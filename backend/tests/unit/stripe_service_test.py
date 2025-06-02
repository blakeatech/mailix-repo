import unittest
from unittest.mock import Mock, patch, MagicMock
from fastapi import HTTPException
from app.utils.stripe_service import StripeService
import stripe

class TestStripeService(unittest.TestCase):
    def setUp(self):
        """Set up test fixtures before each test method."""
        self.patcher = patch('app.utils.stripe_service.get_firestore_client')
        self.mock_firestore = self.patcher.start()
        self.stripe_service = StripeService()
        
        # Mock Firestore document reference
        self.mock_doc_ref = Mock()
        self.mock_doc_ref.get.return_value.exists = True
        self.stripe_service.db.collection().document.return_value = self.mock_doc_ref

    def tearDown(self):
        """Clean up after each test."""
        self.patcher.stop()

    @patch('stripe.Customer.create')
    def test_create_customer_success(self, mock_create):
        """Test successful customer creation."""
        mock_create.return_value = Mock(id='cus_123')
        
        customer_id = self.stripe_service.create_customer(
            user_id='user123',
            email='test@example.com'
        )

        self.assertEqual(customer_id, 'cus_123')
        mock_create.assert_called_once_with(
            email='test@example.com',
            metadata={"user_id": 'user123'}
        )

    @patch('stripe.Customer.create')
    def test_create_customer_failure(self, mock_create):
        """Test handling of customer creation failure."""
        mock_create.side_effect = stripe.error.StripeError("Failed to create customer")

        with self.assertRaises(HTTPException) as context:
            self.stripe_service.create_customer(
                user_id='user123',
                email='test@example.com'
            )

        self.assertEqual(context.exception.status_code, 400)
        self.assertEqual(str(context.exception.detail), "Failed to create customer")

    @patch('stripe.Subscription.delete')
    def test_cancel_subscription_success(self, mock_delete):
        """Test successful subscription cancellation."""
        mock_delete.return_value = {'id': 'sub_123', 'status': 'canceled'}

        result = self.stripe_service.cancel_subscription('sub_123')

        self.assertEqual(result['status'], 'canceled')
        mock_delete.assert_called_once_with('sub_123')

    @patch('stripe.Subscription.delete')
    def test_cancel_subscription_failure(self, mock_delete):
        """Test handling of subscription cancellation failure."""
        mock_delete.side_effect = stripe.error.StripeError("Failed to cancel subscription")

        with self.assertRaises(HTTPException) as context:
            self.stripe_service.cancel_subscription('sub_123')

        self.assertEqual(context.exception.status_code, 400)

    @patch('stripe.PaymentMethod.attach')
    @patch('stripe.Customer.modify')
    @patch('stripe.Subscription.create')
    def test_create_subscription_success(self, mock_create, mock_modify, mock_attach):
        """Test successful subscription creation."""
        mock_create.return_value = {'id': 'sub_123', 'status': 'active'}

        result = self.stripe_service.create_subscription(
            customer_id='cus_123',
            payment_method_id='pm_123'
        )

        self.assertEqual(result['status'], 'active')
        mock_attach.assert_called_once()
        mock_modify.assert_called_once()
        mock_create.assert_called_once()

    @patch('stripe.PaymentMethod.attach')
    def test_create_subscription_failure(self, mock_attach):
        """Test handling of subscription creation failure."""
        mock_attach.side_effect = stripe.error.StripeError("Failed to attach payment method")

        with self.assertRaises(HTTPException) as context:
            self.stripe_service.create_subscription(
                customer_id='cus_123',
                payment_method_id='pm_123'
            )

        self.assertEqual(context.exception.status_code, 400)

    def test_update_user_subscription_status_success(self):
        """Test successful update of user subscription status."""
        self.stripe_service.update_user_subscription_status(
            user_id='user123',
            is_pro=True
        )

        self.mock_doc_ref.update.assert_called_once_with({"is_pro": True})

    def test_update_user_subscription_status_user_not_found(self):
        """Test handling of updating non-existent user."""
        self.mock_doc_ref.get.return_value.exists = False

        with self.assertRaises(HTTPException) as context:
            self.stripe_service.update_user_subscription_status(
                user_id='user123',
                is_pro=True
            )

        self.assertEqual(context.exception.status_code, 404)
        self.assertEqual(str(context.exception.detail), "User not found")

    @patch('stripe.Subscription.retrieve')
    def test_handle_payment_failure(self, mock_retrieve):
        """Test handling of payment failure."""
        mock_retrieve.return_value = Mock(
            metadata={'user_id': 'user123'}
        )

        self.stripe_service.handle_payment_failure('sub_123')

        self.mock_doc_ref.update.assert_called_once_with({"is_pro": False})

    @patch('stripe.Subscription.list')
    def test_get_active_subscription_success(self, mock_list):
        """Test successful retrieval of active subscription."""
        mock_subscription = {'id': 'sub_123', 'status': 'active'}
        mock_list.return_value = Mock(data=[mock_subscription])

        result = self.stripe_service.get_active_subscription('cus_123')

        self.assertEqual(result['id'], 'sub_123')
        mock_list.assert_called_once_with(
            customer='cus_123',
            status='active',
            limit=1
        )

    @patch('stripe.Subscription.list')
    def test_get_active_subscription_none_found(self, mock_list):
        """Test when no active subscription is found."""
        mock_list.return_value = Mock(data=[])

        result = self.stripe_service.get_active_subscription('cus_123')

        self.assertIsNone(result)
        mock_list.assert_called_once()

    @patch('stripe.Subscription.list')
    def test_get_active_subscription_failure(self, mock_list):
        """Test handling of subscription retrieval failure."""
        mock_list.side_effect = stripe.error.StripeError("Failed to retrieve subscription")

        with self.assertRaises(HTTPException) as context:
            self.stripe_service.get_active_subscription('cus_123')

        self.assertEqual(context.exception.status_code, 400)

if __name__ == '__main__':
    unittest.main()
