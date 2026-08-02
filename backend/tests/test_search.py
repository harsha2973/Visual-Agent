import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_full_text_search_api(client: AsyncClient):
    # 1. Search by website URL
    res_url = await client.get("/api/v1/search?q=github")
    assert res_url.status_code == 200
    data_url = res_url.json()
    assert "results" in data_url
    assert data_url["query"] == "github"

    # 2. Search by workflow category filter
    res_cat = await client.get("/api/v1/search?q=coding&category=CODING")
    assert res_cat.status_code == 200
    data_cat = res_cat.json()
    assert isinstance(data_cat["results"], list)

    # 3. Search by OCR text
    res_ocr = await client.get("/api/v1/search?q=ocr")
    assert res_ocr.status_code == 200
    data_ocr = res_ocr.json()
    assert any(r["type"] == "OCR_TEXT" for r in data_ocr["results"])

    # 4. Search by AI summary
    res_ai = await client.get("/api/v1/search?q=summary")
    assert res_ai.status_code == 200
    data_ai = res_ai.json()
    assert any(r["type"] == "AI_SUMMARY" for r in data_ai["results"])

@pytest.mark.asyncio
async def test_full_text_search_post_endpoint(client: AsyncClient):
    payload = {
        "query": "python",
        "category": "READING_DOCUMENTATION",
        "limit": 10,
        "offset": 0
    }
    response = await client.post("/api/v1/search", json=payload)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["query"] == "python"
    assert "results" in res_data
