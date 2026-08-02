import React, { useState } from 'react';
import { Search, Filter, Globe, MousePointer, Keyboard, ArrowDown, Download } from 'lucide-react';

export const ActivitiesPage: React.FC = () => {
  const [filterType, setFilterType] = useState('ALL');
  const [search, setSearch] = useState('');

  const activities = [
    {
      id: 1,
      type: 'CURRENT_URL',
      title: 'URL Navigation',
      detail: 'https://github.com/harsha2973/Visual-Agent',
      timestamp: '21:20:15',
      icon: <Globe size={16} className="text-cyan-400" />,
    },
    {
      id: 2,
      type: 'CLICK',
      title: 'Mouse Click',
      detail: 'Button: "Submit PR" at (420, 180)',
      timestamp: '21:20:18',
      icon: <MousePointer size={16} className="text-indigo-400" />,
    },
    {
      id: 3,
      type: 'KEYBOARD_SHORTCUT',
      title: 'Keyboard Shortcut',
      detail: 'Ctrl+Shift+I (DevTools)',
      timestamp: '21:20:25',
      icon: <Keyboard size={16} className="text-purple-400" />,
    },
    {
      id: 4,
      type: 'SCROLL',
      title: 'Scroll Depth',
      detail: 'Scrolled to 85% of page height',
      timestamp: '21:20:30',
      icon: <ArrowDown size={16} className="text-emerald-400" />,
    },
    {
      id: 5,
      type: 'DOWNLOAD',
      title: 'File Download',
      detail: 'artifact_report.pdf (2.4 MB)',
      timestamp: '21:20:45',
      icon: <Download size={16} className="text-amber-400" />,
    },
    {
      id: 6,
      type: 'CURRENT_URL',
      title: 'URL Navigation',
      detail: 'https://developer.mozilla.org/en-US/docs/Web/API',
      timestamp: '21:21:00',
      icon: <Globe size={16} className="text-cyan-400" />,
    },
  ];

  const filtered = activities.filter((act) => {
    const matchesFilter = filterType === 'ALL' || act.type === filterType;
    const matchesSearch =
      act.detail.toLowerCase().includes(search.toLowerCase()) ||
      act.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-900 p-4 rounded-xl border border-gray-800">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activities by URL, selector, or shortcut..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Event Types</option>
            <option value="CURRENT_URL">URL Navigation</option>
            <option value="CLICK">Mouse Clicks</option>
            <option value="KEYBOARD_SHORTCUT">Keyboard Shortcuts</option>
            <option value="SCROLL">Scroll Events</option>
            <option value="DOWNLOAD">Downloads</option>
          </select>
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-3">
        {filtered.map((act) => (
          <div
            key={act.id}
            className="p-4 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center border border-gray-700">
                {act.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">{act.title}</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-indigo-400 font-mono">
                    {act.type}
                  </span>
                </div>
                <p className="text-xs text-gray-400 font-mono mt-0.5">{act.detail}</p>
              </div>
            </div>
            <span className="text-xs text-gray-500 font-mono">{act.timestamp}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
