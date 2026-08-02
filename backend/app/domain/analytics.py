from typing import List, Optional
from pydantic import BaseModel

class DailyProductivityItem(BaseModel):
    date: str
    productivity_score: float
    focus_score: float
    productive_seconds: int
    distraction_seconds: int

class UsageBreakdownItem(BaseModel):
    name: str
    category: str
    duration_seconds: int
    percentage: float

class HourlyProductivityItem(BaseModel):
    hour: str
    score: float
    event_count: int

class AnalyticsOverviewResponse(BaseModel):
    overall_productivity_score: float
    current_focus_score: float
    context_switches_per_hour: float
    total_tracked_seconds: int
    daily_productivity_trend: List[DailyProductivityItem]
    top_applications: List[UsageBreakdownItem]
    top_websites: List[UsageBreakdownItem]
    most_productive_hours: List[HourlyProductivityItem]
    time_breakdown: List[UsageBreakdownItem]
