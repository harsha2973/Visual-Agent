# API Specification

## REST API (`http://localhost:3000/api/v1`)

### Health Check

- `GET /health`
  - Response: `{ "status": "ok", "timestamp": "ISO-Date" }`

### Sessions

- `POST /sessions`
  - Request: `{ "goal": "Find 2-bedroom apartments", "mode": "IN_BROWSER" }`
  - Response: `{ "sessionId": "uuid", "status": "INITIALIZED" }`

- `GET /sessions`
  - Response: List of active and past agent sessions.

- `GET /sessions/:id`
  - Response: Detailed step breakdown and artifacts for session `:id`.

## WebSocket Protocol (`ws://localhost:3000/ws/v1`)

### Message Packet Schema

```json
{
  "event": "TELEMETRY_STATE",
  "sessionId": "123e4567-e89b-12d3-a456-426614174000",
  "payload": {
    "screenshotBase64": "data:image/webp;base64,...",
    "axDomTree": [],
    "url": "https://example.com"
  }
}
```
