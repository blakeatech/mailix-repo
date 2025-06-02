import unittest
from unittest.mock import patch, Mock
import os
from google.cloud import firestore
from google.oauth2 import service_account
from app.utils.firestore_client import get_firestore_client

class TestFirestoreClient(unittest.TestCase):
    def setUp(self):
        """Set up test fixtures before each test method."""
        # Create patches for the dependencies
        self.credentials_patcher = patch('google.oauth2.service_account.Credentials')
        self.firestore_patcher = patch('google.cloud.firestore.Client')
        self.path_exists_patcher = patch('os.path.exists')
        
        # Start the patches
        self.mock_credentials = self.credentials_patcher.start()
        self.mock_firestore = self.firestore_patcher.start()
        self.mock_path_exists = self.path_exists_patcher.start()

    def tearDown(self):
        """Clean up after each test."""
        # Stop all patches
        self.credentials_patcher.stop()
        self.firestore_patcher.stop()
        self.path_exists_patcher.stop()

    def test_get_firestore_client_success(self):
        """Test successful Firestore client initialization."""
        # Mock the credentials file existence
        self.mock_path_exists.return_value = True
        
        # Mock the credentials and client creation
        mock_creds = Mock(spec=service_account.Credentials)
        self.mock_credentials.from_service_account_file.return_value = mock_creds
        
        mock_client = Mock(spec=firestore.Client)
        self.mock_firestore.return_value = mock_client

        # Call the function
        client = get_firestore_client()

        # Verify the client was created with the correct credentials
        self.mock_credentials.from_service_account_file.assert_called_once()
        self.mock_firestore.assert_called_once_with(credentials=mock_creds)
        self.assertEqual(client, mock_client)

    def test_get_firestore_client_missing_credentials(self):
        """Test handling of missing credentials file."""
        # Mock the credentials file as non-existent
        self.mock_path_exists.return_value = False

        # Verify that attempting to get a client raises FileNotFoundError
        with self.assertRaises(FileNotFoundError) as context:
            get_firestore_client()

        # Verify the error message contains the expected path
        self.assertIn('credentials file was not found', str(context.exception))

    @patch('os.path.abspath')
    @patch('os.path.join')
    def test_get_firestore_client_path_construction(self, mock_join, mock_abspath):
        """Test correct construction of credentials file path."""
        # Mock path construction
        mock_abspath.return_value = '/fake/project/root'
        mock_join.side_effect = lambda *args: '/'.join(args)
        self.mock_path_exists.return_value = True

        # Mock credentials and client
        mock_creds = Mock(spec=service_account.Credentials)
        self.mock_credentials.from_service_account_file.return_value = mock_creds
        
        mock_client = Mock(spec=firestore.Client)
        self.mock_firestore.return_value = mock_client

        # Call the function
        get_firestore_client()

        # Verify correct path construction
        mock_abspath.assert_called_once()
        mock_join.assert_any_call(mock_abspath.return_value, 'firebase_service_account.json')

    @patch('google.oauth2.service_account.Credentials.from_service_account_file')
    def test_get_firestore_client_credentials_error(self, mock_from_file):
        """Test handling of credentials loading error."""
        # Mock the credentials file existence
        self.mock_path_exists.return_value = True
        
        # Mock credentials loading error
        mock_from_file.side_effect = ValueError("Invalid credentials format")

        # Verify that the error is propagated
        with self.assertRaises(ValueError) as context:
            get_firestore_client()

        self.assertIn("Invalid credentials format", str(context.exception))

    def test_get_firestore_client_caching(self):
        """Test that multiple calls return the same client instance."""
        # Mock the credentials file existence
        self.mock_path_exists.return_value = True
        
        # Mock credentials and client
        mock_creds = Mock(spec=service_account.Credentials)
        self.mock_credentials.from_service_account_file.return_value = mock_creds
        
        mock_client = Mock(spec=firestore.Client)
        self.mock_firestore.return_value = mock_client

        # Get client twice
        client1 = get_firestore_client()
        client2 = get_firestore_client()

        # Verify that credentials were only loaded once
        self.mock_credentials.from_service_account_file.assert_called_once()
        # Verify that both calls return the same instance
        self.assertEqual(client1, client2)

if __name__ == '__main__':
    unittest.main()
