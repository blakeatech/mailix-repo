# auth/oauth_service.py
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordBearer
from starlette.responses import RedirectResponse
import requests
import secrets
from datetime import datetime, timedelta
from jose import JWTError
from config.settings import settings
from utils.firestore_client import get_firestore_client
from auth.jwt_handler import decode_access_token, create_access_token
from utils.gmail_service import GmailService
from utils.openai_service import SentEmailProcessor
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
oauth_router = APIRouter()

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = decode_access_token(token)
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

@oauth_router.get("/google-auth")
@limiter.limit("10/minute")
async def google_auth(request: Request, current_user: str = Depends(get_current_user)):
    scopes = "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.compose https://www.googleapis.com/auth/gmail.modify"
    state = f"{current_user}:{secrets.token_urlsafe(32)}"
    auth_url = (
        f"https://accounts.google.com/o/oauth2/auth?client_id={settings.google_client_id}"
        f"&redirect_uri={settings.google_redirect_uri}&scope={scopes}&response_type=code"
        f"&access_type=offline&prompt=consent&state={state}"
    )
    return {"authUrl": auth_url}

@oauth_router.get("/callback")
@limiter.limit("10/minute")
async def google_callback(request: Request, code: str, state: str):
    user_id, _ = state.split(':', 1)  # Extract user_id from state
    response = requests.post(
        "https://oauth2.googleapis.com/token",
        data={
            "code": code,
            "client_id": settings.google_client_id,
            "client_secret": settings.google_client_secret,
            "redirect_uri": settings.google_redirect_uri,
            "grant_type": "authorization_code",
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )

    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to retrieve access token")

    token_data = response.json()
    db = get_firestore_client()
    user_ref = db.collection("users").document(user_id)

    if not user_ref.get().exists:
        raise HTTPException(status_code=404, detail="User not found")

    # Update user document with OAuth tokens
    user_ref.update({
        "google_access_token": token_data['access_token'],
        "google_refresh_token": token_data.get('refresh_token'),  # This might not always be present
        "token_expiry": datetime.utcnow() + timedelta(seconds=token_data['expires_in']),
        "updated_at": datetime.utcnow()
    })

    # Fetch user data
    user_doc = user_ref.get()
    user_data = user_doc.to_dict()
    user_data['id'] = user_id

    # Create and store the vector index
    processor = SentEmailProcessor(user_data)
    df = processor.collect_sent_emails()
    index = processor.create_vector_store_index(df)
    processor.save_index_to_firestore(index)

    # Create a new JWT with updated claims
    new_access_token = create_access_token({
        "sub": user_id,
        "google_authorized": True
    })

    # Redirect to frontend with the new token
    frontend_url = "https://www.notaic.site"  # Replace with your actual frontend URL
    return RedirectResponse(f"{frontend_url}/oauth-success?token={new_access_token}")

@oauth_router.post("/refresh-token")
@limiter.limit("5/minute")
async def refresh_token(request: Request, current_user: str = Depends(get_current_user)):
    db = get_firestore_client()
    user_ref = db.collection("users").document(current_user)
    user_doc = user_ref.get()

    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")

    user_data = user_doc.to_dict()
    refresh_token = user_data.get("google_refresh_token")

    if not refresh_token:
        raise HTTPException(status_code=400, detail="No refresh token available")

    response = requests.post(
        "https://oauth2.googleapis.com/token",
        data={
            "client_id": settings.google_client_id,
            "client_secret": settings.google_client_secret,
            "refresh_token": refresh_token,
            "grant_type": "refresh_token",
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )

    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to refresh token")

    new_token_data = response.json()

    # Update user document with new access token
    user_ref.update({
        "google_access_token": new_token_data['access_token'],
        "token_expiry": datetime.utcnow() + timedelta(seconds=new_token_data['expires_in']),
        "updated_at": datetime.utcnow()
    })

    return {"message": "Token refreshed successfully"}

@oauth_router.get("/revoke-access")
@limiter.limit("5/hour")
async def revoke_access(request: Request, current_user: str = Depends(get_current_user)):
    db = get_firestore_client()
    user_ref = db.collection("users").document(current_user)
    user_doc = user_ref.get()

    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")

    user_data = user_doc.to_dict()
    access_token = user_data.get("google_access_token")

    if not access_token:
        raise HTTPException(status_code=400, detail="No access token available")

    response = requests.post(
        "https://oauth2.googleapis.com/revoke",
        params={"token": access_token},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )

    if response.status_code == 200:
        # Remove Google-related fields from user document
        user_ref.update({
            "google_access_token": firestore.DELETE_FIELD,
            "google_refresh_token": firestore.DELETE_FIELD,
            "token_expiry": firestore.DELETE_FIELD,
            "updated_at": datetime.utcnow()
        })
        return {"message": "Access successfully revoked"}
    else:
        raise HTTPException(status_code=400, detail="Failed to revoke access")
