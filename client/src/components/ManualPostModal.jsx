import React, { useState } from 'react';
import { X, PlusCircle, Link as LinkIcon } from 'lucide-react';

export default function ManualPostModal({ isOpen, onClose, onAddPost, theme }) {
  const [url, setUrl] = useState('');
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  if (!isOpen) return null;

  const isLight = theme === 'light';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim() || !content.trim()) return;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border transition-colors ${
        isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-neutral-900 border-neutral-800 text-neutral-100'
      }`}>
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isLight ? 'border-slate-200 bg-slate-50' : 'border-neutral-800'
        }`}>
          <h2 className={`text-base font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <PlusCircle className="w-5 h-5 text-purple-600" />
            Додати пост вручну
          </h2>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-neutral-300'}`}>
              Посилання на пост у Threads *
            </label>
            <div className="relative">
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.threads.net/@username/post/..."
                className={`w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border focus:outline-none focus:border-purple-500 ${
                  isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-neutral-950 border-neutral-750 text-white'
                }`}
              />
              <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-neutral-300'}`}>
              Нікнейм автора (необов'язково)
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="username (якщо пусто, визначиться з лінка)"
              className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:border-purple-500 ${
                isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-neutral-950 border-neutral-750 text-white'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-neutral-300'}`}>
              Текст посту / запиту клієнта *
            </label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Вставте текст повідомлення з Threads (наприклад: Шукаю розробника на Хорошоп, треба перенести 2000 товарів)..."
              className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:border-purple-500 resize-none ${
                isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-neutral-950 border-neutral-750 text-white'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-neutral-300'}`}>
              Теги (через кому)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Терміново, Міграція, Фільтри"
              className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:border-purple-500 ${
                isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-neutral-950 border-neutral-750 text-white'
              }`}
            />
          </div>

          <div className={`flex items-center justify-end gap-3 pt-3 border-t ${isLight ? 'border-slate-200' : 'border-neutral-800'}`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-xs font-semibold cursor-pointer ${
                isLight ? 'text-slate-500 hover:text-slate-800' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Скасувати
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-900/20 cursor-pointer"
            >
              Додати в кабінет
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
