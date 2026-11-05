import express from 'express';
import { db } from '../db/database.js';

const router = express.Router();

// Get paginated / filtered posts
router.get('/', (req, res) => {
  try {
    const { status, search, tag, page, limit } = req.query;
    const result = db.getPosts({
      status: status || 'all',
      search: search || '',
      tag: tag || '',
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 50
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single post
router.get('/:id', (req, res) => {
  try {
    const post = db.getPostById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Пост не знайдено' });
    }
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update post (status, notes, tags)
router.patch('/:id', (req, res) => {
  try {
    const updated = db.updatePost(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Пост не знайдено' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete post
router.delete('/:id', (req, res) => {
  try {
    const ok = db.deletePost(req.params.id);
    if (!ok) {
      return res.status(404).json({ error: 'Пост не знайдено' });
    }
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add manual post (e.g. if user saw a post in Threads and wants to paste link)
router.post('/manual', (req, res) => {
  try {
    const { url, author, content, tags = [] } = req.body;
    if (!url || !content) {
      return res.status(400).json({ error: 'Вкажіть URL та текст посту' });
    }

    const cleanAuthor = author || 'threads_user';
    const newPost = {
      id: `th_manual_${Date.now()}`,
      author: cleanAuthor,
      authorName: `@${cleanAuthor}`,
      authorUrl: url.startsWith('http') ? url : `https://www.threads.net/@${cleanAuthor}`,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanAuthor)}&background=ec4899&color=fff&bold=true`,
      url,
      content,
      matchedKeywords: ['Додано вручну'],
      date: new Date().toISOString(),
      source: 'Вручну',
      status: 'new',
      notes: '',
      tags: [...tags, 'Ручне додавання'],
      score: 100
    };

    const added = db.addPosts([newPost]);
    res.status(201).json(added[0] || newPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

