from fastapi import APIRouter, Depends, HTTPException, Body, Request
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from collections import Counter
from google.cloud import firestore
from datetime import datetime, timedelta
from .jwt_handler import decode_access_token
from utils.gmail_service import GmailService
from pydantic import BaseModel
from utils.firestore_client import get_firestore_client
import re
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

account_router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

limiter = Limiter(key_func=get_remote_address)

class SaveDraftRequest(BaseModel):
    draft_id: str
    to: str
    subject: str = None
    body: str = None

def extract_email(email_string):
    pattern = r'<([^>]+)>'
    match = re.search(pattern, email_string)
    if match:
        return match.group(1)
    else:
        # If no angle brackets, assume the whole string is an email
        return email_string.strip()

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = decode_access_token(token)
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

@account_router.delete("/delete-account")
@limiter.limit("5/hour")
async def delete_account(request: Request, current_user: str = Depends(get_current_user)):
    db = get_firestore_client()
    user_ref = db.collection("users").document(current_user)
    
    # Check if the user exists
    if not user_ref.get().exists:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Delete the user document
    user_ref.delete()
    
    return {"message": "Account deleted successfully"}

@account_router.post("/user/create-help-ticket")
@limiter.limit("10/hour")
async def create_help_ticket(request: Request, name: str = Body(...), email: str = Body(...), message: str = Body(...), current_user: str = Depends(get_current_user)):
    db = get_firestore_client()
    user_ref = db.collection("users").document(current_user)
    user_doc = user_ref.get()

    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")

    # Create a new help ticket
    help_ticket = {
        "name": name,
        "email": email,
        "message": message,
        "user_id": current_user,
        "timestamp": firestore.SERVER_TIMESTAMP
    }

    # Add the help ticket to the help-tickets collection
    help_ticket_ref = db.collection("help-tickets").add(help_ticket)

    return {
        "message": "Help ticket created successfully",
        "ticket_id": help_ticket_ref[1].id
    }


@account_router.get("/remaining-drafts")
@limiter.limit("20/minute")
async def get_remaining_drafts(request: Request, current_user: str = Depends(get_current_user)):
    db = get_firestore_client()
    user_ref = db.collection("users").document(current_user)
    user_doc = user_ref.get()

    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_data = user_doc.to_dict()
    user_data['id'] = current_user

    remaining_drafts = user_data.get('drafts', 100)

    return {"remaining_drafts": remaining_drafts}

@account_router.get("/subscription-status")
@limiter.limit("20/minute")
async def get_subscription_status(request: Request, current_user: str = Depends(get_current_user)):
    db = get_firestore_client()
    user_ref = db.collection("users").document(current_user)
    user_doc = user_ref.get()

    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")

    user_data = user_doc.to_dict()
    user_data['id'] = current_user

    return {"subscription_status": user_data.get("is_pro", False)}

@account_router.put("/complete-onboarding")
@limiter.limit("5/hour")
async def complete_onboarding(request: Request, responses: dict, current_user: str = Depends(get_current_user)):
    db = get_firestore_client()
    user_ref = db.collection("users").document(current_user)
    
    # Update the user's onboarding status
    user_ref.update({"onboarding_completed": True, "questions": responses})
    
    return {"message": "Onboarding completed successfully"}

@account_router.put("/update-settings")
@limiter.limit("10/hour")
async def update_settings(request: Request, settings: dict, current_user: str = Depends(get_current_user)):
    db = get_firestore_client()
    user_ref = db.collection("users").document(current_user)
    
    # Update the user's settings
    user_ref.update({"settings": settings})

    return {"message": "Settings updated successfully"}

@account_router.get("/drafts/count")
@limiter.limit("20/minute")
async def count_drafts(request: Request, current_user: str = Depends(get_current_user)):
    db = get_firestore_client()
    drafts_count = db.collection("drafts").where("user_id", "==", current_user).count().get()[0][0].value
    return {"drafts_count": drafts_count}

