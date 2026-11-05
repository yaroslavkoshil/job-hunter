import cron from 'node-cron';
import { db } from '../db/database.js';
import { scanner } from './scanner.js';

let cronTask = null;

export function initScheduler() {
  updateScheduler();
}

export function updateScheduler() {
  if (cronTask) {
    cronTask.stop();
    cronTask = null;
  }

  const settings = db.getSettings();

  if (!settings.autoScanEnabled) {
    console.log('[Scheduler] Авто-сканування вимкнено в налаштуваннях.');
    return;
  }

  const interval = Math.max(5, settings.scanIntervalMinutes || 30);
  // cron expression for every X minutes: */X * * * *
  const cronExpression = `*/${interval} * * * *`;

  console.log(`[Scheduler] Авто-сканування заплановано кожні ${interval} хв (${cronExpression})`);

  cronTask = cron.schedule(cronExpression, async () => {
    console.log('[Scheduler] Запуск планового сканування вакансій у Threads...');
    try {
      await scanner.runScan();
    } catch (err) {
      console.error('[Scheduler] Помилка планового сканування:', err);
    }
  });
}

