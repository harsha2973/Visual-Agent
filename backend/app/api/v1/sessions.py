from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.domain.session import SessionCreate, SessionResponse
from app.infrastructure.repositories.session_repo import SessionRepository

router = APIRouter(tags=["Sessions"])

@router.post("/sessions", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(
    payload: SessionCreate,
    db: AsyncSession = Depends(get_db),
):
    """Initializes a new Agent Session."""
    session_repo = SessionRepository(db)
    session = await session_repo.create(payload)
    return session

@router.get("/sessions", response_model=List[SessionResponse])
async def list_sessions(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
):
    """Lists all active and past agent sessions."""
    session_repo = SessionRepository(db)
    sessions = await session_repo.get_all(skip=skip, limit=limit)
    return sessions