@account_router.get("/emails/top-senders")
@limiter.limit("10/hour")
async def top_senders(request: Request, current_user: str = Depends(get_current_user)):
    db = get_firestore_client()
    drafts = db.collection("drafts").where("user_id", "==", current_user).stream()
    senders = [extract_email(draft.to_dict()['recipient_email']) for draft in drafts]
    top_5_senders = Counter(senders).most_common(5)
    return {"top_senders": top_5_senders}

@account_router.get("/emails/high-priority")
@limiter.limit("10/hour")
async def highest_priority(request: Request, current_user: str = Depends(get_current_user)):
    db = get_firestore_client()
    drafts = db.collection("drafts").where("user_id", "==", current_user).stream()
    highest_priority = [{'database_id': draft.id, 'priority': draft.to_dict()['priority'], 'email_subject': draft.to_dict()['email_subject'], 'sender_email': draft.to_dict()['recipient_email']} for draft in drafts if draft.to_dict()['priority'] <= 5]
    return {"highest_priority": highest_priority}

@account_router.get("/drafts/daily-count")
@limiter.limit("10/hour")
async def daily_draft_count(request: Request, current_user: str = Depends(get_current_user), days: int = 30):
    db = get_firestore_client()
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    drafts = db.collection("drafts").where("user_id", "==", current_user).where("date_created", ">=", start_date).stream()
    
    daily_counts = Counter(draft.to_dict()['date_created'].date() for draft in drafts)
    
    result = [{"date": date.isoformat(), "count": count} for date, count in daily_counts.items()]
    return {"daily_counts": result}

@account_router.get("/drafts/recent")
@limiter.limit("20/minute")
async def recent_drafts(request: Request, current_user: str = Depends(get_current_user)):
    db = get_firestore_client()
    recent_drafts = db.collection("drafts").where("user_id", "==", current_user).order_by("date_created", direction=firestore.Query.DESCENDING).limit(10).stream()
    
    user_ref = db.collection("users").document(current_user)
    user_doc = user_ref.get()
    if user_doc.exists:
        user_data = user_doc.to_dict()
        if user_data.get("is_pro"):
            result = [{"database_id": draft.id, "gmail_id": draft.to_dict()['gmail_draft_id'], "email_body": draft.to_dict()['email_body'], "recipient_email": draft.to_dict()['recipient_email'], "recipient_subject": draft.to_dict()['email_subject'], "draft_body": draft.to_dict()['draft_body'], "draft_subject": draft.to_dict()['draft_subject'], "date": draft.to_dict()['date_created'], "action_item": draft.to_dict()['action_item'], "priority": draft.to_dict()['priority']} for draft in recent_drafts]
        else:
            result = [{"database_id": draft.id, "gmail_id": draft.to_dict()['gmail_draft_id'], "email_body": draft.to_dict()['email_body'], "recipient_email": draft.to_dict()['recipient_email'], "recipient_subject": draft.to_dict()['email_subject'], "draft_body": draft.to_dict()['draft_body'], "draft_subject": draft.to_dict()['draft_subject'], "date": draft.to_dict()['date_created']} for draft in recent_drafts]
        return {"recent_drafts": result}    
    else:
        raise HTTPException(status_code=404, detail="User not found")

@account_router.get("/drafts/recent")
async def recent_drafts(current_user: str = Depends(get_current_user)):
    db = get_firestore_client()
    user_ref = db.collection("users").document(current_user)

    recent_drafts = db.collection("drafts").where("user_id", "==", current_user).order_by("date_created", direction=firestore.Query.DESCENDING).limit(10).stream()
    result = [{"database_id": draft.id, "gmail_id": draft.to_dict()['gmail_draft_id'], "email_body": draft.to_dict()['email_body'], "recipient_email": draft.to_dict()['recipient_email'], "recipient_subject": draft.to_dict()['email_subject'], "draft_body": draft.to_dict()['draft_body'], "draft_subject": draft.to_dict()['draft_subject'], "date": draft.to_dict()['date_created']} for draft in recent_drafts]

    user_doc = user_ref.get()
    if user_doc.exists:
        user_data = user_doc.to_dict()
        if user_data.get("is_pro"):
            result = [{"database_id": draft.id, "gmail_id": draft.to_dict()['gmail_draft_id'], "email_body": draft.to_dict()['email_body'], "recipient_email": draft.to_dict()['recipient_email'], "recipient_subject": draft.to_dict()['email_subject'], "draft_body": draft.to_dict()['draft_body'], "draft_subject": draft.to_dict()['draft_subject'], "date": draft.to_dict()['date_created'], "action_item": draft.to_dict()['action_item'], "priority": draft.to_dict()['priority']} for draft in recent_drafts]
        else:
            result = [{"database_id": draft.id, "gmail_id": draft.to_dict()['gmail_draft_id'], "email_body": draft.to_dict()['email_body'], "recipient_email": draft.to_dict()['recipient_email'], "recipient_subject": draft.to_dict()['email_subject'], "draft_body": draft.to_dict()['draft_body'], "draft_subject": draft.to_dict()['draft_subject'], "date": draft.to_dict()['date_created']} for draft in recent_drafts]
    return {"recent_drafts": result}
