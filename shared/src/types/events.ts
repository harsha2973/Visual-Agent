import { AgentThought, AXElementNode, SessionStatus } from './agent.js';

export type EventType =
  | 'SESSION_INIT'
  | 'TELEMETRY_UPDATE'
  | 'ACTION_DISPATCH'
  | 'ACTION_RESULT'
  | 'HUMAN_CONFIRM_REQUEST'
  | 'HUMAN_CONFIRM_RESPONSE'
  | 'SESSION_STATUS_CHANGE';

export interface TelemetryPayload {
  sessionId: string;
  url: string;
  screenshotBase64?: string;
  axDomTree: AXElementNode[];
  timestamp: string;
}

export interface ActionResultPayload {
  sessionId: string;
  stepNumber: number;
  success: boolean;
  error?: string;
  domChanged: boolean;
}

export interface WSEventPacket {
  event: EventType;
  sessionId: string;
  payload:
    | TelemetryPayload
    | AgentThought
    | ActionResultPayload
    | { status: SessionStatus }
    | Record<string, unknown>;
}
