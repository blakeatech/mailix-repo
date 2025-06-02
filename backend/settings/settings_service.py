# settings/settings_service.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import datetime
from utils.firestore_client import get_firestore_client

settings_router = APIRouter()

# Model for example responses
class ExampleResponse(BaseModel):
    question: str
    answer: str

# Endpoint to collect example responses from the user
@settings_router.post("/collect-responses")
def collect_responses(user_id: str, responses: list[ExampleResponse]):
    db = get_firestore_client()
    user_ref = db.collection("users").document(user_id)

    if not user_ref.get().exists:
        raise HTTPException(status_code=404, detail="User not found")

    # Store example responses
    user_ref.update({
        "writing_samples": [response.dict() for response in responses],
        "updated_at": datetime.datetime.utcnow()
    })

    return {"message": "Example responses collected successfully. You can now access your dashboard."}
