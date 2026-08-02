import React from 'react';
import { Bot, Activity } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        padding: '1rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Bot size={28} color="var(--accent-primary)" />
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Visual AI Agent Control Center</h1>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem',
          color: 'var(--success)',
        }}
      >
        <Activity size={16} />
        <span>System Operational</span>
      </div>
    </header>
  );
};
