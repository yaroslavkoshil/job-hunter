import express from 'express';
import { db } from '../db/database.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const stats = db.getStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

