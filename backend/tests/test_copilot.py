import pytest
from httpx import AsyncClient
from app.core.rag_engine import rag_engine

@pytest.mark.asyncio
async def test_copilot_rag_engine_queries():
    # 1. Historical query: What was I working on yesterday?
    res1 = await rag_engine.answer_copilot_query("What was I working on yesterday?")
    assert "Coding" in res1.answer or "Yesterday" in res1.answer
    assert res1.query_type == "HISTORICAL"
    assert len(res1.sources) > 0

    # 2. Search query: When did I visit OpenAI?
    res2 = await rag_engine.answer_copilot_query("When did I visit OpenAI?")
    assert "platform.openai.com" in res2.answer or "OpenAI" in res2.answer
    assert res2.query_type == "SEARCH"

    # 3. Summary query: Summarize today's work.
    res3 = await rag_engine.answer_copilot_query("Summarize today's work.")
    assert "Development" in res3.answer or "summary" in res3.answer.lower()
    assert res3.query_type == "SUMMARY"

    # 4. Interruption query: What distracted me?
    res4 = await rag_engine.answer_copilot_query("What distracted me?")
    assert "YouTube" in res4.answer or "distraction" in res4.answer.lower()
    assert res4.query_type == "INTERRUPTION"

@pytest.mark.asyncio
async def test_copilot_api_endpoint(client: AsyncClient):
    payload = {"query": "What was I working on yesterday?"}
    response = await client.post("/api/v1/copilot/ask", json=payload)
    assert response.status_code == 200
    res_data = response.json()

    assert "answer" in res_data
    assert "sources" in res_data
    assert res_data["query_type"] == "HISTORICAL"
    assert len(res_data["suggested_followups"]) > 0

@pytest.mark.asyncio
async def test_copilot_suggestions_endpoint(client: AsyncClient):
    response = await client.get("/api/v1/copilot/suggestions")
    assert response.status_code == 200
    suggestions = response.json()
    assert len(suggestions) == 4
    assert "What was I working on yesterday?" in suggestions
