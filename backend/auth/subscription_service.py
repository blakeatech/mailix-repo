from fastapi import APIRouter, Depends, HTTPException, Body, Request
from pydantic import BaseModel
from utils.stripe_service import StripeService
from auth.jwt_handler import decode_access_token
from fastapi.security import OAuth2PasswordBearer
from utils.firestore_client import get_firestore_client
import stripe
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)

subscription_router = APIRouter()
stripe_service = StripeService()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Subscription Request Model
class SubscriptionRequest(BaseModel):
    payment_method_id: str

# Helper function to get the current user from the token
def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = decode_access_token(token)
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        return user_id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

@subscription_router.post("/create")
@limiter.limit("5/hour")
async def create_subscription(request: Request, subscription_request: SubscriptionRequest, current_user: str = Depends(get_current_user)):
    # Retrieve user information from Firestore
    db = get_firestore_client()
    user_ref = db.collection("users").document(current_user)
    user_doc = user_ref.get()

    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")

    user_data = user_doc.to_dict()
    email = user_data.get("email")

    # Check if the user is already a Stripe customer
    if "stripe_customer_id" in user_data:
        customer_id = user_data["stripe_customer_id"]
    else:
        # Create a new Stripe customer
        customer_id = stripe_service.create_customer(current_user, email)
        user_ref.update({"stripe_customer_id": customer_id})

    # Create a new subscription
    try:
        subscription = stripe_service.create_subscription(customer_id, subscription_request.payment_method_id)
        
        # Mark user as a Pro member
        stripe_service.update_user_subscription_status(current_user, is_pro=True)
        
        return {"subscription_id": subscription.id, "status": subscription.status}
    except HTTPException as e:
        raise e

@subscription_router.post("/cancel")
@limiter.limit("5/hour")
async def cancel_subscription(request: Request, current_user: str = Depends(get_current_user)):
    # Retrieve user information from Firestore
    db = get_firestore_client()
    user_ref = db.collection("users").document(current_user)
    user_doc = user_ref.get()

    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")

    user_data = user_doc.to_dict()
    customer_id = user_data.get("stripe_customer_id")

    if not customer_id:
        raise HTTPException(status_code=400, detail="User has no associated Stripe customer")

    # Get the active subscription
    active_subscription = stripe_service.get_active_subscription(customer_id)

    if not active_subscription:
        raise HTTPException(status_code=400, detail="No active subscription found")

    # Cancel the subscription
    canceled_subscription = stripe_service.cancel_subscription(active_subscription.id)

    # Update user's subscription status
    stripe_service.update_user_subscription_status(current_user, is_pro=False)

    return {
        "status": "success",
        "message": "Subscription canceled successfully",
        "subscription_status": canceled_subscription.status
    }

@subscription_router.post("/webhook")
async def stripe_webhook(payload: dict = Body(...)):
    event = None
    try:
        event = stripe.Event.construct_from(payload, stripe.api_key)
    except ValueError as e:
        # Invalid payload
        raise HTTPException(status_code=400, detail="Invalid payload")

    # Handle the event
    if event.type == "invoice.payment_failed":
        subscription_id = event.data.object.subscription
        stripe_service.handle_payment_failure(subscription_id)

    return {"status": "success"}
