from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from llm.client import llm_client

router = APIRouter()

class ExplainRequest(BaseModel):
    topic: str
    userId: Optional[str] = None

@router.post("/")
async def explain(request: ExplainRequest):
    """Get AI explanation for a topic"""
    try:
        explanation = await llm_client.explain(request.topic)
        return {"explanation": explanation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
