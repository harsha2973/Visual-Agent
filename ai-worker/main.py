from fastapi import FastAPI, HTTPException, UploadFile, File, BackgroundTasks, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
import uvicorn
import io
from PIL import Image

from config import settings
from agent.planner import ReActPlanner
from agent.executor import CloudPlaywrightExecutor
from app.processor import ocr_processor

app = FastAPI(
    title="Visual AI Worker API",
    description="Multimodal ReAct planner & Playwright execution engine with OCR structured parsing for Visual Agent",
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

class PlanRequest(BaseModel):
    sessionId: str
    telemetry: Dict[str, Any]

class ExecuteRequest(BaseModel):
    url: str
    action: Dict[str, Any]

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "visual-agent-ai-worker"}

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

# OCR Endpoint Architecture
@app.post("/api/v1/ocr/process", status_code=status.HTTP_202_ACCEPTED)
async def process_screenshot_ocr(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
):
    """
    Receives screenshot image file, generates an asynchronous OCR task,
    and returns task_id for tracking structured JSON extraction.
    """
    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Empty screenshot file")

    task_id = ocr_processor.create_task()
    # Schedule non-blocking async OCR task
    background_tasks.add_task(ocr_processor.process_ocr_task, task_id, image_bytes)

    return {
        "success": True,
        "task_id": task_id,
        "status": "PROCESSING",
        "message": "OCR task accepted for asynchronous processing",
    }

@app.get("/api/v1/ocr/tasks/{task_id}")
async def get_ocr_task_status(task_id: str):
    """Retrieves status and structured JSON OCR result (visible text, buttons, forms, navigation, headings)."""
    task = ocr_processor.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail=f"OCR Task '{task_id}' not found")
    return task

if __name__ == "__main__":
    uvicorn.run("main:app", host=settings.host, port=settings.port, reload=True)
