import express from 'express';
import { db } from '../db/database.js';
import { updateScheduler } from '../services/scheduler.js';
import { testTelegramConnection } from '../services/telegram.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const settings = db.getSettings();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    const updated = db.updateSettings(req.body);
    updateScheduler(); // Reschedule if interval or autoScanEnabled changed
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/test-telegram', async (req, res) => {
  try {
    const { botToken, chatId } = req.body;
    const settings = db.getSettings();
    const token = botToken || settings.telegram?.botToken;
    const chat = chatId || settings.telegram?.chatId;

    if (!token || !chat) {
      return res.status(400).json({ error: 'Вкажіть Bot Token та Chat ID' });
    }

    const result = await testTelegramConnection(token, chat);
    res.json({ success: true, result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
