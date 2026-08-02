import React from 'react';
import {
  Activity,
  Clock,
  Brain,
  ArrowUpRight,
  TrendingUp,
  Target,
  Zap,
  AppWindow,
  Globe,
  BarChart3,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const productivityData = [
  { day: 'Mon', score: 85, focus: 82 },
  { day: 'Tue', score: 90, focus: 88 },
  { day: 'Wed', score: 88, focus: 85 },
  { day: 'Thu', score: 94, focus: 92 },
  { day: 'Fri', score: 92, focus: 89 },
  { day: 'Sat', score: 89, focus: 86 },
  { day: 'Sun', score: 95, focus: 93 },
];

const hourlyData = [
  { hour: '09:00', score: 85 },
  { hour: '10:00', score: 95 },
  { hour: '11:00', score: 92 },
  { hour: '12:00', score: 70 },
  { hour: '14:00', score: 88 },
  { hour: '15:00', score: 94 },
  { hour: '16:00', score: 89 },
];

const topApps = [
  { name: 'VS Code', pct: 45, color: 'bg-indigo-500' },
  { name: 'GitHub', pct: 25, color: 'bg-cyan-500' },
  { name: 'MDN Web Docs', pct: 15, color: 'bg-purple-500' },
  { name: 'Notion', pct: 10, color: 'bg-amber-500' },
  { name: 'YouTube', pct: 5, color: 'bg-red-500' },
];

const topWebsites = [
  { name: 'github.com', pct: 37.5, color: 'bg-indigo-500' },
  { name: 'developer.mozilla.org', pct: 20.0, color: 'bg-cyan-500' },
  { name: 'notion.so', pct: 15.0, color: 'bg-purple-500' },
  { name: 'atlassian.net', pct: 10.0, color: 'bg-emerald-500' },
  { name: 'youtube.com', pct: 5.0, color: 'bg-red-500' },
];

export const OverviewPage: React.FC = () => {
  const statCards = [
    {
      label: 'Focus Score',
      value: '87.2 / 100',
      change: '+4.2%',
      icon: <Target className="w-5 h-5 text-emerald-400" />,
      color: 'from-emerald-500/10 to-emerald-500/0 border-emerald-500/20',
    },
    {
      label: 'Context Switches',
      value: '3.2 / hr',
      change: '-15% low',
      icon: <Zap className="w-5 h-5 text-amber-400" />,
      color: 'from-amber-500/10 to-amber-500/0 border-amber-500/20',
    },
    {
      label: 'Active Sessions',
      value: '4 Live',
      change: '+100%',
      icon: <Clock className="w-5 h-5 text-indigo-400" />,
      color: 'from-indigo-500/10 to-indigo-500/0 border-indigo-500/20',
    },
    {
      label: 'Telemetry Events',
      value: '1,284',
      change: '+24%',
      icon: <Activity className="w-5 h-5 text-cyan-400" />,
      color: 'from-cyan-500/10 to-cyan-500/0 border-cyan-500/20',
    },
    {
      label: 'AI Vision Analyses',
      value: '89',
      change: '+35%',
      icon: <Brain className="w-5 h-5 text-purple-400" />,
      color: 'from-purple-500/10 to-purple-500/0 border-purple-500/20',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-xl bg-gray-900 border bg-gradient-to-b ${card.color} flex flex-col justify-between shadow-lg`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-medium">{card.label}</span>
              {card.icon}
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <h3 className="text-xl font-bold text-white tracking-tight">{card.value}</h3>
              <span className="text-xs text-emerald-400 flex items-center font-semibold">
                {card.change}
                <ArrowUpRight size={12} />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Productivity Trend */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-gray-900 border border-gray-800 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Daily Productivity & Focus Trend
              </h3>
              <p className="text-xs text-gray-400">7-day weighted productivity rating</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
              89.4% Avg
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={productivityData}>
                <defs>
                  <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[60, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorProd)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Productive Hours */}
        <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              Most Productive Hours
            </h3>
            <p className="text-xs text-gray-400 mb-4">Peak focus hours analysis</p>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData}>
                  <XAxis dataKey="hour" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} domain={[50, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <span className="text-[11px] text-gray-400 text-center font-mono block">
            Peak Focus: 10:00 AM & 3:00 PM
          </span>
        </div>
      </div>

      {/* Usage Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Apps */}
        <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800 space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <AppWindow size={16} className="text-cyan-400" />
            Top Application Usage
          </h4>
          <div className="space-y-3">
            {topApps.map((app, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-gray-300">
                  <span>{app.name}</span>
                  <span className="text-indigo-400">{app.pct}%</span>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className={`h-full ${app.color}`} style={{ width: `${app.pct}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Websites */}
        <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800 space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Globe size={16} className="text-purple-400" />
            Top Website Domain Usage
          </h4>
          <div className="space-y-3">
            {topWebsites.map((web, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-gray-300 font-mono">
                  <span>{web.name}</span>
                  <span className="text-purple-400">{web.pct}%</span>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className={`h-full ${web.color}`} style={{ width: `${web.pct}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
