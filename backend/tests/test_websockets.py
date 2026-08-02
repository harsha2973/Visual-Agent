import pytest
from fastapi.testclient import TestClient
from app.main import app

def test_websocket_realtime_endpoint_connection_and_ping():
    client = TestClient(app)
    with client.websocket_connect("/ws/realtime?client_type=dashboard&user_id=test_usr_1") as websocket:
        # Initial online users update on connect
        initial_msg = websocket.receive_json()
        assert initial_msg["type"] == "ONLINE_USERS_UPDATE"
        assert initial_msg["online_users_count"] >= 1

        # Send PING heartbeat
        websocket.send_json({"type": "PING"})
        response = websocket.receive_json()
        assert response["type"] == "PONG"
        assert "timestamp" in response

def test_websocket_telemetry_event_broadcasting():
    client = TestClient(app)
    with client.websocket_connect("/ws/realtime?client_type=dashboard&user_id=dash_client") as dash_ws:
        # Drain initial online status message
        _ = dash_ws.receive_json()

        with client.websocket_connect("/ws/realtime?client_type=extension&user_id=ext_client") as ext_ws:
            # Drain online status message on extension connect
            _ = dash_ws.receive_json()

            # Send telemetry event from extension
            telemetry_payload = {
                "type": "TELEMETRY_EVENT",
                "payload": {
                    "eventType": "CURRENT_URL",
                    "url": "https://github.com/harsha2973/Visual-Agent"
                }
            }
            ext_ws.send_json(telemetry_payload)

            # Dashboard receives broadcasted event
            broadcast_msg = dash_ws.receive_json()
            assert broadcast_msg["type"] == "NEW_BROWSER_EVENT"
            assert broadcast_msg["data"]["url"] == "https://github.com/harsha2973/Visual-Agent"
