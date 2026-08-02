/// <reference types="chrome"/>
import { WSEventPacket } from '@visual-agent/shared';
import { EventManager } from '../telemetry/EventManager.js';

let ws: WebSocket | null = null;
let currentSessionId: string | null = null;

// Instantiate EventManager with batch flushing callback
export const eventManager = new EventManager({
  batchSize: 10,
  flushIntervalMs: 5000,
  onFlush: async (batch) => {
    console.info(`[Background SW] Flushed ${batch.length} activity events to storage/backend`);
    if (ws && ws.readyState === WebSocket.OPEN && currentSessionId) {
      ws.send(
        JSON.stringify({
          event: 'TELEMETRY_UPDATE',
          sessionId: currentSessionId,
          payload: { activityEvents: batch },
        }),
      );
    }
  },
});

// Initialize background activity listeners (Tabs, Windows, Idle, Navigation, Downloads)
eventManager.initBackgroundListeners();

// Ensure sidepanel opens when user clicks extension icon
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.sidePanel.open({ tabId: tab.id });
  }
});

// Setup WebSocket connection to backend
function setupWebSocket(sessionId: string) {
  currentSessionId = sessionId;
  eventManager.setSessionId(sessionId);
  ws = new WebSocket(`ws://localhost:3000/ws/v1?sessionId=${sessionId}`);

  ws.onopen = () => {
    console.info('[Background SW] WebSocket connected to backend');
  };

  ws.onmessage = (event) => {
    try {
      const packet: WSEventPacket = JSON.parse(event.data);
      console.info('[Background SW] Received packet:', packet);

      if (packet.event === 'ACTION_DISPATCH') {
        // Forward action to active tab content script
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.id) {
            chrome.tabs.sendMessage(tabs[0].id, {
              type: 'EXECUTE_ACTION',
              action: packet.payload,
            });
          }
        });
      }
    } catch (err) {
      console.error('[Background SW] Failed to parse message:', err);
    }
  };

  ws.onclose = () => {
    console.info('[Background SW] WebSocket closed');
  };
}

// Handle runtime messages from Sidepanel & Content Scripts
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'START_AGENT_SESSION') {
    setupWebSocket(message.sessionId);
    sendResponse({ success: true });
  } else if (message.type === 'TELEMETRY_PAYLOAD') {
    if (ws && ws.readyState === WebSocket.OPEN && currentSessionId) {
      ws.send(
        JSON.stringify({
          event: 'TELEMETRY_UPDATE',
          sessionId: currentSessionId,
          payload: message.payload,
        }),
      );
    }
    sendResponse({ success: true });
  }
  return true;
});
