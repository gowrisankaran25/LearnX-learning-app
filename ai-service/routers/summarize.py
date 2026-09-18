from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from llm.client import llm_client

router = APIRouter()

class SummarizeRequest(BaseModel):
    content: str

@router.post("/")
async def summarize(request: SummarizeRequest):
    """Summarize content"""
    try:
        summary = await llm_client.summarize(request.content)
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
