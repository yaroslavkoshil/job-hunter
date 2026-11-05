import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const DEFAULT_SETTINGS = {
  keywords: [
    'шукаю розробника для хорошопу',
    'хорошоп робота',
    'потрібен розробник хорошоп',
    'доробити сайт на хорошоп',
    'перенести на хорошоп',
    'інтеграція хорошоп',
    'horoshop developer',
    'спеціаліст хорошоп'
  ],
  negativeKeywords: [
    'курси',
    'вебінар',
    'навчання',
    'шукаю роботу'
  ],
  scanIntervalMinutes: 30,
  autoScanEnabled: true,
  provider: 'duckduckgo', // 'duckduckgo' | 'google' | 'serpapi' | 'direct' | 'mock'
  googleApiKey: '',
  googleCseId: '',
  serpApiKey: '',
  telegram: {
    enabled: false,
    botToken: '',
    chatId: '',
    notifyOnNewPost: true
  }
};

const SEED_POSTS = [
  {
    id: "th_post_101",
    author: "olenka_ecommerce",
    authorName: "Олена Кравчук (Brand Shop)",
    authorUrl: "https://www.threads.net/@olenka_ecommerce",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    url: "https://www.threads.net/@olenka_ecommerce/post/DE81jlkA34z",
    content: "Терміново шукаю розробника для Хорошопу! Потрібно налаштувати кастомний фільтр товарів, підключити оплату частинами від Монобанку та поправити мобільну версію шапки. Хто вільний на цьому тижні, напишіть у приватні будь ласка з прикладами робіт або прайсом 🙌",
    matchedKeywords: ["шукаю розробника для хорошопу", "хорошоп"],
    date: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    source: "threads.net",
    status: "new", // 'new' | 'contacted' | 'in_progress' | 'archived' | 'rejected'
    notes: "",
    tags: ["Терміново", "Монобанк", "Кастомізація"],
    score: 95
  },
  {
    id: "th_post_102",
    author: "dmytro_b2b_trade",
    authorName: "Дмитро Савченко",
    authorUrl: "https://www.threads.net/@dmytro_b2b_trade",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    url: "https://www.threads.net/@dmytro_b2b_trade/post/DE7_abc8921",
    content: "Всім привіт! Переїжджаємо з Prom.ua на Хорошоп. Потрібен спеціаліст по Хорошопу, який допоможе грамотно перенести 4200 товарів зі збереженням структури категорій та налаштувати автоматичну синхронізацію залишків через 1С / BAS. Робота проектна, бюджет обговорюємо.",
    matchedKeywords: ["спеціаліст хорошоп", "перенести на хорошоп"],
    date: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
    source: "threads.net",
    status: "contacted",
    notes: "Написав у Threads 2 години тому, чекаю ТЗ на синхронізацію 1С.",
    tags: ["Міграція з Prom", "Синхронізація 1C", "Бюджетний"],
    score: 90
  },
  {
    id: "th_post_103",
    author: "artem_agency_pm",
    authorName: "Артем Мельник",
    authorUrl: "https://www.threads.net/@artem_agency_pm",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    url: "https://www.threads.net/@artem_agency_pm/post/DE62xx80801",
    content: "Агенція шукає надійного підрядника. Постійна робота: верстка та кастомізація інтернет-магазинів на Horoshop. Багато однотипних задач (банери, стилі, кастомні блоки, скрипти трекінгу Meta Pixel та GA4). Оплата за кожний виконаний таск.",
    matchedKeywords: ["хорошоп робота", "horoshop developer"],
    date: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(), // 18 hours ago
    source: "threads.net",
    status: "new",
    notes: "",
    tags: ["Партнерство", "Регулярні таски", "Аналітика"],
    score: 88
  },
  {
    id: "th_post_104",
    author: "victoria_fashion_ua",
    authorName: "Вікторія Ковальчук",
    authorUrl: "https://www.threads.net/@victoria_fashion_ua",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    url: "https://www.threads.net/@victoria_fashion_ua/post/DE5100xx771",
    content: "Дівчата й хлопці, хто розбирається в шаблонах Хорошопу? Хочемо освіжити дизайн шоуруму перед зимовим сезоном. Потрібно переробити сторінку товару і додати зручну розмірну сітку у попапі. Шукаємо розробника або верстальника з портфоліо робіт на хорошопі.",
    matchedKeywords: ["потрібен розробник хорошоп", "доробити сайт на хорошоп"],
    date: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), // 1.5 days ago
    source: "threads.net",
    status: "new",
    notes: "",
    tags: ["Редизайн", "UI/UX", "Шоурум"],
    score: 84
  }
];

