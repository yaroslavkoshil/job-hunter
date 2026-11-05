import express from 'express';
import { scanner } from '../services/scanner.js';
import { db } from '../db/database.js';

const router = express.Router();

// Trigger scan
router.post('/', async (req, res) => {
  try {
    const { provider } = req.body || {};
    const result = await scanner.runScan({ forceProvider: provider });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get scanner status
router.get('/status', (req, res) => {
  res.json(scanner.getStatus());
});

// Get scan history logs
router.get('/logs', (req, res) => {
  res.json(db.getScanLogs());
});

export default router;
