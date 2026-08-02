import os
from pydantic import ConfigDict
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    model_config = ConfigDict(case_sensitive=False)
    
    project_name: str = "Visual AI Agent API"
    version: str = "1.0.0"
    api_v1_prefix: str = "/api/v1"
    
    host: str = os.getenv("HOST", "0.0.0.0")
    port: int = int(os.getenv("PORT", "3000"))
    
    database_url: str = os.getenv(
        "DATABASE_URL",
        "sqlite+aiosqlite:///./visual_agent.db"
    )
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    jwt_secret: str = os.getenv("JWT_SECRET", "super-secret-jwt-key-visual-agent")
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 # 24 hours
    refresh_token_expire_days: int = 7

settings = Settings()
