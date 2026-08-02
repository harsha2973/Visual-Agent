from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class SearchQueryRequest(BaseModel):
    query: str
    category: Optional[str] = None
    session_id: Optional[str] = None
    date_from: Optional[str] = None
    date_to: Optional[str] = None
    limit: int = 20
    offset: int = 0

class SearchResultItem(BaseModel):
    id: str
    type: str  # WEBSITE, TASK, APPLICATION, OCR_TEXT, AI_SUMMARY, WORKFLOW
    title: str
    snippet: str
    category: str
    url: Optional[str] = None
    timestamp: str
    score: float = 1.0
    metadata: Dict[str, Any] = {}

class SearchResponse(BaseModel):
    query: str
    total_hits: int
    results: List[SearchResultItem]
