"""
Email Agent using LangGraph
Implements a workflow for email processing: classifier → prioritizer → responder
"""
import os
import logging
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime
from dotenv import load_dotenv
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser, JsonOutputParser
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, END
from pydantic import BaseModel, Field
from services.embedding_store import EmbeddingStore

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize OpenAI client
llm = ChatOpenAI(model=os.getenv("OPENAI_MODEL_NAME", "gpt-4o"))

# Initialize embedding store for memory-aware responses
embedding_store = EmbeddingStore(provider=os.getenv("VECTOR_DB_PROVIDER", "pinecone"))

# Define state schema
class EmailAgentState(BaseModel):
    """State for the email agent workflow"""
    email: Dict[str, Any] = Field(description="The email being processed")
    user_id: str = Field(description="ID of the user who owns the email")
    classification: Optional[Dict[str, Any]] = Field(default=None, description="Classification results")
    priority: Optional[Dict[str, Any]] = Field(default=None, description="Priority assessment")
    response: Optional[str] = Field(default=None, description="Generated response")
    similar_emails: Optional[List[Dict[str, Any]]] = Field(default=None, description="Similar past emails")
    error: Optional[str] = Field(default=None, description="Error message if any")

# Define the classification node
def classify_email(state: EmailAgentState) -> EmailAgentState:
    """
    Classifies the email into categories and extracts key information.
    """
    logger.info(f"Classifying email for user {state.user_id}")
    
    email_content = state.email.get("content", "")
    email_subject = state.email.get("subject", "")
    email_sender = state.email.get("sender", "")
    
    # Classification prompt
    classification_prompt = ChatPromptTemplate.from_template("""
    You are an email classifier. Analyze the following email and classify it.
    
    Email Subject: {subject}
    Email From: {sender}
    Email Content: {content}
    
    Provide a JSON response with the following fields:
    - category: The primary category (Personal, Work, Marketing, Notification, Support, Other)
    - subcategory: A more specific subcategory
    - urgency: A rating from 1-5 (1 being lowest, 5 being highest)
    - contains_question: Boolean indicating if the email contains questions that need answers
    - key_entities: List of important entities mentioned (people, companies, products)
    - action_items: List of actions that might need to be taken
    - sentiment: The overall sentiment (Positive, Neutral, Negative)
    
    JSON Response:
    """)
    
    # Parse the classification
    try:
        chain = classification_prompt | llm | JsonOutputParser()
        classification = chain.invoke({
            "subject": email_subject,
            "sender": email_sender,
            "content": email_content
        })
        
        # Log classification results
        logger.info(f"Email classified as {classification.get('category')} with urgency {classification.get('urgency')}")
        
        # Update state
        state.classification = classification
        return state
    except Exception as e:
        logger.error(f"Error in classification: {str(e)}")
        state.error = f"Classification error: {str(e)}"
        return state

# Define the prioritization node
def prioritize_email(state: EmailAgentState) -> EmailAgentState:
    """
    Prioritizes the email based on classification and user preferences.
    """
    logger.info(f"Prioritizing email for user {state.user_id}")
    
    # Skip if classification failed
    if not state.classification:
        logger.warning("Skipping prioritization due to missing classification")
        return state
    
    # Retrieve email details
    email_subject = state.email.get("subject", "")
    email_sender = state.email.get("sender", "")
    category = state.classification.get("category", "Other")
    urgency = state.classification.get("urgency", 1)
    
    # Prioritization prompt
    priority_prompt = ChatPromptTemplate.from_template("""
    You are an email prioritizer. Determine the priority of this email based on its classification.
    
    Email Subject: {subject}
    Email From: {sender}
    Category: {category}
    Urgency Rating: {urgency}
    Contains Question: {contains_question}
    Action Items: {action_items}
    
    Provide a JSON response with the following fields:
    - priority_level: The priority level (Critical, High, Medium, Low, Ignore)
    - response_timeframe: Suggested timeframe to respond (Immediate, Today, This Week, When Convenient, No Response Needed)
    - reasoning: Brief explanation for this prioritization
    
    JSON Response:
    """)
    
    # Parse the prioritization
    try:
        chain = priority_prompt | llm | JsonOutputParser()
        priority = chain.invoke({
            "subject": email_subject,
            "sender": email_sender,
            "category": category,
            "urgency": urgency,
            "contains_question": state.classification.get("contains_question", False),
            "action_items": state.classification.get("action_items", [])
        })
        
        # Log priority results
        logger.info(f"Email priority: {priority.get('priority_level')} with response timeframe {priority.get('response_timeframe')}")
        
        # Update state
        state.priority = priority
        return state
    except Exception as e:
        logger.error(f"Error in prioritization: {str(e)}")
        state.error = f"Prioritization error: {str(e)}"
        return state

# Define the memory retrieval node
def retrieve_similar_emails(state: EmailAgentState) -> EmailAgentState:
    """
    Retrieves similar past emails to provide context for the response.
    """
    logger.info(f"Retrieving similar emails for user {state.user_id}")
    
    email_content = state.email.get("content", "")
    email_subject = state.email.get("subject", "")
    
    # Combine subject and content for better similarity matching
    query = f"{email_subject} {email_content}"
    
    try:
        # Query the embedding store
        similar_emails = embedding_store.query_similar_emails(
            query=query,
            user_id=state.user_id,
            limit=3,
            score_threshold=0.7
        )
        
        # Log results
        logger.info(f"Found {len(similar_emails)} similar emails")
        
        # Update state
        state.similar_emails = similar_emails
        return state
    except Exception as e:
        logger.error(f"Error retrieving similar emails: {str(e)}")
        # Don't set error state, just continue without similar emails
        state.similar_emails = []
        return state

