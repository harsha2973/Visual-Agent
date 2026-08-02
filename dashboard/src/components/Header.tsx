import React from 'react';
import { Sun, Moon, RefreshCw, ShieldCheck, Users, Radio, Search } from 'lucide-react';
import { useThemeStore } from '../store/useThemeStore';

interface HeaderProps {
  title: string;
  isLiveConnected?: boolean;
  onlineUsersCount?: number;
  onRefresh?: () => void;
  onOpenSearch?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  isLiveConnected = true,
  onlineUsersCount = 1,
  onRefresh,
  onOpenSearch,
}) => {
  const { isDarkMode, toggleDarkMode } = useThemeStore();

  return (
    <header className="h-16 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-white capitalize">{title}</h2>

        {/* Realtime WebSocket Badge */}
        {isLiveConnected ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <Radio size={12} />
            <span>WebSocket Live</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <span>Reconnecting...</span>
          </div>
        )}

        {/* Online Users Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium">
          <Users size={12} />
          <span>{onlineUsersCount} Online</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Global Search Button */}
        {onOpenSearch && (
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs font-medium border border-gray-700 transition-all"
          >
            <Search size={14} className="text-indigo-400" />
            <span>Search...</span>
            <kbd className="px-1.5 py-0.5 text-[10px] bg-gray-900 border border-gray-700 rounded text-gray-400">
              Ctrl+K
            </kbd>
          </button>
        )}

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
