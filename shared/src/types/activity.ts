export type ActivityEventType =
  | 'CURRENT_URL'
  | 'TAB_CHANGE'
  | 'WINDOW_FOCUS'
  | 'BROWSER_START'
  | 'BROWSER_CLOSE'
  | 'SESSION_DURATION'
  | 'TIME_SPENT'
  | 'SCROLL_DEPTH'
  | 'MOUSE_CLICK'
  | 'KEYBOARD_SHORTCUT'
  | 'IDLE_STATE'
  | 'NAVIGATION'
  | 'DOWNLOAD';

export interface BaseActivityEvent<T = Record<string, unknown>> {
  id: string;
  sessionId: string;
  eventType: ActivityEventType;
  timestamp: string;
  url?: string;
  tabId?: number;
  windowId?: number;
  payload: T;
}

export interface URLChangeEventPayload {
  url: string;
  title?: string;
}

export interface TabChangeEventPayload {
  tabId: number;
  previousTabId?: number;
  url?: string;
}

export interface WindowFocusEventPayload {
  windowId: number;
  focused: boolean;
}

export interface SessionDurationEventPayload {
  durationSeconds: number;
  startTime: string;
}

export interface TimeSpentEventPayload {
  domain: string;
  activeTimeSeconds: number;
}

export interface ScrollDepthEventPayload {
  scrollPercentage: number;
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
}

export interface MouseClickEventPayload {
  x: number;
  y: number;
  button: number;
  tagName: string;
  targetId?: string;
  targetText?: string;
}

export interface KeyboardShortcutEventPayload {
  key: string;
  code: string;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
  shortcutString: string;
}

export interface IdleStateEventPayload {
  state: 'active' | 'idle' | 'locked';
  thresholdSeconds: number;
}

export interface NavigationEventPayload {
  url: string;
  transitionType: string;
  transitionQualifiers: string[];
}

export interface DownloadEventPayload {
  downloadId: number;
  url: string;
  filename?: string;
  fileSize?: number;
  mimeType?: string;
  state?: string;
}

export type BrowserActivityEvent = BaseActivityEvent<
  | URLChangeEventPayload
  | TabChangeEventPayload
  | WindowFocusEventPayload
  | SessionDurationEventPayload
  | TimeSpentEventPayload
  | ScrollDepthEventPayload
  | MouseClickEventPayload
  | KeyboardShortcutEventPayload
  | IdleStateEventPayload
  | NavigationEventPayload
  | DownloadEventPayload
  | Record<string, unknown>
>;
