import React from 'react';
import {
  LayoutDashboard,
  Clock,
  Activity,
  ListOrdered,
  Image,
  Brain,
  GitMerge,
  Settings,
  LogOut,
  Eye,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export type PageId =
  | 'overview'
  | 'sessions'
  | 'activities'
  | 'timeline'
  | 'screenshots'
  | 'ai-insights'
  | 'workflow-explorer'
  | 'settings';

interface SidebarProps {
  currentPage: PageId;
  onSelectPage: (page: PageId) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onSelectPage }) => {
  const { logout, user } = useAuthStore();

  const navItems: { id: PageId; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { id: 'sessions', label: 'Sessions', icon: <Clock size={18} /> },
    { id: 'activities', label: 'Activities', icon: <Activity size={18} /> },
    { id: 'timeline', label: 'Timeline', icon: <ListOrdered size={18} /> },
    { id: 'screenshots', label: 'Screenshots', icon: <Image size={18} /> },
    { id: 'ai-insights', label: 'AI Insights', icon: <Brain size={18} /> },
    { id: 'workflow-explorer', label: 'Workflow Explorer', icon: <GitMerge size={18} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col justify-between p-4 min-h-screen select-none">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-gray-800">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-white leading-none">
              Visual Agent
            </h1>
            <p className="text-xs text-indigo-400 font-medium">Control Dashboard</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectPage(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 font-semibold shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                }`}
              >
                <span className={active ? 'text-indigo-400' : 'text-gray-400'}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User / Logout */}
      <div className="pt-4 border-t border-gray-800">
        <div className="flex items-center justify-between px-2 py-2 mb-2 bg-gray-800/40 rounded-lg">
          <div className="truncate">
            <p className="text-xs font-semibold text-gray-200 truncate">
              {user?.email || 'Demo User'}
            </p>
            <p className="text-[10px] text-gray-400">Connected</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-all"
        >
          <LogOut size={16} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};
