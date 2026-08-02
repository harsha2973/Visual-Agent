import { useState, useEffect, useRef } from 'react';

export interface WebSocketState {
  isLiveConnected: boolean;
  onlineUsersCount: number;
  latestEvent: Record<string, unknown> | null;
  latestScreenshot: Record<string, unknown> | null;
}

export function useWebSocket(url = 'ws://localhost:8000/ws/realtime'): WebSocketState {
  const [state, setState] = useState<WebSocketState>({
    isLiveConnected: false,
    onlineUsersCount: 1,
    latestEvent: null,
    latestScreenshot: null,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const heartbeatTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let isComponentMounted = true;

    function connect() {
      if (!isComponentMounted) return;

      try {
        const socket = new WebSocket(`${url}?client_type=dashboard&user_id=dashboard_user`);
        wsRef.current = socket;

        socket.onopen = () => {
          if (!isComponentMounted) return;
          reconnectAttempts.current = 0;
          setState((prev) => ({ ...prev, isLiveConnected: true }));

          // Heartbeat ping
          heartbeatTimer.current = setInterval(() => {
            if (socket.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify({ type: 'PING' }));
            }
          }, 15000);
        };

        socket.onmessage = (event) => {
          if (!isComponentMounted) return;
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'ONLINE_USERS_UPDATE') {
              setState((prev) => ({
                ...prev,
                onlineUsersCount: (data.online_users_count as number) || 1,
              }));
            } else if (data.type === 'NEW_BROWSER_EVENT') {
              setState((prev) => ({ ...prev, latestEvent: data.data as Record<string, unknown> }));
            } else if (data.type === 'LIVE_SCREENSHOT') {
              setState((prev) => ({
                ...prev,
                latestScreenshot: data.data as Record<string, unknown>,
              }));
            }
          } catch {
            // Ignore malformed payloads
          }
        };

        socket.onclose = () => {
          if (!isComponentMounted) return;
          cleanup();
          scheduleReconnect();
        };

        socket.onerror = () => {
          if (!isComponentMounted) return;
          cleanup();
          scheduleReconnect();
        };
      } catch {
        scheduleReconnect();
      }
    }

    function cleanup() {
      if (heartbeatTimer.current) {
        clearInterval(heartbeatTimer.current);
        heartbeatTimer.current = null;
      }
      setState((prev) => ({ ...prev, isLiveConnected: false }));
    }

    function scheduleReconnect() {
      reconnectAttempts.current += 1;
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current - 1), 30000);
      setTimeout(() => {
        if (isComponentMounted) {
          connect();
        }
      }, delay);
    }

    connect();

    return () => {
      isComponentMounted = false;
      cleanup();
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [url]);

  return state;
}
