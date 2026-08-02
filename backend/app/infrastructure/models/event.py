import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Integer, DateTime, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class EventModel(Base):
    __tablename__ = "activity_events"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: f"evt_{uuid.uuid4().hex[:12]}")
    session_id: Mapped[str] = mapped_column(String(64), ForeignKey("sessions.id"), index=True, nullable=False)
    event_type: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    url: Mapped[str] = mapped_column(String(2048), nullable=True)
    tab_id: Mapped[int] = mapped_column(Integer, nullable=True)
    window_id: Mapped[int] = mapped_column(Integer, nullable=True)
    payload: Mapped[dict] = mapped_column(JSON, nullable=False)

    session = relationship("SessionModel", back_populates="events")
