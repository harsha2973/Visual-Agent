import pytest
import pytest_asyncio
import io
from PIL import Image
from unittest.mock import AsyncMock, patch, MagicMock
from httpx import AsyncClient, ASGITransport
from main import app
from app.vision.factory import VisionFactory
from app.vision.mock_provider import MockVisionProvider
from app.vision.openai_provider import OpenAIVisionProvider
from app.vision.gemini_provider import GoogleGeminiVisionProvider

@pytest_asyncio.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as async_client:
        yield async_client

def create_sample_image() -> bytes:
    img = Image.new("RGB", (400, 300), color="blue")
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()

@pytest.mark.asyncio
async def test_vision_factory_provider_selection():
    mock_p = VisionFactory.get_provider("mock")
    assert isinstance(mock_p, MockVisionProvider)
    assert mock_p.provider_name == "mock"

    gemini_p = VisionFactory.get_provider("gemini")
    assert isinstance(gemini_p, GoogleGeminiVisionProvider)
    assert gemini_p.provider_name == "gemini"

    # Default fallback when key absent
    fallback_p = VisionFactory.get_provider("openai")
    assert isinstance(fallback_p, MockVisionProvider)

@pytest.mark.asyncio
async def test_mock_vision_provider_analysis():
    provider = MockVisionProvider()
    img_bytes = create_sample_image()
    res = await provider.analyze_screenshot(img_bytes, goal_context="Find laptops")
    assert res["current_application"] == "Visual Agent Control Center"
    assert "visible_components" in res
    assert "confidence" in res
    assert "summary" in res
    assert "important_entities" in res
    assert res["provider_used"] == "mock"

@pytest.mark.asyncio
async def test_openai_vision_provider_mocked():
    provider = OpenAIVisionProvider(api_key="mock-openai-key")
    img_bytes = create_sample_image()

    mock_response = MagicMock()
    mock_response.choices = [
        MagicMock(
            message=MagicMock(
                content='{"current_application": "Amazon Store", "current_task": "Search laptop", "visible_components": ["Search Bar", "Product Grid"], "workflow_step": "Browsing", "confidence": 0.96, "summary": "Viewing laptop search results", "important_entities": [{"name": "Price", "type": "Filter", "value": "1000"}]}'
            )
        )
    ]

    mock_client = MagicMock()
    mock_client.chat.completions.create = AsyncMock(return_value=mock_response)

    with patch.object(provider, "client", mock_client):
        res = await provider.analyze_screenshot(img_bytes, goal_context="Search laptop")
        assert res["current_application"] == "Amazon Store"
        assert res["current_task"] == "Search laptop"
        assert len(res["visible_components"]) == 2
        assert res["confidence"] == 0.96
        assert res["provider_used"] == "openai"

@pytest.mark.asyncio
async def test_vision_analyze_endpoint(client: AsyncClient):
    img_bytes = create_sample_image()
    files = {"file": ("screenshot.jpg", img_bytes, "image/jpeg")}
    data = {"goal_context": "Buy shoes", "provider": "mock"}

    response = await client.post("/api/v1/vision/analyze", files=files, data=data)
    assert response.status_code == 200
    res_data = response.json()

    assert "analysis_id" in res_data
    assert res_data["current_application"] == "Visual Agent Control Center"
    assert res_data["confidence"] > 0.0
    assert "summary" in res_data
    assert "important_entities" in res_data
    assert res_data["provider_used"] == "mock"

    # Query stored analysis
    analysis_id = res_data["analysis_id"]
    get_res = await client.get(f"/api/v1/vision/analysis/{analysis_id}")
    assert get_res.status_code == 200
    get_data = get_res.json()
    assert get_data["analysis_id"] == analysis_id
