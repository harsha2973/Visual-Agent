// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TabCaptureManager } from '../src/telemetry/TabCaptureManager.js';

describe('TabCaptureManager Unit Tests', () => {
  let manager: TabCaptureManager;

  beforeEach(() => {
    localStorage.clear();
    manager = new TabCaptureManager({
      intervalMs: 3000,
      compressionQuality: 0.7,
      thumbnailWidth: 150,
    });
  });

  afterEach(() => {
    manager.stopCapture();
    vi.restoreAllMocks();
  });

  it('should initialize with 3s default interval and require user permission', () => {
    expect(manager.getIntervalMs()).toBe(3000);
    expect(manager.getUserPermission()).toBe(false);
    expect(manager.getIsCapturing()).toBe(false);

    // Starting capture without permission should return false
    const started = manager.startCapture();
    expect(started).toBe(false);
    expect(manager.getIsCapturing()).toBe(false);
  });

  it('should start capture when user permission is granted', () => {
    manager.setUserPermission(true);
    expect(manager.getUserPermission()).toBe(true);

    const started = manager.startCapture();
    expect(started).toBe(true);
    expect(manager.getIsCapturing()).toBe(true);
  });

  it('should filter sensitive URLs according to privacy policy', () => {
    expect(manager.isSensitiveUrl('https://mybank.com/account')).toBe(true);
    expect(manager.isSensitiveUrl('https://example.com/login')).toBe(true);
    expect(manager.isSensitiveUrl('https://store.com/checkout')).toBe(true);
    expect(manager.isSensitiveUrl('chrome://settings')).toBe(true);
    expect(manager.isSensitiveUrl('https://news.ycombinator.com/item?id=123')).toBe(false);
  });

  it('should update capture interval dynamically', () => {
    manager.setIntervalMs(5000);
    expect(manager.getIntervalMs()).toBe(5000);
  });

  it('should manage screenshot queue and allow flushing', async () => {
    const mockFrame = {
      id: 'frame_1',
      timestamp: new Date().toISOString(),
      compressedDataUrl: 'data:image/jpeg;base64,mockdata',
      thumbnailDataUrl: 'data:image/jpeg;base64,mockthumb',
    };

    await manager.enqueueFrame(mockFrame);
    const queue = await manager.getQueue();
    expect(queue.length).toBe(1);

    const flushed = await manager.flushQueue();
    expect(flushed.length).toBe(1);
    const emptyQueue = await manager.getQueue();
    expect(emptyQueue.length).toBe(0);
  });
});
