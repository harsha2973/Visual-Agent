import pytest
from httpx import AsyncClient
from app.core.workflow_engine import workflow_engine

def test_workflow_engine_classification_categories():
    # 1. Reading documentation
    cat1, _ = workflow_engine.classify_url_or_text("https://developer.mozilla.org/en-US/docs/Web/JavaScript")
    assert cat1 == "READING_DOCUMENTATION"

    # 2. Coding
    cat2, _ = workflow_engine.classify_url_or_text("https://github.com/harsha2973/Visual-Agent")
    assert cat2 == "CODING"

    # 3. Watching YouTube
    cat3, _ = workflow_engine.classify_url_or_text("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
    assert cat3 == "WATCHING_YOUTUBE"

    # 4. Writing email
    cat4, _ = workflow_engine.classify_url_or_text("https://mail.google.com/mail/u/0/#inbox")
    assert cat4 == "WRITING_EMAIL"

    # 5. Using Jira
    cat5, _ = workflow_engine.classify_url_or_text("https://mycompany.atlassian.net/jira/software/projects/VA")
    assert cat5 == "USING_JIRA"

    # 6. Updating Notion
    cat6, _ = workflow_engine.classify_url_or_text("https://www.notion.so/myworkspace/architecture-123")
    assert cat6 == "UPDATING_NOTION"

    # 7. Shopping
    cat7, _ = workflow_engine.classify_url_or_text("https://www.amazon.com/dp/B08N5WRWNW")
    assert cat7 == "SHOPPING"

def test_interruption_detection():
    events = [
        {"timestamp": "2026-08-02T10:00:00Z", "payload": {"url": "https://github.com/repo"}, "eventType": "URL_NAV"},
        {"timestamp": "2026-08-02T10:05:00Z", "payload": {"url": "https://github.com/repo/issues"}, "eventType": "URL_NAV"},
        {"timestamp": "2026-08-02T10:10:00Z", "payload": {"url": "https://www.youtube.com/watch?v=123"}, "eventType": "URL_NAV"},
    ]
    res = workflow_engine.process_session_workflows(events)
    assert res["primary_workflow"] == "CODING"
    assert res["interruption_count"] == 1
    assert res["workflows"][2]["is_interruption"] is True
    assert "Context switch" in res["workflows"][2]["interruption_type"]

@pytest.mark.asyncio
async def test_detect_and_store_workflows_api(client: AsyncClient):
    payload = {
        "session_id": "sess_wf_123",
        "events": [
            {"timestamp": "2026-08-02T10:00:00Z", "payload": {"url": "https://docs.python.org/3/"}, "eventType": "URL_NAV"},
            {"timestamp": "2026-08-02T10:02:00Z", "payload": {"url": "https://github.com/harsha2973/Visual-Agent"}, "eventType": "URL_NAV"},
        ],
        "ai_vision_results": [
            {"summary": "Viewing python documentation and code repo", "current_task": "Software Development"}
        ]
    }

    response = await client.post("/api/v1/workflows/detect", json=payload)
    assert response.status_code == 201
    workflows = response.json()
    assert len(workflows) == 2
    assert workflows[0]["session_id"] == "sess_wf_123"

    # Query workflows for session
    list_res = await client.get("/api/v1/workflows?session_id=sess_wf_123")
    assert list_res.status_code == 200
    assert len(list_res.json()) == 2

    # Query graph
    graph_res = await client.get("/api/v1/workflows/graph?session_id=sess_wf_123")
    assert graph_res.status_code == 200
    g_data = graph_res.json()
    assert "graph" in g_data
