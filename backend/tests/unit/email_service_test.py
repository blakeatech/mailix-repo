import unittest
from unittest.mock import Mock, patch
from datetime import datetime, timezone
from botocore.exceptions import ClientError
from app.utils.email_service import EmailService

class TestEmailService(unittest.TestCase):
    def setUp(self):
        """Set up test fixtures before each test method."""
        self.patcher = patch('boto3.client')
        self.mock_boto3 = self.patcher.start()
        self.email_service = EmailService()
        
    def tearDown(self):
        """Clean up after each test."""
        self.patcher.stop()

    def test_reset_password_email_success(self):
        """Test successful reset password email sending."""
        # Mock successful SES response
        self.email_service.ses_client.send_email.return_value = {
            'MessageId': 'test_message_123'
        }

        result = self.email_service.reset_password_email(
            recipient_email='test@example.com',
            reset_password_link='https://notaic.site/reset-password?token=abc123'
        )

        # Verify the email was sent with correct parameters
        self.assertTrue(result)
        self.email_service.ses_client.send_email.assert_called_once()
        
        # Verify email content
        call_args = self.email_service.ses_client.send_email.call_args[1]
        self.assertEqual(call_args['Destination']['ToAddresses'], ['test@example.com'])
        self.assertEqual(call_args['Message']['Subject']['Data'], 'Reset Your Password')
        self.assertIn('reset-password?token=abc123', call_args['Message']['Body']['Html']['Data'])

    def test_reset_password_email_failure(self):
        """Test handling of failed reset password email sending."""
        # Mock SES client error
        self.email_service.ses_client.send_email.side_effect = ClientError(
            error_response={'Error': {'Message': 'Test error'}},
            operation_name='SendEmail'
        )

        result = self.email_service.reset_password_email(
            recipient_email='test@example.com',
            reset_password_link='https://notaic.site/reset-password?token=abc123'
        )

        self.assertFalse(result)
        self.email_service.ses_client.send_email.assert_called_once()

    def test_send_verification_email_success(self):
        """Test successful verification email sending."""
        self.email_service.ses_client.send_email.return_value = {
            'MessageId': 'test_message_123'
        }

        result = self.email_service.send_verification_email(
            recipient_email='test@example.com',
            verification_link='https://notaic.site/verify?token=abc123'
        )

        self.assertTrue(result)
        self.email_service.ses_client.send_email.assert_called_once()
        
        # Verify email content
        call_args = self.email_service.ses_client.send_email.call_args[1]
        self.assertEqual(call_args['Destination']['ToAddresses'], ['test@example.com'])
        self.assertEqual(call_args['Message']['Subject']['Data'], 'Sign up to Notaic')
        self.assertIn('verify?token=abc123', call_args['Message']['Body']['Html']['Data'])

    def test_send_verification_email_failure(self):
        """Test handling of failed verification email sending."""
        self.email_service.ses_client.send_email.side_effect = ClientError(
            error_response={'Error': {'Message': 'Test error'}},
            operation_name='SendEmail'
        )

        result = self.email_service.send_verification_email(
            recipient_email='test@example.com',
            verification_link='https://notaic.site/verify?token=abc123'
        )

        self.assertFalse(result)
        self.email_service.ses_client.send_email.assert_called_once()

    def test_send_waitlist_confirmation_email_success(self):
        """Test successful waitlist confirmation email sending."""
        self.email_service.ses_client.send_email.return_value = {
            'MessageId': 'test_message_123'
        }

        result = self.email_service.send_waitlist_confirmation_email(
            recipient_email='test@example.com',
            referral_code='REF123',
            token='verify_token_123'
        )

        self.assertTrue(result)
        self.email_service.ses_client.send_email.assert_called_once()
        
        # Verify email content
        call_args = self.email_service.ses_client.send_email.call_args[1]
        self.assertEqual(call_args['Destination']['ToAddresses'], ['test@example.com'])
        self.assertEqual(call_args['Message']['Subject']['Data'], "Welcome to Notaic's Waiting List!")
        self.assertIn('REF123', call_args['Message']['Body']['Html']['Data'])

    def test_send_waitlist_confirmation_email_failure(self):
        """Test handling of failed waitlist confirmation email sending."""
        self.email_service.ses_client.send_email.side_effect = ClientError(
            error_response={'Error': {'Message': 'Test error'}},
            operation_name='SendEmail'
        )

        result = self.email_service.send_waitlist_confirmation_email(
            recipient_email='test@example.com',
            referral_code='REF123',
            token='verify_token_123'
        )

        self.assertFalse(result)
        self.email_service.ses_client.send_email.assert_called_once()

    def test_send_free_month_email_success(self):
        """Test successful free month email sending."""
        self.email_service.ses_client.send_email.return_value = {
            'MessageId': 'test_message_123'
        }

        result = self.email_service.send_free_month_email(
            recipient_email='test@example.com',
            referral_code='REF123'
        )

        self.assertTrue(result)
        self.email_service.ses_client.send_email.assert_called_once()
        
        # Verify email content
        call_args = self.email_service.ses_client.send_email.call_args[1]
        self.assertEqual(call_args['Destination']['ToAddresses'], ['test@example.com'])
        self.assertEqual(call_args['Message']['Subject']['Data'], "You've Earned a Free Month!")
        self.assertIn('REF123', call_args['Message']['Body']['Html']['Data'])

    def test_send_free_month_email_failure(self):
        """Test handling of failed free month email sending."""
        self.email_service.ses_client.send_email.side_effect = ClientError(
            error_response={'Error': {'Message': 'Test error'}},
            operation_name='SendEmail'
        )

        result = self.email_service.send_free_month_email(
            recipient_email='test@example.com',
            referral_code='REF123'
        )

        self.assertFalse(result)
        self.email_service.ses_client.send_email.assert_called_once()

if __name__ == '__main__':
    unittest.main()
