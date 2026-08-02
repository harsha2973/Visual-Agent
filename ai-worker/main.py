from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
import uvicorn

from config import settings
from agent.planner import ReActPlanner
from agent.executor import CloudPlaywrightExecutor

app = FastAPI(
    title="Visual AI Worker API",
    description="Multimodal ReAct planner & Playwright execution engine for Visual Agent",
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

if __name__ == "__main__":
    uvicorn.run("main:app", host=settings.host, port=settings.port, reload=True)
