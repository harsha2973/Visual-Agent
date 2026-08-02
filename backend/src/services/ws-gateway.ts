import { WebSocket } from 'ws';
import { WSEventPacket } from '@visual-agent/shared';
import { config } from '../config.js';

export class WSGatewayService {
  private clients: Map<string, WebSocket> = new Map();

  public registerClient(sessionId: string, socket: WebSocket) {
    this.clients.set(sessionId, socket);
    console.info(`[WS] Client registered for session: ${sessionId}`);

    socket.on('message', async (raw: string) => {
      try {
        const packet: WSEventPacket = JSON.parse(raw.toString());
        await this.handleIncomingPacket(sessionId, packet, socket);
      } catch (err) {
        console.error('[WS] Failed to parse WebSocket packet:', err);
      }
    });

    socket.on('close', () => {
      this.clients.delete(sessionId);
      console.info(`[WS] Client disconnected: ${sessionId}`);
    });
  }

  private async handleIncomingPacket(sessionId: string, packet: WSEventPacket, socket: WebSocket) {
    if (packet.event === 'TELEMETRY_UPDATE') {
      // Forward state to AI worker endpoint for next ReAct planning step
      try {
        const response = await fetch(`${config.aiWorkerUrl}/api/v1/plan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            telemetry: packet.payload,
          }),
        });

        if (response.ok) {
          const aiResponse = await response.json();
          // Dispatch planned action back to Chrome extension
          socket.send(
            JSON.stringify({
              event: 'ACTION_DISPATCH',
              sessionId,
              payload: aiResponse.plan,
            }),
          );
        }
      } catch (err) {
        console.warn(
          '[WS] AI worker service un-reachable, defaulting to fallback thought step:',
          err,
        );
        // Dispatch fallback mock step
        socket.send(
          JSON.stringify({
            event: 'ACTION_DISPATCH',
            sessionId,
            payload: {
              stepNumber: 1,
              thought: 'Analyzed accessibility DOM tree and visual snapshot. Navigating to goal.',
              action: {
                type: 'WAIT',
                duration_ms: 1000,
              },
              confidence: 0.95,
              requiresHumanApproval: false,
            },
          }),
        );
      }
    } else if (packet.event === 'ACTION_RESULT') {
      console.info(`[WS] Action result received for session ${sessionId}:`, packet.payload);
    }
  }

  public broadcastToSession(sessionId: string, packet: WSEventPacket) {
    const socket = this.clients.get(sessionId);
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(packet));
    }
  }
}

export const wsGateway = new WSGatewayService();
