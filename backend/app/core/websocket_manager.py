from typing import List, Dict, Set, Any
from fastapi import WebSocket
from datetime import datetime, timezone
import json
import asyncio

class ConnectionManager:
    def __init__(self):
        # Active connections: websocket -> client_info
        self.active_connections: Dict[WebSocket, Dict[str, Any]] = {}
        # Online user session IDs
        self.online_users: Set[str] = set()

    async def connect(self, websocket: WebSocket, client_type: str = "dashboard", user_id: str = "anonymous"):
        await websocket.accept()
        self.active_connections[websocket] = {
            "client_type": client_type,
            "user_id": user_id,
            "connected_at": datetime.now(timezone.utc).isoformat(),
        }
        self.online_users.add(user_id)
        await self.broadcast_online_status()

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            info = self.active_connections.pop(websocket)
            user_id = info.get("user_id", "anonymous")
            
            # Check if user has other open connections
            remaining_user_conns = [w for w, i in self.active_connections.items() if i.get("user_id") == user_id]
            if not remaining_user_conns and user_id in self.online_users:
                self.online_users.remove(user_id)
                
            asyncio.create_task(self.broadcast_online_status())

    async def send_personal_message(self, message: Dict[str, Any], websocket: WebSocket):
        try:
            await websocket.send_json(message)
        except Exception:
            self.disconnect(websocket)

    async def broadcast_event(self, event_data: Dict[str, Any]):
        """Broadcasts browser telemetry event to all connected dashboard clients."""
        payload = {
            "type": "NEW_BROWSER_EVENT",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "data": event_data,
        }
        await self._broadcast_to_type("dashboard", payload)

    async def broadcast_screenshot(self, screenshot_data: Dict[str, Any]):
        """Broadcasts live captured screenshot frame to dashboard clients."""
        payload = {
            "type": "LIVE_SCREENSHOT",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "data": screenshot_data,
        }
        await self._broadcast_to_type("dashboard", payload)

    async def broadcast_online_status(self):
        """Broadcasts online users count to all dashboard clients."""
        payload = {
            "type": "ONLINE_USERS_UPDATE",
            "online_users_count": len(self.online_users),
            "total_connections": len(self.active_connections),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        await self._broadcast_to_type("dashboard", payload)

    async def _broadcast_to_type(self, target_type: str, payload: Dict[str, Any]):
        dead_sockets: List[WebSocket] = []
        for ws, info in self.active_connections.items():
            if info.get("client_type") == target_type or target_type == "all":
                try:
                    await ws.send_json(payload)
                except Exception:
                    dead_sockets.append(ws)
        for ws in dead_sockets:
            self.disconnect(ws)

ws_manager = ConnectionManager()
