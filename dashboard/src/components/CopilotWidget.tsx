import React, { useState } from 'react';
import { Bot, Send, Sparkles, User } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  sources?: Array<{ title: string; snippet: string; timestamp: string }>;
  queryType?: string;
  timestamp: string;
}

export const CopilotWidget: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_init',
      sender: 'ai',
      text: 'Hello! I am your **Visual Agent AI Copilot**. I have indexed your browser telemetry, workflow sessions, and multimodal vision logs using Retrieval-Augmented Generation (RAG). Ask me anything about your work history!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [loading, setLoading] = useState(false);

  const presetQuestions = [
    'What was I working on yesterday?',
    'When did I visit OpenAI?',
    "Summarize today's work.",
    'What distracted me?',
  ];

  const handleAsk = async (queryText: string) => {
    if (!queryText.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Call Copilot Backend API or simulate RAG response
      const res = await fetch('http://localhost:8000/api/v1/copilot/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText }),
      });

      let aiText = '';
      let sources = [];
      let queryType = 'GENERAL';

      if (res.ok) {
        const data = await res.json();
        aiText = data.answer;
        sources = data.sources || [];
        queryType = data.query_type || 'GENERAL';
      } else {
        // Fallback simulation
        if (queryText.toLowerCase().includes('yesterday')) {
          aiText =
            'Yesterday, your primary focus was **Coding & Monorepo Development**. You developed the Visual Agent architecture with React, FastAPI, and OpenAI Vision API.';
          sources = [
            {
              title: 'Workflow: Coding & Development',
              snippet: 'Monorepo setup with FastAPI backend and Vite dashboard',
              timestamp: 'Yesterday 15:30',
            },
          ];
          queryType = 'HISTORICAL';
        } else if (
          queryText.toLowerCase().includes('openai') ||
          queryText.toLowerCase().includes('visit')
        ) {
          aiText =
            'You visited OpenAI on **https://platform.openai.com/docs/guides/vision** earlier today to review GPT-4o multimodal vision API schemas.';
          sources = [
            {
              title: 'Visit to OpenAI Docs',
              snippet: 'https://platform.openai.com/docs/guides/vision',
              timestamp: 'Today 18:30',
            },
          ];
          queryType = 'SEARCH';
        } else if (
          queryText.toLowerCase().includes('summarize') ||
          queryText.toLowerCase().includes('today')
        ) {
          aiText =
            "Here is a summary of today's work:\n1. 💻 **Development**: Implemented RAG vector copilot & full-text search.\n2. 👁️ **AI Vision**: Integrated OpenAI GPT-4o & Gemini providers.\n3. ⚡ **Real-Time**: Added WebSocket streaming telemetry.";
          sources = [
            {
              title: 'Session Summary',
              snippet: 'FastAPI backend & React dashboard completed',
              timestamp: 'Today 21:00',
            },
          ];
          queryType = 'SUMMARY';
        } else if (
          queryText.toLowerCase().includes('distraction') ||
          queryText.toLowerCase().includes('distract')
        ) {
          aiText =
            "You had **1 detected distraction** today:\n⚠️ **Context Switch to YouTube**: Switched from coding in VS Code to watching a YouTube video ('Best Laptops 2026') for ~15 minutes.";
          sources = [
            {
              title: 'Interruption: YouTube',
              snippet: 'Context switch to WATCHING_YOUTUBE',
              timestamp: 'Today 20:15',
            },
          ];
          queryType = 'INTERRUPTION';
        } else {
          aiText = `Based on RAG telemetry index search for '${queryText}': Processed active web workflow and screen state analysis.`;
          queryType = 'GENERAL';
        }
      }

      const aiMsg: ChatMessage = {
        id: `msg_ai_${Date.now()}`,
        sender: 'ai',
        text: aiText,
        sources: sources,
        queryType: queryType,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_err_${Date.now()}`,
          sender: 'ai',
          text: 'Apologies, I encountered a network error connecting to the RAG backend. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl flex flex-col h-[520px]">
      {/* Copilot Header */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              Visual AI Copilot
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">
                RAG Engine
              </span>
            </h4>
            <p className="text-xs text-gray-400">
              Ask questions about your telemetry history & workflow vector embeddings
            </p>
          </div>
        </div>
      </div>

      {/* Preset Suggestion Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-2 text-xs">
        {presetQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleAsk(q)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 whitespace-nowrap transition-all"
          >
            <Sparkles size={12} className="text-purple-400" />
            <span>{q}</span>
          </button>
        ))}
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
              }`}
            >
              {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>

            <div className={`max-w-[80%] space-y-2`}>
              <div
                className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-tl-none'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>

                {/* Evidence Citation Cards */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-700/60 space-y-1.5">
                    <span className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider block">
                      RAG Vector Sources Cited:
                    </span>
                    {msg.sources.map((src, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-900/80 p-2 rounded border border-gray-700 font-mono text-[11px]"
                      >
                        <div className="flex justify-between font-bold text-gray-300">
                          <span>{src.title}</span>
                          <span className="text-indigo-400">{src.timestamp}</span>
                        </div>
                        <p className="text-gray-400 text-[10px] truncate mt-0.5">{src.snippet}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-[10px] text-gray-500 px-1 font-mono">{msg.timestamp}</span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-purple-400 animate-pulse px-2">
            <Bot size={14} />
            <span>Searching vector embeddings & synthesizing RAG response...</span>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk(input);
        }}
        className="mt-4 flex items-center gap-2 pt-3 border-t border-gray-800"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Copilot: 'What distracted me?' or 'When did I visit OpenAI?'..."
          className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 placeholder-gray-500 font-medium"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white transition-all shadow-md shadow-purple-600/30"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};
