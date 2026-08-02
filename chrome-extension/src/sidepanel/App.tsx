/// <reference types="chrome"/>
import React from 'react';
import { Bot, Play, RefreshCw, LogOut, Camera, ShieldCheck, ShieldAlert } from 'lucide-react';

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

  // Tab Capture state
  const [hasCapturePermission, setHasCapturePermission] = React.useState(false);
  const [isCapturing, setIsCapturing] = React.useState(false);
  const [captureInterval, setCaptureInterval] = React.useState(3); // 3 seconds default
  const [latestThumbnail, setLatestThumbnail] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Poll tab capture status
    const interval = setInterval(() => {
      if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
        chrome.runtime.sendMessage({ type: 'GET_LATEST_CAPTURED_FRAME' }, (res) => {
          if (res) {
            setHasCapturePermission(res.hasPermission || false);
            setIsCapturing(res.isCapturing || false);
            setCaptureInterval(res.intervalMs ? Math.round(res.intervalMs / 1000) : 3);
            if (res.latestFrame?.thumbnailDataUrl) {
              setLatestThumbnail(res.latestFrame.thumbnailDataUrl);
            }
          }
        });
      }
    }, 1500);

    return () => clearInterval(interval);
  }, []);

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

  const handleTogglePermission = (e: React.ChangeEvent<HTMLInputElement>) => {
    const granted = e.target.checked;
    setHasCapturePermission(granted);

    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({
        type: 'SET_TAB_CAPTURE_PERMISSION',
        granted,
        startCapturing: granted,
      });
    }
  };

  const handleToggleCapture = () => {
    const nextState = !isCapturing;
    setIsCapturing(nextState);

    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({
        type: 'TOGGLE_TAB_CAPTURE',
        enable: nextState,
      });
    }
  };

  const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setCaptureInterval(val);

    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({
        type: 'SET_CAPTURE_INTERVAL',
        intervalMs: val * 1000,
      });
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
              <input
                className="chat-input"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                className="chat-input"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
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

            {/* Tab Capture Control Card */}
            <div
              style={{
                background: 'var(--bg-card)',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginTop: '8px',
              }}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Camera size={16} color="var(--accent)" />
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>Active Tab Capture</span>
                </div>
                {hasCapturePermission ? (
                  <span title="Permission granted">
                    <ShieldCheck size={16} color="#10b981" />
                  </span>
                ) : (
                  <span title="Permission required">
                    <ShieldAlert size={16} color="#ef4444" />
                  </span>
                )}
              </div>

              <label
                style={{
                  fontSize: '11px',
                  color: 'var(--text-sub)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <input
                  type="checkbox"
                  checked={hasCapturePermission}
                  onChange={handleTogglePermission}
                />
                <span>Grant permission to capture active tab</span>
              </label>

              {hasCapturePermission && (
                <>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '11px',
                    }}
                  >
                    <span>
                      Capture Interval: <strong>{captureInterval}s</strong>
                    </span>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={captureInterval}
                      onChange={handleIntervalChange}
                      style={{ width: '100px' }}
                    />
                  </div>

                  <button
                    className="btn-primary"
                    onClick={handleToggleCapture}
                    style={{
                      background: isCapturing ? '#ef4444' : 'var(--accent)',
                      fontSize: '11px',
                      padding: '6px',
                    }}
                  >
                    {isCapturing ? 'Stop Recording' : 'Start Tab Capture (Every 3s)'}
                  </button>
                </>
              )}

              {latestThumbnail && (
                <div style={{ marginTop: '4px', textAlign: 'center' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      color: 'var(--text-sub)',
                      display: 'block',
                      marginBottom: '2px',
                    }}
                  >
                    Latest Captured Frame
                  </span>
                  <img
                    src={latestThumbnail}
                    alt="Active Tab Thumbnail"
                    style={{
                      width: '100%',
                      maxHeight: '100px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                      border: '1px solid var(--border)',
                    }}
                  />
                </div>
              )}
            </div>

            <form
              onSubmit={handleStartTask}
              style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}
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
            Agent & Activity Log
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