class Database {
  constructor() {
    this.ensureDirectory();
    this.init();
  }

  ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  init() {
    if (!fs.existsSync(DB_FILE)) {
      const initialData = {
        posts: SEED_POSTS,
        settings: DEFAULT_SETTINGS,
        scanLogs: [
          {
            timestamp: new Date().toISOString(),
            status: 'success',
            foundCount: SEED_POSTS.length,
            message: 'Система ініціалізована. Початкові тестові ліди завантажено.'
          }
        ]
      };
      this.save(initialData);
    }
  }

  load() {
    try {
      if (!fs.existsSync(DB_FILE)) {
        this.init();
      }
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    } catch (err) {
      console.error('[DB] Помилка зчитування бази:', err);
      return { posts: [], settings: DEFAULT_SETTINGS, scanLogs: [] };
    }
  }

  save(data) {
    try {
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
      return true;
    } catch (err) {
      console.error('[DB] Помилка запису бази:', err);
      return false;
    }
  }

  // --- POSTS ---
  getPosts({ status, search, tag, limit = 100, page = 1 } = {}) {
    const data = this.load();
    let posts = data.posts || [];

    if (status && status !== 'all') {
      posts = posts.filter(p => p.status === status);
    }

    if (search) {
      const q = search.toLowerCase();
      posts = posts.filter(p =>
        (p.content && p.content.toLowerCase().includes(q)) ||
        (p.author && p.author.toLowerCase().includes(q)) ||
        (p.authorName && p.authorName.toLowerCase().includes(q)) ||
        (p.notes && p.notes.toLowerCase().includes(q))
      );
    }

    if (tag) {
      posts = posts.filter(p => p.tags && p.tags.includes(tag));
    }

    // Sort by date descending
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));

    const total = posts.length;
    const startIndex = (page - 1) * limit;
    const paginated = posts.slice(startIndex, startIndex + limit);

    return {
      total,
      page,
      limit,
      posts: paginated
    };
  }

  getPostById(id) {
    const data = this.load();
    return (data.posts || []).find(p => p.id === id);
  }

  addPosts(newPosts) {
    const data = this.load();
    const existingUrls = new Set((data.posts || []).map(p => p.url));
    const added = [];

    for (const post of newPosts) {
      if (!existingUrls.has(post.url)) {
        existingUrls.add(post.url);
        data.posts.unshift(post);
        added.push(post);
      }
    }

    if (added.length > 0) {
      this.save(data);
    }
    return added;
  }

  updatePost(id, updates) {
    const data = this.load();
    const idx = (data.posts || []).findIndex(p => p.id === id);
    if (idx === -1) return null;

    data.posts[idx] = {
      ...data.posts[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save(data);
    return data.posts[idx];
  }

  deletePost(id) {
    const data = this.load();
    const originalLen = (data.posts || []).length;
    data.posts = (data.posts || []).filter(p => p.id !== id);
    if (data.posts.length !== originalLen) {
      this.save(data);
      return true;
    }
    return false;
  }

  // --- SETTINGS ---
  getSettings() {
    const data = this.load();
    return {
      ...DEFAULT_SETTINGS,
      ...(data.settings || {})
    };
  }

  updateSettings(newSettings) {
    const data = this.load();
    data.settings = {
      ...(data.settings || DEFAULT_SETTINGS),
      ...newSettings
    };
    this.save(data);
    return data.settings;
  }

  // --- STATS ---
  getStats() {
    const data = this.load();
    const posts = data.posts || [];
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const total = posts.length;
    const newCount = posts.filter(p => p.status === 'new').length;
    const contactedCount = posts.filter(p => p.status === 'contacted').length;
    const inProgressCount = posts.filter(p => p.status === 'in_progress').length;
    const todayCount = posts.filter(p => new Date(p.date) >= oneDayAgo).length;

    return {
      total,
      newCount,
      contactedCount,
      inProgressCount,
      todayCount
    };
  }

  // --- LOGS ---
  addScanLog(logEntry) {
    const data = this.load();
    if (!data.scanLogs) data.scanLogs = [];
    data.scanLogs.unshift({
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...logEntry
    });
    // Keep max 50 logs
    if (data.scanLogs.length > 50) {
      data.scanLogs = data.scanLogs.slice(0, 50);
    }
    this.save(data);
  }

  getScanLogs() {
    const data = this.load();
    return data.scanLogs || [];
  }
}

export const db = new Database();
