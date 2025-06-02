import unittest
from unittest.mock import Mock, patch
from google.oauth2.credentials import Credentials
from googleapiclient.errors import HttpError
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from services.gmail_service import GmailService

class TestGmailService(unittest.TestCase):
    def setUp(self):
        """Set up test fixtures before each test method."""
        self.mock_credentials = Mock(spec=Credentials)
        self.gmail_service = GmailService(credentials=self.mock_credentials)

    @patch('googleapiclient.discovery.build')
    def test_init_gmail_service(self, mock_build):
        """Test Gmail service initialization."""
        mock_service = Mock()
        mock_build.return_value = mock_service
        
        gmail_service = GmailService(credentials=self.mock_credentials)
        
        mock_build.assert_called_once_with('gmail', 'v1', credentials=self.mock_credentials)
        self.assertIsNotNone(gmail_service.service)

    @patch('googleapiclient.discovery.build')
    def test_send_email_success(self, mock_build):
        """Test successful email sending."""
        mock_service = Mock()
        mock_build.return_value = mock_service
        mock_service.users().messages().send().execute.return_value = {'id': '12345'}

        result = self.gmail_service.send_email(
            to='recipient@example.com',
            subject='Test Subject',
            body='Test Body',
            sender='sender@example.com'
        )

        self.assertEqual(result['id'], '12345')
        mock_service.users().messages().send.assert_called_once()

    @patch('googleapiclient.discovery.build')
    def test_send_email_with_attachment(self, mock_build):
        """Test sending email with attachment."""
        mock_service = Mock()
        mock_build.return_value = mock_service
        mock_service.users().messages().send().execute.return_value = {'id': '12345'}

        attachment_content = b'Test attachment content'
        attachment_name = 'test.txt'

        result = self.gmail_service.send_email(
            to='recipient@example.com',
            subject='Test Subject',
            body='Test Body',
            sender='sender@example.com',
            attachments=[(attachment_name, attachment_content)]
        )

        self.assertEqual(result['id'], '12345')
        mock_service.users().messages().send.assert_called_once()

    @patch('googleapiclient.discovery.build')
    def test_send_email_http_error(self, mock_build):
        """Test handling of HTTP errors during email sending."""
        mock_service = Mock()
        mock_build.return_value = mock_service
        mock_service.users().messages().send().execute.side_effect = HttpError(
            resp=Mock(status=500), content=b'Server Error'
        )

        with self.assertRaises(HttpError):
            self.gmail_service.send_email(
                to='recipient@example.com',
                subject='Test Subject',
                body='Test Body',
                sender='sender@example.com'
            )

    @patch('googleapiclient.discovery.build')
    def test_send_email_invalid_recipient(self, mock_build):
        """Test sending email to invalid recipient."""
        mock_service = Mock()
        mock_build.return_value = mock_service

        with self.assertRaises(ValueError):
            self.gmail_service.send_email(
                to='invalid-email',
                subject='Test Subject',
                body='Test Body',
                sender='sender@example.com'
            )

    @patch('googleapiclient.discovery.build')
    def test_send_html_email(self, mock_build):
        """Test sending email with HTML content."""
        mock_service = Mock()
        mock_build.return_value = mock_service
        mock_service.users().messages().send().execute.return_value = {'id': '12345'}

        html_content = '<html><body><h1>Test</h1><p>HTML Content</p></body></html>'
        
        result = self.gmail_service.send_email(
            to='recipient@example.com',
            subject='Test Subject',
            body=html_content,
            sender='sender@example.com',
            is_html=True
        )

        self.assertEqual(result['id'], '12345')
        mock_service.users().messages().send.assert_called_once()

    def test_validate_email_address(self):
        """Test email address validation."""
        valid_emails = [
            'test@example.com',
            'user.name@domain.com',
            'user+label@domain.co.uk'
        ]
        invalid_emails = [
            'invalid-email',
            '@domain.com',
            'user@.com',
            'user@domain.'
        ]

        for email in valid_emails:
            self.assertTrue(self.gmail_service.validate_email_address(email))

        for email in invalid_emails:
            self.assertFalse(self.gmail_service.validate_email_address(email))

if __name__ == '__main__':
    unittest.main()
