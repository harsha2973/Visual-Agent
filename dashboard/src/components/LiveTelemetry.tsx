import React from 'react';
import { Eye } from 'lucide-react';

interface Props {
  sessionId?: string;
  telemetryLog: Array<{ timestamp: string; text: string }>;
}

export const LiveTelemetry: React.FC<Props> = ({ sessionId, telemetryLog }) => {
  return (
    <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Eye size={20} color="var(--accent-primary)" />
          <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Live Telemetry Monitor</h2>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          Session: {sessionId || 'None Selected'}
        </span>
      </div>

      <div
        style={{
          flex: 1,
          backgroundColor: 'var(--bg-primary)',
          borderRadius: '0.375rem',
          padding: '1rem',
          fontFamily: 'monospace',
          fontSize: '0.875rem',
          overflowY: 'auto',
          minHeight: '300px',
          border: '1px solid var(--border)',
        }}
      >
        {telemetryLog.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '2rem' }}>
            No live telemetry stream active. Select or launch a session.
          </div>
        ) : (
          telemetryLog.map((item, idx) => (
            <div key={idx} style={{ marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>[{item.timestamp}] </span>
              <span>{item.text}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
