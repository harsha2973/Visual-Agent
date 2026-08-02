import React from 'react';
import { Sun, Moon, RefreshCw, ShieldCheck } from 'lucide-react';
import { useThemeStore } from '../store/useThemeStore';

interface HeaderProps {
  title: string;
  onRefresh?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onRefresh }) => {
  const { isDarkMode, toggleDarkMode } = useThemeStore();

  return (
    <header className="h-16 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-white capitalize">{title}</h2>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Live Sync</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-all border border-gray-700"
            title="Refresh Data"
          >
            <RefreshCw size={18} />
          </button>
        )}
        <button
          onClick={toggleDarkMode}
          className="p-2 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-all border border-gray-700"
          title="Toggle Theme"
        >
          {isDarkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
        </button>

        <div className="flex items-center gap-2 pl-3 border-l border-gray-800 text-xs text-gray-400 font-mono">
          <ShieldCheck size={14} className="text-indigo-400" />
          <span>v1.0.0</span>
        </div>
      </div>
    </header>
  );
};
