import { ActivityEventType, BrowserActivityEvent } from '@visual-agent/shared';

export interface StorageDriver {
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown): Promise<void>;
  remove(key: string): Promise<void>;
}

export class ChromeStorageDriver implements StorageDriver {
  async get(key: string): Promise<unknown> {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      const result = await chrome.storage.local.get(key);
      return result[key];
    }
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  }

  async set(key: string, value: unknown): Promise<void> {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      await chrome.storage.local.set({ [key]: value });
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }

  async remove(key: string): Promise<void> {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      await chrome.storage.local.remove(key);
    } else {
      localStorage.removeItem(key);
    }
  }
}

export interface EventManagerOptions {
  batchSize?: number;
  flushIntervalMs?: number;
  sessionId?: string;
  storageDriver?: StorageDriver;
  onFlush?: (batch: BrowserActivityEvent[]) => Promise<void> | void;
}

export class EventManager {
  private queue: BrowserActivityEvent[] = [];
  private storedEventsKey = 'visual_agent_activity_events';
  private batchSize: number;
  private flushIntervalMs: number;
  private sessionId: string;
  private storage: StorageDriver;
  private onFlush?: (batch: BrowserActivityEvent[]) => Promise<void> | void;
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private sessionStartTime: number;
  private sequence = 0;
  private maxScrollDepthMap: Map<string, number> = new Map();

  constructor(options: EventManagerOptions = {}) {
    this.batchSize = options.batchSize || 10;
    this.flushIntervalMs = options.flushIntervalMs || 5000;
    this.sessionId = options.sessionId || `session_${Date.now()}`;
    this.storage = options.storageDriver || new ChromeStorageDriver();
    this.onFlush = options.onFlush;
    this.sessionStartTime = Date.now();

    this.startPeriodicFlush();
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  public setSessionId(id: string): void {
    this.sessionId = id;
  }

  public createEvent<T extends Record<string, unknown>>(
    eventType: ActivityEventType,
    payload: T,
    metadata: { url?: string; tabId?: number; windowId?: number } = {},
  ): BrowserActivityEvent {
    this.sequence++;
    return {
      id: `evt_${Date.now()}_${this.sequence}`,
      sessionId: this.sessionId,
      eventType,
      timestamp: new Date().toISOString(),
      url: metadata.url,
      tabId: metadata.tabId,
      windowId: metadata.windowId,
      payload,
    };
  }

  public async trackEvent<T extends Record<string, unknown>>(
    eventType: ActivityEventType,
    payload: T,
    metadata: { url?: string; tabId?: number; windowId?: number } = {},
  ): Promise<BrowserActivityEvent> {
    const event = this.createEvent(eventType, payload, metadata);
    this.queue.push(event);

    if (this.queue.length >= this.batchSize) {
      await this.flush();
    }

    return event;
  }

  public getQueue(): BrowserActivityEvent[] {
    return [...this.queue];
  }

  public async flush(): Promise<BrowserActivityEvent[]> {
    if (this.queue.length === 0) return [];

    const batchToFlush = [...this.queue];
    this.queue = [];

    // Save batch to local storage
    try {
      const existing =
        ((await this.storage.get(this.storedEventsKey)) as BrowserActivityEvent[]) || [];
      const updated = [...existing, ...batchToFlush];
      await this.storage.set(this.storedEventsKey, updated);
    } catch (err) {
      console.error('[EventManager] Failed to persist batch to local storage:', err);
    }

    // Invoke external flush callback if registered
    if (this.onFlush) {
      try {
        await this.onFlush(batchToFlush);
      } catch (err) {
        console.error('[EventManager] Flush callback failed:', err);
      }
    }

    return batchToFlush;
  }

  public async getStoredEvents(): Promise<BrowserActivityEvent[]> {
    return ((await this.storage.get(this.storedEventsKey)) as BrowserActivityEvent[]) || [];
  }

  public async clearStoredEvents(): Promise<void> {
    await this.storage.remove(this.storedEventsKey);
  }

  private startPeriodicFlush(): void {
    if (this.flushIntervalMs > 0 && typeof setInterval !== 'undefined') {
      this.flushTimer = setInterval(() => {
        void this.flush();
      }, this.flushIntervalMs);
    }
  }

  public destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  // --- Background API Tracking Listeners ---

  public initBackgroundListeners(): void {
    if (typeof chrome === 'undefined') return;

    // 1. Browser Start
    void this.trackEvent('BROWSER_START', {
      startedAt: new Date().toISOString(),
      userAgent: navigator.userAgent,
    });

    // 2. Tab changes
    if (chrome.tabs?.onActivated) {
      chrome.tabs.onActivated.addListener((activeInfo) => {
        chrome.tabs.get(activeInfo.tabId, (tab) => {
          void this.trackEvent(
            'TAB_CHANGE',
            { tabId: activeInfo.tabId, windowId: activeInfo.windowId, url: tab?.url },
            { tabId: activeInfo.tabId, windowId: activeInfo.windowId, url: tab?.url },
          );
        });
      });
    }

    // 3. Current URL changes via Tab updates
    if (chrome.tabs?.onUpdated) {
      chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        if (changeInfo.url) {
          void this.trackEvent(
            'CURRENT_URL',
            { url: changeInfo.url, title: tab.title },
            { tabId, windowId: tab.windowId, url: changeInfo.url },
          );
        }
      });
    }

