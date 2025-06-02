import stripe
from fastapi import HTTPException
from google.cloud import firestore
from datetime import datetime
from utils.firestore_client import get_firestore_client
from dotenv import load_dotenv
import os

load_dotenv()

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

class StripeService:
    def __init__(self):
        self.db = get_firestore_client()

    def create_customer(self, user_id, email):
        try:
            customer = stripe.Customer.create(email=email, metadata={"user_id": user_id})
            return customer.id
        except stripe.error.StripeError as e:
            raise HTTPException(status_code=400, detail=str(e))

    def cancel_subscription(self, subscription_id):
        try:
            canceled_subscription = stripe.Subscription.delete(subscription_id)
            return canceled_subscription
        except stripe.error.StripeError as e:
            raise HTTPException(status_code=400, detail=str(e))

    def create_subscription(self, customer_id, payment_method_id):
        try:
            stripe.PaymentMethod.attach(payment_method_id, customer=customer_id)
            stripe.Customer.modify(
                customer_id,
                invoice_settings={"default_payment_method": payment_method_id},
            )
            
            subscription = stripe.Subscription.create(
                customer=customer_id,
                items=[{"price": os.getenv("STRIPE_PRICE_ID")}],  # Replace with your Stripe price ID
                expand=["latest_invoice.payment_intent"],
            )
            return subscription
        except stripe.error.StripeError as e:
            raise HTTPException(status_code=400, detail=str(e))

    def update_user_subscription_status(self, user_id, is_pro):
        user_ref = self.db.collection("users").document(user_id)
        if user_ref.get().exists:
            user_ref.update({"is_pro": is_pro})
        else:
            raise HTTPException(status_code=404, detail="User not found")

    def handle_payment_failure(self, subscription_id):
        subscription = stripe.Subscription.retrieve(subscription_id)
        user_id = subscription.metadata.get("user_id")
        self.update_user_subscription_status(user_id, is_pro=False)

    def get_active_subscription(self, customer_id):
        try:
            subscriptions = stripe.Subscription.list(
                customer=customer_id,
                status='active',
                limit=1
            )
            if subscriptions.data:
                return subscriptions.data[0]
            return None
        except stripe.error.StripeError as e:
            raise HTTPException(status_code=400, detail=str(e))
