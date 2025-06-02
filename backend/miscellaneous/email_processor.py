from google.cloud import firestore
from utils.gmail_service import GmailService, Draft
from utils.openai_service import OpenAIService, SentEmailProcessor
from config.settings import settings
from utils.firestore_client import get_firestore_client
from datetime import datetime, timedelta
from bs4 import BeautifulSoup
import re
import random

class EmailProcessor:
    def __init__(self):
        vector_store_index = get_vector_store_index()  # Get the vector store index
        self.openai_service = OpenAIService(vector_store_index)
        self.db = get_firestore_client()
        self.users_ref = self.db.collection("users")

    def _clean_email_body(self, email_body):
        """Clean email by removing HTML tags and unnecessary text."""
        # Parse the email content using BeautifulSoup
        soup = BeautifulSoup(email_body, 'html.parser')
        cleaned_text = soup.get_text()

        # Further cleaning to remove email signatures, quoted replies, etc.
        cleaned_text = re.sub(r'--\s*\n.*', '', cleaned_text, flags=re.DOTALL)
        cleaned_text = re.sub(r'^>.*$', '', cleaned_text, flags=re.MULTILINE)
        cleaned_text = re.sub(r'\s+', ' ', cleaned_text).strip()
        
        return cleaned_text

    def _is_promotional(self, email_content):
        """Determine if an email is promotional based on its content."""
        promotional_keywords = ['sale', 'discount', 'offer', 'buy now', 'limited time', 'free trial', 'exclusive deal']
        return any(keyword in email_content.lower() for keyword in promotional_keywords)

    def generate_draft(self, user_id, email):
        """Generate and save an email draft response."""
        user_data = self.users_ref.document(user_id).get().to_dict()
        if not user_data or 'google_refresh_token' not in user_data:
            print(f"User {user_data.get('email')} not connected to Gmail. Skipping.")
            return

        gmail_service = GmailService(user_data)
        cleaned_email_content = self._clean_email_body(email['body'])

        if self._is_promotional(cleaned_email_content):
            print(f"Skipping promotional email with subject: {email['subject']}")
            return
        
        first_name = user_data.get('first_name', 'Colleague')
        response = self.openai_service.generate_response(first_name, cleaned_email_content)

        draft_id, draft_link, compose_id = gmail_service.create_draft(
            user_id='me',
            message_body={
                'raw': gmail_service.create_message(
                    sender=user_data.get('email'),
                    to=email['sender'],
                    subject=f"Re: {email['subject']}",
                    message_text=response['body'],
                    thread_id=email['threadId'],
                    message_id=email['id']
                )['raw']
            }
        )

        if draft_id:
            print(f"Draft created successfully in Gmail with ID: {draft_id}")
            new_draft = Draft(
                user_id=user_id,
                draft_id=draft_id,
                thread_id=email['threadId'],
                message_id=email['id'],
                recipient_email=email['sender'],
                sender_email=user_data.get('email'),
                email_subject=email['subject'],
                email_body=email['body'],
                draft_subject=f"Re: {email['subject']}",
                draft_body=response['body'],
                draft_body_topic='AI Generated Response',
                gmail_draft_id=draft_id,
                draft_link=draft_link,
                compose_id=compose_id
            )
            stored_draft_id = gmail_service.store_draft(new_draft)
            print(f"Draft stored in Firestore with ID: {stored_draft_id}")
        else:
            print(f"Failed to create draft in Gmail for user: {user_data.get('email')}")

    def process_user_emails(self, user_id, limit=5):
        """Process unread emails for a single user and create drafts."""
        user_data = self.users_ref.document(user_id).get().to_dict()
        if not user_data or 'google_refresh_token' not in user_data:
            print(f"User {user_data.get('email')} not connected to Gmail. Skipping.")
            return

        gmail_service = GmailService(user_data)
        unread_emails = gmail_service.get_unread_emails()

        if not unread_emails:
            print(f"No unread emails found for user {user_data.get('email')}")
            return

        # Process up to the specified limit of emails
        for email in unread_emails[:limit]:
            self.generate_draft(user_id, email)

    def process_all_users(self):
        """Iterate through all users and process their emails."""
        users = self.users_ref.stream()
        
        for user in users:
            user_data = user.to_dict()
            user_data['id'] = user.id
            print(f"Processing emails for user: {user_data.get('email')}")
            self.process_user_emails(user_data['id'])

    def run(self):
        """Main method to run the email processor."""
        print("Starting the EmailProcessor service...")
        self.process_all_users()
        print("Email processing completed.")

if __name__ == "__main__":
    email_processor = EmailProcessor()
    email_processor.run()