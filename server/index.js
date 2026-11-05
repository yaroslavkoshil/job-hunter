import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import postsRouter from './routes/posts.js';
import settingsRouter from './routes/settings.js';
import scanRouter from './routes/scan.js';
import statsRouter from './routes/stats.js';
import { initScheduler } from './services/scheduler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/posts', postsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/scan', scanRouter);
app.use('/api/stats', statsRouter);

// Serve frontend static build files if available
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));

// Fallback for SPA router
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(publicDir, 'index.html'), err => {
    if (err) {
      res.status(200).send('API Server running. Please build client with `npm run build` to view web UI.');
    }
  });
});

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 Threads Job Hunter Server запущено!`);
  console.log(`📡 URL сервера: http://localhost:${PORT}`);
  console.log(`=========================================`);

  // Start background auto-scanner scheduler
  initScheduler();
});

