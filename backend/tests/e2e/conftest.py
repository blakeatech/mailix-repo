import pytest
import os
from dotenv import load_dotenv
from google.cloud import firestore
from firebase_admin import credentials, initialize_app
import stripe

def pytest_configure(config):
    """Set up test environment before running tests."""
    # Load environment variables
    load_dotenv('.env.test')
    
    # Initialize Firebase Admin SDK for testing
    cred = credentials.Certificate('path/to/test/service-account.json')
    initialize_app(cred)
    
    # Set up Stripe test keys
    stripe.api_key = os.getenv('STRIPE_TEST_SECRET_KEY')
    
    # Set up test database
    setup_test_database()

def setup_test_database():
    """Set up test database with initial data."""
    db = firestore.Client()
    
    # Clear existing test data
    clear_test_collections(db)
    
    # Set up any necessary test data
    setup_test_users(db)

def clear_test_collections(db):
    """Clear all test collections."""
    collections = ['users', 'drafts', 'subscriptions']
    for collection in collections:
        docs = db.collection(collection).stream()
        for doc in docs:
            doc.reference.delete()

def setup_test_users(db):
    """Set up test users in the database."""
    test_users = [
        {
            'email': 'test@example.com',
            'first_name': 'Test',
            'last_name': 'User',
            'is_pro': False
        }
    ]
    
    for user in test_users:
        db.collection('users').add(user)

@pytest.fixture(scope="session")
def test_client():
    """Create a test client for the FastAPI application."""
    from fastapi.testclient import TestClient
    from app.main import app
    
    return TestClient(app)

@pytest.fixture(scope="session")
def test_db():
    """Create a test database client."""
    return firestore.Client()

@pytest.fixture(scope="function")
def cleanup_database(test_db):
    """Clean up the database after each test."""
    yield
    clear_test_collections(test_db) 