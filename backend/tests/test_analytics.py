import pytest
from httpx import AsyncClient
from app.core.analytics_engine import analytics_engine

def test_analytics_engine_computations():
    res = analytics_engine.compute_analytics(events=[])
    assert res.overall_productivity_score > 80.0
    assert res.current_focus_score > 80.0
    assert res.context_switches_per_hour > 0
    assert len(res.daily_productivity_trend) == 7
    assert len(res.top_applications) >= 4
    assert len(res.top_websites) >= 4
    assert len(res.most_productive_hours) >= 5
    assert len(res.time_breakdown) >= 4

@pytest.mark.asyncio
async def test_analytics_overview_api(client: AsyncClient):
    response = await client.get("/api/v1/analytics/overview")
    assert response.status_code == 200
    data = response.json()

    assert "overall_productivity_score" in data
    assert "current_focus_score" in data
    assert "context_switches_per_hour" in data
    assert "top_applications" in data
    assert "top_websites" in data
    assert "most_productive_hours" in data

@pytest.mark.asyncio
async def test_analytics_productivity_trend_api(client: AsyncClient):
    response = await client.get("/api/v1/analytics/productivity?days=7")
    assert response.status_code == 200
    trend = response.json()
    assert len(trend) == 7
    assert "productivity_score" in trend[0]
