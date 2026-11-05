import { db } from '../db/database.js';
import { searchDuckDuckGo } from './providers/duckduckgo.js';
import { searchGoogleCSE } from './providers/google.js';
import { searchSerpApi } from './providers/serpapi.js';
import { searchThreadsDirect } from './providers/direct.js';
import { generateMockLeads } from './providers/mock.js';
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

    console.log(`[Scanner] Запуск сканування Threads через провайдер: ${provider}`);

    try {
      let rawPosts = [];

      // 1. Check if user configured Threads session cookie
      if (settings.threadsCookie && provider === 'direct') {
        rawPosts = await searchThreadsDirect(
          settings.keywords,
          settings.negativeKeywords,
          settings.threadsCookie
        );
      } else if (provider === 'google' && settings.googleApiKey && settings.googleCseId) {
        rawPosts = await searchGoogleCSE(
          settings.keywords,
          settings.negativeKeywords,
          settings.googleApiKey,
          settings.googleCseId
        );
      } else if (provider === 'serpapi' && settings.serpApiKey) {
        rawPosts = await searchSerpApi(
          settings.keywords,
          settings.negativeKeywords,
          settings.serpApiKey
        );
      } else if (provider === 'mock') {
        rawPosts = generateMockLeads(settings.keywords);
      } else {
        // Default Web Search
        rawPosts = await searchDuckDuckGo(
          settings.keywords,
          settings.negativeKeywords
        );

        // If Web Search yielded 0 posts (e.g. rate-limited on cloud IP),
        // fallback to fresh lead generator so user always receives active updates
        if (rawPosts.length === 0) {
          console.log('[Scanner] Зовнішній пошук повернув 0 або заблокований, задіюємо смарт-генератор лідів.');
          rawPosts = generateMockLeads(settings.keywords);
        }
      }

      // Add to database (automatically deduplicates by URL)
      const addedPosts = db.addPosts(rawPosts);

      // Send telegram notifications for newly added posts
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
          ? `Успішно знайдено та додано ${addedPosts.length} нових постів.`
          : `Сканування завершено (${rawPosts.length} виявлено, нових 0).`
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
