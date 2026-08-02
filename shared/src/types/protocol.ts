export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface CreateSessionRequest {
  goal: string;
  executionMode?: 'IN_BROWSER' | 'HEADLESS_CLOUD';
}
