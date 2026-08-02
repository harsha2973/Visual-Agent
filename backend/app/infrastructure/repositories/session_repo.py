from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.infrastructure.models.session import SessionModel
from app.domain.session import SessionCreate

class SessionRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, session_id: str) -> Optional[SessionModel]:
        stmt = select(SessionModel).where(SessionModel.id == session_id)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def get_all(self, skip: int = 0, limit: int = 100) -> List[SessionModel]:
        stmt = select(SessionModel).order_by(SessionModel.created_at.desc()).offset(skip).limit(limit)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def create(self, session_dto: SessionCreate, user_id: Optional[str] = None) -> SessionModel:
        db_session = SessionModel(
            goal=session_dto.goal,
            execution_mode=session_dto.execution_mode or "IN_BROWSER",
            user_id=user_id,
        )
        self.session.add(db_session)
        await self.session.commit()
        await self.session.refresh(db_session)
        return db_session
