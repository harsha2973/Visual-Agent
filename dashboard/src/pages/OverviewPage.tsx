import React from 'react';
import {
  Activity,
  Clock,
  Image,
  Brain,
  GitMerge,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const chartData = [
  { time: '10:00', events: 12, screenshots: 3 },
  { time: '10:05', events: 25, screenshots: 6 },
  { time: '10:10', events: 45, screenshots: 10 },
  { time: '10:15', events: 30, screenshots: 8 },
  { time: '10:20', events: 65, screenshots: 15 },
  { time: '10:25', events: 80, screenshots: 18 },
  { time: '10:30', events: 95, screenshots: 22 },
];

export const OverviewPage: React.FC = () => {
  const statCards = [
    {
      label: 'Active Sessions',
      value: '4',
      change: '+100%',
      icon: <Clock className="w-5 h-5 text-indigo-400" />,
      color: 'from-indigo-500/10 to-indigo-500/0 border-indigo-500/20',
    },
    {
      label: 'Total Telemetry Events',
      value: '1,284',
      change: '+24%',
      icon: <Activity className="w-5 h-5 text-cyan-400" />,
      color: 'from-cyan-500/10 to-cyan-500/0 border-cyan-500/20',
    },
    {
      label: 'Captured Screenshots',
      value: '142',
      change: '+12%',
      icon: <Image className="w-5 h-5 text-emerald-400" />,
      color: 'from-emerald-500/10 to-emerald-500/0 border-emerald-500/20',
    },
    {
      label: 'AI Vision Analyses',
      value: '89',
      change: '+35%',
      icon: <Brain className="w-5 h-5 text-purple-400" />,
      color: 'from-purple-500/10 to-purple-500/0 border-purple-500/20',
    },
    {
      label: 'Workflows Detected',
      value: '7 Categories',
      change: 'Active',
      icon: <GitMerge className="w-5 h-5 text-amber-400" />,
      color: 'from-amber-500/10 to-amber-500/0 border-amber-500/20',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-xl bg-gray-900 border bg-gradient-to-b ${card.color} flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-medium">{card.label}</span>
              {card.icon}
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <h3 className="text-2xl font-bold text-white tracking-tight">{card.value}</h3>
              <span className="text-xs text-emerald-400 flex items-center font-semibold">
                {card.change}
                <ArrowUpRight size={12} />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Telemetry Velocity Chart & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-gray-900 border border-gray-800 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                Telemetry Event Velocity
              </h3>
              <p className="text-xs text-gray-400">Events uploaded every 30 seconds</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-md bg-gray-800 text-gray-300 font-mono">
              Live Stream
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorEvt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
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
                  dataKey="events"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorEvt)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Health / Status */}
        <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Infrastructure Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 border border-gray-800">
                <span className="text-xs font-medium text-gray-300">FastAPI Backend</span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold">
                  Online (8000)
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 border border-gray-800">
                <span className="text-xs font-medium text-gray-300">AI Worker (OpenAI/Gemini)</span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold">
                  Online (8001)
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 border border-gray-800">
                <span className="text-xs font-medium text-gray-300">MinIO S3 Storage</span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold">
                  Online (9000)
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 border border-gray-800">
                <span className="text-xs font-medium text-gray-300">Chrome Extension Sync</span>
                <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-semibold">
                  Active 30s Batch
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-800 text-xs text-gray-400 flex items-center justify-between">
            <span>Clean Architecture</span>
            <span className="font-mono text-gray-300">Docker Monorepo</span>
          </div>
        </div>
      </div>
    </div>
  );
};
