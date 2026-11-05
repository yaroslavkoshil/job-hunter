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

const STATUS_CONFIG_LIGHT = {
  new: {
    label: 'Нова вакансія',
    bg: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100',
    dot: 'bg-amber-500'
  },
  contacted: {
    label: 'Відгукнувся',
    bg: 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100',
    dot: 'bg-blue-500'
  },
  in_progress: {
    label: 'В роботі',
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100',
    dot: 'bg-emerald-500'
  },
  archived: {
    label: 'В архіві',
    bg: 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200',
    dot: 'bg-slate-400'
  }
};

const STATUS_CONFIG_DARK = {
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

export default function PostCard({ post, onUpdateStatus, onUpdateNotes, onDelete, theme }) {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState(post.notes || '');
  const [isCopied, setIsCopied] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const isLight = theme === 'light';
  const statusConfig = isLight ? STATUS_CONFIG_LIGHT : STATUS_CONFIG_DARK;
  const status = statusConfig[post.status] || statusConfig.new;

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
    <div className={`p-5 rounded-2xl border transition-all duration-200 shadow-sm hover:shadow-md ${
      isLight 
        ? post.status === 'new' 
          ? 'bg-white border-amber-300 ring-1 ring-amber-100' 
          : 'bg-white border-slate-200 hover:border-slate-300'
        : post.status === 'new'
          ? 'bg-neutral-900/80 border-amber-500/30 shadow-amber-950/20'
          : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
    }`}>
      {/* Header: Author + Meta + Status */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <img
            src={post.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author)}`}
            alt={post.author}
            className={`w-11 h-11 rounded-full ring-2 object-cover ${
              isLight ? 'ring-slate-200 bg-slate-100' : 'ring-neutral-700/60 bg-neutral-800'
            }`}
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
                className={`font-bold transition-colors flex items-center gap-1 group ${
                  isLight ? 'text-slate-900 hover:text-purple-600' : 'text-white hover:text-purple-400'
                }`}
              >
                {post.authorName || `@${post.author}`}
              </a>
              {post.score && (
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                  isLight 
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                }`}>
                  <Sparkles className="w-2.5 h-2.5" />
                  {post.score}% релевантність
                </span>
              )}
            </div>
            <div className={`flex items-center gap-2 text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
              <span>@{post.author}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeAgo(post.date)}
              </span>
              <span>•</span>
              <span className={isLight ? 'text-slate-400' : 'text-neutral-500'}>{post.source || 'Threads'}</span>
            </div>
          </div>
        </div>

        {/* Status Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all cursor-pointer ${status.bg}`}
          >
            <span className={`w-2 h-2 rounded-full ${status.dot}`} />
            {status.label}
            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
          </button>

          {showStatusMenu && (
            <div className={`absolute right-0 mt-1 w-44 rounded-xl border shadow-xl z-20 py-1 overflow-hidden ${
              isLight ? 'bg-white border-slate-200' : 'bg-neutral-900 border-neutral-750'
            }`}>
              {Object.entries(statusConfig).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => {
                    onUpdateStatus(post.id, key);
                    setShowStatusMenu(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                    post.status === key 
                      ? isLight ? 'text-slate-900 font-bold bg-slate-100' : 'text-white font-bold bg-neutral-800'
                      : isLight ? 'text-slate-600 hover:bg-slate-50' : 'text-neutral-400 hover:bg-neutral-800'
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
      <div className={`text-sm leading-relaxed mb-4 whitespace-pre-line p-3.5 rounded-xl border ${
        isLight
          ? 'bg-slate-50/80 text-slate-800 border-slate-200/80'
          : 'bg-neutral-950/40 text-neutral-200 border-neutral-800/80'
      }`}>
        {highlighted.map((chunk, i) =>
          chunk.isMatch ? (
            <mark
              key={i}
              className={`font-semibold px-1 py-0.5 rounded border ${
                isLight
                  ? 'bg-purple-100 text-purple-900 border-purple-200'
                  : 'bg-purple-500/25 text-purple-200 border-purple-500/40'
              }`}
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
            className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium ${
              isLight
                ? 'bg-purple-50 text-purple-700 border-purple-200'
                : 'bg-neutral-800 text-purple-300 border-neutral-700/80'
            }`}
          >
            🔍 {kw}
          </span>
        ))}
        {post.tags && post.tags.map((tag, i) => (
          <span
            key={`tag-${i}`}
            className={`text-[11px] px-2 py-0.5 rounded-md border flex items-center gap-1 ${
              isLight
                ? 'bg-slate-100 text-slate-700 border-slate-200'
                : 'bg-neutral-800/60 text-neutral-300 border-neutral-700/50'
            }`}
          >
            <Tag className="w-2.5 h-2.5 opacity-60" />
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
              className={`w-full text-xs p-2.5 rounded-lg border focus:outline-none resize-none h-20 ${
                isLight
                  ? 'bg-white border-purple-400 text-slate-900 focus:ring-1 focus:ring-purple-400'
                  : 'bg-neutral-950 border-purple-500/50 text-neutral-100 focus:ring-1 focus:ring-purple-500'
              }`}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setNotesText(post.notes || '');
                  setIsEditingNotes(false);
                }}
                className={`px-2.5 py-1 text-xs cursor-pointer ${isLight ? 'text-slate-500 hover:text-slate-800' : 'text-neutral-400 hover:text-white'}`}
              >
                Скасувати
              </button>
              <button
                onClick={handleSaveNotes}
                className="px-3 py-1 text-xs rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium cursor-pointer"
              >
                Зберегти
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => setIsEditingNotes(true)}
            className={`text-xs p-2.5 rounded-lg border border-dashed cursor-pointer transition-colors flex items-center justify-between ${
              isLight
                ? 'bg-slate-50 border-slate-300 hover:border-slate-400 text-slate-600'
                : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 text-neutral-400'
            }`}
          >
            <span className={post.notes ? (isLight ? 'text-slate-800 font-medium' : 'text-neutral-200') : (isLight ? 'text-slate-400 italic' : 'text-neutral-500 italic')}>
              {post.notes ? `📝 ${post.notes}` : '+ Додати особисту замітку до ліда...'}
            </span>
            <span className={`text-[10px] uppercase font-mono ${isLight ? 'text-slate-400' : 'text-neutral-600'}`}>редагувати</span>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className={`flex flex-wrap items-center justify-between gap-2 pt-3 border-t ${
        isLight ? 'border-slate-100' : 'border-neutral-800/80'
      }`}>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopyLink}
            className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs cursor-pointer ${
              isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
            title="Скопіювати посилання на пост"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{isCopied ? 'Скопійовано' : 'Лінк'}</span>
          </button>

          <button
            onClick={() => onDelete(post.id)}
            className={`p-2 rounded-lg transition-colors flex items-center gap-1 text-xs cursor-pointer ${
              isLight
                ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                : 'text-neutral-500 hover:text-rose-400 hover:bg-rose-950/20'
            }`}
            title="Видалити пост з кабінету"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <a
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-purple-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>Відкрити у Threads</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
