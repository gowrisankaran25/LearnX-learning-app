from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from llm.client import llm_client

router = APIRouter()

class QuestionsRequest(BaseModel):
    topic: str
    count: Optional[int] = 5
    userId: Optional[str] = None

@router.post("/")
async def generate_questions(request: QuestionsRequest):
    """Generate practice questions"""
    try:
        questions = await llm_client.generate_questions(request.topic, request.count)
        return {"questions": questions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
