from fastapi import FastAPI, HTTPException, UploadFile, File, Form, BackgroundTasks, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
import uvicorn
import uuid
from datetime import datetime, timezone

from config import settings
from agent.planner import ReActPlanner
from agent.executor import CloudPlaywrightExecutor
from app.processor import ocr_processor
from app.vision.factory import VisionFactory
from app.vision.models import MultimodalAnalysisResult

app = FastAPI(
    title="Visual AI Worker API",
    description="Multimodal OpenAI/Gemini vision analysis, ReAct planner, & Playwright execution engine for Visual Agent",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

planner = ReActPlanner()
executor = CloudPlaywrightExecutor()

# In-memory store for multimodal analysis results
analysis_store: Dict[str, MultimodalAnalysisResult] = {}

class PlanRequest(BaseModel):
    sessionId: str
    telemetry: Dict[str, Any]

class ExecuteRequest(BaseModel):
    url: str
    action: Dict[str, Any]

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "visual-agent-ai-worker",
        "active_provider": settings.ai_provider,
    }

@app.post("/api/v1/plan")
def create_plan(payload: PlanRequest):
    try:
        plan = planner.generate_plan(payload.sessionId, payload.telemetry)
        return {"success": True, "plan": plan}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/execute")
async def execute_action(payload: ExecuteRequest):
    try:
        result = await executor.execute_step(payload.url, payload.action)
        return {"success": True, "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- OCR Endpoints ---
@app.post("/api/v1/ocr/process", status_code=status.HTTP_202_ACCEPTED)
async def process_screenshot_ocr(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
):
    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Empty screenshot file")

    task_id = ocr_processor.create_task()
    background_tasks.add_task(ocr_processor.process_ocr_task, task_id, image_bytes)

    return {
        "success": True,
        "task_id": task_id,
        "status": "PROCESSING",
        "message": "OCR task accepted for asynchronous processing",
    }

@app.get("/api/v1/ocr/tasks/{task_id}")
async def get_ocr_task_status(task_id: str):
    task = ocr_processor.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail=f"OCR Task '{task_id}' not found")
    return task

# --- Multimodal Vision API Endpoints ---
@app.get("/api/v1/vision/providers")
def list_vision_providers():
    """Lists available multimodal AI vision providers and active configuration."""
    return {
        "active_provider": settings.ai_provider,
        "available_providers": ["openai", "gemini", "mock"],
    }

@app.post("/api/v1/vision/analyze", response_model=MultimodalAnalysisResult)
async def analyze_screenshot_vision(
    file: UploadFile = File(...),
    goal_context: Optional[str] = Form(None),
    provider: Optional[str] = Form(None),
):
    """
    Analyzes active browser screenshot using OpenAI Vision (or configured provider)
    and extracts current application, current task, visible components, workflow step,
    confidence score, natural language summary, and important entities.
    """
    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Empty screenshot file")

    vision_provider = VisionFactory.get_provider(provider_name=provider or settings.ai_provider)
    analysis = await vision_provider.analyze_screenshot(image_bytes, goal_context=goal_context)

    analysis_id = f"analysis_{uuid.uuid4().hex[:12]}"
    result = MultimodalAnalysisResult(
        analysis_id=analysis_id,
        current_application=analysis["current_application"],
        current_task=analysis["current_task"],
        visible_components=analysis["visible_components"],
        workflow_step=analysis["workflow_step"],
        confidence=analysis["confidence"],
        summary=analysis["summary"],
        important_entities=analysis["important_entities"],
        provider_used=analysis["provider_used"],
        created_at=datetime.now(timezone.utc).isoformat(),
    )

    analysis_store[analysis_id] = result
    return result

@app.get("/api/v1/vision/analysis/{analysis_id}", response_model=MultimodalAnalysisResult)
async def get_vision_analysis(analysis_id: str):
    """Retrieves stored multimodal screenshot analysis by analysis_id."""
    if analysis_id not in analysis_store:
        raise HTTPException(status_code=404, detail=f"Analysis '{analysis_id}' not found")
    return analysis_store[analysis_id]

if __name__ == "__main__":
    uvicorn.run("main:app", host=settings.host, port=settings.port, reload=True)
