from google.cloud import firestore
from app.utils.gmail_service import GmailService, Draft
from app.utils.openai_service import OpenAIService, SentEmailProcessor
from app.config.settings import settings
from app.utils.firestore_client import get_firestore_client
import random

def main():
    print("Step 1: Initializing services")
    db = get_firestore_client()

    print("Step 2: Fetching specific user from database")
    users_ref = db.collection("users")
    user_query = users_ref.where("email", "==", "blake@blakeamtech.com").limit(1).get()
    
    if not user_query:
        print("User not found. Exiting.")
        return

    user = user_query[0]
    user_data = user.to_dict()
    user_data['id'] = user.id

    if 'google_refresh_token' not in user_data:
        print(f"User {user_data.get('email')} is not connected to Gmail. Exiting.")
        return

    gmail_service = GmailService(user_data)
    sent_email_processor = SentEmailProcessor(user_data)

    print(f"Processing user: {user_data.get('email')}")

    # Get or create vector store index
    vector_store_index = sent_email_processor.load_index_from_firestore()
    if vector_store_index is None:
        print(f"Creating new vector store index for user {user_data.get('email')}")
        df = sent_email_processor.collect_sent_emails()
        vector_store_index = sent_email_processor.create_vector_store_index(df)
        sent_email_processor.save_index_to_firestore(vector_store_index)

    # Initialize OpenAIService with the vector store index
    openai_service = OpenAIService(vector_store_index)

    unread_emails = gmail_service.get_unread_emails()
    
    if not unread_emails:
        print(f"No unread emails found for user {user_data.get('email')}. Exiting.")
        return

    print(f"Found {len(unread_emails)} unread emails for user {user_data.get('email')}")

    print("Step 3: Selecting a random email")
    random_email = random.choice(unread_emails)
    print(f"Selected email with subject: {random_email['subject']}")

    print("Step 4: Generating response using OpenAI")
    name = user_data.get('full_name', 'None')

    length = user_data.get('questions', {}).get('averageLength', 'Short')
    stop_words = str(user_data.get('questions', {}).get('selectedWords', []))
    response = openai_service.generate_response(name, random_email['body'], length, stop_words)
    print("Response generated successfully")

    print("Step 5: Creating draft reply")
    print(f"Response: {response}")
    
    draft_id, draft_link, compose_id = gmail_service.create_draft(
        user_id='me',
        message_body={
            'raw': gmail_service.create_message(
                sender=user_data.get('email'),
                to=random_email['sender'],
                subject=f"Re: {random_email['subject']}",
                message_text=response['body'],
                thread_id=random_email['threadId'],
                message_id=random_email['id']
            )['raw']
        }
    )

    if draft_id:
        print(f"Draft created successfully in Gmail with ID: {draft_id}")
        print(f"Draft link: {draft_link}")
        print(f"Compose ID: {compose_id}")
        
        # Store the draft in Firebase
        new_draft = Draft(
            user_id=user_data['id'],
            draft_id=draft_id,
            thread_id=random_email['threadId'],
            message_id=random_email['id'],
            recipient_email=random_email['sender'],
            sender_email=user_data.get('email'),
            email_subject=random_email['subject'],
            email_body=random_email['body'],
            draft_subject=f"Re: {random_email['subject']}",
            draft_body=response['body'],
            draft_body_topic=response['topic'],
            gmail_draft_id=draft_id,
            draft_link=draft_link,
            compose_id=compose_id
        )
        stored_draft_id = gmail_service.store_draft(new_draft)
        print(f"Draft stored in Firebase with ID: {stored_draft_id}")
    else:
        print(f"Failed to create draft in Gmail for user: {user_data.get('email')}")

    print("Process completed")

if __name__ == "__main__":
    main()
