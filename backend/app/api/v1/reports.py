from fastapi import APIRouter, Query, Response, HTTPException, status
from fastapi.responses import StreamingResponse
import io

from app.core.pdf_generator import pdf_generator

router = APIRouter(prefix="/reports", tags=["PDF Reports"])

@router.get("/pdf")
async def download_pdf_report(
    period: str = Query("daily", pattern="^(daily|weekly|monthly)$", description="Report period frequency: daily, weekly, or monthly"),
):
    """
    Generates and returns a downloadable vector PDF report containing:
    - Charts data & Executive KPI metrics
    - Multimodal AI Vision & RAG Insights
    - Workflow Category Summary & Interruption alerts
    - Productivity & Focus Scores
    - Top Websites & Domain usage breakdown
    - Granular Task Breakdown table
    """
    try:
        pdf_bytes = pdf_generator.generate_report_pdf(period_type=period)
        filename = f"visual_agent_{period}_report.pdf"

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")

@router.get("/list")
async def list_available_reports():
    """Lists available PDF report period options."""
    return {
        "available_periods": ["daily", "weekly", "monthly"],
        "formats": ["pdf"],
    }
