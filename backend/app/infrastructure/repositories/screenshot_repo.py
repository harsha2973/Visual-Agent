from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.infrastructure.models.screenshot import ScreenshotModel

class ScreenshotRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, screenshot: ScreenshotModel) -> ScreenshotModel:
        self.db.add(screenshot)
        await self.db.commit()
        await self.db.refresh(screenshot)
        return screenshot

    async def get_by_id(self, screenshot_id: str) -> Optional[ScreenshotModel]:
        stmt = select(ScreenshotModel).where(ScreenshotModel.id == screenshot_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def list_by_session(self, session_id: str, limit: int = 50) -> List[ScreenshotModel]:
        stmt = select(ScreenshotModel).where(ScreenshotModel.session_id == session_id).order_by(ScreenshotModel.created_at.desc()).limit(limit)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_expired(self) -> List[ScreenshotModel]:
        now = datetime.now(timezone.utc)
        stmt = select(ScreenshotModel).where(ScreenshotModel.expires_at <= now)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def delete(self, screenshot_id: str) -> bool:
        stmt = delete(ScreenshotModel).where(ScreenshotModel.id == screenshot_id)
        await self.db.execute(stmt)
        await self.db.commit()
        return True
