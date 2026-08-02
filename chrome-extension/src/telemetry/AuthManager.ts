/// <reference types="chrome"/>
import { UserResponse, TokenResponse } from '@visual-agent/shared';

export interface AuthManagerOptions {
  baseUrl?: string;
}

export class AuthManager {
  private baseUrl: string;
  private accessToken: string | null = null;
  private currentUser: UserResponse | null = null;
  private tokenStorageKey = 'visual_agent_auth_tokens';

  constructor(options: AuthManagerOptions = {}) {
    this.baseUrl = options.baseUrl || 'http://localhost:3000/api/v1';
    void this.loadStoredToken();
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  public getAccessToken(): string | null {
    return this.accessToken;
  }

  public getCurrentUser(): UserResponse | null {
    return this.currentUser;
  }

  public isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  public async loadStoredToken(): Promise<boolean> {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage?.session) {
        const result = await chrome.storage.session.get(this.tokenStorageKey);
        if (result[this.tokenStorageKey]) {
          const data: TokenResponse = result[this.tokenStorageKey];
          this.accessToken = data.access_token;
          this.currentUser = data.user;
          return true;
        }
      } else if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(this.tokenStorageKey);
        if (stored) {
          const data: TokenResponse = JSON.parse(stored);
          this.accessToken = data.access_token;
          this.currentUser = data.user;
          return true;
        }
      }
    } catch (err) {
      console.warn('[AuthManager] Failed to load stored token:', err);
    }
    return false;
  }

  private async saveToken(tokenData: TokenResponse): Promise<void> {
    this.accessToken = tokenData.access_token;
    this.currentUser = tokenData.user;

    try {
      if (typeof chrome !== 'undefined' && chrome.storage?.session) {
        await chrome.storage.session.set({ [this.tokenStorageKey]: tokenData });
      } else if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.tokenStorageKey, JSON.stringify(tokenData));
      }
    } catch (err) {
      console.error('[AuthManager] Failed to save token to secure storage:', err);
    }
  }

  public async clearToken(): Promise<void> {
    this.accessToken = null;
    this.currentUser = null;

    try {
      if (typeof chrome !== 'undefined' && chrome.storage?.session) {
        await chrome.storage.session.remove(this.tokenStorageKey);
      } else if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(this.tokenStorageKey);
      }
    } catch (err) {
      console.error('[AuthManager] Failed to clear token from storage:', err);
    }
  }

  public async register(email: string, password: string, fullName?: string): Promise<UserResponse> {
    const response = await fetch(`${this.baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name: fullName }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Registration failed with status ${response.status}`);
    }

    const user: UserResponse = await response.json();
    return user;
  }

  public async login(email: string, password: string): Promise<TokenResponse> {
    const response = await fetch(`${this.baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Login failed with status ${response.status}`);
    }

    const tokenData: TokenResponse = await response.json();
    await this.saveToken(tokenData);
    return tokenData;
  }

  public async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const headers = new Headers(options.headers || {});
    if (this.accessToken) {
      headers.set('Authorization', `Bearer ${this.accessToken}`);
    }

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
      console.warn('[AuthManager] Received 401 Unauthorized. Clearing token.');
      await this.clearToken();
    }

    return response;
  }
}
