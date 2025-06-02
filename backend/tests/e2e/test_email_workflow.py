import unittest
from unittest.mock import patch
import os
import json
from fastapi.testclient import TestClient
from app.main import app
from app.utils.gmail_service import GmailService
from app.utils.email_service import EmailService
from app.utils.openai_service import OpenAIService
from app.utils.stripe_service import StripeService

class TestEmailWorkflowE2E(unittest.TestCase):
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
        
        # Set up test tokens
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

    def test_complete_email_workflow(self):
        """Test the complete email processing workflow."""
        # 1. Connect Gmail account
        gmail_auth_response = self.client.post(
            "/gmail/authorize",
            headers={"Authorization": f"Bearer {self.access_token}"},
            json={"auth_code": "test_auth_code"}
        )
        self.assertEqual(gmail_auth_response.status_code, 200)

        # 2. Process unread emails
        process_response = self.client.post(
            "/emails/process",
            headers={"Authorization": f"Bearer {self.access_token}"}
        )
        self.assertEqual(process_response.status_code, 200)

        # 3. Get generated drafts
        drafts_response = self.client.get(
            "/drafts",
            headers={"Authorization": f"Bearer {self.access_token}"}
        )
        self.assertEqual(drafts_response.status_code, 200)
        drafts = drafts_response.json()
        self.assertGreater(len(drafts), 0)

        # 4. Edit and send a draft
        draft_id = drafts[0]['id']
        edit_response = self.client.put(
            f"/drafts/{draft_id}",
            headers={"Authorization": f"Bearer {self.access_token}"},
            json={
                "body": "Updated draft content",
                "subject": "Updated subject"
            }
        )
        self.assertEqual(edit_response.status_code, 200)

        send_response = self.client.post(
            f"/drafts/{draft_id}/send",
            headers={"Authorization": f"Bearer {self.access_token}"}
        )
        self.assertEqual(send_response.status_code, 200) 