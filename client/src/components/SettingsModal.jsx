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
  AlertCircle
} from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, settings, onSaveSettings }) {
  const [formData, setFormData] = useState({
    keywords: [],
    negativeKeywords: [],
    scanIntervalMinutes: 30,
    autoScanEnabled: true,
    provider: 'duckduckgo',
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
  const [testStatus, setTestStatus] = useState(null); // { type: 'success' | 'error', message: '' }
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        keywords: settings.keywords || [],
        negativeKeywords: settings.negativeKeywords || [],
        scanIntervalMinutes: settings.scanIntervalMinutes || 30,
        autoScanEnabled: settings.autoScanEnabled ?? true,
        provider: settings.provider || 'duckduckgo',
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
        setTestStatus({ type: 'success', message: '✅ Повідомлення успішно відправлено у ваш Telegram!' });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              ⚙️ Налаштування пошуку та сповіщень
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Керуйте ключовими словами, пошуковим рушієм та ботом у Telegram
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-800 px-6 bg-neutral-950/40">
          <button
            onClick={() => setActiveTab('keywords')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'keywords'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Search className="w-4 h-4" />
            Ключові слова ({formData.keywords.length})
          </button>
          <button
            onClick={() => setActiveTab('provider')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'provider'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Key className="w-4 h-4" />
            Пошуковий провайдер
          </button>
          <button
            onClick={() => setActiveTab('telegram')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'telegram'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-neutral-400 hover:text-white'
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
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                  Ключові фрази для пошуку в Threads
                </label>
                <p className="text-xs text-neutral-400 mb-3">
                  Система шукає пости з фразами на кшталт "шукаю розробника для хорошопу", "робота хорошоп" тощо.
                </p>

                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="Введіть нову фразу (наприклад: правки сайту на хорошоп)..."
                    className="flex-1 text-xs px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-750 text-white focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddKeyword}
                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Додати
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neutral-800 text-neutral-200 text-xs border border-neutral-700"
                    >
                      {kw}
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword(kw)}
                        className="text-neutral-400 hover:text-rose-400 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Negative Keywords */}
              <div className="pt-4 border-t border-neutral-800">
                <label className="block text-xs font-bold text-rose-300 uppercase tracking-wider mb-2">
                  Мінус-слова (Виключати пости)
                </label>
                <p className="text-xs text-neutral-400 mb-3">
                  Пости, що містять ці слова, автоматично ігноруватимуться (наприклад: курси, навчання, вебінар).
                </p>

                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newNegative}
                    onChange={(e) => setNewNegative(e.target.value)}
                    placeholder="Введіть стоп-слово..."
                    className="flex-1 text-xs px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-750 text-white focus:outline-none focus:border-rose-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddNegative}
                    className="px-4 py-2.5 rounded-xl bg-rose-600/80 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Додати
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.negativeKeywords.map((neg) => (
                    <span
                      key={neg}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-950/30 text-rose-300 text-xs border border-rose-900/40"
                    >
                      {neg}
                      <button
                        type="button"
                        onClick={() => handleRemoveNegative(neg)}
                        className="text-rose-400 hover:text-rose-200 transition-colors"
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
              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                  Пошуковий провайдер
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setFormData({ ...formData, provider: 'duckduckgo' })}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      formData.provider === 'duckduckgo'
                        ? 'border-purple-500 bg-purple-500/10 text-white'
                        : 'border-neutral-800 bg-neutral-950/40 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div className="font-semibold text-sm mb-1 text-white">DuckDuckGo Web Search</div>
                    <div className="text-xs text-neutral-400">
                      Працює автоматично без API-ключів. Шукає проіндексовані пости Threads.
                    </div>
                  </div>

                  <div
                    onClick={() => setFormData({ ...formData, provider: 'mock' })}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      formData.provider === 'mock'
                        ? 'border-purple-500 bg-purple-500/10 text-white'
                        : 'border-neutral-800 bg-neutral-950/40 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div className="font-semibold text-sm mb-1 text-white">Демо-генератор (Mock)</div>
                    <div className="text-xs text-neutral-400">
                      Для тестування та демонстрації інтерфейсу. Генерує свіжі ліди під Хорошоп.
                    </div>
                  </div>

                  <div
                    onClick={() => setFormData({ ...formData, provider: 'google' })}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      formData.provider === 'google'
                        ? 'border-purple-500 bg-purple-500/10 text-white'
                        : 'border-neutral-800 bg-neutral-950/40 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div className="font-semibold text-sm mb-1 text-white">Google Custom Search API</div>
                    <div className="text-xs text-neutral-400">
                      Офіційне Google CSE API (100 безкоштовних пошуків на день).
                    </div>
                  </div>

                  <div
                    onClick={() => setFormData({ ...formData, provider: 'serpapi' })}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      formData.provider === 'serpapi'
                        ? 'border-purple-500 bg-purple-500/10 text-white'
                        : 'border-neutral-800 bg-neutral-950/40 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div className="font-semibold text-sm mb-1 text-white">SerpAPI (Google Engine)</div>
                    <div className="text-xs text-neutral-400">
                      Професійний API парсингу Google пошуку з геоприв'язкою до України.
                    </div>
                  </div>
                </div>
              </div>

              {/* Provider details */}
              {formData.provider === 'google' && (
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Google API Key
                    </label>
                    <input
                      type="password"
                      value={formData.googleApiKey}
                      onChange={(e) => setFormData({ ...formData, googleApiKey: e.target.value })}
                      placeholder="AIzaSy..."
                      className="w-full text-xs px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-750 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Custom Search Engine ID (cx)
                    </label>
                    <input
                      type="text"
                      value={formData.googleCseId}
                      onChange={(e) => setFormData({ ...formData, googleCseId: e.target.value })}
                      placeholder="b928..."
                      className="w-full text-xs px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-750 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              )}

              {formData.provider === 'serpapi' && (
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    SerpAPI Key
                  </label>
                  <input
                    type="password"
                    value={formData.serpApiKey}
                    onChange={(e) => setFormData({ ...formData, serpApiKey: e.target.value })}
                    placeholder="Введіть ваш SerpAPI ключ..."
                    className="w-full text-xs px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-750 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              )}

              {/* Schedule */}
              <div className="pt-4 border-t border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                      Автоматичне фонове сканування
                    </label>
                    <p className="text-xs text-neutral-400">
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
                    <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                      Частота перевірки:
                    </label>
                    <select
                      value={formData.scanIntervalMinutes}
                      onChange={(e) => setFormData({ ...formData, scanIntervalMinutes: Number(e.target.value) })}
                      className="w-full text-xs px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-750 text-white focus:outline-none focus:border-purple-500"
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
              <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <Send className="w-4 h-4 text-cyan-400" />
                    Миттєві сповіщення у Telegram
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
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
                  className="w-5 h-5 accent-cyan-500 rounded cursor-pointer"
                />
              </div>

              {formData.telegram.enabled && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
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
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-750 text-white focus:outline-none focus:border-cyan-500"
                    />
                    <p className="text-[11px] text-neutral-500 mt-1">
                      Отримайте у @BotFather в Telegram (команда /newbot)
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
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
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-750 text-white focus:outline-none focus:border-cyan-500"
                    />
                    <p className="text-[11px] text-neutral-500 mt-1">
                      Дізнайтесь свій ID через бота @userinfobot або @getmyid_bot
                    </p>
                  </div>

                  {testStatus && (
                    <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                      testStatus.type === 'success'
                        ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800'
                        : 'bg-rose-950/40 text-rose-300 border border-rose-800'
                    }`}>
                      {testStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                      <span>{testStatus.message}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleTestTelegram}
                    disabled={isTesting || !formData.telegram.botToken || !formData.telegram.chatId}
                    className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-2 border border-neutral-700 disabled:opacity-50 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isTesting ? 'Надсилання...' : 'Перевірити зʼєднання з Telegram'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              Скасувати
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-purple-900/40 transition-colors"
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