# Define the response generation node
def generate_response(state: EmailAgentState) -> EmailAgentState:
    """
    Generates a response to the email based on classification, priority, and similar emails.
    """
    logger.info(f"Generating response for user {state.user_id}")
    
    # Skip if classification or prioritization failed
    if not state.classification or not state.priority:
        logger.warning("Skipping response generation due to missing classification or priority")
        state.error = "Cannot generate response without classification and priority"
        return state
    
    # Retrieve email details
    email_content = state.email.get("content", "")
    email_subject = state.email.get("subject", "")
    email_sender = state.email.get("sender", "")
    
    # Format similar emails context
    similar_emails_context = ""
    if state.similar_emails:
        similar_emails_context = "Here are similar past emails for context:\n\n"
        for i, email in enumerate(state.similar_emails, 1):
            similar_emails_context += f"Similar Email {i}:\n"
            similar_emails_context += f"Content: {email.get('content', '')[:200]}...\n"
            similar_emails_context += f"Metadata: {email.get('metadata', {})}\n\n"
    
    # Response generation prompt
    response_prompt = ChatPromptTemplate.from_template("""
    You are an AI email assistant. Generate a response to the following email.
    
    Email Subject: {subject}
    Email From: {sender}
    Email Content: {content}
    
    Classification: {classification}
    Priority: {priority}
    
    {similar_emails_context}
    
    Generate a professional and helpful response that addresses the key points and questions in the email.
    If the email doesn't require a response, provide a brief note explaining why.
    
    Response:
    """)
    
    # Generate the response
    try:
        chain = response_prompt | llm | StrOutputParser()
        response = chain.invoke({
            "subject": email_subject,
            "sender": email_sender,
            "content": email_content,
            "classification": state.classification,
            "priority": state.priority,
            "similar_emails_context": similar_emails_context
        })
        
        # Log response generation
        logger.info("Response generated successfully")
        
        # Update state
        state.response = response
        
        # Store the email embedding for future reference
        email_id = state.email.get("email_id", f"email_{datetime.now().timestamp()}")
        embedding_store.store_email_embedding(
            email_id=email_id,
            content=email_content,
            metadata={
                "subject": email_subject,
                "sender": email_sender,
                "timestamp": state.email.get("timestamp", datetime.now().isoformat()),
                "classification": state.classification,
                "priority": state.priority
            },
            user_id=state.user_id
        )
        
        return state
    except Exception as e:
        logger.error(f"Error generating response: {str(e)}")
        state.error = f"Response generation error: {str(e)}"
        return state

# Define the decision function for error handling
def should_continue(state: EmailAgentState) -> str:
    """
    Determines whether to continue the workflow or end due to errors.
    """
    if state.error:
        logger.warning(f"Workflow ended with error: {state.error}")
        return "error"
    return "continue"

# Build the workflow graph
def build_email_workflow() -> StateGraph:
    """
    Builds and returns the email processing workflow graph.
    """
    # Create the graph
    workflow = StateGraph(EmailAgentState)
    
    # Add nodes
    workflow.add_node("classify", classify_email)
    workflow.add_node("prioritize", prioritize_email)
    workflow.add_node("retrieve_memory", retrieve_similar_emails)
    workflow.add_node("respond", generate_response)
    
    # Define the edges
    workflow.add_edge("classify", "prioritize")
    workflow.add_edge("prioritize", "retrieve_memory")
    workflow.add_edge("retrieve_memory", "respond")
    workflow.add_edge("respond", END)
    
    # Add conditional edges for error handling
    workflow.add_conditional_edges(
        "classify",
        should_continue,
        {
            "continue": "prioritize",
            "error": END
        }
    )
    
    workflow.add_conditional_edges(
        "prioritize",
        should_continue,
        {
            "continue": "retrieve_memory",
            "error": END
        }
    )
    
    # Set the entry point
    workflow.set_entry_point("classify")
    
    return workflow

# Create the compiled workflow
email_workflow = build_email_workflow().compile()

def process_email(email: Dict[str, Any], user_id: str) -> Dict[str, Any]:
    """
    Process an email through the LangGraph workflow.
    
    Args:
        email (Dict[str, Any]): The email to process
        user_id (str): ID of the user who owns the email
        
    Returns:
        Dict[str, Any]: The processing results
    """
    logger.info(f"Processing email for user {user_id}")
    
    # Initialize the state
    initial_state = EmailAgentState(
        email=email,
        user_id=user_id
    )
    
    # Run the workflow
    try:
        final_state = email_workflow.invoke(initial_state)
        
        # Return the results
        return {
            "email_id": email.get("email_id", ""),
            "classification": final_state.classification,
            "priority": final_state.priority,
            "response": final_state.response,
            "error": final_state.error
        }
    except Exception as e:
        logger.error(f"Error in email workflow: {str(e)}")
        return {
            "email_id": email.get("email_id", ""),
            "error": f"Workflow error: {str(e)}"
        }
