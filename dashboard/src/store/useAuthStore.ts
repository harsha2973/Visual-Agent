import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  full_name?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('visual_agent_token'),
  user: JSON.parse(localStorage.getItem('visual_agent_user') || 'null'),
  isAuthenticated: Boolean(localStorage.getItem('visual_agent_token')),
  setAuth: (token, user) => {
    localStorage.setItem('visual_agent_token', token);
    localStorage.setItem('visual_agent_user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('visual_agent_token');
    localStorage.removeItem('visual_agent_user');
    set({ token: null, user: null, isAuthenticated: false });
  },
}));
