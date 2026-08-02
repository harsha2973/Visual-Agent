from typing import List
from fastapi import APIRouter, HTTPException, status
from app.core.rag_engine import rag_engine
from app.domain.copilot import CopilotQueryRequest, CopilotResponse

router = APIRouter(prefix="/copilot", tags=["AI Copilot"])

@router.post("/ask", response_model=CopilotResponse, status_code=status.HTTP_200_OK)
async def ask_ai_copilot(payload: CopilotQueryRequest):
    """
    RAG-powered AI Copilot endpoint that accepts user natural language queries
    ('What was I working on yesterday?', 'When did I visit OpenAI?', 'Summarize today's work.', 'What distracted me?'),
    retrieves nearest vector context, and synthesizes structured answers with citation sources.
    """
    if not payload.query or not payload.query.strip():
        raise HTTPException(status_code=400, detail="Query prompt cannot be empty")

    return await rag_engine.answer_copilot_query(
        query=payload.query,
        session_id=payload.session_id,
        user_id=payload.user_id,
    )

@router.get("/suggestions", response_model=List[str])
def get_copilot_suggestions():
    """Returns contextual prompt suggestions for the AI Copilot UI."""
    return [
        "What was I working on yesterday?",
        "When did I visit OpenAI?",
        "Summarize today's work.",
        "What distracted me?",
    ]
