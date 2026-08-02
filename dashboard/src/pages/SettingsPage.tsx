import React, { useState } from 'react';
import { Save, Sliders, Shield, Cpu, Database } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [backendUrl, setBackendUrl] = useState('http://localhost:8000');
  const [aiWorkerUrl, setAiWorkerUrl] = useState('http://localhost:8001');
  const [uploadInterval, setUploadInterval] = useState(30);
  const [screenshotInterval, setScreenshotInterval] = useState(3);
  const [aiProvider, setAiProvider] = useState('openai');
  const [openaiKey, setOpenaiKey] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
      <div>
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Sliders className="w-5 h-5 text-indigo-400" />
          Dashboard & Extension Settings
        </h3>
        <p className="text-xs text-gray-400">
          Configure connection strings, sync frequency, privacy rules, and AI providers
        </p>
      </div>

      {saved && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          Settings updated successfully!
        </div>
      )}

      {/* Network & Endpoints */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Database size={16} className="text-cyan-400" />
          API & Service Connections
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">
              FastAPI Backend Endpoint
            </label>
            <input
              type="text"
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">
              AI Worker Endpoint
            </label>
            <input
              type="text"
              value={aiWorkerUrl}
              onChange={(e) => setAiWorkerUrl(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Intervals & Privacy */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Shield size={16} className="text-emerald-400" />
          Capture & Telemetry Frequencies
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1 font-semibold">
              <span>Telemetry Upload Interval:</span>
              <span className="text-indigo-400 font-bold">{uploadInterval}s</span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              value={uploadInterval}
              onChange={(e) => setUploadInterval(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1 font-semibold">
              <span>Tab Capture Interval:</span>
              <span className="text-emerald-400 font-bold">{screenshotInterval}s</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={screenshotInterval}
              onChange={(e) => setScreenshotInterval(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* AI Provider Config */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Cpu size={16} className="text-purple-400" />
          Multimodal AI Vision Provider Configuration
        </h4>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">
              Active Vision Provider
            </label>
            <select
              value={aiProvider}
              onChange={(e) => setAiProvider(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="openai">OpenAI GPT-4o Vision</option>
              <option value="gemini">Google Gemini 1.5 Flash Vision</option>
              <option value="mock">Mock Offline Provider</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">
              OpenAI API Key (Optional)
            </label>
            <input
              type="password"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder="sk-proj-••••••••••••••••"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-600/30"
      >
        <Save size={16} />
        <span>Save Changes</span>
      </button>
    </form>
  );
};
