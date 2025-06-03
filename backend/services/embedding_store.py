"""
Vector Database Support for Notaic
Provides functionality to store and query email embeddings for memory-aware responses.
"""
import os
import logging
from typing import List, Dict, Any, Optional, Union
from dotenv import load_dotenv
import pinecone
from weaviate import Client, WeaviateAuthClientCredentials
from langchain_pinecone import PineconeVectorStore
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.schema import Document

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EmbeddingStore:
    """
    A service for storing and querying vector embeddings.
    Supports both Pinecone and Weaviate as backend vector databases.
    """
    
    def __init__(self, provider: str = "pinecone"):
        """
        Initialize the embedding store with the specified vector database provider.
        
        Args:
            provider (str): The vector database provider to use ('pinecone' or 'weaviate')
        """
        self.provider = provider.lower()
        self.embeddings = OpenAIEmbeddings()
        
        if self.provider == "pinecone":
            self._init_pinecone()
        elif self.provider == "weaviate":
            self._init_weaviate()
        else:
            raise ValueError(f"Unsupported vector database provider: {provider}")
        
        logger.info(f"Initialized EmbeddingStore with {self.provider} provider")
    
    def _init_pinecone(self):
        """Initialize Pinecone client and index"""
        api_key = os.getenv("PINECONE_API_KEY")
        environment = os.getenv("PINECONE_ENVIRONMENT", "gcp-starter")
        index_name = os.getenv("PINECONE_INDEX", "notaic-emails")
        
        if not api_key:
            raise ValueError("PINECONE_API_KEY environment variable is required")
        
        # Initialize Pinecone
        pinecone.init(api_key=api_key, environment=environment)
        
        # Create index if it doesn't exist
        if index_name not in pinecone.list_indexes():
            logger.info(f"Creating Pinecone index: {index_name}")
            pinecone.create_index(
                name=index_name,
                dimension=1536,  # OpenAI embedding dimension
                metric="cosine"
            )
        
        self.index = pinecone.Index(index_name)
        self.vector_store = PineconeVectorStore(
            index_name=index_name,
            embedding=self.embeddings
        )
        logger.info(f"Connected to Pinecone index: {index_name}")
    
    def _init_weaviate(self):
        """Initialize Weaviate client"""
        url = os.getenv("WEAVIATE_URL")
        api_key = os.getenv("WEAVIATE_API_KEY")
        
        if not url:
            raise ValueError("WEAVIATE_URL environment variable is required")
        
        auth_config = None
        if api_key:
            auth_config = WeaviateAuthClientCredentials(api_key=api_key)
        
        self.client = Client(url=url, auth_client_secret=auth_config)
        
        # Create schema if it doesn't exist
        if not self.client.schema.exists("Email"):
            logger.info("Creating Weaviate schema for Email class")
            self.client.schema.create_class({
                "class": "Email",
                "properties": [
                    {"name": "content", "dataType": ["text"]},
                    {"name": "subject", "dataType": ["text"]},
                    {"name": "sender", "dataType": ["text"]},
                    {"name": "timestamp", "dataType": ["date"]},
                    {"name": "user_id", "dataType": ["string"]},
                    {"name": "email_id", "dataType": ["string"]},
                    {"name": "metadata", "dataType": ["text"]}
                ]
            })
        
        logger.info("Connected to Weaviate")
    
    def store_email_embedding(
        self, 
        email_id: str, 
        content: str, 
        metadata: Dict[str, Any],
        user_id: str
    ) -> str:
        """
        Store an email embedding in the vector database.
        
        Args:
            email_id (str): Unique identifier for the email
            content (str): Email content to embed
            metadata (Dict[str, Any]): Additional metadata about the email
            user_id (str): ID of the user who owns the email
            
        Returns:
            str: ID of the stored embedding
        """
        logger.info(f"Storing embedding for email {email_id}")
        
        if self.provider == "pinecone":
            return self._store_in_pinecone(email_id, content, metadata, user_id)
        elif self.provider == "weaviate":
            return self._store_in_weaviate(email_id, content, metadata, user_id)
    
    def _store_in_pinecone(
        self, 
        email_id: str, 
        content: str, 
        metadata: Dict[str, Any],
        user_id: str
    ) -> str:
        """Store an embedding in Pinecone"""
        # Add user_id to metadata for filtering
        metadata_with_user = {**metadata, "user_id": user_id, "email_id": email_id}
        
        # Create document for LangChain
        document = Document(
            page_content=content,
            metadata=metadata_with_user
        )
        
        # Store in Pinecone
        self.vector_store.add_documents([document])
        
        return email_id
    
    def _store_in_weaviate(
        self, 
        email_id: str, 
        content: str, 
        metadata: Dict[str, Any],
        user_id: str
    ) -> str:
        """Store an embedding in Weaviate"""
        # Extract common fields from metadata
        subject = metadata.get("subject", "")
        sender = metadata.get("sender", "")
        timestamp = metadata.get("timestamp", "")
        
        # Create the object in Weaviate
        with self.client.batch as batch:
            batch.add_data_object(
                data_object={
                    "content": content,
                    "subject": subject,
                    "sender": sender,
                    "timestamp": timestamp,
                    "user_id": user_id,
                    "email_id": email_id,
                    "metadata": str(metadata)  # Convert dict to string for storage
                },
                class_name="Email",
                uuid=email_id
            )
        
        return email_id
    
    def query_similar_emails(
        self, 
        query: str, 
        user_id: str, 
        limit: int = 5,
        score_threshold: float = 0.7
    ) -> List[Dict[str, Any]]:
        """
        Query for emails similar to the given query.
        
        Args:
            query (str): The query text to find similar emails
            user_id (str): ID of the user to filter results
            limit (int): Maximum number of results to return
            score_threshold (float): Minimum similarity score (0-1)
            
        Returns:
            List[Dict[str, Any]]: List of similar emails with their metadata
        """
        logger.info(f"Querying similar emails for user {user_id}")
        
        if self.provider == "pinecone":
            return self._query_pinecone(query, user_id, limit, score_threshold)
        elif self.provider == "weaviate":
            return self._query_weaviate(query, user_id, limit, score_threshold)
    
    def _query_pinecone(
        self, 
        query: str, 
        user_id: str, 
        limit: int = 5,
        score_threshold: float = 0.7
    ) -> List[Dict[str, Any]]:
        """Query for similar emails in Pinecone"""
        # Use LangChain to query with metadata filtering
        filter_dict = {"user_id": user_id}
        
        results = self.vector_store.similarity_search_with_score(
            query=query,
            k=limit,
            filter=filter_dict
        )
        
        # Format results
        similar_emails = []
        for doc, score in results:
            if score >= score_threshold:
                similar_emails.append({
                    "content": doc.page_content,
                    "metadata": doc.metadata,
                    "similarity_score": score
                })
        
        return similar_emails
    
    def _query_weaviate(
        self, 
        query: str, 
        user_id: str, 
        limit: int = 5,
        score_threshold: float = 0.7
    ) -> List[Dict[str, Any]]:
        """Query for similar emails in Weaviate"""
        # Generate embedding for the query
        query_embedding = self.embeddings.embed_query(query)
        
        # Query Weaviate
        result = (
            self.client.query
            .get("Email", ["content", "subject", "sender", "timestamp", "email_id", "metadata"])
            .with_where({
                "path": ["user_id"],
                "operator": "Equal",
                "valueString": user_id
            })
            .with_near_vector({
                "vector": query_embedding,
                "certainty": score_threshold
            })
            .with_limit(limit)
            .do()
        )
        
        # Format results
        similar_emails = []
        if "data" in result and "Get" in result["data"] and "Email" in result["data"]["Get"]:
            for item in result["data"]["Get"]["Email"]:
                similar_emails.append({
                    "content": item["content"],
                    "metadata": {
                        "subject": item["subject"],
                        "sender": item["sender"],
                        "timestamp": item["timestamp"],
                        "email_id": item["email_id"],
                        **eval(item["metadata"])  # Convert string back to dict
                    },
                    "similarity_score": item.get("_additional", {}).get("certainty", 0)
                })
        
        return similar_emails
    
    def delete_email_embedding(self, email_id: str) -> bool:
        """
        Delete an email embedding from the vector database.
        
        Args:
            email_id (str): ID of the email embedding to delete
            
        Returns:
            bool: True if successful, False otherwise
        """
        logger.info(f"Deleting embedding for email {email_id}")
        
        try:
            if self.provider == "pinecone":
                self.index.delete(ids=[email_id])
            elif self.provider == "weaviate":
                self.client.data_object.delete(email_id, "Email")
            return True
        except Exception as e:
            logger.error(f"Error deleting embedding: {str(e)}")
            return False
