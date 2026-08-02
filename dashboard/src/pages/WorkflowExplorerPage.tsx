import React from 'react';
import {
  GitMerge,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  PieChart as PieIcon,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const categoryData = [
  { name: 'Coding', value: 45, color: '#6366f1' },
  { name: 'Reading Documentation', value: 25, color: '#06b6d4' },
  { name: 'Updating Notion', value: 15, color: '#a855f7' },
  { name: 'Watching YouTube (Interruption)', value: 15, color: '#ef4444' },
];

export const WorkflowExplorerPage: React.FC = () => {
  const workflowNodes = [
    {
      id: 'node_1',
      title: 'Reading Documentation',
      category: 'READING_DOCUMENTATION',
      isInterruption: false,
    },
    { id: 'node_2', title: 'Coding & Debugging', category: 'CODING', isInterruption: false },
    { id: 'node_3', title: 'Watching YouTube', category: 'WATCHING_YOUTUBE', isInterruption: true },
    { id: 'node_4', title: 'Coding & PR Review', category: 'CODING', isInterruption: false },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <GitMerge className="w-5 h-5 text-indigo-400" />
          Automated Workflow Explorer & Directed Graph
        </h3>
        <p className="text-xs text-gray-400">
          Classifies browser telemetry into 7 workflow categories & tracks task context switches
        </p>
      </div>

      {/* Top Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between">
          <div>
            <span className="text-xs text-indigo-300 font-semibold uppercase">
              Primary Workflow
            </span>
            <h4 className="text-lg font-bold text-white mt-1">Coding & Development</h4>
          </div>
          <span className="px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 text-xs font-mono font-bold">
            85% Session
          </span>
        </div>

        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-between">
          <div>
            <span className="text-xs text-red-300 font-semibold uppercase">
              Detected Interruptions
            </span>
            <h4 className="text-lg font-bold text-white mt-1">1 Context Switch</h4>
          </div>
          <AlertTriangle className="w-6 h-6 text-red-400" />
        </div>

        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-300 font-semibold uppercase">
              Multimodal AI Fusion
            </span>
            <h4 className="text-lg font-bold text-white mt-1">High Confidence</h4>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Directed Graph Viewer */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-gray-900 border border-gray-800 space-y-4">
          <h4 className="text-sm font-bold text-white mb-2">Workflow State Transition Sequence</h4>
          <div className="flex flex-col sm:flex-row items-center gap-3 overflow-x-auto py-4">
            {workflowNodes.map((node, idx) => (
              <React.Fragment key={node.id}>
                <div
                  className={`p-4 rounded-xl border flex-1 min-w-[160px] text-center shadow-lg ${
                    node.isInterruption
                      ? 'bg-red-500/10 border-red-500/30 text-red-300'
                      : 'bg-gray-800 border-gray-700 text-white'
                  }`}
                >
                  <span className="text-[10px] uppercase tracking-wider font-mono font-bold block mb-1">
                    Step {idx + 1}
                  </span>
                  <h5 className="text-xs font-bold truncate">{node.title}</h5>
                  {node.isInterruption && (
                    <span className="mt-2 inline-block text-[9px] px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-semibold">
                      Interruption
                    </span>
                  )}
                </div>
                {idx < workflowNodes.length - 1 && (
                  <ArrowRight className="text-gray-600 flex-shrink-0" size={18} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Category Pie Chart */}
        <div className="p-6 rounded-2xl bg-gray-900 border border-gray-800 flex flex-col justify-between">
          <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
            <PieIcon size={16} className="text-cyan-400" />
            Time Allocation Breakdown
          </h4>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  fill="#8884d8"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
