from typing import List, Dict, Any, Optional
from pydantic import BaseModel, ConfigDict, Field

class EntityItem(BaseModel):
    name: str
    type: str
    value: Optional[str] = None

class MultimodalAnalysisResult(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    analysis_id: str
    current_application: str = Field(description="Name or title of the active application/web app")
    current_task: str = Field(description="Inferred user task or active workflow goal")
    visible_components: List[str] = Field(description="List of key UI components currently visible")
    workflow_step: str = Field(description="Current step in the user workflow")
    confidence: float = Field(description="Confidence score between 0.0 and 1.0")
    summary: str = Field(description="Natural language summary of screenshot contents")
    important_entities: List[Dict[str, Any]] = Field(description="Key entities, IDs, labels, or data values extracted")
    provider_used: str = Field(description="AI Provider used for analysis (e.g. openai, gemini, mock)")
    created_at: str
