/// <reference types="chrome"/>
import { CapturedFrame } from './TabCaptureManager.js';
import { AuthManager } from './AuthManager.js';

export interface ScreenshotUploaderOptions {
  baseUrl?: string;
  maxRetries?: number;
  baseDelayMs?: number;
  authManager?: AuthManager;
}

export class ScreenshotUploader {
  private baseUrl: string;
  private maxRetries: number;
  private baseDelayMs: number;
  private authManager: AuthManager;
  private queueStorageKey = 'visual_agent_screenshot_upload_queue';

  constructor(options: ScreenshotUploaderOptions = {}) {
    this.baseUrl = options.baseUrl || 'http://localhost:3000/api/v1';
    this.maxRetries = options.maxRetries || 3;
    this.baseDelayMs = options.baseDelayMs || 1000;
    this.authManager = options.authManager || new AuthManager({ baseUrl: this.baseUrl });
  }

  public dataUrlToBlob(dataUrl: string): Blob {
    const arr = dataUrl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

  public async uploadFrame(frame: CapturedFrame, sessionId: string): Promise<boolean> {
    let attempt = 0;

    while (attempt <= this.maxRetries) {
      try {
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          console.warn('[ScreenshotUploader] Network offline. Storing screenshot frame.');
          await this.enqueueFailedFrame(frame);
          return false;
        }

        const blob = this.dataUrlToBlob(frame.compressedDataUrl);
        const formData = new FormData();
        formData.append('file', blob, `${frame.id}.jpg`);
        formData.append('session_id', sessionId);
        if (frame.url) formData.append('page_url', frame.url);
        if (frame.tabId) formData.append('tab_id', frame.tabId.toString());

        const endpoint = `${this.baseUrl}/screenshots`;
        const response = await this.authManager.fetchWithAuth(endpoint, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          console.info(`[ScreenshotUploader] Screenshot ${frame.id} uploaded successfully.`);
          return true;
        }

        if (response.status === 401) {
          console.warn('[ScreenshotUploader] Authentication required (401).');
          await this.enqueueFailedFrame(frame);
          return false;
        }
      } catch (err) {
        console.warn(`[ScreenshotUploader] Error uploading frame attempt ${attempt + 1}:`, err);
      }

      attempt++;
      if (attempt <= this.maxRetries) {
        const delay = this.baseDelayMs * Math.pow(2, attempt - 1);
        await new Promise((res) => setTimeout(res, delay));
      }
    }

    await this.enqueueFailedFrame(frame);
    return false;
  }

  public async enqueueFailedFrame(frame: CapturedFrame): Promise<void> {
    try {
      const queue = await this.getFailedQueue();
      queue.push(frame);
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        await chrome.storage.local.set({ [this.queueStorageKey]: queue });
      } else if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.queueStorageKey, JSON.stringify(queue));
      }
    } catch (err) {
      console.error('[ScreenshotUploader] Error queueing failed frame:', err);
    }
  }

  public async getFailedQueue(): Promise<CapturedFrame[]> {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        const res = await chrome.storage.local.get(this.queueStorageKey);
        return res[this.queueStorageKey] || [];
      } else if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(this.queueStorageKey);
        return stored ? JSON.parse(stored) : [];
      }
    } catch (err) {
      console.error('[ScreenshotUploader] Error reading failed queue:', err);
    }
    return [];
  }
}
