const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
const AI_WORKER_URL = import.meta.env.VITE_AI_WORKER_URL || 'http://localhost:8001';

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('visual_agent_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BACKEND_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`API Error (${response.status}): ${errText}`);
  }

  return response.json();
}

export async function fetchAIWorker(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${AI_WORKER_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!response.ok) {
    throw new Error(`AI Worker Error (${response.status})`);
  }
  return response.json();
}
