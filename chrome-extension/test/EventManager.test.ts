// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EventManager, StorageDriver } from '../src/telemetry/EventManager.js';

class MockStorageDriver implements StorageDriver {
  private store: Map<string, unknown> = new Map();

  async get(key: string): Promise<unknown> {
    return this.store.get(key) || null;
  }

  async set(key: string, value: unknown): Promise<void> {
    this.store.set(key, value);
  }

  async remove(key: string): Promise<void> {
    this.store.delete(key);
  }
}

describe('EventManager Unit Tests', () => {
  let eventManager: EventManager;
  let mockStorage: MockStorageDriver;

  beforeEach(() => {
    mockStorage = new MockStorageDriver();
    eventManager = new EventManager({
      batchSize: 3,
      flushIntervalMs: 0, // Disable auto timer flush in test for deterministic control
      sessionId: 'test_session_123',
      storageDriver: mockStorage,
    });
  });

  afterEach(() => {
    eventManager.destroy();
  });

  it('should generate structured JSON events with correct schema', () => {
    const event = eventManager.createEvent(
      'CURRENT_URL',
      { url: 'https://example.com', title: 'Example Title' },
      { tabId: 10, windowId: 1, url: 'https://example.com' },
    );

    expect(event).toBeDefined();
    expect(event.id).toMatch(/^evt_\d+_\d+$/);
    expect(event.sessionId).toBe('test_session_123');
    expect(event.eventType).toBe('CURRENT_URL');
    expect(event.timestamp).toBeDefined();
    expect(event.tabId).toBe(10);
    expect(event.windowId).toBe(1);
    expect(event.url).toBe('https://example.com');
    expect(event.payload).toEqual({ url: 'https://example.com', title: 'Example Title' });
  });

  it('should queue events and automatically flush when batchSize threshold is reached', async () => {
    const flushCallback = vi.fn();
    const batchManager = new EventManager({
      batchSize: 3,
      flushIntervalMs: 0,
      sessionId: 'batch_test_session',
      storageDriver: mockStorage,
      onFlush: flushCallback,
    });

    await batchManager.trackEvent('TAB_CHANGE', { tabId: 1 });
    await batchManager.trackEvent('WINDOW_FOCUS', { windowId: 1, focused: true });
    expect(batchManager.getQueue().length).toBe(2);
    expect(flushCallback).not.toHaveBeenCalled();

    // 3rd event triggers batch flush
    await batchManager.trackEvent('IDLE_STATE', { state: 'active', thresholdSeconds: 60 });
    expect(batchManager.getQueue().length).toBe(0);
    expect(flushCallback).toHaveBeenCalledOnce();

    const flushedBatch = flushCallback.mock.calls[0][0];
    expect(flushedBatch.length).toBe(3);
    expect(flushedBatch[0].eventType).toBe('TAB_CHANGE');
    expect(flushedBatch[1].eventType).toBe('WINDOW_FOCUS');
    expect(flushedBatch[2].eventType).toBe('IDLE_STATE');

    batchManager.destroy();
  });

  it('should persist flushed batches into local storage driver', async () => {
    await eventManager.trackEvent('DOWNLOAD', {
      downloadId: 99,
      url: 'https://example.com/file.zip',
      filename: 'file.zip',
      fileSize: 1024,
    });
    await eventManager.flush();

    const storedEvents = await eventManager.getStoredEvents();
    expect(storedEvents.length).toBe(1);
    expect(storedEvents[0].eventType).toBe('DOWNLOAD');
    expect(storedEvents[0].payload).toEqual({
      downloadId: 99,
      url: 'https://example.com/file.zip',
      filename: 'file.zip',
      fileSize: 1024,
    });

    await eventManager.clearStoredEvents();
    const clearedEvents = await eventManager.getStoredEvents();
    expect(clearedEvents.length).toBe(0);
  });

  it('should track content script DOM Mouse Clicks correctly', async () => {
    const mockDocument = document.createElement('div');
    const mockWindow = {
      location: { href: 'https://example.com/dashboard', hostname: 'example.com' },
      document: {
        addEventListener: (type: string, listener: EventListener) => {
          if (type === 'click') {
            mockDocument.addEventListener('click', listener);
          }
        },
        documentElement: { scrollTop: 0, scrollHeight: 1000, clientHeight: 500 },
        body: { scrollTop: 0, scrollHeight: 1000 },
      },
      addEventListener: vi.fn(),
    } as unknown as Window;

    eventManager.initContentScriptListeners(mockWindow);

    // Simulate click event
    const clickEvent = new MouseEvent('click', { clientX: 150, clientY: 250, button: 0 });
    Object.defineProperty(clickEvent, 'target', {
      value: { tagName: 'BUTTON', id: 'submit-btn', textContent: 'Submit Form' },
    });
    mockDocument.dispatchEvent(clickEvent);

    const queue = eventManager.getQueue();
    expect(queue.length).toBe(1);
    expect(queue[0].eventType).toBe('MOUSE_CLICK');
    expect(queue[0].payload).toEqual({
      x: 150,
      y: 250,
      button: 0,
      tagName: 'button',
      targetId: 'submit-btn',
      targetText: 'Submit Form',
    });
  });

  it('should track content script Keyboard Shortcuts correctly', async () => {
    let keydownListener: (e: KeyboardEvent) => void = () => {};
    const mockWindow = {
      location: { href: 'https://example.com', hostname: 'example.com' },
      document: {
        addEventListener: (type: string, listener: EventListener) => {
          if (type === 'keydown') {
            keydownListener = listener as (e: KeyboardEvent) => void;
          }
        },
        documentElement: { scrollTop: 0, scrollHeight: 1000, clientHeight: 500 },
        body: { scrollTop: 0, scrollHeight: 1000 },
      },
      addEventListener: vi.fn(),
    } as unknown as Window;

    eventManager.initContentScriptListeners(mockWindow);

    // Simulate Ctrl+S keydown event
    const kbEvent = new KeyboardEvent('keydown', {
      key: 's',
      code: 'KeyS',
      ctrlKey: true,
    });
    keydownListener(kbEvent);

    const queue = eventManager.getQueue();
    expect(queue.length).toBe(1);
    expect(queue[0].eventType).toBe('KEYBOARD_SHORTCUT');
    expect(queue[0].payload).toEqual({
      key: 's',
      code: 'KeyS',
      ctrlKey: true,
      shiftKey: false,
      altKey: false,
      metaKey: false,
      shortcutString: 'Ctrl+s',
    });
  });
});
