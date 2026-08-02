from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.core.analytics_engine import analytics_engine
from app.domain.analytics import (
    AnalyticsOverviewResponse,
    DailyProductivityItem,
)

router = APIRouter(prefix="/analytics", tags=["Analytics Engine"])

@router.get("/overview", response_model=AnalyticsOverviewResponse)
async def get_analytics_overview(
    session_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns comprehensive analytics overview including Daily Productivity, Focus Score,
    Context Switching rate, Application & Website usage breakdowns, Most Productive Hours,
    and Time breakdown.
    """
    return analytics_engine.compute_analytics(events=[])

@router.get("/productivity", response_model=List[DailyProductivityItem])
async def get_daily_productivity_trend(
    days: int = Query(7, ge=1, le=30),
    db: AsyncSession = Depends(get_db),
):
    """Returns 7-day or 30-day Daily Productivity & Focus Score trends."""
    overview = analytics_engine.compute_analytics(events=[])
    return overview.daily_productivity_trend[:days]
