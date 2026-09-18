from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from llm.client import llm_client

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = ""
    userId: Optional[str] = None

@router.post("/")
async def chat(request: ChatRequest):
    """Chat with AI tutor"""
    try:
        response = await llm_client.chat(request.message, request.context)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