    // 4. Window Focus changes
    if (chrome.windows?.onFocusChanged) {
      chrome.windows.onFocusChanged.addListener((windowId) => {
        const focused = windowId !== chrome.windows.WINDOW_ID_NONE;
        void this.trackEvent('WINDOW_FOCUS', { windowId, focused }, { windowId });
      });
    }

    // 5. Idle State changes
    if (chrome.idle?.onStateChanged) {
      chrome.idle.onStateChanged.addListener((newState) => {
        void this.trackEvent('IDLE_STATE', {
          state: newState as 'active' | 'idle' | 'locked',
          thresholdSeconds: 60,
        });
      });
    }

    // 6. Navigation events via webNavigation
    if (chrome.webNavigation?.onCommitted) {
      chrome.webNavigation.onCommitted.addListener((details) => {
        if (details.frameId === 0) {
          void this.trackEvent(
            'NAVIGATION',
            {
              url: details.url,
              transitionType: details.transitionType,
              transitionQualifiers: details.transitionQualifiers,
            },
            { url: details.url, tabId: details.tabId },
          );
        }
      });
    }

    // 7. Downloads tracking
    if (chrome.downloads?.onCreated) {
      chrome.downloads.onCreated.addListener((downloadItem) => {
        void this.trackEvent('DOWNLOAD', {
          downloadId: downloadItem.id,
          url: downloadItem.url,
          filename: downloadItem.filename,
          fileSize: downloadItem.fileSize,
          mimeType: downloadItem.mime,
          state: downloadItem.state,
        });
      });
    }

    // 8. Session Duration tracking timer
    setInterval(() => {
      const durationSeconds = Math.floor((Date.now() - this.sessionStartTime) / 1000);
      void this.trackEvent('SESSION_DURATION', {
        durationSeconds,
        startTime: new Date(this.sessionStartTime).toISOString(),
      });
    }, 60000);
  }

  // --- Content Script DOM Activity Tracking Listeners ---

  public initContentScriptListeners(targetWindow: Window = window): void {
    if (!targetWindow || !targetWindow.document) return;

    let pageStartTime = Date.now();
    const domain = targetWindow.location.hostname;

    // 1. Mouse Click Tracking
    targetWindow.document.addEventListener('click', (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      void this.trackEvent(
        'MOUSE_CLICK',
        {
          x: event.clientX,
          y: event.clientY,
          button: event.button,
          tagName: target?.tagName?.toLowerCase() || 'unknown',
          targetId: target?.id || target?.getAttribute('data-agent-id') || undefined,
          targetText: target?.textContent?.trim().slice(0, 50) || undefined,
        },
        { url: targetWindow.location.href },
      );
    });

    // 2. Keyboard Shortcut Tracking
    targetWindow.document.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.ctrlKey || event.altKey || event.metaKey) {
        const keys: string[] = [];
        if (event.ctrlKey) keys.push('Ctrl');
        if (event.altKey) keys.push('Alt');
        if (event.metaKey) keys.push('Meta');
        if (event.shiftKey) keys.push('Shift');
        keys.push(event.key);

        void this.trackEvent(
          'KEYBOARD_SHORTCUT',
          {
            key: event.key,
            code: event.code,
            ctrlKey: event.ctrlKey,
            shiftKey: event.shiftKey,
            altKey: event.altKey,
            metaKey: event.metaKey,
            shortcutString: keys.join('+'),
          },
          { url: targetWindow.location.href },
        );
      }
    });

    // 3. Scroll Depth Tracking
    let scrollTimeout: ReturnType<typeof setTimeout> | null = null;
    targetWindow.addEventListener('scroll', () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const docEl = targetWindow.document.documentElement;
        const body = targetWindow.document.body;
        const scrollTop = docEl.scrollTop || body.scrollTop;
        const scrollHeight = docEl.scrollHeight || body.scrollHeight;
        const clientHeight = docEl.clientHeight;

        const maxScroll = scrollHeight - clientHeight;
        const scrollPercentage =
          maxScroll > 0 ? Math.min(100, Math.round((scrollTop / maxScroll) * 100)) : 100;

        const currentMax = this.maxScrollDepthMap.get(targetWindow.location.href) || 0;
        if (scrollPercentage > currentMax) {
          this.maxScrollDepthMap.set(targetWindow.location.href, scrollPercentage);
          void this.trackEvent(
            'SCROLL_DEPTH',
            {
              scrollPercentage,
              scrollTop: Math.round(scrollTop),
              scrollHeight: Math.round(scrollHeight),
              clientHeight: Math.round(clientHeight),
            },
            { url: targetWindow.location.href },
          );
        }
      }, 200);
    });

    // 4. Time Spent & Page Visibility / Unload
    targetWindow.addEventListener('beforeunload', () => {
      const activeTimeSeconds = Math.floor((Date.now() - pageStartTime) / 1000);
      void this.trackEvent(
        'TIME_SPENT',
        { domain, activeTimeSeconds },
        { url: targetWindow.location.href },
      );
      void this.trackEvent('BROWSER_CLOSE', {
        closedAt: new Date().toISOString(),
        durationSeconds: activeTimeSeconds,
      });
      void this.flush();
    });

    targetWindow.document.addEventListener('visibilitychange', () => {
      if (targetWindow.document.hidden) {
        const activeTimeSeconds = Math.floor((Date.now() - pageStartTime) / 1000);
        void this.trackEvent(
          'TIME_SPENT',
          { domain, activeTimeSeconds },
          { url: targetWindow.location.href },
        );
      } else {
        pageStartTime = Date.now();
      }
    });
  }
}
