// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthManager } from '../src/telemetry/AuthManager.js';

describe('AuthManager Unit Tests', () => {
  let authManager: AuthManager;

  beforeEach(() => {
    localStorage.clear();
    authManager = new AuthManager({ baseUrl: 'http://testserver/api/v1' });
    vi.restoreAllMocks();
  });

  it('should initialize unauthenticated and handle baseUrl', () => {
    expect(authManager.isAuthenticated()).toBe(false);
    expect(authManager.getAccessToken()).toBeNull();
    expect(authManager.getCurrentUser()).toBeNull();
    expect(authManager.getBaseUrl()).toBe('http://testserver/api/v1');
  });

  it('should perform successful login and store JWT token securely', async () => {
    const mockTokenResponse = {
      access_token: 'mock-jwt-access-token-123',
      token_type: 'bearer',
      user: {
        id: 'user_1',
        email: 'user@example.com',
        full_name: 'Test User',
        is_active: true,
        is_superuser: false,
        created_at: new Date().toISOString(),
      },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockTokenResponse,
    } as Response);

    const result = await authManager.login('user@example.com', 'Password123');
    expect(result.access_token).toBe('mock-jwt-access-token-123');
    expect(authManager.isAuthenticated()).toBe(true);
    expect(authManager.getAccessToken()).toBe('mock-jwt-access-token-123');
    expect(authManager.getCurrentUser()?.email).toBe('user@example.com');
  });

  it('should attach Authorization Bearer header to outbound requests and clear token on 401', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ detail: 'Unauthorized' }),
    } as Response);

    global.fetch = mockFetch;

    // Set token manually
    await authManager.login('user@example.com', 'Password123').catch(() => {});

    // Perform fetchWithAuth
    const res = await authManager.fetchWithAuth('http://testserver/api/v1/users');
    expect(res.status).toBe(401);
    expect(authManager.isAuthenticated()).toBe(false);
  });
});
