from openai import OpenAI
from config.settings import settings
from utils.gmail_service import GmailService
import json
import logging

import pandas
from llama_index.core import Document, VectorStoreIndex
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.llms.openai import OpenAI as LlamaOpenAI
from llama_index.core.callbacks import CallbackManager
from langchain.chat_models import ChatOpenAI

import os

os.environ["OPENAI_API_KEY"] = settings.openai_api_key

import email
import re
from bs4 import BeautifulSoup
import pandas as pd
from llama_index.core.settings import Settings
import pickle
import firebase_admin
from firebase_admin import credentials, firestore

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

class SentEmailProcessor(GmailService):
    def __init__(self, user_data):
        super().__init__(user_data)

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
        text = re.sub(r'--\s*\n.*', '', text, flags=re.DOTALL)
        text = re.sub(r'^>.*$', '', text, flags=re.MULTILINE)
        text = re.sub(r'\s+', ' ', text).strip()
        return text

    def collect_sent_emails(self):
        sent_emails = self.get_sent_emails()
        
        data = []
        for email in sent_emails:
            reply_text = self.extract_reply(email['body'])
            data.append({
                'email_id': email['id'],
                'thread_id': email['threadId'],
                'subject': email['subject'],
                'recipient': email['recipient'],
                'date': email['date'],
                'reply_text': reply_text
            })
        
        df = pd.DataFrame(data)
        return df

    def create_vector_store_index(self, df):
        try:
            df = df[df['reply_text'].str.len() > 40]
            df = df.drop_duplicates(subset=['reply_text'], keep='first')
            
            text_data = df['reply_text'].dropna().tolist()
            documents = [Document(text=text) for text in text_data]
            
            embedding_model = OpenAIEmbedding()
            llm = LlamaOpenAI(temperature=0, model_name="gpt-4o")
            callback_manager = CallbackManager()
            
            index = VectorStoreIndex.from_documents(
                documents, embed_model=embedding_model, callback_manager=callback_manager
            )
            
            Settings.llm = llm
            return index
        except Exception as e:
            logger.error(f"Error creating vector store index: {e}")
            return None

    def save_index_to_firestore(self, index):
        try:
            # Serialize the index to a binary format
            serialized_index = pickle.dumps(index)
        
            # Update the user's document in Firestore with the serialized index
            user_ref = self.db.collection("users").document(self.user_data['id'])
            user_ref.update({"vector_store_index": serialized_index})
            logger.info(f"Index saved to Firestore for user {self.user_data['email']}")
        except Exception as e:
            logger.error(f"Error saving index to Firestore: {e}")

    def load_index_from_firestore(self):
        try:
            # Retrieve the user's document from Firestore
            user_ref = self.db.collection("users").document(self.user_data['id'])
            user_doc = user_ref.get()
            
            if user_doc.exists:
                user_data = user_doc.to_dict()
                serialized_index = user_data.get("vector_store_index")
                
                if serialized_index:
                    # Deserialize the index from the binary format
                    index = pickle.loads(serialized_index)
                    logger.info(f"Index loaded from Firestore for user {self.user_data['email']}")
                    return index
                else:
                    logger.info(f"No index found for user {self.user_data['email']}")
                    return None
            else:
                logger.info(f"User document not found for {self.user_data['email']}")
                return None
        except Exception as e:
            logger.error(f"Error loading index from Firestore: {e}")
            return None


class OpenAIService:
    def __init__(self, vector_store_index):
        self.client = OpenAI(api_key=settings.openai_api_key)
        self.vector_store_index = vector_store_index

    def preprocess_email(self, email_content):
        """
        Preprocess the email content by removing HTML tags and cleaning the text.
        """
        # Check if the content is HTML
        if re.search(r'<[^>]+>', email_content):
            # Parse HTML
            soup = BeautifulSoup(email_content, 'html.parser')
            
            # Extract text from HTML
            text = soup.get_text(separator=' ', strip=True)
            
            # Remove extra whitespace
            text = re.sub(r'\s+', ' ', text).strip()
            
            # Remove common email signatures and footers
            text = re.sub(r'--\s*\n.*', '', text, flags=re.DOTALL)
            text = re.sub(r'^>.*$', '', text, flags=re.MULTILINE)
            
            return text
        else:
            # If it's not HTML, just clean up whitespace
            return ' '.join(email_content.split())

    def retrieve_context(self, email_content):
        # Preprocess the email content before querying
        preprocessed_content = self.preprocess_email(email_content)
        
        # Query the vector store index with the preprocessed email content
        query_engine = self.vector_store_index.as_query_engine()
        response = query_engine.query(preprocessed_content)
        
        # Extract the most relevant context
        return response.response

    def generate_response(self, name, email_content, length, stop_words, writing_style):
        # Preprocess the email content
        preprocessed_content = self.preprocess_email(email_content)
        
        # Retrieve context from LlamaIndex based on the preprocessed email content
        try:
            context = self.retrieve_context(preprocessed_content)
        except TypeError as e:
            logger.error(f"Error retrieving context: {e}")
            return ''
        
        # Modify the prompt to include the preprocessed content and context
        prompt = f"""
        Given the following email content:

        {preprocessed_content}

        And the following context from the sender's past emails:

        {context}

        Generate a response to this email. Your response should include both a subject line and the body of the email.

        You will not use any of the following words in your response: {stop_words}

        Your writing style should be {writing_style}.

        The length of your response should be {length}.

        Your name is {name}. Please take use the first name in the signature.If the name is None, don't write a closing signature. If you don't know the first name of the person you are responding to, begin the email with "Hi." Don't use a placeholder like [First Name].

        Please do not make the email sound AI-generated. Use human-like language and sound natural please. Act like you're talking to a colleague.
        
        Use the following function call format in your response:

        generate_email(subject="[Your generated subject line here]", body="[Your generated email body here]")

        In addition, you must also include a topic that is either Professional, Personal, or Marketing. This is so the email response can be categorized.

        Ensure the subject is concise and relevant, and the body is professional and addresses the content of the original email.
        """

        response = self.client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a helpful assistant skilled in writing professional email responses."},
                {"role": "user", "content": prompt}
            ],
            functions=[
                {
                    "name": "generate_email",
                    "description": "Generate a subject and body for an email response",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "subject": {
                                "type": "string",
                                "description": "The subject line for the email response"
                            },
                            "body": {
                                "type": "string",
                                "description": "The body content for the email response"
                            },
                            "topic": {
                                "type": "string",
                                "description": "The topic of the email response: must be either Professional, Personal, or Marketing."
                            }
                        },
                        "required": ["subject", "body", "topic"]
                    }
                }
            ],
            function_call={"name": "generate_email"}
        )

        # Extract the function call from the response
        function_call = json.loads(response.choices[0].message.function_call.arguments)

        subject = function_call.get("subject")
        body = function_call.get("body")
        topic = function_call.get("topic")
        
        return {
            "subject": subject,
            "body": body,
            "topic": topic
        }
