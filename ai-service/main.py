from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os
from typing import Optional, List
import shutil

from routers import chat, explain, questions, summarize, notes

load_dotenv()

app = FastAPI(
    title="LearnX AI Service",
    description="AI-powered learning assistance service",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat.router, prefix="/chat", tags=["Chat"])
app.include_router(explain.router, prefix="/explain", tags=["Explain"])
app.include_router(questions.router, prefix="/generate-questions", tags=["Questions"])
app.include_router(summarize.router, prefix="/summarize", tags=["Summarize"])
app.include_router(notes.router, prefix="/analyze-notes", tags=["Notes Analysis"])

@app.get("/")
async def root():
    return {
        "message": "LearnX AI Service",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8000)),
        reload=True
    )
