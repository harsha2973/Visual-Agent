/// <reference types="chrome"/>
import { BrowserActivityEvent } from '@visual-agent/shared';
import { AuthManager } from './AuthManager.js';
import { EventManager } from './EventManager.js';

export interface BatchUploaderOptions {
  uploadIntervalMs?: number;
  maxRetries?: number;
  baseDelayMs?: number;
  authManager?: AuthManager;
  eventManager?: EventManager;
}

export class BatchUploader {
  private uploadIntervalMs: number;
  private maxRetries: number;
  private baseDelayMs: number;
  private authManager: AuthManager;
  private eventManager?: EventManager;
  private offlineQueueKey = 'visual_agent_offline_queue';
  private timer: ReturnType<typeof setInterval> | null = null;
  private isUploading = false;
  private lastUploadTimestamp: string | null = null;

  constructor(options: BatchUploaderOptions = {}) {
    this.uploadIntervalMs = options.uploadIntervalMs || 30000; // 30 seconds
    this.maxRetries = options.maxRetries || 3;
    this.baseDelayMs = options.baseDelayMs || 1000;
    this.authManager = options.authManager || new AuthManager();
    this.eventManager = options.eventManager;

    this.startPeriodicUpload();
    this.initBackgroundSyncListeners();
  }

  public getLastUploadTimestamp(): string | null {
    return this.lastUploadTimestamp;
  }

  public startPeriodicUpload(): void {
    if (this.uploadIntervalMs > 0 && typeof setInterval !== 'undefined') {
      this.timer = setInterval(() => {
        void this.triggerScheduledUpload();
      }, this.uploadIntervalMs);
    }
  }

  public stopPeriodicUpload(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  public async triggerScheduledUpload(): Promise<void> {
    if (this.isUploading) return;

    try {
      this.isUploading = true;

      // 1. Drain current batch from EventManager if registered
      let eventsToUpload: BrowserActivityEvent[] = [];
      if (this.eventManager) {
        eventsToUpload = await this.eventManager.flush();
      }

      // 2. Load stored offline queue
      const offlineEvents = await this.getOfflineQueue();
      const combined = [...offlineEvents, ...eventsToUpload];

      if (combined.length === 0) {
        this.isUploading = false;
        return;
      }

      // 3. Attempt upload with exponential backoff retries
      const success = await this.uploadWithRetry(combined);

      if (success) {
        await this.clearOfflineQueue();
        this.lastUploadTimestamp = new Date().toISOString();
        console.info(`[BatchUploader] Successfully uploaded batch of ${combined.length} events.`);
      } else {
        // Save failed batch back to offline queue
        await this.saveOfflineQueue(combined);
        console.warn(
          `[BatchUploader] Saved ${combined.length} events to offline queue for background sync.`,
        );
      }
    } catch (err) {
      console.error('[BatchUploader] Scheduled upload error:', err);
    } finally {
      this.isUploading = false;
    }
  }

  public async uploadWithRetry(events: BrowserActivityEvent[]): Promise<boolean> {
    let attempt = 0;

    while (attempt <= this.maxRetries) {
      try {
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          console.warn('[BatchUploader] Browser is offline. Skipping upload attempt.');
          return false;
        }

        const endpoint = `${this.authManager.getBaseUrl()}/events`;
        const payload = JSON.stringify({ events });
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        let body: BodyInit = payload;

        // Apply compression if CompressionStream and Blob.stream APIs are available
        if (
          typeof CompressionStream !== 'undefined' &&
          typeof Blob !== 'undefined' &&
          typeof Blob.prototype.stream === 'function'
        ) {
          try {
            const stream = new Blob([payload]).stream().pipeThrough(new CompressionStream('gzip'));
            body = await new Response(stream).arrayBuffer();
            headers['Content-Encoding'] = 'gzip';
          } catch (compErr) {
            console.warn(
              '[BatchUploader] Compression failed, falling back to uncompressed payload:',
              compErr,
            );
          }
        }

        const response = await this.authManager.fetchWithAuth(endpoint, {
          method: 'POST',
          headers,
          body,
        });

        if (response.ok) {
          return true;
        }

        if (response.status === 401) {
          console.warn('[BatchUploader] Authentication required (401). Storing events offline.');
          return false;
        }
      } catch (networkErr) {
        console.warn(
          `[BatchUploader] Network error on attempt ${attempt + 1}/${this.maxRetries + 1}:`,
          networkErr,
        );
      }

      attempt++;
      if (attempt <= this.maxRetries) {
        const delay = this.baseDelayMs * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    return false;
  }

  // --- Offline Storage Queue Helpers ---

  public async getOfflineQueue(): Promise<BrowserActivityEvent[]> {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        const res = await chrome.storage.local.get(this.offlineQueueKey);
        return res[this.offlineQueueKey] || [];
      } else if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(this.offlineQueueKey);
        return stored ? JSON.parse(stored) : [];
      }
    } catch (err) {
      console.error('[BatchUploader] Failed to read offline queue:', err);
    }
    return [];
  }

  public async saveOfflineQueue(events: BrowserActivityEvent[]): Promise<void> {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        await chrome.storage.local.set({ [this.offlineQueueKey]: events });
      } else if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.offlineQueueKey, JSON.stringify(events));
      }
    } catch (err) {
      console.error('[BatchUploader] Failed to save offline queue:', err);
    }
  }

  public async clearOfflineQueue(): Promise<void> {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        await chrome.storage.local.remove(this.offlineQueueKey);
      } else if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(this.offlineQueueKey);
      }
    } catch (err) {
      console.error('[BatchUploader] Failed to clear offline queue:', err);
    }
  }

  // --- Background Sync Listeners ---

  private initBackgroundSyncListeners(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.info('[BatchUploader] Network connection restored. Triggering background sync.');
        void this.triggerScheduledUpload();
      });
    }

    if (typeof chrome !== 'undefined' && chrome.alarms) {
      chrome.alarms.create('visual_agent_batch_upload', { periodInMinutes: 0.5 });
      chrome.alarms.onAlarm.addListener((alarm) => {
        if (alarm.name === 'visual_agent_batch_upload') {
          void this.triggerScheduledUpload();
        }
      });
    }
  }
}
