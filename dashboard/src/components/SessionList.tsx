import React from 'react';
import { Session } from '@visual-agent/shared';

interface Props {
  sessions: Session[];
  activeSessionId?: string;
  onSelectSession: (session: Session) => void;
  onNewSession: (goal: string) => void;
}

export const SessionList: React.FC<Props> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
}) => {
  const [newGoal, setNewGoal] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGoal.trim()) {
      onNewSession(newGoal.trim());
      setNewGoal('');
    }
  };

  return (
    <div className="card" style={{ flex: '0 0 350px' }}>
      <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Agent Sessions</h2>

      <form
        onSubmit={handleSubmit}
        style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}
      >
        <input
          type="text"
          placeholder="New goal prompt..."
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
          style={{
            flex: 1,
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            padding: '0.5rem 0.75rem',
            borderRadius: '0.375rem',
          }}
        />
        <button
          type="submit"
          style={{
            backgroundColor: 'var(--accent-primary)',
            color: '#fff',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Start
        </button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {sessions.map((s) => (
          <div
            key={s.id}
            onClick={() => onSelectSession(s)}
            style={{
              padding: '0.75rem',
              borderRadius: '0.375rem',
              backgroundColor: activeSessionId === s.id ? 'var(--bg-card)' : 'transparent',
              border: '1px solid var(--border)',
              cursor: 'pointer',
            }}
          >
            <div
              style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}
            >
              <span className={`badge badge-${s.status.toLowerCase()}`}>{s.status}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {s.executionMode}
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>{s.goal}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
