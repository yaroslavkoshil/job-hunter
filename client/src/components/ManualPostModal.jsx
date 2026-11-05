import React, { useState } from 'react';
import { X, PlusCircle, Link as LinkIcon } from 'lucide-react';

export default function ManualPostModal({ isOpen, onClose, onAddPost }) {
  const [url, setUrl] = useState('');
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim() || !content.trim()) return;

    // extract author from url if empty
    let detectedAuthor = author.trim();
    if (!detectedAuthor && url.includes('threads.net/@')) {
      const match = url.match(/threads\.net\/@([a-zA-Z0-9._]+)/);
      if (match && match[1]) detectedAuthor = match[1];
    }

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    onAddPost({
      url: url.trim(),
      author: detectedAuthor || 'threads_user',
      content: content.trim(),
      tags
    });

    setUrl('');
    setAuthor('');
    setContent('');
    setTagsInput('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-purple-400" />
            Додати пост вручну
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Посилання на пост у Threads *
            </label>
            <div className="relative">
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.threads.net/@username/post/..."
                className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-750 text-white focus:outline-none focus:border-purple-500"
              />
              <LinkIcon className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Нікнейм автора (необов'язково)
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="username (якщо пусто, визначиться з лінка)"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-750 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Текст посту / запиту клієнта *
            </label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Вставте текст повідомлення з Threads (наприклад: Шукаю розробника на Хорошоп, треба перенести 2000 товарів)..."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-750 text-white focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Теги (через кому)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Терміново, Міграція, Фільтри"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-750 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white"
            >
              Скасувати
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/30"
            >
              Додати в кабінет
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
