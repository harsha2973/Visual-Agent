from typing import List, Optional, Union
from fastapi import APIRouter, Depends, status, Query, Body
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.domain.event import EventCreate, EventBatchCreate, EventResponse
from app.infrastructure.repositories.event_repo import EventRepository

router = APIRouter(tags=["Events"])

@router.post("/events", response_model=Union[EventResponse, List[EventResponse]], status_code=status.HTTP_201_CREATED)
async def create_events(
    payload: Union[EventCreate, EventBatchCreate, List[EventCreate]] = Body(...),
    db: AsyncSession = Depends(get_db),
):
    """Ingests browser activity events (single event, batch object, or list of events)."""
    event_repo = EventRepository(db)

    if isinstance(payload, EventBatchCreate):
        created = await event_repo.create_bulk_events(payload.events)
        return created
    elif isinstance(payload, list):
        created = await event_repo.create_bulk_events(payload)
        return created
    else:
        created = await event_repo.create_event(payload)
        return created

@router.get("/events", response_model=List[EventResponse])
async def list_events(
    session_id: Optional[str] = Query(None, alias="sessionId"),
    event_type: Optional[str] = Query(None, alias="eventType"),
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
):
    """Queries and filters browser activity events by session_id, event_type, with pagination."""
    event_repo = EventRepository(db)
    events = await event_repo.query_events(
        session_id=session_id,
        event_type=event_type,
        skip=skip,
        limit=limit,
    )
    return events
