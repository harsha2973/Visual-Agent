import React from 'react';
import { Header } from './components/Header.js';
import { SessionList } from './components/SessionList.js';
import { LiveTelemetry } from './components/LiveTelemetry.js';
import { Session } from '@visual-agent/shared';

export const App: React.FC = () => {
  const [sessions, setSessions] = React.useState<Session[]>([
    {
      id: 'session_demo_1',
      goal: 'Find 3-bedroom apartment under $3000 in Miami',
      status: 'RUNNING',
      executionMode: 'IN_BROWSER',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);
  const [activeSession, setActiveSession] = React.useState<Session | undefined>(sessions[0]);
  const [telemetry] = React.useState<Array<{ timestamp: string; text: string }>>([
    { timestamp: new Date().toLocaleTimeString(), text: 'Session session_demo_1 initialized.' },
    { timestamp: new Date().toLocaleTimeString(), text: 'Content script DOM inspector active.' },
    { timestamp: new Date().toLocaleTimeString(), text: 'Offscreen canvas PII redactor ready.' },
  ]);

  const handleNewSession = async (goal: string) => {
    try {
      const res = await fetch('http://localhost:3000/api/v1/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, executionMode: 'IN_BROWSER' }),
      });
      if (res.ok) {
        const json = await res.json();
        setSessions((prev) => [json.data, ...prev]);
        setActiveSession(json.data);
      }
    } catch {
      // Fallback local creation
      const localSession: Session = {
        id: `session_${Date.now()}`,
        goal,
        status: 'INITIALIZED',
        executionMode: 'IN_BROWSER',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setSessions((prev) => [localSession, ...prev]);
      setActiveSession(localSession);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <div className="dashboard-container">
        <SessionList
          sessions={sessions}
          activeSessionId={activeSession?.id}
          onSelectSession={setActiveSession}
          onNewSession={handleNewSession}
        />
        <LiveTelemetry sessionId={activeSession?.id} telemetryLog={telemetry} />
      </div>
    </div>
  );
};

export default App;
