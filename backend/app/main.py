from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.config import settings
from app.core.database import engine, Base
import app.infrastructure.models  # noqa: F401
from app.api.v1 import auth, users, sessions, events, screenshots, workflows, websockets, search

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-create database tables on startup (or via Alembic)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()

app = FastAPI(
    title=settings.project_name,
    version=settings.version,
    description="Clean Architecture FastAPI Backend with JWT Auth, SQLAlchemy, & Alembic for Visual Agent",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# Enable CORS for Chrome Extension & Dashboard origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "ok",
        "service": "visual-agent-backend-fastapi",
        "version": settings.version,
    }

# Register API v1 Routers
app.include_router(auth.router, prefix=settings.api_v1_prefix)
app.include_router(users.router, prefix=settings.api_v1_prefix)
app.include_router(sessions.router, prefix=settings.api_v1_prefix)
app.include_router(events.router, prefix=settings.api_v1_prefix)
app.include_router(screenshots.router, prefix=settings.api_v1_prefix)
app.include_router(workflows.router, prefix=settings.api_v1_prefix)
app.include_router(search.router, prefix=settings.api_v1_prefix)
app.include_router(websockets.router)

if __name__ == "__main__":
    uvicorn.run("app.main:app", host=settings.host, port=settings.port, reload=True)
