/// <reference types="chrome"/>
import React from 'react';
import { Bot, Play, RefreshCw, LogOut } from 'lucide-react';

export const App: React.FC = () => {
  const [goal, setGoal] = React.useState('');
  const [status, setStatus] = React.useState<'IDLE' | 'RUNNING' | 'FINISHED'>('IDLE');
  const [logs, setLogs] = React.useState<string[]>([]);

  // Auth state
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [userEmail, setUserEmail] = React.useState('');
  const [authMode, setAuthMode] = React.useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [fullName, setFullName] = React.useState('');
  const [authError, setAuthError] = React.useState('');
  const [isSyncing, setIsSyncing] = React.useState(false);

  const handleStartTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;

    setStatus('RUNNING');
    setLogs((prev) => [...prev, `[Task Started] ${goal}`]);

    const sessionId = `ext_session_${Date.now()}`;
    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({
        type: 'START_AGENT_SESSION',
        sessionId,
        goal,
      });
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const msgType = authMode === 'LOGIN' ? 'AUTH_LOGIN' : 'AUTH_REGISTER';

    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage(
        {
          type: msgType,
          email,
          password,
          fullName,
        },
        (res) => {
          if (res?.success) {
            setIsLoggedIn(true);
            setUserEmail(email);
            setLogs((prev) => [...prev, `[Auth Success] Logged in as ${email}`]);
          } else {
            setAuthError(res?.error || 'Authentication failed');
          }
        },
      );
    } else {
      setIsLoggedIn(true);
      setUserEmail(email);
    }
  };

  const handleManualSync = () => {
    setIsSyncing(true);
    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({ type: 'MANUAL_SYNC' }, (res) => {
        setIsSyncing(false);
        if (res?.success) {
          setLogs((prev) => [...prev, `[Batch Sync] 30s Event batch synced to backend.`]);
        } else {
          setLogs((prev) => [...prev, `[Sync Error] ${res?.error || 'Offline queue saved.'}`]);
        }
      });
    } else {
      setTimeout(() => setIsSyncing(false), 500);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="panel-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bot size={22} color="var(--accent)" />
          <span style={{ fontWeight: 600, fontSize: '15px' }}>Visual Agent Assistant</span>
        </div>
        {isLoggedIn && (
          <button
            onClick={() => setIsLoggedIn(false)}
            title="Logout"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-sub)',
              cursor: 'pointer',
            }}
          >
            <LogOut size={16} />
          </button>
        )}
      </div>

      <div className="panel-body">
        {!isLoggedIn ? (
          <div
            style={{
              background: 'var(--bg-card)',
              padding: '14px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: '12px',
                marginBottom: '12px',
                borderBottom: '1px solid var(--border)',
                paddingBottom: '8px',
              }}
            >
              <button
                onClick={() => setAuthMode('LOGIN')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: authMode === 'LOGIN' ? 'var(--accent)' : 'var(--text-sub)',
                  fontWeight: authMode === 'LOGIN' ? 700 : 400,
                  cursor: 'pointer',
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => setAuthMode('REGISTER')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: authMode === 'REGISTER' ? 'var(--accent)' : 'var(--text-sub)',
                  fontWeight: authMode === 'REGISTER' ? 700 : 400,
                  cursor: 'pointer',
                }}
              >
                Register
              </button>
            </div>

            {authError && (
              <div style={{ color: '#ef4444', fontSize: '12px', marginBottom: '8px' }}>
                {authError}
              </div>
            )}

            <form
              onSubmit={handleAuthSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
            >
              {authMode === 'REGISTER' && (
                <input
                  className="chat-input"
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              )}
              <div style={{ position: 'relative' }}>
                <input
                  className="chat-input"
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  className="chat-input"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button className="btn-primary" type="submit">
                {authMode === 'LOGIN' ? 'Authenticate' : 'Create Account'}
              </button>
            </form>
          </div>
        ) : (
          <>
            <div
              style={{
                fontSize: '12px',
                color: 'var(--accent)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>
                Authenticated: <strong>{userEmail}</strong>
              </span>
              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-main)',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <RefreshCw size={12} className={isSyncing ? 'spin' : ''} />
                <span>Sync Now</span>
              </button>
            </div>

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
          </>
        )}

        <div style={{ marginTop: '12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-sub)', marginBottom: '6px' }}>
            Agent & Activity Log (30s Sync Queue)
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
              <span style={{ color: 'var(--text-sub)' }}>
                No active tasks. Sign in and enter a goal prompt.
              </span>
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
