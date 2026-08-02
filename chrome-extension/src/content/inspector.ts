/// <reference types="chrome"/>
import { AXElementNode, isElementSensitive } from '@visual-agent/shared';
import { EventManager } from '../telemetry/EventManager.js';

let elementCounter = 0;

// Initialize Content Script DOM EventManager for user interaction tracking
export const contentEventManager = new EventManager({
  batchSize: 5,
  flushIntervalMs: 3000,
  onFlush: async (batch) => {
    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({
        type: 'TELEMETRY_PAYLOAD',
        payload: { activityEvents: batch },
      });
    }
  },
});

contentEventManager.initContentScriptListeners(window);

function parseAXDomTree(): AXElementNode[] {
  const nodes: AXElementNode[] = [];
  const interactiveElements = document.querySelectorAll(
    'button, a, input, select, textarea, [role="button"], [role="link"], [role="textbox"]',
  );

  interactiveElements.forEach((el) => {
    let agentId = el.getAttribute('data-agent-id');
    if (!agentId) {
      agentId = `${++elementCounter}`;
      el.setAttribute('data-agent-id', agentId);
    }

    const rect = el.getBoundingClientRect();
    const inputType = (el as HTMLInputElement).type;
    const nameAttr = (el as HTMLInputElement).name;
    const idAttr = el.id;

    nodes.push({
      agentId,
      tagName: el.tagName.toLowerCase(),
      role: el.getAttribute('role') || undefined,
      name: el.textContent?.trim().slice(0, 50) || nameAttr || idAttr,
      value: (el as HTMLInputElement).value || undefined,
      boundingBox: {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      },
      isSensitive: isElementSensitive(inputType, nameAttr, idAttr),
    });
  });

  return nodes;
}

// Listen for action execution requests from Background SW
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'EXECUTE_ACTION') {
    const action = message.action?.action || message.action;
    console.info('[Content Script] Executing action:', action);

    if (action.type === 'CLICK' && action.targetId) {
      const target = document.querySelector(`[data-agent-id="${action.targetId}"]`) as HTMLElement;
      if (target) {
        target.click();
      }
    } else if (action.type === 'TYPE_TEXT' && action.targetId) {
      const target = document.querySelector(
        `[data-agent-id="${action.targetId}"]`,
      ) as HTMLInputElement;
      if (target) {
        target.value = action.text || '';
        target.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }

    sendResponse({ success: true });
  }
  return true;
});

// Periodic telemetry collection
setInterval(() => {
  const axTree = parseAXDomTree();
  chrome.runtime.sendMessage({
    type: 'TELEMETRY_PAYLOAD',
    payload: {
      url: window.location.href,
      axDomTree: axTree,
      timestamp: new Date().toISOString(),
    },
  });
}, 3000);
