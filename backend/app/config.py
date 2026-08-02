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

    # S3 Storage Configuration
    s3_endpoint_url: str = os.getenv("S3_ENDPOINT_URL", "http://localhost:9000")
    s3_access_key: str = os.getenv("S3_ACCESS_KEY", "minioadmin")
    s3_secret_key: str = os.getenv("S3_SECRET_KEY", "minioadmin")
    s3_bucket_name: str = os.getenv("S3_BUCKET_NAME", "visual-agent-screenshots")
    s3_region: str = os.getenv("S3_REGION", "us-east-1")

settings = Settings()
