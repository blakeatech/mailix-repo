import csv
from datetime import datetime
import sys
import os
import email
import re
from bs4 import BeautifulSoup
import pandas as pd
from llama_index import Document, VectorStoreIndex, OpenAIEmbedding, OpenAI, CallbackManager
from llama_index.core.settings import Settings
import pickle
from utils.firestore_client import get_firestore_client
from utils.gmail_service import GmailService

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

class SentEmailProcessor(GmailService):
    def __init__(self, user_data, csv_filename):
        super().__init__()
        self.user_data = user_data
        self.csv_filename = csv_filename
        self.db = get_firestore_client()

    def extract_reply(self, email_body):
        msg = email.message_from_string(email_body)
        
        if msg.is_multipart():
            for part in msg.walk():
                if part.get_content_type() == "text/plain":
                    return self.clean_text(part.get_payload())
                elif part.get_content_type() == "text/html":
                    html_content = part.get_payload()
                    soup = BeautifulSoup(html_content, 'html.parser')
                    text = soup.get_text()
                    return self.clean_text(text)
        else:
            if msg.get_content_type() == "text/html":
                soup = BeautifulSoup(msg.get_payload(), 'html.parser')
                text = soup.get_text()
                return self.clean_text(text)
            else:
                return self.clean_text(msg.get_payload())

    def clean_text(self, text):
        # Implement any text cleaning logic here
        return text.strip()

    def collect_sent_emails(self):
        sent_emails = self.get_sent_emails(self.user_data)
        print(f"Found {len(sent_emails)} sent emails for user {self.user_data.get('email')}")
        
        data = []
        for email in sent_emails:
            reply_text = self.extract_reply(email['body'])
            data.append({
                'user_id': self.user_data['id'],
                'email_id': email['id'],
                'thread_id': email['threadId'],
                'subject': email['subject'],
                'recipient': email['recipient'],
                'date': email['date'],
                'reply_text': reply_text
            })
        
        df = pd.DataFrame(data)
        df.to_csv(self.csv_filename, index=False)
        print(f"Sent emails collected and stored in {self.csv_filename}")
        return df

    def create_vector_store_index(self, df):
        df = df[df['reply_text'].str.len() > 40]
        df = df.drop_duplicates(subset=['reply_text'], keep='first')
        
        text_data = df['reply_text'].dropna().tolist()
        documents = [Document(text=text) for text in text_data]
        
        embedding_model = OpenAIEmbedding()
        llm = OpenAI(temperature=0, model_name="gpt-4o")
        callback_manager = CallbackManager()
        
        index = VectorStoreIndex.from_documents(
            documents, embed_model=embedding_model, callback_manager=callback_manager
        )
        
        Settings.llm = llm
        return index

    def save_index_to_firestore(self, index):
        # Serialize the index to a binary format
        serialized_index = pickle.dumps(index)
        
        # Update the user's document in Firestore with the serialized index
        user_ref = self.db.collection("users").document(self.user_data['id'])
        user_ref.update({"vector_store_index": serialized_index})
        print(f"Index saved to Firestore for user {self.user_data['email']}")

    def load_index_from_firestore(self):
        # Retrieve the user's document from Firestore
        user_ref = self.db.collection("users").document(self.user_data['id'])
        user_doc = user_ref.get()
        
        if user_doc.exists:
            user_data = user_doc.to_dict()
            serialized_index = user_data.get("vector_store_index")
            
            if serialized_index:
                # Deserialize the index from the binary format
                index = pickle.loads(serialized_index)
                print(f"Index loaded from Firestore for user {self.user_data['email']}")
                return index
            else:
                print(f"No index found for user {self.user_data['email']}")
                return None
        else:
            print(f"User document not found for {self.user_data['email']}")
            return None

def clean_text(text):
    # Remove email signatures
    text = re.sub(r'--\s*\n.*', '', text, flags=re.DOTALL)
    
    # Remove quoted text
    text = re.sub(r'^>.*$', '', text, flags=re.MULTILINE)
    
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text

def extract_reply(email_body):
    # Parse the email body
    msg = email.message_from_string(email_body)
    
    if msg.is_multipart():
        for part in msg.walk():
            if part.get_content_type() == "text/plain":
                return clean_text(part.get_payload())
            elif part.get_content_type() == "text/html":
                html_content = part.get_payload()
                soup = BeautifulSoup(html_content, 'html.parser')
                text = soup.get_text()
                return clean_text(text)
    else:
        if msg.get_content_type() == "text/html":
            soup = BeautifulSoup(msg.get_payload(), 'html.parser')
            text = soup.get_text()
            return clean_text(text)
        else:
            return clean_text(msg.get_payload())

def collect_sent_emails():
    print("Step 1: Initializing Firestore client")
    db = get_firestore_client()

    print("Step 2: Fetching users from database")
    users_ref = db.collection("users")
    users = users_ref.stream()

    print("Step 3: Preparing CSV file")
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    csv_filename = f"sent_emails_{timestamp}.csv"
    
    with open(csv_filename, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['user_id', 'email_id', 'thread_id', 'subject', 'recipient', 'date', 'reply_text']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()

        for user in users:
            user_data = user.to_dict()
            user_data['id'] = user.id

            if 'google_refresh_token' not in user_data:
                print(f"Skipping user {user_data.get('email')}: Not connected to Gmail")
                continue

            print(f"Processing user: {user_data.get('email')}")
            gmail_service = GmailService(user_data)

            sent_emails = gmail_service.get_sent_emails()
            
            if not sent_emails:
                print(f"No sent emails found for user {user_data.get('email')}")
                continue

            print(f"Found {len(sent_emails)} sent emails for user {user_data.get('email')}")
            
            for email in sent_emails:
                reply_text = extract_reply(email['body'])
                writer.writerow({
                    'user_id': user_data['id'],
                    'email_id': email['id'],
                    'thread_id': email['threadId'],
                    'subject': email['subject'],
                    'recipient': email['recipient'],
                    'date': email['date'],
                    'reply_text': reply_text
                })

    print(f"Sent emails collected and stored in {csv_filename}")


if __name__ == "__main__":
    collect_sent_emails()