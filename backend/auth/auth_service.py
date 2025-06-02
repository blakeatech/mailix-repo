# auth/auth_service.py
from fastapi import APIRouter, HTTPException, Body, Form, Request, Depends
from typing import Optional
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
import datetime
import secrets
from utils.firestore_client import get_firestore_client
from utils.email_service import EmailService
from dependencies import get_email_service
from google.cloud import firestore
from config.settings import settings
from dotenv import load_dotenv
import smtplib
from email.mime.text import MIMEText
import datetime
import os
import logging
from google.cloud.firestore_v1.field_path import FieldPath
from auth.jwt_handler import create_access_token, decode_access_token
from fastapi.security import OAuth2PasswordBearer
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

auth_router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")  # Initialize password hashing
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class RegisterForm(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str

# Endpoint for user registration

class SignInForm(BaseModel):
    email: EmailStr
    password: str

class WaitlistSignupRequest(BaseModel):
    email: EmailStr
    referral_code: Optional[str] = None

@auth_router.get("/authenticate")
@limiter.limit("60/minute")
async def authenticate(request: Request, token: str = Depends(oauth2_scheme)):
    try:
        # Decode the JWT
        payload = decode_access_token(token)
        
        if payload is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # Check if the token has expired
        exp = payload.get("exp")
        if exp is None or datetime.datetime.now(datetime.timezone.utc).timestamp() > exp:
            raise HTTPException(status_code=401, detail="Token has expired")
        
        # Get the user ID from the token
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        
        # Verify the user exists in the database
        db = get_firestore_client()
        user_doc = db.collection("users").document(user_id).get()
        
        if not user_doc.exists:
            raise HTTPException(status_code=401, detail="User not found")
        
        user_data = user_doc.to_dict()
        
        # Return user information
        return {
            "message": "Authenticated successfully",
            "user_id": user_id,
            "email": user_data.get("email"),
            "is_google_authorized": "google_access_token" in user_data,
            "onboarding_completed": user_data.get("onboarding_completed", False)
        }
    
    except HTTPException as he:
        # Re-raise HTTP exceptions
        raise he
    except Exception as e:
        # Log the error for debugging
        print(f"Authentication error: {str(e)}")
        raise HTTPException(status_code=401, detail="Authentication failed")

@auth_router.post("/reset-password-request")
@limiter.limit("5/hour")
async def reset_password_request(request: Request, email: str = Body(...), email_service: EmailService = Depends(get_email_service)):
    db = get_firestore_client()
    user_ref = db.collection("users").where("email", "==", email).limit(1).stream()
    user_doc = next(user_ref, None)
    if not user_doc:
        raise HTTPException(status_code=400, detail="User not found")
    user_data = user_doc.to_dict()
    reset_password_token = secrets.token_urlsafe(16)
    user_data['reset_password_token'] = reset_password_token
    db.collection("users").document(user_doc.id).update(user_data)

    reset_password_link = f"https://www.notaic.site/reset-password?token={reset_password_token}"
    email_service.reset_password_email(email, reset_password_link)
    return {"message": "Password reset email sent", "reset_password_link": reset_password_link}
    if not user_data:
        raise HTTPException(status_code=400, detail="User data is empty")

@auth_router.post("/reset-password")
@limiter.limit("5/hour")
async def reset_password(request: Request, token: str = Body(...), new_password: str = Body(...)):
    db = get_firestore_client()
    user_ref = db.collection("users").where("reset_password_token", "==", token).limit(1).stream()
    user_doc = next(user_ref, None)
    if not user_doc:
        raise HTTPException(status_code=400, detail="User not found")
    user_data = user_doc.to_dict()
    user_data['password'] = pwd_context.hash(new_password)
    db.collection("users").document(user_doc.id).update(user_data)
    return {"message": "Password reset successfully"}
    if not user_data:
        raise HTTPException(status_code=400, detail="User data is empty")

@auth_router.post("/signin")
@limiter.limit("10/minute")
async def signin(request: Request, form_data: SignInForm):
    db = get_firestore_client()
    user_ref = db.collection("users").where("email", "==", form_data.email).limit(1).stream()
    user_doc = next(user_ref, None)
    
    if not user_doc:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    user_data = user_doc.to_dict()
    if not user_data:
        raise HTTPException(status_code=400, detail="User data is empty")
    
    if not pwd_context.verify(form_data.password, user_data['password']):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user_doc.id, "email": user_data['email']}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user_doc.id,
        "email": user_data['email']
    }

@auth_router.post("/register")
@limiter.limit("5/hour")
async def register(request: Request, full_name: str = Body(...), email: str = Body(...), password: str = Body(...), email_service: EmailService = Depends(get_email_service)):
    db = get_firestore_client()
    
    # Check if the user already exists in Firestore
    user_ref = db.collection("users").where("email", "==", email).stream()
    if any(user_ref):
        raise HTTPException(status_code=400, detail="User already exists")

    # Generate a secure verification token
    verification_token = secrets.token_urlsafe(16)
    hashed_password = pwd_context.hash(password)  # Hash the password

    # Create user data
    user_data = {
        "full_name": full_name,
        "email": email,
        "password": hashed_password,
        "verification_status": "pending",
        "verification_token": verification_token,
        "token_expiry": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=10),
        "created_at": datetime.datetime.now(datetime.timezone.utc),
        "updated_at": datetime.datetime.now(datetime.timezone.utc)
    }

    # Store user data in Firestore
    user_id = db.collection("users").add(user_data)[1].id
    
    # Generate verification link
    verification_link = f"https://www.notaic.site/verified-email?token={verification_token}"

    # Send verification email
    if email_service.send_verification_email(email, verification_link):
        # Create JWT
        access_token = create_access_token({"sub": str(user_id)})

        return {"message": "User registered successfully. Please check your email for verification.", "access_token": access_token}
    else:
        # If email sending fails, you might want to delete the user or mark them as unverified
        return {"error": "Failed to send verification email. Please try again."}

