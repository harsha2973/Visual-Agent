import pytest

@pytest.mark.asyncio
async def test_events_api_single_and_batch(client):
    # 1. Post single event via POST /api/v1/events
    single_event = {
        "sessionId": "test_session_456",
        "eventType": "CURRENT_URL",
        "url": "https://example.com/login",
        "tabId": 1,
        "windowId": 1,
        "payload": {"title": "Example Login Page"},
    }
    res_single = await client.post("/api/v1/events", json=single_event)
    assert res_single.status_code == 201
    single_data = res_single.json()
    assert single_data["session_id"] == "test_session_456"
    assert single_data["event_type"] == "CURRENT_URL"
    assert single_data["url"] == "https://example.com/login"

    # 2. Post event batch object
    batch_payload = {
        "events": [
            {
                "sessionId": "test_session_456",
                "eventType": "TAB_CHANGE",
                "payload": {"tabId": 2},
            },
            {
                "sessionId": "test_session_456",
                "eventType": "MOUSE_CLICK",
                "url": "https://example.com/dashboard",
                "payload": {"x": 100, "y": 200, "tagName": "button"},
            },
        ]
    }
    res_batch = await client.post("/api/v1/events", json=batch_payload)
    assert res_batch.status_code == 201
    batch_data = res_batch.json()
    assert len(batch_data) == 2

    # 3. Query events via GET /api/v1/events
    res_query = await client.get("/api/v1/events?sessionId=test_session_456")
    assert res_query.status_code == 200
    events_list = res_query.json()
    assert len(events_list) == 3

    # 4. Filter events by eventType
    res_filtered = await client.get("/api/v1/events?eventType=CURRENT_URL")
    assert res_filtered.status_code == 200
    filtered_list = res_filtered.json()
    assert len(filtered_list) == 1
    assert filtered_list[0]["event_type"] == "CURRENT_URL"
