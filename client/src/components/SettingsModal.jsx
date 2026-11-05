import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Send,
  Save,
  Key,
  Clock,
  Search,
  Bell,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, settings, onSaveSettings, theme }) {
  const [formData, setFormData] = useState({
    keywords: [],
    negativeKeywords: [],
    scanIntervalMinutes: 30,
    autoScanEnabled: true,
    provider: 'duckduckgo',
    threadsCookie: '',
    googleApiKey: '',
    googleCseId: '',
    serpApiKey: '',
    telegram: {
      enabled: false,
      botToken: '',
      chatId: '',
      notifyOnNewPost: true
    }
  });

  const [newKeyword, setNewKeyword] = useState('');
  const [newNegative, setNewNegative] = useState('');
  const [activeTab, setActiveTab] = useState('keywords'); // 'keywords' | 'provider' | 'telegram'
  const [testStatus, setTestStatus] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  const isLight = theme === 'light';

  useEffect(() => {
    if (settings) {
      setFormData({
        keywords: settings.keywords || [],
        negativeKeywords: settings.negativeKeywords || [],
        scanIntervalMinutes: settings.scanIntervalMinutes || 30,
        autoScanEnabled: settings.autoScanEnabled ?? true,
        provider: settings.provider || 'duckduckgo',
        threadsCookie: settings.threadsCookie || '',
        googleApiKey: settings.googleApiKey || '',
        googleCseId: settings.googleCseId || '',
        serpApiKey: settings.serpApiKey || '',
        telegram: {
          enabled: settings.telegram?.enabled ?? false,
          botToken: settings.telegram?.botToken || '',
          chatId: settings.telegram?.chatId || '',
          notifyOnNewPost: settings.telegram?.notifyOnNewPost ?? true
        }
      });
    }
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleAddKeyword = (e) => {
    e.preventDefault();
    if (newKeyword.trim() && !formData.keywords.includes(newKeyword.trim())) {
      setFormData({
        ...formData,
        keywords: [...formData.keywords, newKeyword.trim()]
      });
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (kw) => {
    setFormData({
      ...formData,
      keywords: formData.keywords.filter(k => k !== kw)
    });
  };

  const handleAddNegative = (e) => {
    e.preventDefault();
    if (newNegative.trim() && !formData.negativeKeywords.includes(newNegative.trim())) {
      setFormData({
        ...formData,
        negativeKeywords: [...formData.negativeKeywords, newNegative.trim()]
      });
      setNewNegative('');
    }
  };

  const handleRemoveNegative = (neg) => {
    setFormData({
      ...formData,
      negativeKeywords: formData.negativeKeywords.filter(k => k !== neg)
    });
  };

  const handleTestTelegram = async () => {
    setIsTesting(true);
    setTestStatus(null);
    try {
      const res = await fetch('/api/settings/test-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken: formData.telegram.botToken,
          chatId: formData.telegram.chatId
        })
      });
      const data = await res.json();
      if (res.ok) {
        setTestStatus({ type: 'success', message: '✅ Повідомлення успішно надійшло у ваш Telegram!' });
      } else {
        setTestStatus({ type: 'error', message: `❌ Помилка: ${data.error || 'Не вдалося надіслати'}` });
      }
    } catch (err) {
      setTestStatus({ type: 'error', message: `❌ Помилка з'єднання: ${err.message}` });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveSettings(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className={`w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border transition-colors ${
        isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-neutral-900 border-neutral-800 text-neutral-100'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isLight ? 'border-slate-200 bg-slate-50/50' : 'border-neutral-800'
        }`}>
          <div>
            <h2 className={`text-lg font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              ⚙️ Налаштування пошуку та сповіщень
            </h2>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
              Керуйте ключовими словами, пошуковим рушієм та ботом у Telegram
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className={`flex border-b px-6 ${
          isLight ? 'border-slate-200 bg-slate-50/80' : 'border-neutral-800 bg-neutral-950/40'
        }`}>
          <button
            onClick={() => setActiveTab('keywords')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'keywords'
                ? 'border-purple-600 text-purple-600 font-bold'
                : isLight ? 'border-transparent text-slate-500 hover:text-slate-900' : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Search className="w-4 h-4" />
            Ключові слова ({formData.keywords.length})
          </button>
          <button
            onClick={() => setActiveTab('provider')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'provider'
                ? 'border-purple-600 text-purple-600 font-bold'
                : isLight ? 'border-transparent text-slate-500 hover:text-slate-900' : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Key className="w-4 h-4" />
            Пошуковий провайдер
          </button>
          <button
            onClick={() => setActiveTab('telegram')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'telegram'
                ? 'border-purple-600 text-purple-600 font-bold'
                : isLight ? 'border-transparent text-slate-500 hover:text-slate-900' : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Bell className="w-4 h-4" />
            Telegram сповіщення
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'keywords' && (
            <div className="space-y-6">
              {/* Positive Keywords */}
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                  isLight ? 'text-slate-700' : 'text-neutral-300'
                }`}>
                  Ключові фрази для пошуку в Threads
                </label>
                <p className={`text-xs mb-3 ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                  Система шукає пости з фразами на кшталт "шукаю розробника для хорошопу", "хорошоп робота" тощо.
                </p>

                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="Введіть нову фразу (наприклад: правки сайту на хорошоп)..."
                    className={`flex-1 text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:border-purple-500 ${
                      isLight 
                        ? 'bg-slate-50 border-slate-300 text-slate-900' 
                        : 'bg-neutral-950 border-neutral-750 text-white'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleAddKeyword}
                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Додати
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.keywords.map((kw) => (
                    <span
                      key={kw}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs border ${
                        isLight 
                          ? 'bg-slate-100 text-slate-800 border-slate-200' 
                          : 'bg-neutral-800 text-neutral-200 border-neutral-700'
                      }`}
                    >
                      {kw}
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword(kw)}
                        className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Negative Keywords */}
              <div className={`pt-4 border-t ${isLight ? 'border-slate-200' : 'border-neutral-800'}`}>
                <label className="block text-xs font-bold text-rose-600 dark:text-rose-300 uppercase tracking-wider mb-2">
                  Мінус-слова (Виключати пости)
                </label>
                <p className={`text-xs mb-3 ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                  Пости, що містять ці слова, автоматично ігноруватимуться (наприклад: курси, навчання, вебінар).
                </p>

                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newNegative}
                    onChange={(e) => setNewNegative(e.target.value)}
                    placeholder="Введіть стоп-слово..."
                    className={`flex-1 text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:border-rose-500 ${
                      isLight 
                        ? 'bg-slate-50 border-slate-300 text-slate-900' 
                        : 'bg-neutral-950 border-neutral-750 text-white'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleAddNegative}
                    className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Додати
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.negativeKeywords.map((neg) => (
                    <span
                      key={neg}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-xs border border-rose-200 dark:border-rose-900/40"
                    >
                      {neg}
                      <button
                        type="button"
                        onClick={() => handleRemoveNegative(neg)}
                        className="text-rose-400 hover:text-rose-700 transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'provider' && (
            <div className="space-y-5">
              {/* Info banner about how Threads search works */}
              <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                isLight ? 'bg-purple-50/70 border-purple-200 text-purple-900' : 'bg-purple-950/30 border-purple-800/40 text-purple-200'
              }`}>
                <HelpCircle className="w-5 h-5 shrink-0 text-purple-600 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <span className="font-bold">Чому Threads іноді не знаходить дописи?</span>
                  <p className="mt-1">
                    Meta (Threads) обмежує анонімні запити. Система використовує автоматичний комбінований веб-пошук. Для гарантованого пошуку реальних постів без блокувань ви можете підключити <span className="font-semibold">Google Custom Search API</span> (100 безкоштовних пошуків щодня) або вставити <span className="font-semibold">Threads Cookie</span>.
                  </p>
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                  isLight ? 'text-slate-700' : 'text-neutral-300'
                }`}>
                  Пошуковий провайдер
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setFormData({ ...formData, provider: 'duckduckgo' })}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      formData.provider === 'duckduckgo'
                        ? isLight ? 'border-purple-600 bg-purple-50/50 text-purple-900 ring-2 ring-purple-100' : 'border-purple-500 bg-purple-500/10 text-white'
                        : isLight ? 'border-slate-200 bg-white text-slate-700 hover:border-slate-300' : 'border-neutral-800 bg-neutral-950/40 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div className="font-bold text-sm mb-1">Веб-пошук (Авто-режим)</div>
                    <div className={`text-xs ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                      Працює автоматично без API-ключів зі смарт-підбором лідів.
                    </div>
                  </div>

                  <div
                    onClick={() => setFormData({ ...formData, provider: 'mock' })}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      formData.provider === 'mock'
                        ? isLight ? 'border-purple-600 bg-purple-50/50 text-purple-900 ring-2 ring-purple-100' : 'border-purple-500 bg-purple-500/10 text-white'
                        : isLight ? 'border-slate-200 bg-white text-slate-700 hover:border-slate-300' : 'border-neutral-800 bg-neutral-950/40 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div className="font-bold text-sm mb-1">Демо-генератор лідів</div>
                    <div className={`text-xs ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                      Миттєва генерація свіжих реалістичних запитів під Хорошоп.
                    </div>
                  </div>

                  <div
                    onClick={() => setFormData({ ...formData, provider: 'direct' })}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      formData.provider === 'direct'
                        ? isLight ? 'border-purple-600 bg-purple-50/50 text-purple-900 ring-2 ring-purple-100' : 'border-purple-500 bg-purple-500/10 text-white'
                        : isLight ? 'border-slate-200 bg-white text-slate-700 hover:border-slate-300' : 'border-neutral-800 bg-neutral-950/40 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div className="font-bold text-sm mb-1">Прямий Threads API (Cookie)</div>
                    <div className={`text-xs ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                      Прямий пошук у Threads через авторизаційний сесійний cookie.
                    </div>
                  </div>

                  <div
                    onClick={() => setFormData({ ...formData, provider: 'google' })}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      formData.provider === 'google'
                        ? isLight ? 'border-purple-600 bg-purple-50/50 text-purple-900 ring-2 ring-purple-100' : 'border-purple-500 bg-purple-500/10 text-white'
                        : isLight ? 'border-slate-200 bg-white text-slate-700 hover:border-slate-300' : 'border-neutral-800 bg-neutral-950/40 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div className="font-bold text-sm mb-1">Google Custom Search API</div>
                    <div className={`text-xs ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                      Офіційний пошук Google (100 безкоштовних запитів на добу).
                    </div>
                  </div>
                </div>
              </div>

              {/* Provider details */}
              {formData.provider === 'direct' && (
                <div className={`p-4 rounded-xl border space-y-2 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-neutral-950 border-neutral-800'
                }`}>
                  <label className={`block text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-neutral-300'}`}>
                    Threads Session Cookie
                  </label>
                  <textarea
                    rows={3}
                    value={formData.threadsCookie}
                    onChange={(e) => setFormData({ ...formData, threadsCookie: e.target.value })}
                    placeholder="sessionid=...; csrftoken=... (скопіюйте з cookies на threads.net)"
                    className={`w-full text-xs p-2.5 rounded-lg border focus:outline-none focus:border-purple-500 font-mono ${
                      isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-neutral-900 border-neutral-750 text-white'
                    }`}
                  />
                  <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                    Відкрийте DevTools у браузері на threads.net &rarr; вкладка Application / Storage &rarr; Cookies &rarr; скопіюйте sessionid.
                  </p>
                </div>
              )}

              {formData.provider === 'google' && (
                <div className={`p-4 rounded-xl border space-y-3 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-neutral-950 border-neutral-800'
                }`}>
                  <div>
                    <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-neutral-300'}`}>
                      Google API Key
                    </label>
                    <input
                      type="password"
                      value={formData.googleApiKey}
                      onChange={(e) => setFormData({ ...formData, googleApiKey: e.target.value })}
                      placeholder="AIzaSy..."
                      className={`w-full text-xs px-3 py-2 rounded-lg border focus:outline-none focus:border-purple-500 ${
                        isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-neutral-900 border-neutral-750 text-white'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-neutral-300'}`}>
                      Custom Search Engine ID (cx)
                    </label>
                    <input
                      type="text"
                      value={formData.googleCseId}
                      onChange={(e) => setFormData({ ...formData, googleCseId: e.target.value })}
                      placeholder="b928..."
                      className={`w-full text-xs px-3 py-2 rounded-lg border focus:outline-none focus:border-purple-500 ${
                        isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-neutral-900 border-neutral-750 text-white'
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Schedule */}
              <div className={`pt-4 border-t space-y-3 ${isLight ? 'border-slate-200' : 'border-neutral-800'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <label className={`text-xs font-bold uppercase tracking-wider ${
                      isLight ? 'text-slate-700' : 'text-neutral-300'
                    }`}>
                      Автоматичне фонове сканування
                    </label>
                    <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                      Регулярно перевіряти Threads на нові пости без участі користувача
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.autoScanEnabled}
                    onChange={(e) => setFormData({ ...formData, autoScanEnabled: e.target.checked })}
                    className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
                  />
                </div>

                {formData.autoScanEnabled && (
                  <div>
                    <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                      Частота перевірки:
                    </label>
                    <select
                      value={formData.scanIntervalMinutes}
                      onChange={(e) => setFormData({ ...formData, scanIntervalMinutes: Number(e.target.value) })}
                      className={`w-full text-xs px-3 py-2.5 rounded-xl border focus:outline-none focus:border-purple-500 ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-neutral-950 border-neutral-750 text-white'
                      }`}
                    >
                      <option value={10}>Кожні 10 хвилин (найшвидше)</option>
                      <option value={15}>Кожні 15 хвилин</option>
                      <option value={30}>Кожні 30 хвилин (рекомендовано)</option>
                      <option value={60}>Кожну годину</option>
                      <option value={120}>Кожні 2 години</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'telegram' && (
            <div className="space-y-5">
              <div className={`flex items-center justify-between p-4 rounded-xl border ${
                isLight ? 'bg-cyan-50/50 border-cyan-200' : 'bg-neutral-950 border-neutral-800'
              }`}>
                <div>
                  <div className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    <Send className="w-4 h-4 text-cyan-600" />
                    Миттєві сповіщення у Telegram
                  </div>
                  <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                    Отримувати повідомлення на телефон одразу, як тільки пост з'явився у Threads
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.telegram.enabled}
                  onChange={(e) => setFormData({
                    ...formData,
                    telegram: { ...formData.telegram, enabled: e.target.checked }
                  })}
                  className="w-5 h-5 accent-cyan-600 rounded cursor-pointer"
                />
              </div>

              {formData.telegram.enabled && (
                <div className="space-y-4">
                  <div>
                    <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-neutral-300'}`}>
                      Telegram Bot Token
                    </label>
                    <input
                      type="text"
                      value={formData.telegram.botToken}
                      onChange={(e) => setFormData({
                        ...formData,
                        telegram: { ...formData.telegram, botToken: e.target.value }
                      })}
                      placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ..."
                      className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:border-cyan-500 ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-neutral-950 border-neutral-750 text-white'
                      }`}
                    />
                    <p className={`text-[11px] mt-1 ${isLight ? 'text-slate-400' : 'text-neutral-500'}`}>
                      Отримайте у @BotFather в Telegram (команда /newbot)
                    </p>
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-neutral-300'}`}>
                      Ваш Telegram Chat ID
                    </label>
                    <input
                      type="text"
                      value={formData.telegram.chatId}
                      onChange={(e) => setFormData({
                        ...formData,
                        telegram: { ...formData.telegram, chatId: e.target.value }
                      })}
                      placeholder="987654321 або @channelname"
                      className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:border-cyan-500 ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-neutral-950 border-neutral-750 text-white'
                      }`}
                    />
                    <p className={`text-[11px] mt-1 ${isLight ? 'text-slate-400' : 'text-neutral-500'}`}>
                      Дізнайтесь свій ID через бота @userinfobot або @getmyid_bot
                    </p>
                  </div>

                  {testStatus && (
                    <div className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                      testStatus.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-rose-50 text-rose-800 border-rose-300'
                    }`}>
                      {testStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                      <span>{testStatus.message}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleTestTelegram}
                    disabled={isTesting || !formData.telegram.botToken || !formData.telegram.chatId}
                    className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border disabled:opacity-50 transition-colors cursor-pointer ${
                      isLight 
                        ? 'bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border-cyan-200' 
                        : 'bg-neutral-800 hover:bg-neutral-750 text-cyan-300 border-neutral-700'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isTesting ? 'Надсилання...' : 'Перевірити зʼєднання з Telegram'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className={`flex items-center justify-end gap-3 pt-4 border-t ${
            isLight ? 'border-slate-200' : 'border-neutral-800'
          }`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              Скасувати
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-purple-900/20 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Зберегти налаштування
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
