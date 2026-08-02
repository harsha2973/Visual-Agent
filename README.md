# Visual AI Browser Agent Ecosystem

[![Visual Agent CI](https://github.com/harsha2973/Visual-Agent/actions/workflows/ci.yml/badge.svg)](https://github.com/harsha2973/Visual-Agent/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node: >=20](https://img.shields.io/badge/node-%3E%3D20-blue.svg)](https://nodejs.org/)
[![Python: >=3.10](https://img.shields.io/badge/python-%3E%3D3.10-blue.svg)](https://python.org/)

A production-ready **Visual AI Browser Agent System** featuring a Manifest V3 Chrome Extension, dual-input Multimodal AI planner (Vision + Accessibility DOM tree), Fastify API Gateway, React Analytics Dashboard, and Python AI Worker service.

---

## 📁 Repository Structure

```
.
├── chrome-extension/   # Manifest V3 Chrome Extension (Sidepanel, Offscreen PII Canvas, Content Script)
├── backend/            # Fastify REST & WebSocket API Gateway
├── dashboard/          # React + Vite Control & Analytics Dashboard
├── ai-worker/          # Python FastAPI Multimodal ReAct Planner & Playwright Execution Engine
├── shared/             # Common TypeScript interfaces, event schemas, & PII utilities
├── docker/             # Microservice Dockerfiles
├── docs/               # Architecture diagrams and API specifications
├── docker-compose.yml  # Multi-service local orchestrator
├── pnpm-workspace.yaml # Monorepo workspace configuration
└── README.md
```

---

## ⚡ Quickstart: Run Everything with Docker

You can launch the entire stack (API Gateway, Control Dashboard, AI Worker, and Redis) with a single command:

```bash
docker compose up --build
```

### Accessing Services:

- **Control Dashboard**: `http://localhost:5173`
- **Backend API Gateway**: `http://localhost:3000` (`http://localhost:3000/health`)
- **AI Worker API**: `http://localhost:8000` (`http://localhost:8000/health`)
- **Redis Queue**: `localhost:6379`

---

## 🛠 Local Development Setup

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0 (`npm install -g pnpm`)
- Python >= 3.10

### 1. Install & Build Node Workspace

```bash
pnpm install
pnpm build
```

### 2. Setup Python Virtual Environment for AI Worker

```bash
cd ai-worker

# On Linux/macOS
bash setup_venv.sh

# On Windows
setup_venv.bat
```

### 3. Load Chrome Extension in Browser

1. Open Google Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode** in the top right toggle.
3. Click **Load unpacked**.
4. Select the `chrome-extension/dist` folder.

---

## 🧪 Testing & Quality Standards

Run linters, formatters, and type-checks across the entire monorepo:

```bash
# Run ESLint across all TypeScript packages
pnpm lint

# Format code with Prettier
pnpm format

# Run tests
pnpm test
```

---

## 🔒 Security & PII Privacy Safeguards

- **Canvas-Level Redaction**: PII inputs (`password`, `credit-card`, `ssn`) are detected client-side and blacked out on an offscreen HTML canvas before any visual data is sent to AI endpoints.
- **Human-in-the-Loop Approval**: Financial or sensitive form actions trigger mandatory user confirmation via the sidepanel interface.

---

## 📜 License

MIT License.
