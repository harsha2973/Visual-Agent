from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class SessionCreate(BaseModel):
    goal: str
    execution_mode: Optional[str] = "IN_BROWSER"

class SessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: Optional[str] = None
    goal: str
    status: str
    execution_mode: str
    created_at: datetime
    updated_at: datetime
