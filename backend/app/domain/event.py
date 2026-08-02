from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, ConfigDict

class EventCreate(BaseModel):
    id: Optional[str] = None
    sessionId: Optional[str] = None
    session_id: Optional[str] = None
    eventType: Optional[str] = None
    event_type: Optional[str] = None
    timestamp: Optional[str] = None
    url: Optional[str] = None
    tabId: Optional[int] = None
    tab_id: Optional[int] = None
    windowId: Optional[int] = None
    window_id: Optional[int] = None
    payload: Dict[str, Any]

class EventBatchCreate(BaseModel):
    events: List[EventCreate]

class EventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    session_id: str
    event_type: str
    timestamp: datetime
    url: Optional[str] = None
    tab_id: Optional[int] = None
    window_id: Optional[int] = None
    payload: Dict[str, Any]