# Endpoint for email verification
@auth_router.get("/verify-email")
@limiter.limit("10/hour")
async def verify_email(request: Request, token: str):
    try:
        db = get_firestore_client()
        
        # Find the user document with the matching verification token
        users = db.collection("users").where("verification_token", "==", token).limit(1).stream()
        user_doc = next(users, None)

        if not user_doc:
            raise HTTPException(status_code=400, detail="Invalid or expired verification token")

        user_data = user_doc.to_dict()
        if not user_data:
            raise HTTPException(status_code=400, detail="User data is empty")

        # Add the document ID to the user_data dictionary
        user_data['id'] = user_doc.id

        # Check if the token has expired
        current_time = datetime.datetime.now(datetime.timezone.utc)
        token_expiry = user_data['token_expiry'].replace(tzinfo=datetime.timezone.utc)
        
        if current_time > token_expiry:
            raise HTTPException(status_code=400, detail="Verification link has expired")
        
        # Update the user's verification status
        db.collection("users").document(user_data['id']).update({
            "verification_status": "verified",
            "verification_token": None,
            "token_expiry": None,
            "updated_at": current_time,
            "drafts": 100,
            "is_pro": False,
            "onboarding_completed": False,
            "settings": {
                "writing_style": "Professional"
            }
        })

        return {"message": "Email verified. You can now proceed to authenticate with Gmail."}
    except Exception as e:
        logger.error(f"Failed to verify email: {e}")
        raise HTTPException(status_code=500, detail="Failed to verify email")

def generate_referral_code():
    return secrets.token_urlsafe(8)

@auth_router.post("/waitlist-signup")
@limiter.limit("5/hour")
async def waitlist_signup(request: Request, request_data: WaitlistSignupRequest, email_service: EmailService = Depends(get_email_service)):
    db = get_firestore_client()
    waitlist_ref = db.collection("waitlist")
    
    # Check if email is already in waitlist
    existing_entry = waitlist_ref.where("email", "==", request_data.email).limit(1).get()
    if len(existing_entry) > 0:
        raise HTTPException(status_code=400, detail="Email already in waitlist")
    
    # Generate new referral code
    new_referral_code = generate_referral_code()
    verification_token = secrets.token_urlsafe(16)
    print(request_data.referral_code)
    
    # If referral code provided, increment free months
    if request_data.referral_code:
        referrer = waitlist_ref.where("referral_code", "==", request_data.referral_code).limit(1).get()
        if len(referrer) > 0:
            referrer_doc = referrer[0]
            referrer_doc.reference.update({"free_months": firestore.Increment(1)})
            
            # Increment free months for new signup
            free_months = 1
        else:
            free_months = 0
    else:
        free_months = 0
    
    # Add new entry to waitlist
    new_entry = {
        "email": request_data.email,
        "referral_code": new_referral_code,
        "verification_token": verification_token,
        "free_months": free_months,
        "signup_date": firestore.SERVER_TIMESTAMP
    }
    waitlist_ref.add(new_entry)
    
    # Send confirmation email
    email_service.send_waitlist_confirmation_email(request_data.email, new_referral_code, verification_token)
    
    # If referral code was used, send emails about free month
    if request_data.referral_code and len(referrer) > 0:
        email_service.send_free_month_email(referrer_doc.to_dict()["email"], referrer_doc.to_dict()["referral_code"])
    
    return {"message": "Successfully added to waitlist", "referral_code": new_referral_code}

@auth_router.post("/confirm-waitlist-signup")
@limiter.limit("5/hour")
async def confirm_waitlist_signup(
    request: Request,
    email: str = Body(...),
    token: str = Body(...),
    email_service: EmailService = Depends(get_email_service)
):
    db = get_firestore_client()
    waitlist_ref = db.collection("waitlist")
    
    # Check if email is in waitlist
    waitlist_entry = waitlist_ref.where("email", "==", email).limit(1).get()
    if len(waitlist_entry) == 0:
        raise HTTPException(status_code=400, detail="Email not in waitlist")
    
    waitlist_doc = waitlist_entry[0]
    waitlist_data = waitlist_doc.to_dict()
    
    # Check if the token is valid and not expired
    if waitlist_data.get("verification_token") != token:
        raise HTTPException(status_code=400, detail="Invalid verification token")
    
    # Update the waitlist entry to mark it as verified
    waitlist_doc.reference.update({
        "verified": True,
        "verification_token": None,
        "token_expiry": None,
        "verified_at": datetime.datetime.now(datetime.timezone.utc)
    })
    
    return {"message": "Email verified successfully"}

@auth_router.post("/resend-verification")
@limiter.limit("3/hour")
async def resend_verification(request: Request, email: str = Body(...), email_service: EmailService = Depends(get_email_service)):
    db = get_firestore_client()
    
    # Check if the user exists and is not verified
    user_ref = db.collection("users").where("email", "==", email).limit(1).stream()
    user_doc = next(user_ref, None)
    
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_data = user_doc.to_dict()
    if user_data.get("verification_status") == "verified":
        raise HTTPException(status_code=400, detail="User is already verified")
    
    # Generate a new verification token
    verification_token = secrets.token_urlsafe(16)
    
    # Update the user document with the new token
    user_doc.reference.update({
        "verification_token": verification_token,
        "token_expiry": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=10)
    })
    
    # Generate verification link
    verification_link = f"https://www.notaic.site/verified-email?token={verification_token}"
    
    # Send verification email
    if email_service.send_verification_email(email, verification_link):
        return {"message": "Verification email resent successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to send verification email")
