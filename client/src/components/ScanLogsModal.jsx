import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { timeAgo } from '../utils/format';

export default function ScanLogsModal({ isOpen, onClose, theme }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const isLight = theme === 'light';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className={`w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border transition-colors ${
        isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-neutral-900 border-neutral-800 text-neutral-100'
      }`}>
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isLight ? 'border-slate-200 bg-slate-50' : 'border-neutral-800'
        }`}>
          <div className="flex items-center gap-2">
            <h2 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Історія сканувань Threads
            </h2>
            <button
              onClick={fetchLogs}
              className={`p-1 rounded cursor-pointer ${
                isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-200' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
              title="Оновити"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {logs.length === 0 ? (
            <div className={`text-center text-xs py-8 ${isLight ? 'text-slate-400' : 'text-neutral-500'}`}>
              Ще немає збережених логів сканування.
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className={`p-3.5 rounded-xl border text-xs flex items-start justify-between gap-3 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-neutral-950 border-neutral-800'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {log.status === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className={`font-semibold ${isLight ? 'text-slate-900' : 'text-neutral-200'}`}>
                      {log.message || 'Сканування завершено'}
                    </div>
                    <div className={`text-[11px] mt-1 flex items-center gap-2 ${
                      isLight ? 'text-slate-500' : 'text-neutral-400'
                    }`}>
                      <span className={`px-1.5 py-0.5 rounded font-mono ${
                        isLight ? 'bg-slate-200 text-slate-700' : 'bg-neutral-800 text-neutral-300'
                      }`}>
                        {log.provider || 'default'}
                      </span>
                      {log.durationMs && (
                        <span>{Math.round(log.durationMs / 1000)}с</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className={`text-[11px] shrink-0 text-right ${isLight ? 'text-slate-400' : 'text-neutral-500'}`}>
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
