import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { timeAgo } from '../utils/format';

export default function ScanLogsModal({ isOpen, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/scan/logs');
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white">Історія сканувань Threads</h2>
            <button
              onClick={fetchLogs}
              className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800"
              title="Оновити"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {logs.length === 0 ? (
            <div className="text-center text-xs text-neutral-500 py-8">
              Ще немає збережених логів сканування.
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-2.5">
                  {log.status === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-semibold text-neutral-200">
                      {log.message || 'Сканування завершено'}
                    </div>
                    <div className="text-[11px] text-neutral-400 mt-1 flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300">
                        {log.provider || 'default'}
                      </span>
                      {log.durationMs && (
                        <span>{Math.round(log.durationMs / 1000)}с</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-[11px] text-neutral-500 shrink-0 text-right">
                  {timeAgo(log.timestamp)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
