from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.core.workflow_engine import workflow_engine
from app.domain.workflow import (
    WorkflowDetectionRequest,
    WorkflowResponse,
)
from app.infrastructure.models.workflow import WorkflowModel
from app.infrastructure.repositories.workflow_repo import WorkflowRepository

router = APIRouter(prefix="/workflows", tags=["Workflows"])

@router.post("/detect", response_model=List[WorkflowResponse], status_code=status.HTTP_201_CREATED)
async def detect_and_store_workflows(
    payload: WorkflowDetectionRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Combines browser telemetry events with AI vision & OCR results to automatically
    detect workflows (Coding, YouTube, Notion, Jira, Email, Shopping, Docs),
    flag interruptions, generate directed graph, and persist workflows to PostgreSQL.
    """
    detection_result = workflow_engine.process_session_workflows(
        events=payload.events,
        ai_vision_results=payload.ai_vision_results,
    )

    repo = WorkflowRepository(db)
    stored_workflows: List[WorkflowModel] = []
    now = datetime.now(timezone.utc)

    for item in detection_result["workflows"]:
        wf_entity = WorkflowModel(
            id=str(uuid.uuid4()),
            session_id=payload.session_id,
            user_id=payload.user_id,
            category=item["category"],
            title=item["title"],
            start_time=now,
            end_time=now,
            duration_seconds=30,
            confidence=item["confidence"],
            is_interruption=item["is_interruption"],
            interruption_type=item.get("interruption_type"),
            graph_json=detection_result["graph"],
            created_at=now,
        )
        saved = await repo.create(wf_entity)
        stored_workflows.append(saved)

    return stored_workflows

@router.get("", response_model=List[WorkflowResponse])
async def list_workflows_by_session(
    session_id: str,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    """List detected workflows for a given session."""
    repo = WorkflowRepository(db)
    return await repo.list_by_session(session_id, limit=limit)

@router.get("/graph")
async def get_workflow_graph(
    session_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Returns stored directed workflow graph and interruption analytics for a session."""
    repo = WorkflowRepository(db)
    workflows = await repo.list_by_session(session_id, limit=1)
    if not workflows or not workflows[0].graph_json:
        return {
            "session_id": session_id,
            "nodes": [],
            "edges": [],
            "interruption_count": 0,
            "message": "No workflow graph generated for session yet"
        }
    return {
        "session_id": session_id,
        "graph": workflows[0].graph_json
    }
