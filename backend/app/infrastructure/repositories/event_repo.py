from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.infrastructure.models.event import EventModel
from app.infrastructure.models.session import SessionModel
from app.domain.event import EventCreate

class EventRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def ensure_session_exists(self, session_id: str):
        stmt = select(SessionModel).where(SessionModel.id == session_id)
        res = await self.session.execute(stmt)
        if not res.scalars().first():
            auto_session = SessionModel(id=session_id, goal="Activity Tracking Session")
            self.session.add(auto_session)
            await self.session.flush()

    async def create_event(self, event_dto: EventCreate) -> EventModel:
        sid = event_dto.session_id or event_dto.sessionId or "default_session"
        etype = event_dto.event_type or event_dto.eventType or "GENERIC"
        
        await self.ensure_session_exists(sid)

        db_event = EventModel(
            id=event_dto.id,
            session_id=sid,
            event_type=etype,
            url=event_dto.url,
            tab_id=event_dto.tab_id or event_dto.tabId,
            window_id=event_dto.window_id or event_dto.windowId,
            payload=event_dto.payload,
        )
        self.session.add(db_event)
        await self.session.commit()
        await self.session.refresh(db_event)
        return db_event

    async def create_bulk_events(self, events_dto: List[EventCreate]) -> List[EventModel]:
        created: List[EventModel] = []
        for dto in events_dto:
            sid = dto.session_id or dto.sessionId or "default_session"
            etype = dto.event_type or dto.eventType or "GENERIC"
            
            await self.ensure_session_exists(sid)

            db_event = EventModel(
                id=dto.id,
                session_id=sid,
                event_type=etype,
                url=dto.url,
                tab_id=dto.tab_id or dto.tabId,
                window_id=dto.window_id or dto.windowId,
                payload=dto.payload,
            )
            self.session.add(db_event)
            created.append(db_event)
        
        await self.session.commit()
        for item in created:
            await self.session.refresh(item)
        return created

    async def query_events(
        self,
        session_id: Optional[str] = None,
        event_type: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[EventModel]:
        stmt = select(EventModel)
        if session_id:
            stmt = stmt.where(EventModel.session_id == session_id)
        if event_type:
            stmt = stmt.where(EventModel.event_type == event_type)
        
        stmt = stmt.order_by(EventModel.timestamp.desc()).offset(skip).limit(limit)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
