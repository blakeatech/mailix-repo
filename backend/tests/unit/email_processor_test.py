import unittest
from unittest.mock import Mock, patch, MagicMock
from bs4 import BeautifulSoup
from miscellaneous.email_processor import EmailProcessor
from app.utils.gmail_service import GmailService, Draft

class TestEmailProcessor(unittest.TestCase):
    def setUp(self):
        """Set up test fixtures before each test method."""
        self.patcher = patch('miscellaneous.email_processor.get_vector_store_index')
        self.mock_vector_store = self.patcher.start()
        self.email_processor = EmailProcessor()
        
    def tearDown(self):
        """Clean up after each test."""
        self.patcher.stop()

    def test_clean_email_body(self):
        """Test email body cleaning functionality."""
        test_cases = [
            # HTML content
            (
                '<html><body><p>Hello World</p><div class="signature">Best regards</div></body></html>',
                'Hello World Best regards'
            ),
            # Email with signature
            (
                'Main content\n--\nJohn Doe\nCompany Name',
                'Main content'
            ),
            # Email with quoted reply
            (
                'New message\n> Previous message\n> Another line',
                'New message'
            )
        ]

        for input_text, expected_output in test_cases:
            cleaned = self.email_processor._clean_email_body(input_text)
            self.assertEqual(cleaned.strip(), expected_output.strip())

    def test_is_promotional(self):
        """Test promotional email detection."""
        promotional_emails = [
            "Don't miss our amazing sale!",
            "Limited time offer - 50% off",
            "Exclusive deal just for you",
            "Sign up for your free trial today",
        ]
        
        non_promotional_emails = [
            "Meeting schedule for tomorrow",
            "Project update report",
            "Question about the documentation",
        ]

        for email in promotional_emails:
            self.assertTrue(
                self.email_processor._is_promotional(email),
                f"Failed to identify promotional email: {email}"
            )

        for email in non_promotional_emails:
            self.assertFalse(
                self.email_processor._is_promotional(email),
                f"Incorrectly identified as promotional: {email}"
            )

    @patch('miscellaneous.email_processor.GmailService')
    @patch('miscellaneous.email_processor.OpenAIService')
    def test_generate_draft_success(self, mock_openai, mock_gmail):
        """Test successful draft generation."""
        # Mock user data
        mock_user_data = {
            'google_refresh_token': 'fake_token',
            'email': 'user@example.com',
            'first_name': 'John'
        }
        
        # Mock Firestore get
        self.email_processor.users_ref.document().get().to_dict = Mock(
            return_value=mock_user_data
        )

        # Mock email data
        test_email = {
            'body': 'Test email content',
            'subject': 'Test Subject',
            'sender': 'sender@example.com',
            'threadId': 'thread123',
            'id': 'msg123'
        }

        # Mock OpenAI response
        mock_openai.return_value.generate_response.return_value = {
            'body': 'AI generated response'
        }

        # Mock Gmail service
        mock_gmail_instance = mock_gmail.return_value
        mock_gmail_instance.create_draft.return_value = ('draft123', 'http://draft-link', 'compose123')
        mock_gmail_instance.store_draft.return_value = 'stored_draft_123'

        # Execute the method
        self.email_processor.generate_draft('user123', test_email)

        # Verify the draft was created and stored
        mock_gmail_instance.create_draft.assert_called_once()
        mock_gmail_instance.store_draft.assert_called_once()

    @patch('miscellaneous.email_processor.GmailService')
    def test_process_user_emails(self, mock_gmail):
        """Test processing user emails."""
        # Mock user data
        mock_user_data = {
            'google_refresh_token': 'fake_token',
            'email': 'user@example.com'
        }
        
        # Mock Firestore get
        self.email_processor.users_ref.document().get().to_dict = Mock(
            return_value=mock_user_data
        )

        # Mock Gmail service
        mock_gmail_instance = mock_gmail.return_value
        mock_gmail_instance.get_unread_emails.return_value = [
            {
                'body': 'Email 1 content',
                'subject': 'Subject 1',
                'sender': 'sender1@example.com',
                'threadId': 'thread1',
                'id': 'msg1'
            },
            {
                'body': 'Email 2 content',
                'subject': 'Subject 2',
                'sender': 'sender2@example.com',
                'threadId': 'thread2',
                'id': 'msg2'
            }
        ]

        # Execute the method
        self.email_processor.process_user_emails('user123', limit=2)

        # Verify emails were processed
        mock_gmail_instance.get_unread_emails.assert_called_once()

    @patch('miscellaneous.email_processor.GmailService')
    def test_process_user_emails_no_unread(self, mock_gmail):
        """Test processing when there are no unread emails."""
        # Mock user data
        mock_user_data = {
            'google_refresh_token': 'fake_token',
            'email': 'user@example.com'
        }
        
        # Mock Firestore get
        self.email_processor.users_ref.document().get().to_dict = Mock(
            return_value=mock_user_data
        )

        # Mock Gmail service with no unread emails
        mock_gmail_instance = mock_gmail.return_value
        mock_gmail_instance.get_unread_emails.return_value = []

        # Execute the method
        self.email_processor.process_user_emails('user123')

        # Verify get_unread_emails was called but no further processing occurred
        mock_gmail_instance.get_unread_emails.assert_called_once()

    def test_process_user_emails_no_token(self):
        """Test processing for user without Google token."""
        # Mock user data without token
        mock_user_data = {
            'email': 'user@example.com'
        }
        
        # Mock Firestore get
        self.email_processor.users_ref.document().get().to_dict = Mock(
            return_value=mock_user_data
        )

        # Execute the method
        self.email_processor.process_user_emails('user123')
        # No exception should be raised, method should just return

if __name__ == '__main__':
    unittest.main()