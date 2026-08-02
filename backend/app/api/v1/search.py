from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.domain.search import SearchQueryRequest, SearchResponse
from app.infrastructure.repositories.search_repo import SearchRepository

router = APIRouter(prefix="/search", tags=["Full Text Search"])

@router.get("", response_model=SearchResponse)
async def search_visual_agent(
    q: str = Query(..., description="Search query term across Website, Task, Application, OCR, AI Summary, & Workflow"),
    category: Optional[str] = Query(None, description="Filter by workflow category (e.g. CODING, SHOPPING, YOUTUBE)"),
    session_id: Optional[str] = Query(None, description="Filter by session ID"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    """
    Full Text Search API supporting queries across Website URLs, active Tasks, Application names,
    OCR extracted text, AI vision summaries, and Workflow categories with filter parameters.
    """
    repo = SearchRepository(db)
    return await repo.full_text_search(
        query=q,
        category=category,
        session_id=session_id,
        limit=limit,
        offset=offset,
    )

@router.post("", response_model=SearchResponse, status_code=status.HTTP_200_OK)
async def search_visual_agent_post(
    payload: SearchQueryRequest,
    db: AsyncSession = Depends(get_db),
):
    """POST endpoint for full-text search with request body filters."""
    repo = SearchRepository(db)
    return await repo.full_text_search(
        query=payload.query,
        category=payload.category,
        session_id=payload.session_id,
        limit=payload.limit,
        offset=payload.offset,
    )
