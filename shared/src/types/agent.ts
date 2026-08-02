export type ExecutionMode = 'IN_BROWSER' | 'HEADLESS_CLOUD';

export type SessionStatus =
  'INITIALIZED' | 'RUNNING' | 'WAITING_HUMAN_CONFIRMATION' | 'COMPLETED' | 'FAILED' | 'STOPPED';

export type ActionType =
  | 'CLICK'
  | 'TYPE_TEXT'
  | 'SCROLL'
  | 'SELECT_OPTION'
  | 'NAVIGATE'
  | 'HOVER'
  | 'EXTRACT_DATA'
  | 'WAIT'
  | 'FINISH';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AXElementNode {
  agentId: string;
  tagName: string;
  role?: string;
  name?: string;
  value?: string;
  boundingBox?: BoundingBox;
  isSensitive?: boolean;
}

export interface AgentAction {
  type: ActionType;
  targetId?: string;
  text?: string;
  url?: string;
  scrollDirection?: 'UP' | 'DOWN';
  scrollAmount?: number;
  optionValue?: string;
  extractedData?: Record<string, unknown>;
  summary?: string;
}

export interface AgentThought {
  stepNumber: number;
  thought: string;
  action: AgentAction;
  confidence: number;
  requiresHumanApproval: boolean;
}

export interface Session {
  id: string;
  goal: string;
  status: SessionStatus;
  executionMode: ExecutionMode;
  createdAt: string;
  updatedAt: string;
}
