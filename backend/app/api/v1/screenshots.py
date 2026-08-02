from typing import List, Optional
from datetime import datetime, timedelta, timezone
import uuid
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.core.s3 import s3_service
from app.core.image_processor import compress_and_thumbnail
from app.domain.screenshot import (
    ScreenshotResponse,
    PresignedUploadRequest,
    PresignedUploadResponse,
)
from app.infrastructure.models.screenshot import ScreenshotModel
from app.infrastructure.repositories.screenshot_repo import ScreenshotRepository

router = APIRouter(prefix="/screenshots", tags=["Screenshots"])

@router.post("/presigned-url", response_model=PresignedUploadResponse)
async def get_presigned_upload_url(payload: PresignedUploadRequest):
    """Generates a presigned S3 POST URL for direct client screenshot uploads."""
    s3_key = f"screenshots/{payload.session_id}/{uuid.uuid4()}_{payload.file_name}"
    presigned_data = s3_service.generate_presigned_post(
        object_key=s3_key,
        content_type=payload.content_type,
    )
    return PresignedUploadResponse(
        s3_key=s3_key,
        url=presigned_data["url"],
        fields=presigned_data["fields"],
    )

@router.post("", response_model=ScreenshotResponse, status_code=status.HTTP_201_CREATED)
async def upload_screenshot(
    file: UploadFile = File(...),
    session_id: str = Form(...),
    user_id: Optional[str] = Form(None),
    page_url: Optional[str] = Form(None),
    tab_id: Optional[int] = Form(None),
    retention_days: int = Form(7),
    db: AsyncSession = Depends(get_db),
):
    """
    Accepts raw screenshot binary, applies Pillow JPEG compression,
    generates thumbnail, uploads to S3 storage, and saves metadata into PostgreSQL.
    """
    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Empty screenshot file")

    # Compress main image and generate thumbnail
    processed = compress_and_thumbnail(file_bytes, quality=75)

    s3_key_main = f"screenshots/{session_id}/{uuid.uuid4()}.jpg"
    s3_key_thumb = f"thumbnails/{session_id}/{uuid.uuid4()}_thumb.jpg"

    # Upload main image & thumbnail to S3
    main_url = s3_service.upload_file_bytes(
        file_bytes=processed["compressed_bytes"],
        object_key=s3_key_main,
        content_type="image/jpeg",
    )

    thumb_url = s3_service.upload_file_bytes(
        file_bytes=processed["thumbnail_bytes"],
        object_key=s3_key_thumb,
        content_type="image/jpeg",
    )

    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(days=retention_days)

    screenshot_entity = ScreenshotModel(
        id=str(uuid.uuid4()),
        session_id=session_id,
        user_id=user_id,
        s3_key=s3_key_main,
        url=main_url,
        thumbnail_url=thumb_url,
        file_size=processed["file_size"],
        width=processed["width"],
        height=processed["height"],
        format="jpeg",
        page_url=page_url,
        tab_id=tab_id,
        created_at=now,
        expires_at=expires_at,
    )

    repo = ScreenshotRepository(db)
    saved = await repo.create(screenshot_entity)
    return saved

@router.get("", response_model=List[ScreenshotResponse])
async def list_screenshots(
    session_id: str,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    """List screenshots for a given session."""
    repo = ScreenshotRepository(db)
    return await repo.list_by_session(session_id, limit=limit)

@router.delete("/cleanup", status_code=status.HTTP_200_OK)
async def cleanup_expired_screenshots(db: AsyncSession = Depends(get_db)):
    """Deletes expired screenshots from S3 storage and PostgreSQL metadata database."""
    repo = ScreenshotRepository(db)
    expired = await repo.get_expired()
    deleted_count = 0

    for item in expired:
        s3_service.delete_object(item.s3_key)
        await repo.delete(item.id)
        deleted_count += 1

    return {"deleted_count": deleted_count, "status": "success"}
