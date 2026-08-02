import pytest
import io
from unittest.mock import MagicMock
from PIL import Image
from httpx import AsyncClient
from app.core.s3 import s3_service

@pytest.fixture(autouse=True)
def mock_s3():
    s3_service.ensure_bucket_exists = MagicMock()
    s3_service.generate_presigned_post = MagicMock(return_value={
        "url": "http://localhost:9000/visual-agent-screenshots",
        "fields": {"key": "mock-key", "AWSAccessKeyId": "mock"}
    })
    s3_service.upload_file_bytes = MagicMock(
        side_effect=lambda file_bytes, object_key, content_type="image/jpeg", metadata=None: f"http://localhost:9000/visual-agent-screenshots/{object_key}"
    )
    s3_service.delete_object = MagicMock(return_value=True)

@pytest.mark.asyncio
async def test_generate_presigned_url(client: AsyncClient):
    payload = {
        "session_id": "sess_presigned_123",
        "file_name": "test_frame.jpg",
        "content_type": "image/jpeg"
    }
    response = await client.post("/api/v1/screenshots/presigned-url", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "s3_key" in data
    assert "url" in data
    assert "fields" in data

@pytest.mark.asyncio
async def test_upload_and_list_screenshots(client: AsyncClient):
    img = Image.new("RGB", (800, 600), color="blue")
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format="JPEG")
    img_bytes = img_byte_arr.getvalue()

    files = {"file": ("screenshot.jpg", img_bytes, "image/jpeg")}
    data = {
        "session_id": "sess_upload_456",
        "page_url": "https://example.com/test",
        "tab_id": 1,
        "retention_days": 7
    }

    upload_res = await client.post("/api/v1/screenshots", files=files, data=data)
    assert upload_res.status_code == 201
    shot_data = upload_res.json()
    assert shot_data["session_id"] == "sess_upload_456"
    assert shot_data["width"] == 800
    assert shot_data["height"] == 600
    assert shot_data["format"] == "jpeg"
    assert "url" in shot_data
    assert "thumbnail_url" in shot_data

    list_res = await client.get("/api/v1/screenshots?session_id=sess_upload_456")
    assert list_res.status_code == 200
    items = list_res.json()
    assert len(items) == 1
    assert items[0]["id"] == shot_data["id"]

@pytest.mark.asyncio
async def test_cleanup_expired_screenshots(client: AsyncClient):
    cleanup_res = await client.delete("/api/v1/screenshots/cleanup")
    assert cleanup_res.status_code == 200
    data = cleanup_res.json()
    assert "deleted_count" in data
    assert data["status"] == "success"
