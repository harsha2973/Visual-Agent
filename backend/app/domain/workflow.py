from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, ConfigDict

class WorkflowDetectionRequest(BaseModel):
    session_id: str
    user_id: Optional[str] = None
    events: List[Dict[str, Any]]
    ai_vision_results: Optional[List[Dict[str, Any]]] = None

class WorkflowGraphNode(BaseModel):
    id: str
    category: str
    title: str
    duration_seconds: int

class WorkflowGraphEdge(BaseModel):
    source: str
    target: str
    transition_type: str
    is_interruption: bool = False

class WorkflowGraphResponse(BaseModel):
    session_id: str
    nodes: List[WorkflowGraphNode]
    edges: List[Dict[str, Any]]
    total_duration_seconds: int
    interruption_count: int

class WorkflowResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    session_id: str
    user_id: Optional[str] = None
    category: str
    title: str
    start_time: datetime
    end_time: datetime
    duration_seconds: int
    confidence: float
    is_interruption: bool
    interruption_type: Optional[str] = None
    graph_json: Optional[Dict[str, Any]] = None
    created_at: datetime
