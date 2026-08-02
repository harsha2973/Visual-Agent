import { Session, SessionStatus, ExecutionMode } from '@visual-agent/shared';

class SessionManager {
  private sessions: Map<string, Session> = new Map();

  public createSession(goal: string, mode: ExecutionMode = 'IN_BROWSER'): Session {
    const id = `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const session: Session = {
      id,
      goal,
      status: 'INITIALIZED',
      executionMode: mode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.sessions.set(id, session);
    return session;
  }

  public getSession(id: string): Session | undefined {
    return this.sessions.get(id);
  }

  public getAllSessions(): Session[] {
    return Array.from(this.sessions.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  public updateStatus(id: string, status: SessionStatus): Session | undefined {
    const session = this.sessions.get(id);
    if (session) {
      session.status = status;
      session.updatedAt = new Date().toISOString();
      this.sessions.set(id, session);
    }
    return session;
  }
}

export const sessionManager = new SessionManager();
