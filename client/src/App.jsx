import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import StatsCards from './components/StatsCards';
import PostCard from './components/PostCard';
import SettingsModal from './components/SettingsModal';
import ManualPostModal from './components/ManualPostModal';
import ScanLogsModal from './components/ScanLogsModal';
import {
  Search,
  Filter,
  RefreshCw,
  FolderOpen,
  Tag,
  CheckCircle2,
  AlertTriangle,
  Info,
  ExternalLink,
  PlusCircle,
  Trash2
} from 'lucide-react';

const STATUS_TABS = [
  { id: 'all', label: 'Всі пости' },
  { id: 'new', label: '🔥 Нові' },
  { id: 'contacted', label: '💬 Відгукнувся' },
  { id: 'in_progress', label: '🚀 В роботі' },
  { id: 'archived', label: '📦 В архіві' }
];

export default function App() {
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState(null);
  const [settings, setSettings] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);

  // Theme state: defaults to 'light', persists in localStorage
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  const isLight = theme === 'light';

  useEffect(() => {
    document.body.className = theme;
    document.documentElement.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isManualAddOpen, setIsManualAddOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);

  // Toast notification
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch initial data
  const fetchData = async () => {
    try {
      const [postsRes, statsRes, settingsRes] = await Promise.all([
        fetch('/api/posts?limit=200'),
        fetch('/api/stats'),
        fetch('/api/settings')
      ]);

      const postsData = await postsRes.json();
      const statsData = await statsRes.json();
      const settingsData = await settingsRes.json();

      setPosts(postsData.posts || []);
      setStats(statsData);
      setSettings(settingsData);
    } catch (err) {
      console.error('Помилка завантаження даних:', err);
      showToast('Не вдалося зʼєднатися з сервером API', 'error');
    } finally {
      setIsLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle scan trigger
  const handleTriggerScan = async (provider = null) => {
    setIsScanning(true);
    const activeProvider = provider || settings?.provider || 'duckduckgo';
    showToast(`Запущено пошук реальних публікацій у Threads...`, 'info');

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider })
      });
      const data = await res.json();

      if (data.status === 'success') {
        const added = data.summary?.newAdded || 0;
        showToast(
          added > 0
            ? `🎉 Знайдено та додано ${added} нових реальних публікацій!`
            : 'Пошук завершено. Нових постів наразі не виявлено.',
          added > 0 ? 'success' : 'info'
        );
        fetchData();
      } else {
        showToast(`Помилка: ${data.message || 'Сканування не вдалося'}`, 'error');
      }
    } catch (err) {
      showToast(`Помилка запиту сканування: ${err.message}`, 'error');
    } finally {
      setIsScanning(false);
    }
  };

  // Update post status
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setPosts(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
        const statsRes = await fetch('/api/stats');
        setStats(await statsRes.json());
      }
    } catch (err) {
      showToast('Помилка оновлення статусу', 'error');
    }
  };

  // Update post notes
  const handleUpdateNotes = async (id, notes) => {
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      });
      if (res.ok) {
        setPosts(prev => prev.map(p => p.id === id ? { ...p, notes } : p));
        showToast('Замітку збережено', 'success');
      }
    } catch (err) {
      showToast('Помилка збереження замітки', 'error');
    }
  };

  // Delete post
  const handleDeletePost = async (id) => {
    if (!window.confirm('Видалити цей пост з кабінету?')) return;
    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPosts(prev => prev.filter(p => p.id !== id));
        showToast('Пост видалено', 'info');
        const statsRes = await fetch('/api/stats');
        setStats(await statsRes.json());
      }
    } catch (err) {
      showToast('Помилка видалення поста', 'error');
    }
  };

  // Clear all posts
  const handleClearAllPosts = async () => {
    if (!window.confirm('Ви впевнені, що хочете очистити всі пости з кабінету?')) return;
    try {
      const res = await fetch('/api/posts/clear-all', { method: 'POST' });
      if (res.ok) {
        setPosts([]);
        showToast('Всі пости видалено з кабінету', 'info');
        const statsRes = await fetch('/api/stats');
        setStats(await statsRes.json());
      }
    } catch (err) {
      showToast('Помилка очищення списку', 'error');
    }
  };

  // Add manual post
  const handleAddManualPost = async (postData) => {
    try {
      const res = await fetch('/api/posts/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Пост успішно додано у ваш кабінет!', 'success');
        fetchData();
      } else {
        showToast(data.error || 'Не вдалося додати пост', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Save settings
  const handleSaveSettings = async (newSettings) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      const data = await res.json();
      if (res.ok) {
        setSettings(data);
        showToast('Налаштування збережено!', 'success');
      }
    } catch (err) {
      showToast('Помилка збереження налаштувань', 'error');
    }
  };

  // Extract all unique tags
  const availableTags = useMemo(() => {
    const set = new Set();
    posts.forEach(p => {
      if (Array.isArray(p.tags)) {
        p.tags.forEach(t => set.add(t));
      }
    });
    return Array.from(set);
  }, [posts]);

  // Filtered posts
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      if (selectedStatus !== 'all' && post.status !== selectedStatus) {
        return false;
      }
      if (selectedTag && (!post.tags || !post.tags.includes(selectedTag))) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inContent = post.content && post.content.toLowerCase().includes(q);
        const inAuthor = (post.author && post.author.toLowerCase().includes(q)) ||
                         (post.authorName && post.authorName.toLowerCase().includes(q));
        const inNotes = post.notes && post.notes.toLowerCase().includes(q);
        return inContent || inAuthor || inNotes;
      }
      return true;
    });
  }, [posts, selectedStatus, selectedTag, searchQuery]);

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      isLight ? 'bg-[#f8fafc] text-slate-800' : 'bg-neutral-950 text-neutral-100'
    }`}>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className={`px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 border ${
            toast.type === 'error'
              ? 'bg-rose-600 text-white border-rose-700'
              : toast.type === 'info'
              ? 'bg-indigo-600 text-white border-indigo-700'
              : 'bg-emerald-600 text-white border-emerald-700'
          }`}>
            {toast.type === 'error' && <AlertTriangle className="w-4 h-4 text-white" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-white" />}
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-white" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        settings={settings}
        isScanning={isScanning}
        theme={theme}
        onToggleTheme={toggleTheme}
        onTriggerScan={handleTriggerScan}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenManualAdd={() => setIsManualAddOpen(true)}
        onOpenLogs={() => setIsLogsOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8">
        {/* Banner with context */}
        <div className={`mb-6 p-5 rounded-2xl border backdrop-blur-md flex flex-wrap items-center justify-between gap-4 transition-colors ${
          isLight
            ? 'bg-white border-purple-200 shadow-sm'
            : 'bg-gradient-to-r from-purple-900/30 via-indigo-900/20 to-neutral-900/50 border-purple-800/30'
        }`}>
          <div>
            <h1 className={`text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2 ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              🎯 Моніторинг замовлень та вакансій Хорошоп у Threads
            </h1>
            <p className={`text-xs sm:text-sm mt-1 max-w-3xl ${
              isLight ? 'text-slate-600' : 'text-neutral-300'
            }`}>
              Відстеження нових дописів у Threads зі словами <span className="font-semibold text-purple-600">"шукаю розробника для хорошопу"</span>, <span className="font-semibold text-purple-600">"потрібен спеціаліст Хорошоп"</span>, міграції з Prom та інтеграції.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://www.threads.net/search?q=%D1%85%D0%BE%D1%80%D0%BE%D1%88%D0%BE%D0%BF"
              target="_blank"
              rel="noopener noreferrer"
              className={`text-xs px-3.5 py-2 rounded-xl border flex items-center gap-1.5 font-semibold transition-colors ${
                isLight 
                  ? 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200' 
                  : 'bg-neutral-800 hover:bg-neutral-750 text-purple-300 border-neutral-700'
              }`}
            >
              <span>Пошук у Threads</span>
              <ExternalLink className="w-3.5 h-3.5 text-purple-600" />
            </a>
            {posts.length > 0 && (
              <button
                onClick={handleClearAllPosts}
                className={`text-xs p-2 rounded-xl border transition-colors cursor-pointer ${
                  isLight ? 'text-slate-400 hover:text-rose-600 border-slate-200 hover:bg-rose-50' : 'text-neutral-500 hover:text-rose-400 border-neutral-850 hover:bg-neutral-900'
                }`}
                title="Очистити всі пости з кабінету"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Metric Stats Cards */}
        <StatsCards stats={stats} onSelectStatus={setSelectedStatus} theme={theme} />

        {/* Controls: Search, Status Tabs, Filter Pills */}
        <div className="space-y-4 mb-6">
          {/* Status Tabs and Search Input */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Tabs */}
            <div className={`flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl border ${
              isLight ? 'bg-white border-slate-200 shadow-2xs' : 'bg-neutral-900/80 border-neutral-800/80'
            }`}>
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedStatus(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedStatus === tab.id
                      ? 'bg-purple-600 text-white shadow-xs'
                      : isLight 
                        ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' 
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[260px] md:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Пошук по тексту, ніку чи замітках..."
                className={`w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border focus:outline-none focus:border-purple-500 transition-colors ${
                  isLight 
                    ? 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 shadow-2xs' 
                    : 'bg-neutral-900 border-neutral-800 text-white placeholder-neutral-500'
                }`}
              />
              <Search className={`w-4 h-4 absolute left-3 top-3 ${isLight ? 'text-slate-400' : 'text-neutral-500'}`} />
            </div>
          </div>

          {/* Tag Pills */}
          {availableTags.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className={`text-[11px] font-semibold shrink-0 uppercase tracking-wider flex items-center gap-1 mr-1 ${
                isLight ? 'text-slate-500' : 'text-neutral-500'
              }`}>
                <Tag className="w-3 h-3" />
                Теги:
              </span>
              <button
                onClick={() => setSelectedTag('')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                  selectedTag === ''
                    ? isLight ? 'bg-slate-800 text-white' : 'bg-neutral-700 text-white'
                    : isLight ? 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                Всі
              </button>
              {availableTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition-all cursor-pointer ${
                    selectedTag === tag
                      ? isLight ? 'bg-purple-100 text-purple-800 border border-purple-300' : 'bg-purple-600/30 text-purple-300 border border-purple-500/50'
                      : isLight ? 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Posts Grid */}
        {isLoadingPosts ? (
          <div className="text-center py-20">
            <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>Завантаження вакансій...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className={`text-center py-16 border border-dashed rounded-3xl p-8 max-w-2xl mx-auto ${
            isLight ? 'bg-white border-slate-300 shadow-sm' : 'bg-neutral-900/30 border-neutral-800'
          }`}>
            <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-7 h-7" />
            </div>
            <h3 className={`text-base font-bold mb-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              У кабінеті поки немає збережених вакансій
            </h3>
            <p className={`text-xs leading-relaxed max-w-md mx-auto mb-6 ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
              Всі знайдені реальні дописи у Threads будуть зберігатися тут. Ви можете запустити сканування, відкрити пошук у самому Threads або додати знайдений пост вручну за посиланням.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => handleTriggerScan()}
                disabled={isScanning}
                className="px-4 py-2.5 text-xs rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-md shadow-purple-900/20 transition-all cursor-pointer flex items-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                <span>{isScanning ? 'Сканування...' : 'Шукати зараз'}</span>
              </button>

              <a
                href="https://www.threads.net/search?q=%D1%85%D0%BE%D1%80%D0%BE%D1%88%D0%BE%D0%BF"
                target="_blank"
                rel="noopener noreferrer"
                className={`px-4 py-2.5 text-xs rounded-xl border font-semibold transition-colors flex items-center gap-1.5 ${
                  isLight 
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200' 
                    : 'bg-neutral-800 hover:bg-neutral-750 text-neutral-200 border-neutral-700'
                }`}
              >
                <span>Відкрити пошук у Threads</span>
                <ExternalLink className="w-3.5 h-3.5 text-purple-600" />
              </a>

              <button
                onClick={() => setIsManualAddOpen(true)}
                className={`px-4 py-2.5 text-xs rounded-xl border font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  isLight 
                    ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300' 
                    : 'bg-neutral-900 hover:bg-neutral-850 text-neutral-300 border-neutral-800'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5 text-purple-600" />
                <span>Додати пост вручну</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onUpdateStatus={handleUpdateStatus}
                onUpdateNotes={handleUpdateNotes}
                onDelete={handleDeletePost}
                theme={theme}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={`mt-auto border-t py-6 px-4 text-center text-xs ${
        isLight ? 'bg-white border-slate-200 text-slate-500' : 'border-neutral-850 text-neutral-500'
      }`}>
        <p>Threads Lead Hunter — пошук клієнтів та вакансій під платформу Хорошоп</p>
      </footer>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        theme={theme}
      />

      <ManualPostModal
        isOpen={isManualAddOpen}
        onClose={() => setIsManualAddOpen(false)}
        onAddPost={handleAddManualPost}
        theme={theme}
      />

      <ScanLogsModal
        isOpen={isLogsOpen}
        onClose={() => setIsLogsOpen(false)}
        theme={theme}
      />
    </div>
  );
}
