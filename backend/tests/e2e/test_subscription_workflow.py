import unittest
from unittest.mock import patch
from fastapi.testclient import TestClient
from app.main import app
import stripe

class TestSubscriptionWorkflowE2E(unittest.TestCase):
    def setUp(self):
        """Set up test environment before each test."""
        self.client = TestClient(app)
        
        # Test user credentials
        self.test_user = {
            'email': 'test@example.com',
            'password': 'test_password',
            'first_name': 'Test',
            'last_name': 'User'
        }
        
        self.access_token = None
        self.setup_test_user()

    def setup_test_user(self):
        """Create a test user and get authentication tokens."""
        # Register user
        response = self.client.post(
            "/auth/register",
            json=self.test_user
        )
        assert response.status_code == 200
        
        # Login and get tokens
        response = self.client.post(
            "/auth/login",
            data={
                "username": self.test_user['email'],
                "password": self.test_user['password']
            }
        )
        assert response.status_code == 200
        self.access_token = response.json()["access_token"]

    def test_complete_subscription_workflow(self):
        """Test the complete subscription workflow."""
        # 1. Create Stripe customer
        customer_response = self.client.post(
            "/stripe/customer",
            headers={"Authorization": f"Bearer {self.access_token}"}
        )
        self.assertEqual(customer_response.status_code, 200)
        customer_id = customer_response.json()['customer_id']

        # 2. Add payment method
        payment_method_response = self.client.post(
            "/stripe/payment-method",
            headers={"Authorization": f"Bearer {self.access_token}"},
            json={
                "payment_method_id": "pm_test_card",
                "customer_id": customer_id
            }
        )
        self.assertEqual(payment_method_response.status_code, 200)

        # 3. Create subscription
        subscription_response = self.client.post(
            "/stripe/subscription",
            headers={"Authorization": f"Bearer {self.access_token}"},
            json={
                "payment_method_id": "pm_test_card",
                "price_id": "price_test"
            }
        )
        self.assertEqual(subscription_response.status_code, 200)
        subscription_id = subscription_response.json()['subscription_id']

        # 4. Verify subscription status
        status_response = self.client.get(
            f"/stripe/subscription/{subscription_id}",
            headers={"Authorization": f"Bearer {self.access_token}"}
        )
        self.assertEqual(status_response.status_code, 200)
        self.assertEqual(status_response.json()['status'], 'active')

        # 5. Cancel subscription
        cancel_response = self.client.delete(
            f"/stripe/subscription/{subscription_id}",
            headers={"Authorization": f"Bearer {self.access_token}"}
        )
        self.assertEqual(cancel_response.status_code, 200) 