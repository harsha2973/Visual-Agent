from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.infrastructure.models.workflow import WorkflowModel

class WorkflowRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, workflow: WorkflowModel) -> WorkflowModel:
        self.db.add(workflow)
        await self.db.commit()
        await self.db.refresh(workflow)
        return workflow

    async def get_by_id(self, workflow_id: str) -> Optional[WorkflowModel]:
        stmt = select(WorkflowModel).where(WorkflowModel.id == workflow_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def list_by_session(self, session_id: str, limit: int = 50) -> List[WorkflowModel]:
        stmt = select(WorkflowModel).where(WorkflowModel.session_id == session_id).order_by(WorkflowModel.start_time.asc()).limit(limit)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def delete_by_session(self, session_id: str) -> bool:
        stmt = delete(WorkflowModel).where(WorkflowModel.session_id == session_id)
        await self.db.execute(stmt)
        await self.db.commit()
        return True
