import React, { useState } from 'react';
import {
  ExternalLink,
  MessageSquare,
  Copy,
  Check,
  Trash2,
  Bookmark,
  ChevronDown,
  Tag,
  Clock,
  Sparkles
} from 'lucide-react';
import { timeAgo, highlightKeywords } from '../utils/format';

const STATUS_CONFIG = {
  new: {
    label: 'Нова вакансія',
    bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    dot: 'bg-amber-400'
  },
  contacted: {
    label: 'Відгукнувся',
    bg: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    dot: 'bg-blue-400'
  },
  in_progress: {
    label: 'В роботі',
    bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    dot: 'bg-emerald-400'
  },
  archived: {
    label: 'В архіві',
    bg: 'bg-neutral-800 text-neutral-400 border-neutral-700',
    dot: 'bg-neutral-500'
  }
};

export default function PostCard({ post, onUpdateStatus, onUpdateNotes, onDelete }) {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState(post.notes || '');
  const [isCopied, setIsCopied] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const status = STATUS_CONFIG[post.status] || STATUS_CONFIG.new;

  const handleSaveNotes = () => {
    setIsEditingNotes(false);
    if (notesText !== post.notes) {
      onUpdateNotes(post.id, notesText);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(post.url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const highlighted = highlightKeywords(post.content, post.matchedKeywords);

  return (
    <div className={`p-5 rounded-2xl border transition-all duration-200 bg-neutral-900/60 backdrop-blur-md hover:border-neutral-700 shadow-md ${
      post.status === 'new' ? 'border-amber-500/20 shadow-amber-950/10' : 'border-neutral-800'
    }`}>
      {/* Header: Author + Meta + Status */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <img
            src={post.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author)}`}
            alt={post.author}
            className="w-11 h-11 rounded-full ring-2 ring-neutral-700/60 object-cover bg-neutral-800"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author)}&background=7c3aed&color=fff`;
            }}
          />
          <div>
            <div className="flex items-center gap-2">
              <a
                href={post.authorUrl || post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-white hover:text-purple-400 transition-colors flex items-center gap-1 group"
              >
                {post.authorName || `@${post.author}`}
              </a>
              {post.score && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  {post.score}% релевантність
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
              <span>@{post.author}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeAgo(post.date)}
              </span>
              <span>•</span>
              <span className="text-neutral-500">{post.source || 'Threads'}</span>
            </div>
          </div>
        </div>

        {/* Status Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all ${status.bg}`}
          >
            <span className={`w-2 h-2 rounded-full ${status.dot}`} />
            {status.label}
            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
          </button>

          {showStatusMenu && (
            <div className="absolute right-0 mt-1 w-44 rounded-xl bg-neutral-900 border border-neutral-750 shadow-xl z-20 py-1 overflow-hidden">
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => {
                    onUpdateStatus(post.id, key);
                    setShowStatusMenu(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2.5 hover:bg-neutral-800 transition-colors ${
                    post.status === key ? 'text-white font-semibold bg-neutral-800/60' : 'text-neutral-400'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${config.dot}`} />
                  {config.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Post Text */}
      <div className="text-neutral-200 text-sm leading-relaxed mb-4 whitespace-pre-line bg-neutral-950/40 p-3.5 rounded-xl border border-neutral-800/80">
        {highlighted.map((chunk, i) =>
          chunk.isMatch ? (
            <mark
              key={i}
              className="bg-purple-500/25 text-purple-200 font-semibold px-1 py-0.5 rounded border border-purple-500/40"
            >
              {chunk.text}
            </mark>
          ) : (
            <span key={i}>{chunk.text}</span>
          )
        )}
      </div>

      {/* Keywords & Tags */}
      <div className="flex flex-wrap items-center gap-1.5 mb-4">
        {post.matchedKeywords && post.matchedKeywords.map((kw, i) => (
          <span
            key={`kw-${i}`}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-neutral-800 text-purple-300 border border-neutral-700/80 font-medium"
          >
            🔍 {kw}
          </span>
        ))}
        {post.tags && post.tags.map((tag, i) => (
          <span
            key={`tag-${i}`}
            className="text-[11px] px-2 py-0.5 rounded-md bg-neutral-800/60 text-neutral-300 border border-neutral-700/50 flex items-center gap-1"
          >
            <Tag className="w-2.5 h-2.5 text-neutral-400" />
            {tag}
          </span>
        ))}
      </div>

      {/* Notes Section */}
      <div className="mb-4">
        {isEditingNotes ? (
          <div className="flex flex-col gap-2">
            <textarea
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="Додайте власну замітку (наприклад: Написав у дірект, бюджет 12 000 грн)..."
              className="w-full text-xs p-2.5 rounded-lg bg-neutral-950 border border-purple-500/50 text-neutral-100 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none h-20"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setNotesText(post.notes || '');
                  setIsEditingNotes(false);
                }}
                className="px-2.5 py-1 text-xs text-neutral-400 hover:text-white"
              >
                Скасувати
              </button>
              <button
                onClick={handleSaveNotes}
                className="px-3 py-1 text-xs rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium"
              >
                Зберегти
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => setIsEditingNotes(true)}
            className="text-xs p-2.5 rounded-lg bg-neutral-950/60 border border-dashed border-neutral-800 hover:border-neutral-700 cursor-pointer text-neutral-400 transition-colors flex items-center justify-between"
          >
            <span className={post.notes ? 'text-neutral-200' : 'text-neutral-500 italic'}>
              {post.notes ? `📝 ${post.notes}` : '+ Додати особисту замітку до ліда...'}
            </span>
            <span className="text-[10px] text-neutral-600 uppercase font-mono">редагувати</span>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-neutral-800/80">
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopyLink}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors flex items-center gap-1.5 text-xs"
            title="Скопіювати посилання на пост"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{isCopied ? 'Скопійовано' : 'Лінк'}</span>
          </button>

          <button
            onClick={() => onDelete(post.id)}
            className="p-2 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-950/20 transition-colors flex items-center gap-1 text-xs"
            title="Видалити пост з кабінету"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <a
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>Відкрити у Threads</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
