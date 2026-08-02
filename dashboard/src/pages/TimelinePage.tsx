import React, { useState } from 'react';
import { ListOrdered, ChevronRight, ChevronDown, Code } from 'lucide-react';

export const TimelinePage: React.FC = () => {
  const [expandedId, setExpandedId] = useState<number | null>(1);

  const timelineEvents = [
    {
      id: 1,
      time: '21:20:00.120',
      type: 'BROWSER_START',
      summary: 'Extension service worker initialized',
      payload: { extensionVersion: '1.0.0', permissions: ['tabCapture', 'activeTab', 'storage'] },
    },
    {
      id: 2,
      time: '21:20:03.450',
      type: 'CURRENT_URL',
      summary: 'Navigated to GitHub monorepo',
      payload: { url: 'https://github.com/harsha2973/Visual-Agent', tabId: 104, active: true },
    },
    {
      id: 3,
      time: '21:20:06.890',
      type: 'SCREENSHOT_CAPTURE',
      summary: 'Tab capture auto frame uploaded to MinIO S3',
      payload: {
        screenshotId: 'sc_821a',
        url: 'https://minio/bucket/sc_821a.jpg',
        format: 'jpeg',
        dimensions: '1920x1080',
      },
    },
    {
      id: 4,
      time: '21:20:12.300',
      type: 'AI_VISION_ANALYSIS',
      summary: 'Multimodal GPT-4o vision analyzed screen state',
      payload: {
        application: 'GitHub',
        workflow: 'CODING',
        confidence: 0.98,
        entities: ['harsha2973/Visual-Agent'],
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <ListOrdered className="w-5 h-5 text-indigo-400" />
          Chronological Event Sequence
        </h3>
        <p className="text-xs text-gray-400">
          Inspect exact telemetry timeline ordering and JSON payload attributes
        </p>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-800">
        {timelineEvents.map((item) => {
          const isOpen = expandedId === item.id;
          return (
            <div key={item.id} className="relative group">
              {/* Dot */}
              <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-indigo-500 border-2 border-gray-950 group-hover:scale-125 transition-transform" />

              <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-lg transition-all">
                <button
                  onClick={() => setExpandedId(isOpen ? null : item.id)}
                  className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">
                      {item.time}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-800 text-gray-300">
                      {item.type}
                    </span>
                    <h4 className="text-sm font-medium text-white">{item.summary}</h4>
                  </div>
                  {isOpen ? (
                    <ChevronDown size={18} className="text-gray-400" />
                  ) : (
                    <ChevronRight size={18} className="text-gray-400" />
                  )}
                </button>

                {isOpen && (
                  <div className="p-4 bg-gray-950 border-t border-gray-800">
                    <div className="flex items-center gap-2 text-xs font-mono text-gray-400 mb-2">
                      <Code size={14} className="text-cyan-400" />
                      <span>Structured Event JSON Payload</span>
                    </div>
                    <pre className="text-xs font-mono text-emerald-400 bg-gray-900 p-3 rounded-lg border border-gray-800 overflow-x-auto">
                      {JSON.stringify(item.payload, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
