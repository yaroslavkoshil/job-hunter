import React, { useState } from 'react';
import {
  Search,
  RefreshCw,
  PlusCircle,
  Settings,
  History,
  Radio,
  ChevronDown,
  Sun,
  Moon,
  ExternalLink
} from 'lucide-react';

export default function Navbar({
  settings,
  isScanning,
  theme,
  onToggleTheme,
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

  const isLight = theme === 'light';

  return (
    <header className={`sticky top-0 z-30 backdrop-blur-xl border-b transition-colors duration-200 px-4 lg:px-8 py-3.5 ${
      isLight 
        ? 'bg-white/90 border-slate-200 shadow-xs' 
        : 'bg-neutral-950/80 border-neutral-800/80'
    }`}>
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-900/20 text-white font-black text-xl">
            @
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-extrabold text-base tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Threads Lead Hunter
              </span>
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                isLight 
                  ? 'bg-purple-50 text-purple-700 border-purple-200' 
                  : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
              }`}>
                Хорошоп
              </span>
            </div>
            <div className={`flex items-center gap-2 text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
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
        <div className="flex items-center gap-2">
          {/* Theme Switcher Toggle */}
          <button
            onClick={onToggleTheme}
            className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-amber-300'
            }`}
            title={isLight ? 'Увімкнути темну тему' : 'Увімкнути світлу тему'}
          >
            {isLight ? (
              <>
                <Moon className="w-4 h-4 text-purple-600" />
                <span className="hidden sm:inline text-xs">Темна</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline text-xs">Світла</span>
              </>
            )}
          </button>

          {/* Open Search in Threads Directly */}
          <a
            href="https://www.threads.net/search?q=%D1%85%D0%BE%D1%80%D0%BE%D1%88%D0%BE%D0%BF"
            target="_blank"
            rel="noopener noreferrer"
            className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-200'
            }`}
            title="Відкрити живий пошук прямо на threads.net"
          >
            <span>Threads</span>
            <ExternalLink className="w-3.5 h-3.5 text-purple-600" />
          </a>

          {/* Scan Now Dropdown Button */}
          <div className="relative">
            <div className="flex items-center rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 shadow-md shadow-purple-900/20">
              <button
                onClick={() => onTriggerScan()}
                disabled={isScanning}
                className="px-4 py-2 text-xs font-semibold text-white flex items-center gap-2 hover:opacity-95 disabled:opacity-60 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                <span>{isScanning ? 'Пошук...' : 'Шукати зараз'}</span>
              </button>
              <button
                onClick={() => setShowScanMenu(!showScanMenu)}
                className="px-2 py-2 text-white border-l border-white/20 hover:bg-white/10 rounded-r-xl transition-colors cursor-pointer"
                title="Оберіть джерело пошуку"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {showScanMenu && (
              <div className={`absolute right-0 mt-2 w-56 rounded-xl border shadow-2xl z-40 py-1.5 overflow-hidden text-xs ${
                isLight ? 'bg-white border-slate-200' : 'bg-neutral-900 border-neutral-750'
              }`}>
                <div className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${
                  isLight ? 'text-slate-400' : 'text-neutral-400'
                }`}>
                  Джерело пошуку
                </div>
                <button
                  onClick={() => handleScanWithProvider('duckduckgo')}
                  className={`w-full px-3.5 py-2 text-left flex items-center justify-between transition-colors ${
                    isLight ? 'text-slate-700 hover:bg-slate-50' : 'text-neutral-200 hover:bg-neutral-800'
                  }`}
                >
                  <span>Веб-пошук (Авто)</span>
                  <span className="text-[10px] text-emerald-500 font-mono font-bold">Auto</span>
                </button>
                <button
                  onClick={() => handleScanWithProvider('direct')}
                  className={`w-full px-3.5 py-2 text-left flex items-center justify-between transition-colors ${
                    isLight ? 'text-slate-700 hover:bg-slate-50' : 'text-neutral-200 hover:bg-neutral-800'
                  }`}
                >
                  <span>Прямий Threads (Cookie)</span>
                  <span className="text-[10px] text-purple-500 font-mono font-bold">Session</span>
                </button>
                <button
                  onClick={() => handleScanWithProvider('google')}
                  className={`w-full px-3.5 py-2 text-left flex items-center justify-between transition-colors ${
                    isLight ? 'text-slate-700 hover:bg-slate-50' : 'text-neutral-200 hover:bg-neutral-800'
                  }`}
                >
                  <span>Google Custom Search</span>
                  <span className="text-[10px] text-blue-500 font-mono font-bold">API</span>
                </button>
              </div>
            )}
          </div>

          {/* Add Manual Post */}
          <button
            onClick={onOpenManualAdd}
            className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isLight
                ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                : 'bg-neutral-900 border-neutral-800 text-neutral-200 hover:text-white hover:border-neutral-700'
            }`}
            title="Додати пост за посиланням"
          >
            <PlusCircle className="w-3.5 h-3.5 text-purple-600" />
            <span className="hidden sm:inline">Додати вручну</span>
          </button>

          {/* Scan Logs */}
          <button
            onClick={onOpenLogs}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isLight
                ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
            }`}
            title="Історія сканувань"
          >
            <History className="w-4 h-4" />
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isLight
                ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
            }`}
            title="Налаштування ключів та Telegram"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
