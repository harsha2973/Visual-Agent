import React, { useState } from 'react';
import {
  Search,
  X,
  Globe,
  CheckSquare,
  AppWindow,
  FileText,
  Brain,
  GitMerge,
  Filter,
  ArrowRight,
} from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');

  if (!isOpen) return null;

  const mockResults = [
    {
      id: 'res_1',
      type: 'WEBSITE',
      title: 'GitHub Monorepo Repository',
      snippet: 'https://github.com/harsha2973/Visual-Agent',
      category: 'CODING',
      timestamp: '21:20:15',
      icon: <Globe className="w-4 h-4 text-cyan-400" />,
    },
    {
      id: 'res_2',
      type: 'TASK',
      title: 'Implement Workflow Engine & Directed Graph',
      snippet:
        'Active workflow task: Building multi-category detection and context switch tracking',
      category: 'CODING',
      timestamp: '21:21:00',
      icon: <CheckSquare className="w-4 h-4 text-indigo-400" />,
    },
    {
      id: 'res_3',
      type: 'APPLICATION',
      title: 'Visual Agent Dashboard Interface',
      snippet: 'Active application state detected via OpenAI Vision API',
      category: 'AI_VISION',
      timestamp: '21:22:30',
      icon: <AppWindow className="w-4 h-4 text-purple-400" />,
    },
    {
      id: 'res_4',
      type: 'OCR_TEXT',
      title: 'OCR Visible Bounding Text',
      snippet: 'Detected visible UI text: "Submit PR", "Search Bar", "Tabs", "Live Sync"',
      category: 'OCR',
      timestamp: '21:23:45',
      icon: <FileText className="w-4 h-4 text-emerald-400" />,
    },
    {
      id: 'res_5',
      type: 'AI_SUMMARY',
      title: 'Multimodal Vision Natural Language Summary',
      snippet:
        'GPT-4o Vision analyzed active screen: User is testing PostgreSQL full-text search engine API',
      category: 'AI_SUMMARY',
      timestamp: '21:24:00',
      icon: <Brain className="w-4 h-4 text-amber-400" />,
    },
    {
      id: 'res_6',
      type: 'WORKFLOW',
      title: 'Workflow: Coding & Development',
      snippet: 'Category: CODING | Interruption: False | Session: sess_9823a7',
      category: 'WORKFLOW',
      timestamp: '21:25:10',
      icon: <GitMerge className="w-4 h-4 text-rose-400" />,
    },
  ];

  const filteredResults = mockResults.filter((res) => {
    const matchesCategory =
      filterCategory === 'ALL' || res.category === filterCategory || res.type === filterCategory;
    const matchesQuery =
      !query ||
      res.title.toLowerCase().includes(query.toLowerCase()) ||
      res.snippet.toLowerCase().includes(query.toLowerCase()) ||
      res.type.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-16 px-4">
      <div className="w-full max-w-3xl bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Header */}
        <div className="p-4 border-b border-gray-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-indigo-400 flex-shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by Website, Task, Application, OCR text, AI summary, or Workflow..."
            className="w-full bg-transparent text-white text-base focus:outline-none placeholder-gray-500 font-medium"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filters Bar */}
        <div className="px-4 py-2 bg-gray-950 border-b border-gray-800 flex items-center gap-2 overflow-x-auto text-xs">
          <Filter size={14} className="text-gray-400 flex-shrink-0" />
          {['ALL', 'WEBSITE', 'TASK', 'APPLICATION', 'OCR_TEXT', 'AI_SUMMARY', 'WORKFLOW'].map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 rounded-full font-semibold transition-all ${
                  filterCategory === cat
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {cat.replace('_', ' ')}
              </button>
            ),
          )}
        </div>

        {/* Results List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {filteredResults.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-sm">
              No matching search results found. Try adjusting keywords or filters.
            </div>
          ) : (
            filteredResults.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-gray-800/50 hover:bg-gray-800 border border-gray-800 hover:border-indigo-500/30 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-gray-900 border border-gray-700 mt-0.5">
                    {item.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                        {item.title}
                      </h4>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-gray-900 text-gray-400 font-mono">
                        {item.type}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 font-mono">{item.snippet}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px] text-gray-500 font-mono hidden sm:inline">
                    {item.timestamp}
                  </span>
                  <ArrowRight
                    size={14}
                    className="text-gray-500 group-hover:text-indigo-400 transition-colors"
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-950 border-t border-gray-800 text-xs text-gray-500 flex items-center justify-between font-mono">
          <span>PostgreSQL Full Text Search Engine</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
};
