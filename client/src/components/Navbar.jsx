import React, { useState } from 'react';
import {
  Search,
  RefreshCw,
  PlusCircle,
  Settings,
  History,
  Radio,
  ChevronDown,
  Sparkles
} from 'lucide-react';

export default function Navbar({
  settings,
  isScanning,
  onTriggerScan,
  onOpenSettings,
  onOpenManualAdd,
  onOpenLogs
}) {
  const [showScanMenu, setShowScanMenu] = useState(false);

  const handleScanWithProvider = (provider) => {
    setShowScanMenu(false);
    onTriggerScan(provider);
  };

  return (
    <header className="sticky top-0 z-30 bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-800/80 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-900/30 text-white font-black text-xl">
            @
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">
                Threads Lead Hunter
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30">
                Хорошоп
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
              <span className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                {settings?.autoScanEnabled
                  ? `Автопошук: кожні ${settings.scanIntervalMinutes || 30}хв`
                  : 'Автопошук вимкнено'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Scan Now Dropdown Button */}
          <div className="relative">
            <div className="flex items-center rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg shadow-purple-900/25">
              <button
                onClick={() => onTriggerScan()}
                disabled={isScanning}
                className="px-4 py-2 text-xs font-semibold text-white flex items-center gap-2 hover:opacity-95 disabled:opacity-60 transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                <span>{isScanning ? 'Сканування...' : 'Шукати зараз'}</span>
              </button>
              <button
                onClick={() => setShowScanMenu(!showScanMenu)}
                className="px-2 py-2 text-white border-l border-white/20 hover:bg-white/10 rounded-r-xl transition-colors"
                title="Оберіть джерело сканування"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {showScanMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-neutral-900 border border-neutral-750 shadow-2xl z-40 py-1.5 overflow-hidden text-xs">
                <div className="px-3 py-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  Джерело пошуку
                </div>
                <button
                  onClick={() => handleScanWithProvider('duckduckgo')}
                  className="w-full px-3.5 py-2 text-left text-neutral-200 hover:bg-neutral-800 flex items-center justify-between"
                >
                  <span>DuckDuckGo (Без ключів)</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Free</span>
                </button>
                <button
                  onClick={() => handleScanWithProvider('mock')}
                  className="w-full px-3.5 py-2 text-left text-neutral-200 hover:bg-neutral-800 flex items-center justify-between"
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    Демо генератор
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono">Test</span>
                </button>
                <button
                  onClick={() => handleScanWithProvider('google')}
                  className="w-full px-3.5 py-2 text-left text-neutral-200 hover:bg-neutral-800 flex items-center justify-between"
                >
                  <span>Google Custom Search</span>
                  <span className="text-[10px] text-neutral-400 font-mono">API</span>
                </button>
                <button
                  onClick={() => handleScanWithProvider('serpapi')}
                  className="w-full px-3.5 py-2 text-left text-neutral-200 hover:bg-neutral-800 flex items-center justify-between"
                >
                  <span>SerpAPI (Google)</span>
                  <span className="text-[10px] text-neutral-400 font-mono">API</span>
                </button>
              </div>
            )}
          </div>

          {/* Add Manual Post */}
          <button
            onClick={onOpenManualAdd}
            className="px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-200 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Додати пост за посиланням"
          >
            <PlusCircle className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Додати вручну</span>
          </button>

          {/* Scan Logs */}
          <button
            onClick={onOpenLogs}
            className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white transition-colors"
            title="Історія сканувань"
          >
            <History className="w-4 h-4" />
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white transition-colors"
            title="Налаштування ключів та Telegram"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
