// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ScreenshotUploader } from '../src/telemetry/ScreenshotUploader.js';
import { AuthManager } from '../src/telemetry/AuthManager.js';
import { CapturedFrame } from '../src/telemetry/TabCaptureManager.js';

describe('ScreenshotUploader Unit Tests', () => {
  let uploader: ScreenshotUploader;
  let authManager: AuthManager;

  beforeEach(() => {
    localStorage.clear();
    authManager = new AuthManager({ baseUrl: 'http://testserver/api/v1' });
    uploader = new ScreenshotUploader({
      baseUrl: 'http://testserver/api/v1',
      maxRetries: 2,
      baseDelayMs: 10,
      authManager,
    });
  });

  it('should convert base64 Data URL to Blob cleanly', () => {
    const dataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD';
    const blob = uploader.dataUrlToBlob(dataUrl);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('image/jpeg');
  });

  it('should enqueue frame to failed queue on network failure', async () => {
    const mockFrame: CapturedFrame = {
      id: 'frame_upload_1',
      timestamp: new Date().toISOString(),
      compressedDataUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD',
      thumbnailDataUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD',
      url: 'https://example.com',
      tabId: 5,
    };

    authManager.fetchWithAuth = vi.fn().mockRejectedValue(new Error('Network error'));

    const success = await uploader.uploadFrame(mockFrame, 'sess_test');
    expect(success).toBe(false);

    const queue = await uploader.getFailedQueue();
    expect(queue.length).toBe(1);
    expect(queue[0].id).toBe('frame_upload_1');
  });

  it('should successfully upload frame when server responds 201 Created', async () => {
    const mockFrame: CapturedFrame = {
      id: 'frame_upload_2',
      timestamp: new Date().toISOString(),
      compressedDataUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD',
      thumbnailDataUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD',
    };

    authManager.fetchWithAuth = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ id: 'shot_123', url: 'http://testserver/s3/shot.jpg' }),
    } as Response);

    const success = await uploader.uploadFrame(mockFrame, 'sess_test');
    expect(success).toBe(true);
  });
});
