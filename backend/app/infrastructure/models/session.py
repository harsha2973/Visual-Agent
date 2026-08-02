import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class SessionModel(Base):
    __tablename__ = "sessions"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: f"session_{uuid.uuid4().hex[:12]}")
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    goal: Mapped[str] = mapped_column(String(512), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="INITIALIZED", index=True)
    execution_mode: Mapped[str] = mapped_column(String(50), default="IN_BROWSER")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user = relationship("UserModel", back_populates="sessions")
    events = relationship("EventModel", back_populates="session", cascade="all, delete-orphan")
