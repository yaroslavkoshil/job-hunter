import { db } from '../db/database.js';
import { searchDuckDuckGo } from './providers/duckduckgo.js';
import { searchGoogleCSE } from './providers/google.js';
import { searchSerpApi } from './providers/serpapi.js';
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

      switch (provider) {
        case 'google':
          rawPosts = await searchGoogleCSE(
            settings.keywords,
            settings.negativeKeywords,
            settings.googleApiKey,
            settings.googleCseId
          );
          break;

        case 'serpapi':
          rawPosts = await searchSerpApi(
            settings.keywords,
            settings.negativeKeywords,
            settings.serpApiKey
          );
          break;

        case 'mock':
          rawPosts = generateMockLeads(settings.keywords);
          break;

        case 'duckduckgo':
        default:
          rawPosts = await searchDuckDuckGo(
            settings.keywords,
            settings.negativeKeywords
          );
          break;
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
        message: `Успішно проскановано. Знайдено ${rawPosts.length} постів, нових додано: ${addedPosts.length}.`
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
