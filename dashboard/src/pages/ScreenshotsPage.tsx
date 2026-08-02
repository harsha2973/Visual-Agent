import React, { useState } from 'react';
import { Image as ImageIcon, Maximize2 } from 'lucide-react';

export const ScreenshotsPage: React.FC = () => {
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  const screenshots = [
    {
      id: 'sc_01',
      title: 'GitHub Monorepo Code Base',
      url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
      timestamp: '21:20:00',
      dimensions: '1920x1080',
      storage: 'MinIO S3 (visual-agent-screenshots)',
    },
    {
      id: 'sc_02',
      title: 'MDN Web Docs JavaScript Reference',
      url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
      timestamp: '21:20:15',
      dimensions: '1920x1080',
      storage: 'MinIO S3 (visual-agent-screenshots)',
    },
    {
      id: 'sc_03',
      title: 'FastAPI Swagger Documentation',
      url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
      timestamp: '21:20:30',
      dimensions: '1920x1080',
      storage: 'MinIO S3 (visual-agent-screenshots)',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-emerald-400" />
            S3-Compatible Screenshot Gallery
          </h3>
          <p className="text-xs text-gray-400">
            Captured active tab frames compressed & stored in PostgreSQL / MinIO S3
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Auto 3s Interval
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {screenshots.map((sc) => (
          <div
            key={sc.id}
            className="group bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-indigo-500/40 transition-all shadow-xl"
          >
            <div className="relative aspect-video bg-gray-950 overflow-hidden">
              <img
                src={sc.url}
                alt={sc.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gray-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  onClick={() => setSelectedImg(sc.url)}
                  className="p-2.5 rounded-full bg-indigo-600 text-white hover:bg-indigo-500 transition-all shadow-lg"
                  title="Enlarge Image"
                >
                  <Maximize2 size={18} />
                </button>
              </div>
            </div>

            <div className="p-4">
              <h4 className="text-sm font-bold text-white truncate">{sc.title}</h4>
              <div className="mt-2 space-y-1 text-xs font-mono text-gray-400">
                <div className="flex items-center justify-between">
                  <span>Captured:</span>
                  <span className="text-indigo-400 font-semibold">{sc.timestamp}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Resolution:</span>
                  <span className="text-gray-300">{sc.dimensions}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Lightbox */}
      {selectedImg && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-4xl w-full bg-gray-900 border border-gray-800 rounded-2xl p-4 overflow-hidden relative">
            <button
              onClick={() => setSelectedImg(null)}
              className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 hover:text-white text-xs font-semibold"
            >
              Close (ESC)
            </button>
            <img
              src={selectedImg}
              alt="Enlarged"
              className="w-full h-auto rounded-xl object-contain max-h-[80vh]"
            />
          </div>
        </div>
      )}
    </div>
  );
};
