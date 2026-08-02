import pytest
from httpx import AsyncClient
from app.core.pdf_generator import pdf_generator

def test_pdf_report_generator_binary_output():
    pdf_bytes = pdf_generator.generate_report_pdf(period_type="daily")
    assert isinstance(pdf_bytes, bytes)
    assert len(pdf_bytes) > 500
    assert pdf_bytes.startswith(b"%PDF")

@pytest.mark.asyncio
async def test_download_daily_pdf_report_api(client: AsyncClient):
    response = await client.get("/api/v1/reports/pdf?period=daily")
    assert response.status_code == 200
    assert response.headers["Content-Type"] == "application/pdf"
    assert "visual_agent_daily_report.pdf" in response.headers["Content-Disposition"]
    assert response.content.startswith(b"%PDF")

@pytest.mark.asyncio
async def test_download_weekly_pdf_report_api(client: AsyncClient):
    response = await client.get("/api/v1/reports/pdf?period=weekly")
    assert response.status_code == 200
    assert response.headers["Content-Type"] == "application/pdf"
    assert "visual_agent_weekly_report.pdf" in response.headers["Content-Disposition"]

@pytest.mark.asyncio
async def test_reports_list_api(client: AsyncClient):
    response = await client.get("/api/v1/reports/list")
    assert response.status_code == 200
    data = response.json()
    assert "available_periods" in data
    assert "daily" in data["available_periods"]
