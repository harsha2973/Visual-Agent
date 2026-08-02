/// <reference types="chrome"/>
import React from 'react';
import { Bot, Play } from 'lucide-react';

export const App: React.FC = () => {
  const [goal, setGoal] = React.useState('');
  const [status, setStatus] = React.useState<'IDLE' | 'RUNNING' | 'FINISHED'>('IDLE');
  const [logs, setLogs] = React.useState<string[]>([]);

  const handleStartTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;

    setStatus('RUNNING');
    setLogs((prev) => [...prev, `[Task Started] ${goal}`]);

    const sessionId = `ext_session_${Date.now()}`;
    chrome.runtime.sendMessage({
      type: 'START_AGENT_SESSION',
      sessionId,
      goal,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="panel-header">
        <Bot size={22} color="var(--accent)" />
        <span style={{ fontWeight: 600, fontSize: '15px' }}>Visual Agent Assistant</span>
      </div>

      <div className="panel-body">
        <form
          onSubmit={handleStartTask}
          style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
        >
          <label style={{ fontSize: '12px', color: 'var(--text-sub)' }}>Goal Prompt</label>
          <input
            className="chat-input"
            type="text"
            placeholder="e.g. Find laptops under $1000 on Amazon"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            disabled={status === 'RUNNING'}
          />
          <button className="btn-primary" type="submit" disabled={status === 'RUNNING'}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <Play size={14} />
              <span>{status === 'RUNNING' ? 'Agent Active...' : 'Launch Agent'}</span>
            </div>
          </button>
        </form>

        <div style={{ marginTop: '12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-sub)', marginBottom: '6px' }}>
            Agent Action Log
          </span>
          <div
            style={{
              flex: 1,
              background: 'var(--bg-main)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '8px',
              fontFamily: 'monospace',
              fontSize: '11px',
              overflowY: 'auto',
            }}
          >
            {logs.length === 0 ? (
              <span style={{ color: 'var(--text-sub)' }}>No active tasks. Enter a goal above.</span>
            ) : (
              logs.map((log, index) => (
                <div key={index} style={{ marginBottom: '4px' }}>
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
