# Visual AI Browser Agent Architecture Specification

## Overview

The Visual AI Browser Agent is an enterprise-grade web automation ecosystem consisting of:

1. **Chrome Extension (`chrome-extension/`)**: Manifest V3 extension providing in-browser execution, accessibility DOM parsing, visual tab screenshot capture, and PII masking.
2. **Backend Gateway (`backend/`)**: Fastify-powered WebSocket and REST gateway for session management, real-time agent telemetry, and queue routing.
3. **Control Dashboard (`dashboard/`)**: React dashboard for observing live browser session telemetry, action step inspection, and task history.
4. **AI Worker Service (`ai-worker/`)**: Python FastAPI service running multimodal ReAct planning algorithms, dual-input grounding (vision + AX-DOM tree), and Playwright cloud execution.
5. **Shared Package (`shared/`)**: Common TypeScript types, event protocol definitions, and PII redactor utilities.

## Data Flow

```
User Goal -> Chrome Extension Sidepanel -> API Gateway -> AI Worker (ReAct Loop)
                   ^                                            |
                   |--- Realtime Execution / Feedback Stream ---|
```

## Security & Privacy

- **PII Blackout**: Input fields flagged as password/sensitive are redacted directly on an offscreen HTML canvas before transmitting visual tab screenshots to LLM endpoints.
- **Human-in-the-Loop Confirmation**: Sensitive financial or submission actions require manual confirmation via the extension sidepanel.
