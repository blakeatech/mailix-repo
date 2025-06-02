# utils/firestore_client.py
from google.cloud import firestore
from google.oauth2 import service_account
import os

def get_firestore_client():
    # Get the path to the project root directory
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    
    # Construct the path to the service account file
    credentials_path = os.path.join(project_root, 'utils', 'firebase_service_account.json')

    # Check if the file exists
    if not os.path.exists(credentials_path):
        raise FileNotFoundError(f"The credentials file was not found at {credentials_path}")

    # Load the service account credentials
    credentials = service_account.Credentials.from_service_account_file(credentials_path)

    # Initialize and return the Firestore client with the credentials
    return firestore.Client(credentials=credentials)