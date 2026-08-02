import React from 'react';
import { Play, CheckCircle2, Monitor } from 'lucide-react';

export const SessionsPage: React.FC = () => {
  const sessions = [
    {
      id: 'sess_9823a7',
      status: 'RUNNING',
      device: 'Chrome Windows 11',
      startTime: '2026-08-02 21:10:00',
      eventCount: 450,
      screenshotCount: 48,
    },
    {
      id: 'sess_8472f1',
      status: 'COMPLETED',
      device: 'Chrome macOS Sonoma',
      startTime: '2026-08-02 19:30:00',
      eventCount: 890,
      screenshotCount: 92,
    },
    {
      id: 'sess_1204e3',
      status: 'COMPLETED',
      device: 'Chrome Linux Desktop',
      startTime: '2026-08-02 16:15:00',
      eventCount: 310,
      screenshotCount: 35,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">Browser Telemetry Sessions</h3>
          <p className="text-xs text-gray-400">Track active and past extension tracking sessions</p>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-gray-800/60 text-xs font-semibold text-gray-400 uppercase border-b border-gray-800">
            <tr>
              <th className="px-6 py-4">Session ID</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Client Environment</th>
              <th className="px-6 py-4">Started At</th>
              <th className="px-6 py-4">Events</th>
              <th className="px-6 py-4">Screenshots</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {sessions.map((sess) => (
              <tr key={sess.id} className="hover:bg-gray-800/40 transition-colors">
                <td className="px-6 py-4 font-mono font-semibold text-indigo-400">{sess.id}</td>
                <td className="px-6 py-4">
                  {sess.status === 'RUNNING' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                      <Play size={12} className="fill-current animate-pulse" />
                      RUNNING
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold border border-blue-500/20">
                      <CheckCircle2 size={12} />
                      COMPLETED
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 flex items-center gap-2">
                  <Monitor size={16} className="text-gray-400" />
                  <span>{sess.device}</span>
                </td>
                <td className="px-6 py-4 text-xs font-mono text-gray-400">{sess.startTime}</td>
                <td className="px-6 py-4 font-semibold text-white">{sess.eventCount}</td>
                <td className="px-6 py-4 font-semibold text-cyan-400">{sess.screenshotCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
