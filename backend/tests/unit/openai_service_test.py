import unittest
from unittest.mock import Mock, patch, MagicMock
from bs4 import BeautifulSoup
from app.utils.openai_service import OpenAIService, SentEmailProcessor
import pandas as pd
from llama_index.core import VectorStoreIndex
import json

class TestOpenAIService(unittest.TestCase):
    def setUp(self):
        """Set up test fixtures before each test method."""
        self.mock_vector_store = Mock(spec=VectorStoreIndex)
        self.openai_service = OpenAIService(self.mock_vector_store)

    def test_preprocess_email_html(self):
        """Test preprocessing of HTML email content."""
        html_content = """
        <html>
            <body>
                <div>Hello World</div>
                <div class="signature">
                    --<br>
                    Best regards<br>
                    John Doe
                </div>
            </body>
        </html>
        """
        expected_output = "Hello World"
        result = self.openai_service.preprocess_email(html_content)
        self.assertIn(expected_output, result)
        self.assertNotIn("Best regards", result)

    def test_preprocess_email_plain_text(self):
        """Test preprocessing of plain text email content."""
        plain_text = """
        Hello World
        
        --
        Best regards
        John Doe
        """
        result = self.openai_service.preprocess_email(plain_text)
        self.assertIn("Hello World", result)
        self.assertNotIn("Best regards", result)

    @patch('app.utils.openai_service.OpenAI')
    def test_generate_response(self, mock_openai):
        """Test email response generation."""
        # Mock the OpenAI API response
        mock_response = Mock()
        mock_response.choices = [
            Mock(
                message=Mock(
                    function_call=Mock(
                        arguments='{"subject": "Re: Test", "body": "Test response", "topic": "Professional"}'
                    )
                )
            )
        ]
        mock_openai.return_value.chat.completions.create.return_value = mock_response

        # Mock context retrieval
        self.mock_vector_store.as_query_engine.return_value.query.return_value.response = "Previous context"

        result = self.openai_service.generate_response(
            name="John",
            email_content="Test email",
            length="short",
            stop_words=[],
            writing_style="professional"
        )

        self.assertEqual(result["subject"], "Re: Test")
        self.assertEqual(result["body"], "Test response")
        self.assertEqual(result["topic"], "Professional")

    def test_retrieve_context(self):
        """Test context retrieval from vector store."""
        # Mock the query engine
        mock_query_engine = Mock()
        mock_query_engine.query.return_value.response = "Retrieved context"
        self.mock_vector_store.as_query_engine.return_value = mock_query_engine

        result = self.openai_service.retrieve_context("Test query")
        self.assertEqual(result, "Retrieved context")
        mock_query_engine.query.assert_called_once()

class TestSentEmailProcessor(unittest.TestCase):
    def setUp(self):
        """Set up test fixtures before each test method."""
        self.mock_user_data = {
            'id': 'test_user_123',
            'email': 'test@example.com'
        }
        self.processor = SentEmailProcessor(self.mock_user_data)

    def test_extract_reply_plain_text(self):
        """Test extracting reply from plain text email."""
        email_body = """
        This is a reply
        
        > Original message
        > More original content
        
        --
        Signature
        """
        result = self.processor.extract_reply(email_body)
        self.assertIn("This is a reply", result)
        self.assertNotIn("Original message", result)
        self.assertNotIn("Signature", result)

    def test_extract_reply_html(self):
        """Test extracting reply from HTML email."""
        email_body = """
        <html>
            <body>
                <div>This is a reply</div>
                <div class="quote">Original message</div>
                <div class="signature">Best regards</div>
            </body>
        </html>
        """
        result = self.processor.extract_reply(email_body)
        self.assertIn("This is a reply", result)
        self.assertNotIn("Original message", result)
        self.assertNotIn("Best regards", result)

    @patch('app.utils.openai_service.GmailService.get_sent_emails')
    def test_collect_sent_emails(self, mock_get_sent_emails):
        """Test collection of sent emails."""
        mock_get_sent_emails.return_value = [
            {
                'id': 'msg1',
                'threadId': 'thread1',
                'subject': 'Test Subject',
                'recipient': 'recipient@example.com',
                'date': '2024-01-01',
                'body': 'Test body content'
            }
        ]

        result = self.processor.collect_sent_emails()
        self.assertIsInstance(result, pd.DataFrame)
        self.assertEqual(len(result), 1)
        self.assertEqual(result.iloc[0]['subject'], 'Test Subject')

    @patch('app.utils.openai_service.VectorStoreIndex')
    def test_create_vector_store_index(self, mock_vector_store):
        """Test creation of vector store index."""
        test_df = pd.DataFrame({
            'reply_text': ['Test reply 1', 'Test reply 2'],
            'email_id': ['1', '2'],
            'thread_id': ['t1', 't2']
        })

        mock_index = Mock(spec=VectorStoreIndex)
        mock_vector_store.from_documents.return_value = mock_index

        result = self.processor.create_vector_store_index(test_df)
        self.assertEqual(result, mock_index)
        mock_vector_store.from_documents.assert_called_once()

    @patch('pickle.dumps')
    def test_save_index_to_firestore(self, mock_pickle_dumps):
        """Test saving index to Firestore."""
        mock_index = Mock()
        mock_pickle_dumps.return_value = b'serialized_index'

        self.processor.save_index_to_firestore(mock_index)

        # Verify Firestore update was called
        self.processor.db.collection().document().update.assert_called_once_with(
            {"vector_store_index": b'serialized_index'}
        )

    @patch('pickle.loads')
    def test_load_index_from_firestore(self, mock_pickle_loads):
        """Test loading index from Firestore."""
        mock_index = Mock()
        mock_pickle_loads.return_value = mock_index

        # Mock Firestore document
        mock_doc = Mock()
        mock_doc.exists = True
        mock_doc.to_dict.return_value = {"vector_store_index": b'serialized_index'}
        self.processor.db.collection().document().get.return_value = mock_doc

        result = self.processor.load_index_from_firestore()
        self.assertEqual(result, mock_index)
        mock_pickle_loads.assert_called_once_with(b'serialized_index')

if __name__ == '__main__':
    unittest.main()
