export type ConnectionStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'RECONNECTING';

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private serverUrl: string;
  private userId: string;
  private status: ConnectionStatus = 'DISCONNECTED';
  private reconnectAttempts = 0;
  private maxReconnectDelayMs = 30000;
  private heartbeatIntervalTimer: ReturnType<typeof setInterval> | null = null;
  private onStatusChangeCallback?: (status: ConnectionStatus) => void;

  constructor(serverUrl = 'ws://localhost:8000/ws/realtime', userId = 'usr_ext_client') {
    this.serverUrl = serverUrl;
    this.userId = userId;
  }

  public connect(): void {
    if (this.status === 'CONNECTED' || this.status === 'CONNECTING') return;

    this.setStatus('CONNECTING');
    const fullUrl = `${this.serverUrl}?client_type=extension&user_id=${encodeURIComponent(this.userId)}`;

    try {
      this.ws = new WebSocket(fullUrl);

      this.ws.onopen = () => {
        this.setStatus('CONNECTED');
        this.reconnectAttempts = 0;
        this.startHeartbeat();
      };

      this.ws.onmessage = (evt) => {
        try {
          const msg = JSON.parse(evt.data);
          if (msg.type === 'PONG') {
            // Heartbeat ACK
          }
        } catch {
          // Ignore invalid JSON
        }
      };

      this.ws.onerror = () => {
        this.handleConnectionDrop();
      };

      this.ws.onclose = () => {
        this.handleConnectionDrop();
      };
    } catch {
      this.handleConnectionDrop();
    }
  }

  public disconnect(): void {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.setStatus('DISCONNECTED');
  }

  public sendTelemetryEvent(eventData: Record<string, unknown>): boolean {
    return this.sendJSON({
      type: 'TELEMETRY_EVENT',
      payload: eventData,
    });
  }

  public sendScreenshotFrame(frameData: Record<string, unknown>): boolean {
    return this.sendJSON({
      type: 'SCREENSHOT_FRAME',
      payload: frameData,
    });
  }

  private sendJSON(payload: Record<string, unknown>): boolean {
    if (this.ws && this.status === 'CONNECTED' && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(payload));
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }

  private handleConnectionDrop(): void {
    this.stopHeartbeat();
    this.ws = null;

    if (this.status !== 'DISCONNECTED') {
      this.setStatus('RECONNECTING');
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const backoffMs = Math.min(
      1000 * Math.pow(2, this.reconnectAttempts - 1),
      this.maxReconnectDelayMs,
    );
    setTimeout(() => {
      if (this.status === 'RECONNECTING') {
        this.connect();
      }
    }, backoffMs);
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatIntervalTimer = setInterval(() => {
      this.sendJSON({ type: 'PING' });
    }, 15000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatIntervalTimer) {
      clearInterval(this.heartbeatIntervalTimer);
      this.heartbeatIntervalTimer = null;
    }
  }

  public onStatusChange(callback: (status: ConnectionStatus) => void): void {
    this.onStatusChangeCallback = callback;
  }

  private setStatus(newStatus: ConnectionStatus): void {
    this.status = newStatus;
    if (this.onStatusChangeCallback) {
      this.onStatusChangeCallback(newStatus);
    }
  }

  public getStatus(): ConnectionStatus {
    return this.status;
  }
}
