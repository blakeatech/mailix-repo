from google.cloud import firestore
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from google.auth.transport.requests import Request
from datetime import datetime, timedelta
import base64
from config.settings import settings
from utils.firestore_client import get_firestore_client
import random
from email.mime.text import MIMEText
from googleapiclient.errors import HttpError
from pydantic import BaseModel
from openai import OpenAI
import re
import json

class Draft(BaseModel):
    user_id: str
    draft_id: str
    thread_id: str
    message_id: str
    recipient_email: str
    sender_email: str
    email_subject: str
    email_body: str
    draft_subject: str
    draft_body: str
    draft_body_topic: str = None
    date_created: datetime = None
    date_modified: datetime = None
    gmail_draft_id: str = None
    draft_link: str = None
    compose_id: str = None

class GmailService:
    def __init__(self, user_data):
        self.user_data = user_data
        self.db = get_firestore_client()
        self.creds = Credentials(
            token=user_data.get('google_access_token'),
            refresh_token=user_data.get('google_refresh_token'),
            token_uri="https://oauth2.googleapis.com/token",
            client_id=settings.google_client_id,
            client_secret=settings.google_client_secret
        )
        self.client = OpenAI(api_key=settings.openai_api_key)

        if self.creds and self.creds.expired and self.creds.refresh_token:
            self.creds.refresh(Request())
            # Update the stored access token
            self.db.collection("users").document(user_data['id']).update({
                "google_access_token": self.creds.token
            })

        self.service = build('gmail', 'v1', credentials=self.creds)

    def get_unread_emails(self):
        # Calculate the timestamp for 24 hours ago
        time_24_hours_ago = (datetime.utcnow() - timedelta(days=1)).strftime('%Y/%m/%d')

        query = f'is:unread after:{time_24_hours_ago}'
        results = self.service.users().messages().list(userId='me', q=query).execute()

        messages = results.get('messages', [])
        unread_emails = []
        for message in messages:
            msg = self.service.users().messages().get(userId='me', id=message['id'], format='full').execute()
            subject = next((header['value'] for header in msg['payload']['headers'] if header['name'].lower() == 'subject'), 'No Subject')
            sender = next((header['value'] for header in msg['payload']['headers'] if header['name'].lower() == 'from'), 'Unknown Sender')
            
            # Extract full body
            body = ""
            if 'parts' in msg['payload']:
                for part in msg['payload']['parts']:
                    if part['mimeType'] == 'text/plain':
                        body = base64.urlsafe_b64decode(part['body'].get('data', '')).decode()
                        break
            else:
                body = base64.urlsafe_b64decode(msg['payload']['body'].get('data', '')).decode()
            
            unread_emails.append({
                'subject': subject,
                'sender': sender,
                'body': body,
                'id': message['id'],
                'threadId': message['threadId']
            })

        return unread_emails

    
    def create_draft(self, user_id, message_body):
        try:
            draft = self.service.users().drafts().create(userId=user_id, body={'message': message_body}).execute()
            draft_id = draft['id']
            print(f'Draft id: {draft_id}')
            
            # Get the draft details to extract the compose ID
            draft_details = self.service.users().drafts().get(userId=user_id, id=draft_id, format='full').execute()
            
            # Extract the compose ID from the draft details
            message = draft_details.get('message', {})
            headers = message.get('payload', {}).get('headers', [])
            for header in headers:
                if header['name'] == 'Message-ID':
                    compose_id = re.search(r'<(.+?)>', header['value']).group(1)
                    break
            else:
                compose_id = draft_id  # Fallback to draft_id if Message-ID is not found
            
            # Construct the draft link
            draft_link = f"https://mail.google.com/mail/u/0/#drafts?compose={compose_id}"
            
            return draft_id, draft_link, compose_id
        except HttpError as error:
            print(f'An error occurred: {error}')
            return None, None, None
    
    def create_message(self, sender, to, message_id, thread_id, subject, message_text):
        message = MIMEText(message_text)
        message['from'] = sender
        message['to'] = to
        message['In-Reply-To'] = message_id
        message['References'] = message_id
        message['subject'] = subject

        return {
            'raw': base64.urlsafe_b64encode(message.as_string().encode()).decode(),
            'threadId': thread_id
        }
    
    def extract_email_priority(self, message_text):
        system_prompt = f"""
        You are an AI assistant. Your task is to assign a priority level to a user's email.
        """
        prompt = f"""
        You are an AI assistant. Your task is to extract a priority level from the following message.

        A priority level of 1 is the highest priority and means that the email is critical and must be completed as soon as possible.
        A priority level of 2 is a high priority and means that the email is important and should be completed as soon as possible.
        A priority level of 3 is a medium priority and means that the email is of moderate importance and can be completed at a later time.
        A priority level of 4 is a low priority and means that the email can be ignored.

        {message_text}

        You must output the priority level as a number between 1 and 4. You must output a JSON object with the priority level.
        """

        response = self.client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            functions=[{
                "name": "extract_email_priority",
                "description": "Extract a priority level from the message",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "priority": {
                            "type": "number",
                            "description": "The priority level of the email"
                        }
                    },
                    "required": ["priority"]
                }
            }],
            function_call={
                "name": "extract_email_priority"
            }
        )

        if response.choices[0].message.function_call:
            function_args = json.loads(response.choices[0].message.function_call.arguments)
            priority = function_args.get("priority", None)
            return priority
        else:
            return None
    
    def extract_to_do_item(self, message_text):
        system_prompt = f"""
        You are an AI assistant. Your task is to extract the most important task to complete from a user's email.
        """

        prompt = f"""
        You are an AI assistant. Your task is to extract the most important task to complete from the following message.

        {message_text}

        You need to output a short sentence under ten words stating the most important task please.

        In addition, you need to output a very short tagline for the email in under five words. You must output a JSON object with the to-do item and the tagline.
        """

        response = self.client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": message_text}
            ],
            functions=[
                {
                    "name": "extract_to_do_list",
                    "description": "Extract a to-do list from the message",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "to_do_item": {
                                "type": "string",
                                "description": "The most important task to complete from the email."
                            },
                            "source": {
                                "type": "string",
                                "description": "A very short tagline for the email."
                            }
                        }
                    },
                    "required": ["to_do_item", "source"]
                }
            ],
            function_call={ 
                "name": "extract_to_do_list"
            }
        )

        if response.choices[0].message.function_call:
            function_args = json.loads(response.choices[0].message.function_call.arguments)
            return function_args
        else:
            return {}



    def store_draft(self, draft: Draft) -> str:
        if not self.can_create_draft():
            print(f"User {self.user_data['id']} has no drafts left. Skipping draft creation.")
            return None

        # Ensure date fields are set
        if not draft.date_created:
            draft.date_created = datetime.utcnow()
        draft.date_modified = datetime.utcnow()

        # Convert the draft to a dictionary
        draft_dict = draft.model_dump()

        # Convert datetime objects to Firestore timestamps
        draft_dict['date_created'] = firestore.SERVER_TIMESTAMP
        draft_dict['date_modified'] = firestore.SERVER_TIMESTAMP
        draft_dict['action_item'] = self.extract_to_do_item(draft.email_body)
        draft_dict['priority'] = self.extract_email_priority(draft.email_body)

        # Create a new document with an auto-generated ID
        draft_ref = self.db.collection("drafts").document()

        # Set the data in the new document
        draft_ref.set(draft_dict)

        # Decrement the drafts count if not unlimited
        if not self.user_data.get('unlimited_drafts', False):
            self.db.collection("users").document(draft.user_id).update({
                "drafts": firestore.Increment(-1)
            })

        # Return the auto-generated document ID
        return draft_ref.id

    def save_draft(self, database_id, gmail_id, to, subject=None, body=None):
        try:
            # Get the existing draft
            draft = self.service.users().drafts().get(userId='me', id=gmail_id).execute()

            # Create a new message object
            message = MIMEText(body)
            message['to'] = to
            message['subject'] = subject

            # If the draft already has a message, preserve its ID
            if 'message' in draft and 'id' in draft['message']:
                message['Message-ID'] = draft['message']['id']

            # Encode the updated message
            raw = base64.urlsafe_b64encode(message.as_bytes()).decode()

            updated_draft_body = {
                'message': {
                    'raw': raw
                }
            }

            # Update the draft
            updated_draft = self.service.users().drafts().update(
                userId='me', 
                id=gmail_id, 
                body=updated_draft_body
            ).execute()

            # Update the draft in Firestore
            draft_ref = self.db.collection("drafts").document(database_id)
            draft_ref.update({
                'recipient_email': to,
                'draft_subject': subject,
                'draft_body': body,
                'date_modified': firestore.SERVER_TIMESTAMP
            })

            print(f"Draft with ID {database_id} updated successfully.")
            return updated_draft
        except HttpError as error:
            print(f"An error occurred: {error}")
            return None

    def send_draft(self, database_id: str, gmail_id: str):
        try:
            # Send the draft
            sent_message = self.service.users().drafts().send(userId='me', body={'id': gmail_id}).execute()
            print(f"Draft with ID {gmail_id} sent successfully.")

            # Remove the draft from Firestore
            draft_ref = self.db.collection("drafts").document(database_id)
            draft_ref.delete()
            print(f"Draft with database ID {database_id} removed from Firestore.")

            return sent_message
        except HttpError as error:
            print(f"An error occurred: {error}")
            return None

    def get_draft(self, draft_id: str) -> Draft:
        draft_ref = self.db.collection("drafts").document(draft_id)
        draft_data = draft_ref.get().to_dict()
        if draft_data:
            return Draft(**draft_data)
        return None

    def update_draft(self, draft_id: str, updated_data: dict) -> bool:
        draft_ref = self.db.collection("drafts").document(draft_id)
        updated_data['date_modified'] = firestore.SERVER_TIMESTAMP
        draft_ref.update(updated_data)
        return True

    def delete_draft(self, draft_id: str) -> bool:
        draft_ref = self.db.collection("drafts").document(draft_id)
        draft_ref.delete()
        return True

    def get_sent_emails(self, max_results=None):
        # Calculate the timestamp for 1 year ago
        one_year_ago = (datetime.utcnow() - timedelta(days=365)).strftime('%Y/%m/%d')

        query = f'in:sent after:{one_year_ago}'
        
        # If max_results is not specified, we'll fetch all emails
        if max_results:
            results = self.service.users().messages().list(userId='me', q=query, maxResults=max_results).execute()
        else:
            results = self.service.users().messages().list(userId='me', q=query).execute()

        messages = results.get('messages', [])
        sent_emails = []

        for message in messages:
            msg = self.service.users().messages().get(userId='me', id=message['id'], format='full').execute()
            subject = next((header['value'] for header in msg['payload']['headers'] if header['name'].lower() == 'subject'), 'No Subject')
            recipient = next((header['value'] for header in msg['payload']['headers'] if header['name'].lower() == 'to'), 'Unknown Recipient')
            date = next((header['value'] for header in msg['payload']['headers'] if header['name'].lower() == 'date'), 'Unknown Date')
            
            # Extract full body
            body = ""
            if 'parts' in msg['payload']:
                for part in msg['payload']['parts']:
                    if part['mimeType'] == 'text/plain':
                        body = base64.urlsafe_b64decode(part['body'].get('data', '')).decode()
                        break
            else:
                body = base64.urlsafe_b64decode(msg['payload']['body'].get('data', '')).decode()
            
            sent_emails.append({
                'id': message['id'],
                'threadId': message['threadId'],
                'subject': subject,
                'recipient': recipient,
                'date': date,
                'body': body
            })

        return sent_emails

    def can_create_draft(self):
        user_ref = self.db.collection("users").document(self.user_data['id'])
        user_doc = user_ref.get()
        user_data = user_doc.to_dict()
        
        if user_data.get('unlimited_drafts', False):
            return True
        
        remaining_drafts = user_data.get('drafts', 0)
        return remaining_drafts > 0

    def mark_email_as_read(self, message_id):
        try:
            self.service.users().messages().modify(
                userId='me',
                id=message_id,
                body={'removeLabelIds': ['UNREAD']}
            ).execute()
            print(f"Marked email {message_id} as read.")
        except HttpError as error:
            print(f"An error occurred while marking email as read: {error}")

    def create_draft_reply(self, user_id, thread_id, message_id, to, subject, message_text):
        try:
            message = self.create_reply_message(
                sender=self.user_data.get('email'),
                to=to,
                subject=subject,
                message_text=message_text,
                thread_id=thread_id,
                message_id=message_id
            )

            draft = self.service.users().drafts().create(userId=user_id, body={'message': message}).execute()
            draft_id = draft['id']
            print(f'Draft id: {draft_id}')
            
            # Get the draft details to extract the compose ID
            draft_details = self.service.users().drafts().get(userId=user_id, id=draft_id, format='full').execute()
            
            # Extract the compose ID from the draft details
            message = draft_details.get('message', {})
            headers = message.get('payload', {}).get('headers', [])
            for header in headers:
                if header['name'] == 'Message-ID':
                    compose_id = re.search(r'<(.+?)>', header['value']).group(1)
                    break
            else:
                compose_id = draft_id  # Fallback to draft_id if Message-ID is not found
            
            # Construct the draft link
            draft_link = f"https://mail.google.com/mail/u/0/#inbox/{thread_id}"
            
            return draft_id, draft_link, compose_id
        except HttpError as error:
            print(f'An error occurred: {error}')
            return None, None, None

    def create_reply_message(self, sender, to, subject, message_text, thread_id, message_id):
        message = MIMEText(message_text)
        message['from'] = sender
        message['to'] = to
        message['subject'] = subject
        message['In-Reply-To'] = message_id
        message['References'] = message_id

        raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()

        return {
            'raw': raw_message,
            'threadId': thread_id
        }
