import { create } from 'zustand';

interface ThemeState {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDarkMode: localStorage.getItem('visual_agent_theme') !== 'light',
  toggleDarkMode: () =>
    set((state) => {
      const nextMode = !state.isDarkMode;
      localStorage.setItem('visual_agent_theme', nextMode ? 'dark' : 'light');
      return { isDarkMode: nextMode };
    }),
}));
