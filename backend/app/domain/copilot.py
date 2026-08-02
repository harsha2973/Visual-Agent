from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class CopilotQueryRequest(BaseModel):
    query: str
    session_id: Optional[str] = None
    user_id: Optional[str] = None

class CopilotSource(BaseModel):
    id: str
    type: str  # WORKFLOW, TELEMETRY, AI_VISION, SCREENSHOT
    title: str
    snippet: str
    timestamp: str
    relevance_score: float

class CopilotResponse(BaseModel):
    query: str
    answer: str
    sources: List[CopilotSource]
    confidence: float
    query_type: str  # HISTORICAL, SEARCH, SUMMARY, INTERRUPTION, GENERAL
    suggested_followups: List[str] = []
