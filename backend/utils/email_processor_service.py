import asyncio
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from concurrent.futures import ThreadPoolExecutor
from utils.gmail_service import GmailService, Draft
from utils.openai_service import OpenAIService, SentEmailProcessor
from config.settings import settings
from utils.firestore_client import get_firestore_client

from bs4 import BeautifulSoup
import re
import logging

import os
import joblib

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

class EmailProcessor:
    def __init__(self):
        self.db = get_firestore_client()
        self.users_ref = self.db.collection("users")
        self.executor = ThreadPoolExecutor(max_workers=10)  # Adjust the number of workers as needed

        model_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models', 'notaic_email_classifier.joblib')
        if os.path.exists(model_path):
            self.promotional_model = joblib.load(model_path)
        else:
            logger.error(f"Model file not found at {model_path}")
            raise FileNotFoundError(f"Model file not found at {model_path}")

    async def _clean_email_body(self, email_body):
        """Clean email by removing HTML tags and unnecessary text."""
        soup = BeautifulSoup(email_body, 'html.parser')
        cleaned_text = soup.get_text()
        cleaned_text = re.sub(r'--\s*\n.*', '', cleaned_text, flags=re.DOTALL)
        cleaned_text = re.sub(r'^>.*$', '', cleaned_text, flags=re.MULTILINE)
        cleaned_text = re.sub(r'\s+', ' ', cleaned_text).strip()
        return cleaned_text

    async def _is_promotional(self, email_content):
        """Determine if an email is promotional based on its content."""
        return self.promotional_model.predict([email_content])[0]

    async def generate_draft(self, user_id, email):
        """Generate and save an email draft response asynchronously."""
        user_data = self.users_ref.document(user_id).get().to_dict()
        user_data['id'] = user_id
        if not user_data or 'google_refresh_token' not in user_data:
            print(f"User {user_data.get('email')} not connected to Gmail. Skipping.")
            return

        gmail_service = GmailService(user_data)

        cleaned_email_content = await self._clean_email_body(email['body'])

        if await self._is_promotional(cleaned_email_content):
            print(f"Skipping draft creation for promotional email with subject: {email['subject']}")
            return
        
        if not gmail_service.can_create_draft():
            print(f"User {user_data.get('email')} has no drafts left. Skipping draft creation.")
            return

        # Initialize SentEmailProcessor and load index
        sent_email_processor = SentEmailProcessor(user_data)
        vector_store_index = sent_email_processor.load_index_from_firestore()

        if not vector_store_index:
            print(f"No vector store index found for user {user_data.get('email')}. Skipping.")
            return

        # Initialize OpenAIService with the loaded index
        openai_service = OpenAIService(vector_store_index)

        name = user_data.get('full_name', 'None')
        length = user_data.get('questions', {}).get('averageLength', 'Short')
        stop_words = str(user_data.get('questions', {}).get('selectedWords', []))
        writing_style = user_data.get('settings', {}).get('writing_style', 'Professional')
        
        # Run the OpenAI generation in the executor
        response = await asyncio.get_running_loop().run_in_executor(
            self.executor, 
            openai_service.generate_response, 
            name, 
            cleaned_email_content,
            length,
            stop_words,
            writing_style
        )

        # Create a draft reply
        draft_id, draft_link, compose_id = gmail_service.create_draft_reply(
            user_id='me',
            thread_id=email['threadId'],
            message_id=email['id'],
            to=email['sender'],
            subject=f"Re: {email['subject']}",
            message_text=response['body']
        )

        if draft_id:
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
            if stored_draft_id:
                print(f"Draft stored with ID: {stored_draft_id}")

    async def process_user_emails(self, user_id, limit=5):
        """Process unread emails for a single user asynchronously."""
        user_data = self.users_ref.document(user_id).get().to_dict()
        if not user_data or 'google_refresh_token' not in user_data:
            print(f"User {user_data.get('email')} not connected to Gmail. Skipping.")
            return

        gmail_service = GmailService(user_data)
        unread_emails = await asyncio.get_running_loop().run_in_executor(
            self.executor, gmail_service.get_unread_emails
        )

        if not unread_emails:
            print(f"No unread emails found for user {user_data.get('email')}")
            return

        print(f"Found {len(unread_emails)} unread emails for user {user_data.get('email')}")

        # Process up to the specified limit of emails concurrently
        tasks = [self.generate_draft(user_id, email) for email in unread_emails[:limit]]
        await asyncio.gather(*tasks)

        # Mark all processed emails as read
        for email in unread_emails[:limit]:
            await asyncio.get_running_loop().run_in_executor(
                self.executor, gmail_service.mark_email_as_read, email['id']
            )
            print(f"Marked email with ID {email['id']} as read.")

    async def process_specific_user(self, email):
        """Process emails for a specific user."""
        user_query = self.users_ref.where("email", "==", email).limit(1).get()
        
        if not user_query:
            print(f"User with email {email} not found. Skipping.")
            return

        user = user_query[0]
        user_data = user.to_dict()
        user_data['id'] = user.id

        await self.process_user_emails(user_data['id'])

    async def process_all_users(self):
        """Process emails for all users in the database."""
        users = self.users_ref.stream()
        for user in users:
            user_data = user.to_dict()
            user_data['id'] = user.id
            if 'google_refresh_token' in user_data:
                print(f"Processing emails for user: {user_data.get('email')}")
                await self.process_user_emails(user_data['id'])
            else:
                print(f"User {user_data.get('email')} not connected to Gmail. Skipping.")

    async def run(self):
        """Main method to run the email processor for all users."""
        print("Starting the EmailProcessor service...")
        await self.process_all_users()
        print("Email processing completed for all users.")

def run_periodically():
    """Scheduler entry point for periodic execution."""
    email_processor = EmailProcessor()
    asyncio.run(email_processor.run())

if __name__ == "__main__":
    scheduler = AsyncIOScheduler()
    scheduler.add_job(run_periodically, 'interval', minutes=30)  # Run every 5 minutes
    scheduler.start()

    try:
        print("Scheduler started. Press Ctrl+C to exit.")
        asyncio.get_event_loop().run_forever()
    except (KeyboardInterrupt, SystemExit):
        print("Shutting down...")
