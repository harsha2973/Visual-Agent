/// <reference types="chrome"/>

export interface CapturedFrame {
  id: string;
  tabId?: number;
  url?: string;
  timestamp: string;
  compressedDataUrl: string;
  thumbnailDataUrl: string;
}

export interface TabCaptureOptions {
  intervalMs?: number;
  compressionQuality?: number;
  thumbnailWidth?: number;
  maxQueueSize?: number;
}

export class TabCaptureManager {
  private intervalMs: number;
  private compressionQuality: number;
  private thumbnailWidth: number;
  private maxQueueSize: number;
  private hasUserPermission = false;
  private isCapturing = false;
  private timer: ReturnType<typeof setInterval> | null = null;
  private queueStorageKey = 'visual_agent_screenshot_queue';
  private latestFrame: CapturedFrame | null = null;

  // Sensitive URL pattern matching for privacy compliance
  private sensitiveUrlPatterns = [
    /bank/i,
    /login/i,
    /auth/i,
    /checkout/i,
    /password/i,
    /chrome:\/\//i,
    /chrome-extension:\/\//i,
  ];

  constructor(options: TabCaptureOptions = {}) {
    this.intervalMs = options.intervalMs || 3000; // Default 3 seconds
    this.compressionQuality = options.compressionQuality || 0.65;
    this.thumbnailWidth = options.thumbnailWidth || 200;
    this.maxQueueSize = options.maxQueueSize || 20;
  }

  public setUserPermission(granted: boolean): void {
    this.hasUserPermission = granted;
    if (!granted && this.isCapturing) {
      this.stopCapture();
    }
  }

  public getUserPermission(): boolean {
    return this.hasUserPermission;
  }

  public setIntervalMs(intervalMs: number): void {
    this.intervalMs = Math.max(1000, intervalMs);
    if (this.isCapturing) {
      this.stopCapture();
      this.startCapture();
    }
  }

  public getIntervalMs(): number {
    return this.intervalMs;
  }

  public getIsCapturing(): boolean {
    return this.isCapturing;
  }

  public getLatestFrame(): CapturedFrame | null {
    return this.latestFrame;
  }

  public startCapture(): boolean {
    if (!this.hasUserPermission) {
      console.warn(
        '[TabCaptureManager] Cannot start tab capture without explicit user permission.',
      );
      return false;
    }

    if (this.isCapturing) return true;

    this.isCapturing = true;
    console.info(`[TabCaptureManager] Starting tab capture every ${this.intervalMs}ms.`);

    // Perform immediate first capture
    void this.captureActiveTab();

    if (typeof setInterval !== 'undefined') {
      this.timer = setInterval(() => {
        void this.captureActiveTab();
      }, this.intervalMs);
    }

    return true;
  }

  public stopCapture(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isCapturing = false;
    console.info('[TabCaptureManager] Tab capture stopped.');
  }

  public async captureActiveTab(): Promise<CapturedFrame | null> {
    if (!this.hasUserPermission || !this.isCapturing) {
      return null;
    }

    try {
      if (typeof chrome === 'undefined' || !chrome.tabs?.captureVisibleTab) {
        console.warn(
          '[TabCaptureManager] chrome.tabs.captureVisibleTab API not available in environment.',
        );
        return null;
      }

      // 1. Query active tab
      const [activeTab] = await new Promise<chrome.tabs.Tab[]>((resolve) =>
        chrome.tabs.query({ active: true, currentWindow: true }, resolve),
      );

      if (!activeTab || !activeTab.id || !activeTab.url) {
        return null;
      }

      // 2. Check privacy restrictions
      if (this.isSensitiveUrl(activeTab.url)) {
        console.info(`[TabCaptureManager] Skipping screenshot for sensitive URL: ${activeTab.url}`);
        return null;
      }

      // 3. Capture visible tab as Data URL
      const rawDataUrl = await new Promise<string>((resolve, reject) => {
        chrome.tabs.captureVisibleTab(
          activeTab.windowId,
          { format: 'jpeg', quality: Math.round(this.compressionQuality * 100) },
          (dataUrl) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(dataUrl);
            }
          },
        );
      });

      if (!rawDataUrl) return null;

      // 4. Generate thumbnail and compressed representation
      const thumbnailDataUrl = await this.generateThumbnail(rawDataUrl, this.thumbnailWidth);

      const frame: CapturedFrame = {
        id: `cap_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        tabId: activeTab.id,
        url: activeTab.url,
        timestamp: new Date().toISOString(),
        compressedDataUrl: rawDataUrl,
        thumbnailDataUrl,
      };

      this.latestFrame = frame;
      await this.enqueueFrame(frame);
      return frame;
    } catch (err) {
      console.error('[TabCaptureManager] Error capturing active tab:', err);
      return null;
    }
  }

  public isSensitiveUrl(url: string): boolean {
    return this.sensitiveUrlPatterns.some((pattern) => pattern.test(url));
  }

  public async generateThumbnail(dataUrl: string, targetWidth: number): Promise<string> {
    // Canvas-based thumbnail generator (works in DOM environments or Canvas contexts)
    if (typeof document !== 'undefined' && typeof Image !== 'undefined') {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const aspectRatio = img.height / img.width;
          canvas.width = targetWidth;
          canvas.height = Math.round(targetWidth * aspectRatio);

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', 0.5));
          } else {
            resolve(dataUrl);
          }
        };
        img.onerror = () => resolve(dataUrl);
        img.src = dataUrl;
      });
    }
    return dataUrl;
  }

  public async enqueueFrame(frame: CapturedFrame): Promise<void> {
    try {
      const currentQueue = await this.getQueue();
      currentQueue.push(frame);

      // Enforce max queue size limit
      if (currentQueue.length > this.maxQueueSize) {
        currentQueue.splice(0, currentQueue.length - this.maxQueueSize);
      }

      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        await chrome.storage.local.set({ [this.queueStorageKey]: currentQueue });
      } else if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.queueStorageKey, JSON.stringify(currentQueue));
      }
    } catch (err) {
      console.error('[TabCaptureManager] Failed to enqueue frame:', err);
    }
  }

  public async getQueue(): Promise<CapturedFrame[]> {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        const res = await chrome.storage.local.get(this.queueStorageKey);
        return res[this.queueStorageKey] || [];
      } else if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(this.queueStorageKey);
        return stored ? JSON.parse(stored) : [];
      }
    } catch (err) {
      console.error('[TabCaptureManager] Failed to read screenshot queue:', err);
    }
    return [];
  }

  public async flushQueue(): Promise<CapturedFrame[]> {
    const queue = await this.getQueue();
    try {
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        await chrome.storage.local.remove(this.queueStorageKey);
      } else if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(this.queueStorageKey);
      }
    } catch (err) {
      console.error('[TabCaptureManager] Failed to clear screenshot queue:', err);
    }
    return queue;
  }
}