@account_router.get("/emails/common-topics")
@limiter.limit("10/hour")
async def common_topics(request: Request, current_user: str = Depends(get_current_user)):
    db = get_firestore_client()
    drafts = db.collection("drafts").where("user_id", "==", current_user).stream()
    topics = [draft.to_dict()['draft_body_topic'] for draft in drafts if 'draft_body_topic' in draft.to_dict()]
    top_5_topics = Counter(topics).most_common(5)
    return {"common_topics": top_5_topics}

@account_router.post("/emails/send-draft")
@limiter.limit("30/hour")
async def send_draft(request: Request, gmail_id: str = Body(...), database_id: str = Body(...), current_user: str = Depends(get_current_user)):
    db = get_firestore_client()
    user_ref = db.collection("users").document(current_user)
    user_doc = user_ref.get()

    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")

    user_data = user_doc.to_dict()
    user_data['id'] = current_user

    gmail_service = GmailService(user_data)
    result = gmail_service.send_draft(database_id, gmail_id)

    if result:
        user_ref.update({"messages_sent": firestore.Increment(1)})
        return {"message": "Draft sent successfully", "message_id": result['id']}
    else:
        raise HTTPException(status_code=500, detail="Failed to send draft")

@account_router.get("/messages/count")
@limiter.limit("20/minute")
async def get_message_count(request: Request, current_user: str = Depends(get_current_user)):
    db = get_firestore_client()
    user_ref = db.collection("users").document(current_user)
    user_doc = user_ref.get()

    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")

    messages_sent = user_doc.to_dict().get("messages_sent", 0)
    return {"user_id": current_user, "messages_sent": messages_sent}

@account_router.get("/drafts/average-words")
@limiter.limit("10/hour")
async def get_average_draft_words(request: Request, current_user: str = Depends(get_current_user)):
    db = get_firestore_client()
    drafts = db.collection("drafts").where("user_id", "==", current_user).stream()

    total_words = 0
    draft_count = 0

    for draft in drafts:
        draft_data = draft.to_dict()
        body = draft_data.get('draft_body', '')
        total_words += len(body.split())
        draft_count += 1

    if draft_count == 0:
        return {"user_id": current_user, "average_words": 0}

    average_words = int(total_words / draft_count)
    return {"user_id": current_user, "average_words": average_words}

@account_router.post("/emails/save-draft")
@limiter.limit("30/hour")
async def save_draft(request: Request, database_id: str = Body(...), gmail_id: str = Body(...), to: str = Body(...), subject: str = Body(...), body: str = Body(...), current_user: str = Depends(get_current_user)):
    db = get_firestore_client()
    user_ref = db.collection("users").document(current_user)
    print(user_ref)
    user_doc = user_ref.get()

    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")

    user_data = user_doc.to_dict()
    user_data['id'] = current_user


    gmail_service = GmailService(user_data)
    print("done")
    result = gmail_service.save_draft(database_id, gmail_id, to, subject, body)

    if result:
        return {"message": "Draft saved successfully", "draft_id": database_id}
    else:
        raise HTTPException(status_code=500, detail="Failed to save draft")

