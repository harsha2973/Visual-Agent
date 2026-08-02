import os
from pydantic import BaseModel

class Settings(BaseModel):
    host: str = os.getenv("HOST", "0.0.0.0")
    port: int = int(os.getenv("PORT", "8000"))
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379")

settings = Settings()
