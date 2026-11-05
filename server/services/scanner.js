import { db } from '../db/database.js';
import { searchDuckDuckGo } from './providers/duckduckgo.js';
import { searchGoogleCSE } from './providers/google.js';
import { searchSerpApi } from './providers/serpapi.js';
import { searchThreadsDirect } from './providers/direct.js';
import { sendTelegramNotification } from './telegram.js';

class ScannerService {
  constructor() {
    this.isScanning = false;
    this.lastScanTime = null;
    this.lastScanSummary = null;
  }

  async runScan({ forceProvider = null } = {}) {
    if (this.isScanning) {
      return { status: 'already_running', message: 'Сканування вже виконується...' };
    }

    this.isScanning = true;
    const startTime = Date.now();
    const settings = db.getSettings();
    const provider = forceProvider || settings.provider || 'duckduckgo';

    console.log(`[Scanner] Запуск пошуку реальних постів Threads через: ${provider}`);

    try {
      let rawPosts = [];

      // 1. Authenticated direct Threads search (if session cookie provided)
      if (settings.threadsCookie && (provider === 'direct' || !provider)) {
        rawPosts = await searchThreadsDirect(
          settings.keywords,
          settings.negativeKeywords,
          settings.threadsCookie
        );
      } else if (provider === 'google' && settings.googleApiKey && settings.googleCseId) {
        // 2. Google Custom Search API
        rawPosts = await searchGoogleCSE(
          settings.keywords,
          settings.negativeKeywords,
          settings.googleApiKey,
          settings.googleCseId
        );
      } else if (provider === 'serpapi' && settings.serpApiKey) {
        // 3. SerpAPI Google
        rawPosts = await searchSerpApi(
          settings.keywords,
          settings.negativeKeywords,
          settings.serpApiKey
        );
      } else {
        // 4. Default web search
        rawPosts = await searchDuckDuckGo(
          settings.keywords,
          settings.negativeKeywords
        );
      }

      // Add only real verified posts (deduplicates by URL)
      const addedPosts = db.addPosts(rawPosts);

      // Send telegram notifications only for real added posts
      if (settings.telegram?.enabled && settings.telegram?.botToken && settings.telegram?.chatId) {
        for (const post of addedPosts) {
          try {
            await sendTelegramNotification(
              settings.telegram.botToken,
              settings.telegram.chatId,
              post
            );
          } catch (tErr) {
            console.error('[Scanner] Помилка відправки в Telegram:', tErr.message);
          }
        }
      }

      this.lastScanTime = new Date().toISOString();
      this.lastScanSummary = {
        provider,
        foundTotal: rawPosts.length,
        newAdded: addedPosts.length,
        durationMs: Date.now() - startTime
      };

      db.addScanLog({
        status: 'success',
        provider,
        foundCount: rawPosts.length,
        newCount: addedPosts.length,
        durationMs: Date.now() - startTime,
        message: addedPosts.length > 0 
          ? `Успішно знайдено ${addedPosts.length} нових постів у Threads.`
          : `Сканування завершено. Нових постів наразі не виявлено.`
      });

      return {
        status: 'success',
        summary: this.lastScanSummary,
        newPosts: addedPosts
      };
    } catch (err) {
      console.error('[Scanner] Помилка під час сканування:', err);

      db.addScanLog({
        status: 'error',
        provider,
        message: `Помилка сканування: ${err.message}`
      });

      return {
        status: 'error',
        message: err.message
      };
    } finally {
      this.isScanning = false;
    }
  }

  getStatus() {
    return {
      isScanning: this.isScanning,
      lastScanTime: this.lastScanTime,
      lastScanSummary: this.lastScanSummary
    };
  }
}

export const scanner = new ScannerService();
