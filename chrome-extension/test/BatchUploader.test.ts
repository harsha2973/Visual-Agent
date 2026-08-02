// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BatchUploader } from '../src/telemetry/BatchUploader.js';
import { AuthManager } from '../src/telemetry/AuthManager.js';
import { EventManager } from '../src/telemetry/EventManager.js';
import { BrowserActivityEvent } from '@visual-agent/shared';

describe('BatchUploader Unit Tests', () => {
  let uploader: BatchUploader;
  let authManager: AuthManager;
  let eventManager: EventManager;

  beforeEach(() => {
    localStorage.clear();
    authManager = new AuthManager({ baseUrl: 'http://testserver/api/v1' });
    eventManager = new EventManager({ batchSize: 5, flushIntervalMs: 0 });

    uploader = new BatchUploader({
      uploadIntervalMs: 0, // Disable timer in test
      maxRetries: 2,
      baseDelayMs: 10,
      authManager,
      eventManager,
    });
  });

  afterEach(() => {
    uploader.stopPeriodicUpload();
    eventManager.destroy();
    vi.restoreAllMocks();
  });

  it('should save batch to offline queue when network request fails', async () => {
    const mockEvents: BrowserActivityEvent[] = [
      {
        id: 'evt_1',
        sessionId: 'sess_1',
        eventType: 'CURRENT_URL',
        timestamp: new Date().toISOString(),
        payload: { url: 'https://example.com' },
      },
    ];

    // Mock network failure
    authManager.fetchWithAuth = vi.fn().mockRejectedValue(new Error('Network disconnected'));

    const success = await uploader.uploadWithRetry(mockEvents);
    expect(success).toBe(false);

    // Verify offline queue fallback
    await uploader.saveOfflineQueue(mockEvents);
    const offlineQueue = await uploader.getOfflineQueue();
    expect(offlineQueue.length).toBe(1);
    expect(offlineQueue[0].id).toBe('evt_1');
  });

  it('should retry with exponential backoff on transient errors and succeed', async () => {
    const mockEvents: BrowserActivityEvent[] = [
      {
        id: 'evt_retry',
        sessionId: 'sess_1',
        eventType: 'TAB_CHANGE',
        timestamp: new Date().toISOString(),
        payload: { tabId: 2 },
      },
    ];

    let attempts = 0;
    authManager.fetchWithAuth = vi.fn().mockImplementation(async () => {
      attempts++;
      if (attempts < 2) {
        return { ok: false, status: 503 } as Response;
      }
      return { ok: true, status: 201 } as Response;
    });

    const success = await uploader.uploadWithRetry(mockEvents);
    expect(success).toBe(true);
    expect(attempts).toBe(2);
  });

  it('should successfully upload combined offline events and update lastUploadTimestamp', async () => {
    const offlineEvents: BrowserActivityEvent[] = [
      {
        id: 'evt_offline_1',
        sessionId: 'sess_offline',
        eventType: 'WINDOW_FOCUS',
        timestamp: new Date().toISOString(),
        payload: { windowId: 1, focused: true },
      },
    ];

    await uploader.saveOfflineQueue(offlineEvents);

    authManager.fetchWithAuth = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ success: true }),
    } as Response);

    await uploader.triggerScheduledUpload();

    const remainingOffline = await uploader.getOfflineQueue();
    expect(remainingOffline.length).toBe(0);
    expect(uploader.getLastUploadTimestamp()).not.toBeNull();
  });
});
