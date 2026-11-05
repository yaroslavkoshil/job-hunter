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
  Info
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

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isManualAddOpen, setIsManualAddOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);

  // Toast notification
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'info' | 'error' }

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

  // Handle manual or automatic scan trigger
  const handleTriggerScan = async (provider = null) => {
    setIsScanning(true);
    showToast(`Запущено сканування Threads (${provider || settings?.provider || 'duckduckgo'})...`, 'info');

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
            ? `🎉 Знайдено та додано ${added} нових вакансій!`
            : 'Пошук завершено. Нових постів не виявлено.',
          'success'
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
        // Refresh stats
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

  // Extract all unique tags for filter pills
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
      // Status filter
      if (selectedStatus !== 'all' && post.status !== selectedStatus) {
        return false;
      }
      // Tag filter
      if (selectedTag && (!post.tags || !post.tags.includes(selectedTag))) {
        return false;
      }
      // Text search
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
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className={`px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 border ${
            toast.type === 'error'
              ? 'bg-rose-950/90 text-rose-200 border-rose-800'
              : toast.type === 'info'
              ? 'bg-indigo-950/90 text-indigo-200 border-indigo-800'
              : 'bg-emerald-950/90 text-emerald-200 border-emerald-800'
          }`}>
            {toast.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-400" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-indigo-400" />}
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        settings={settings}
        isScanning={isScanning}
        onTriggerScan={handleTriggerScan}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenManualAdd={() => setIsManualAddOpen(true)}
        onOpenLogs={() => setIsLogsOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8">
        {/* Banner with context */}
        <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-purple-900/30 via-indigo-900/20 to-neutral-900/50 border border-purple-800/30 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              🎯 Моніторинг замовлень та вакансій Хорошоп у Threads
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 mt-1 max-w-3xl">
              Система відстежує нові дописи в мережі Threads із запитами на кшталт <span className="text-purple-300 font-semibold">"шукаю розробника для хорошопу"</span>, <span className="text-purple-300 font-semibold">"потрібен спеціаліст Хорошоп"</span>, міграції та інтеграції.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTriggerScan('mock')}
              className="text-xs px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-300 border border-neutral-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Згенерувати тестовий лід для перевірки інтерфейсу"
            >
              <span>+ Тестовий лід</span>
            </button>
          </div>
        </div>

        {/* Metric Stats Cards */}
        <StatsCards stats={stats} onSelectStatus={setSelectedStatus} />

        {/* Controls: Search, Status Tabs, Filter Pills */}
        <div className="space-y-4 mb-6">
          {/* Status Tabs and Search Input */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 bg-neutral-900/80 p-1.5 rounded-xl border border-neutral-800/80">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedStatus(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedStatus === tab.id
                      ? 'bg-purple-600 text-white shadow-md'
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
                className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-purple-500 placeholder-neutral-500 transition-colors"
              />
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
            </div>
          </div>

          {/* Tag Pills */}
          {availableTags.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-neutral-500 text-[11px] font-semibold shrink-0 uppercase tracking-wider flex items-center gap-1 mr-1">
                <Tag className="w-3 h-3" />
                Теги:
              </span>
              <button
                onClick={() => setSelectedTag('')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition-all cursor-pointer ${
                  selectedTag === ''
                    ? 'bg-neutral-700 text-white'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
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
                      ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
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
            <RefreshCw className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-3" />
            <p className="text-xs text-neutral-400">Завантаження знайдених вакансій...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20 bg-neutral-900/30 border border-dashed border-neutral-800 rounded-3xl p-8">
            <FolderOpen className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-neutral-200">
              Постів не знайдено за заданими фільтрами
            </h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto">
              Спробуйте змінити пошуковий запит, очистити фільтри або запустити сканування Threads з кнопки зверху.
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => { setSelectedStatus('all'); setSelectedTag(''); setSearchQuery(''); }}
                className="px-3.5 py-2 text-xs rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-200 transition-colors cursor-pointer"
              >
                Скинути фільтри
              </button>
              <button
                onClick={() => handleTriggerScan()}
                className="px-4 py-2 text-xs rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-lg shadow-purple-900/30 transition-colors cursor-pointer"
              >
                Запустити сканування Threads
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
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-neutral-850 py-6 px-4 text-center text-xs text-neutral-500">
        <p>Threads Lead Hunter — пошук клієнтів та вакансій під платформу Хорошоп</p>
      </footer>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />

      <ManualPostModal
        isOpen={isManualAddOpen}
        onClose={() => setIsManualAddOpen(false)}
        onAddPost={handleAddManualPost}
      />

      <ScanLogsModal
        isOpen={isLogsOpen}
        onClose={() => setIsLogsOpen(false)}
      />
    </div>
  );
}
