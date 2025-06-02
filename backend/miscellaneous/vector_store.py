from google.cloud import firestore
from utils.openai_service import SentEmailProcessor
from llama_index.core import VectorStoreIndex
from utils.firestore_client import get_firestore_client
import pickle


def ask_question_to_index(query_engine, question):
    # Assuming you have a method to query the index
    response = query_engine.query(question)
    return response

def main():
    print("Step 1: Initializing Firestore client")
    db = get_firestore_client()

    print("Step 2: Fetching users from database")
    users_ref = db.collection("users")
    users = users_ref.stream()

    question = "What project did the author mention to Brandon in their emails?"  # Example question

    for user in users:
        user_data = user.to_dict()
        user_data['id'] = user.id

        print(f"Processing user: {user_data.get('email')}")

        # Load the vector index from Firestore
        processor = SentEmailProcessor(user_data)
        index = processor.load_index_from_firestore()

        query_engine = index.as_query_engine()

        if index:
            print(f"Asking question to the index for user {user_data.get('email')}")
            response = ask_question_to_index(query_engine, question)
            print(f"Response for user {user_data.get('email')}: {response}")
        else:
            print(f"No vector index found for user {user_data.get('email')}")

if __name__ == "__main__":
    main()