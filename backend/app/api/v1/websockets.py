from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from datetime import datetime, timezone
import json
from app.core.websocket_manager import ws_manager

router = APIRouter(tags=["WebSockets"])

@router.websocket("/ws/realtime")
async def websocket_endpoint(
    websocket: WebSocket,
    client_type: str = Query("dashboard"),
    user_id: str = Query("usr_anon"),
):
    """
    Real-time WebSocket endpoint supporting live browser events, live screenshot streams,
    heartbeat ping/pong, connection recovery, and online user counts.
    """
    await ws_manager.connect(websocket, client_type=client_type, user_id=user_id)
    try:
        while True:
            data_text = await websocket.receive_text()
            try:
                msg = json.loads(data_text)
                msg_type = msg.get("type", "").upper()

                if msg_type == "PING":
                    await ws_manager.send_personal_message(
                        {"type": "PONG", "timestamp": datetime.now(timezone.utc).isoformat()},
                        websocket
                    )

                elif msg_type == "TELEMETRY_EVENT":
                    # Broadcast telemetry event to dashboard clients
                    await ws_manager.broadcast_event(msg.get("payload", {}))

                elif msg_type == "SCREENSHOT_FRAME":
                    # Broadcast live screenshot frame to dashboard clients
                    await ws_manager.broadcast_screenshot(msg.get("payload", {}))

            except json.JSONDecodeError:
                await ws_manager.send_personal_message(
                    {"type": "ERROR", "message": "Invalid JSON format"},
                    websocket
                )
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception:
        ws_manager.disconnect(websocket)
