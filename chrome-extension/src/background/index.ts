/// <reference types="chrome"/>
import { WSEventPacket } from '@visual-agent/shared';
import { EventManager } from '../telemetry/EventManager.js';
import { AuthManager } from '../telemetry/AuthManager.js';
import { BatchUploader } from '../telemetry/BatchUploader.js';

let ws: WebSocket | null = null;
let currentSessionId: string | null = null;

// Instantiate AuthManager & EventManager
export const authManager = new AuthManager({
  baseUrl: 'http://localhost:3000/api/v1',
});

export const eventManager = new EventManager({
  batchSize: 10,
  flushIntervalMs: 5000,
});

// Instantiate BatchUploader configured for 30-second uploads
export const batchUploader = new BatchUploader({
  uploadIntervalMs: 30000, // 30 seconds
  maxRetries: 3,
  baseDelayMs: 1000,
  authManager,
  eventManager,
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
  } else if (message.type === 'AUTH_LOGIN') {
    authManager
      .login(message.email, message.password)
      .then((tokenData) => sendResponse({ success: true, user: tokenData.user }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  } else if (message.type === 'AUTH_REGISTER') {
    authManager
      .register(message.email, message.password, message.fullName)
      .then((user) => sendResponse({ success: true, user }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  } else if (message.type === 'MANUAL_SYNC') {
    batchUploader
      .triggerScheduledUpload()
      .then(() => sendResponse({ success: true }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
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
