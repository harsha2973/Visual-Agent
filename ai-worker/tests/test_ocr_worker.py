import pytest
import io
import asyncio
from PIL import Image
from httpx import AsyncClient, ASGITransport
from main import app
from app.ocr_engine import ocr_engine
from app.structured_parser import structured_parser

import pytest_asyncio

@pytest_asyncio.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as async_client:
        yield async_client

def create_sample_image() -> bytes:
    img = Image.new("RGB", (600, 400), color="white")
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()

@pytest.mark.asyncio
async def test_ocr_token_extraction_and_structured_parsing():
    img_bytes = create_sample_image()
    tokens = ocr_engine.extract_text_data(img_bytes)
    assert isinstance(tokens, list)
    assert len(tokens) > 0

    structured = structured_parser.parse_tokens(tokens)
    assert "visible_text" in structured
    assert "buttons" in structured
    assert "forms" in structured
    assert "navigation" in structured
    assert "headings" in structured
    assert len(structured["visible_text"]) > 0

@pytest.mark.asyncio
async def test_ocr_process_endpoint_and_async_retrieval(client: AsyncClient):
    img_bytes = create_sample_image()
    files = {"file": ("screenshot.jpg", img_bytes, "image/jpeg")}

    # Submit task
    response = await client.post("/api/v1/ocr/process", files=files)
    assert response.status_code == 202
    data = response.json()
    assert data["success"] is True
    assert "task_id" in data
    task_id = data["task_id"]

    # Wait for async background task to complete
    await asyncio.sleep(0.5)

    # Query task status
    task_res = await client.get(f"/api/v1/ocr/tasks/{task_id}")
    assert task_res.status_code == 200
    task_data = task_res.json()
    assert task_data["status"] in ["PROCESSING", "COMPLETED"]
    if task_data["status"] == "COMPLETED":
        res = task_data["result"]
        assert "visible_text" in res
        assert "buttons" in res
        assert "forms" in res
        assert "navigation" in res
        assert "headings" in res
