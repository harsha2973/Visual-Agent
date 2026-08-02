import React from 'react';
import { Brain, Sparkles, Layout, Tag } from 'lucide-react';

export const AIInsightsPage: React.FC = () => {
  const insights = [
    {
      id: 'ai_01',
      provider: 'openai',
      model: 'gpt-4o',
      confidence: 0.98,
      application: 'GitHub Repository Manager',
      task: 'Reviewing Pull Requests and Commits',
      workflowStep: 'Code Verification & Monorepo Build',
      summary:
        'Detected Visual Agent monorepo codebase with active TypeScript and Python backend files. User is currently testing workflow engine.',
      components: [
        'Repository Header',
        'File Explorer Sidebar',
        'Commit History Panel',
        'Pulls Tab',
      ],
      entities: [
        { name: 'Repo', type: 'Identifier', value: 'harsha2973/Visual-Agent' },
        { name: 'Branch', type: 'Git', value: 'main' },
      ],
    },
    {
      id: 'ai_02',
      provider: 'gemini',
      model: 'gemini-1.5-flash',
      confidence: 0.94,
      application: 'FastAPI Interactive Swagger Docs',
      task: 'Testing Endpoint Schemas',
      workflowStep: 'API Integration Testing',
      summary:
        'Viewing FastAPI OpenAPI documentation at http://localhost:8000/docs. Endpoints for /api/v1/workflows and /api/v1/screenshots visible.',
      components: ['API Authorization Button', 'Endpoint Accordion', 'Schemas Panel'],
      entities: [
        { name: 'Endpoint', type: 'Route', value: '/api/v1/workflows/detect' },
        { name: 'Method', type: 'HTTP', value: 'POST' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          Multimodal AI Insights & Vision Results
        </h3>
        <p className="text-xs text-gray-400">
          Structured application state extraction powered by OpenAI Vision API & Google Gemini
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {insights.map((item) => (
          <div
            key={item.id}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl space-y-4"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">{item.application}</h4>
                  <p className="text-xs text-gray-400">{item.task}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  Provider: {item.provider.toUpperCase()} ({item.model})
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Confidence {(item.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
              <p className="text-xs text-gray-300 leading-relaxed">{item.summary}</p>
            </div>

            {/* Grid stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-semibold text-gray-400 flex items-center gap-1.5 mb-2">
                  <Layout size={14} className="text-indigo-400" />
                  Visible Components ({item.components.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {item.components.map((comp, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded bg-gray-800 text-gray-300 font-medium"
                    >
                      {comp}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-semibold text-gray-400 flex items-center gap-1.5 mb-2">
                  <Tag size={14} className="text-amber-400" />
                  Extracted Entities
                </span>
                <div className="space-y-1">
                  {item.entities.map((ent, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-gray-800/60 px-2.5 py-1 rounded font-mono"
                    >
                      <span className="text-gray-400">
                        {ent.name} ({ent.type}):
                      </span>
                      <span className="text-cyan-400 font-semibold">{ent.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
