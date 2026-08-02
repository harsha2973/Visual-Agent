import pytest

@pytest.mark.asyncio
async def test_sessions_api(client):
    # 1. Create a session
    payload = {
        "goal": "Search for apartments in Miami",
        "execution_mode": "IN_BROWSER",
    }
    create_res = await client.post("/api/v1/sessions", json=payload)
    assert create_res.status_code == 201
    session_data = create_res.json()
    assert session_data["goal"] == "Search for apartments in Miami"
    assert session_data["status"] == "INITIALIZED"
    assert "id" in session_data

    # 2. List sessions via GET /sessions
    list_res = await client.get("/api/v1/sessions")
    assert list_res.status_code == 200
    sessions_list = list_res.json()
    assert len(sessions_list) >= 1
    assert sessions_list[0]["id"] == session_data["id"]
