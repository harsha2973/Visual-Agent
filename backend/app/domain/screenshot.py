from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, ConfigDict

class ScreenshotCreate(BaseModel):
    session_id: str
    user_id: Optional[str] = None
    page_url: Optional[str] = None
    tab_id: Optional[int] = None
    retention_days: Optional[int] = 7

class ScreenshotResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    session_id: str
    user_id: Optional[str] = None
    s3_key: str
    url: str
    thumbnail_url: Optional[str] = None
    file_size: int
    width: int
    height: int
    format: str
    page_url: Optional[str] = None
    tab_id: Optional[int] = None
    created_at: datetime
    expires_at: Optional[datetime] = None

class PresignedUploadRequest(BaseModel):
    session_id: str
    file_name: str
    content_type: str = "image/jpeg"

class PresignedUploadResponse(BaseModel):
    s3_key: str
    url: str
    fields: Dict[str, Any]
