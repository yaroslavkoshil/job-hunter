import React from 'react';
import { Sparkles, BellRing, Clock, CheckCircle2 } from 'lucide-react';

export default function StatsCards({ stats, onSelectStatus, theme }) {
  if (!stats) return null;

  const isLight = theme === 'light';

  const cards = [
    {
      id: 'all',
      title: 'Всього знайдено',
      value: stats.total || 0,
      icon: Sparkles,
      lightBg: 'bg-white border-purple-200/80 text-purple-700 shadow-xs hover:border-purple-300',
      darkBg: 'from-purple-500/20 to-indigo-500/20 text-purple-400 border-purple-500/30',
      iconBg: isLight ? 'bg-purple-50 text-purple-600' : 'bg-neutral-900/60'
    },
    {
      id: 'new',
      title: 'Нові (без відповіді)',
      value: stats.newCount || 0,
      icon: BellRing,
      lightBg: 'bg-white border-amber-200/80 text-amber-700 shadow-xs hover:border-amber-300',
      darkBg: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
      iconBg: isLight ? 'bg-amber-50 text-amber-600' : 'bg-neutral-900/60',
      badge: stats.newCount > 0 ? 'Потрібна реакція' : null
    },
    {
      id: 'today',
      title: 'Знайдено за 24г',
      value: stats.todayCount || 0,
      icon: Clock,
      lightBg: 'bg-white border-blue-200/80 text-blue-700 shadow-xs hover:border-blue-300',
      darkBg: 'from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30',
      iconBg: isLight ? 'bg-blue-50 text-blue-600' : 'bg-neutral-900/60'
    },
    {
      id: 'contacted',
      title: 'Відгукнувся / В роботі',
      value: (stats.contactedCount || 0) + (stats.inProgressCount || 0),
      icon: CheckCircle2,
      lightBg: 'bg-white border-emerald-200/80 text-emerald-700 shadow-xs hover:border-emerald-300',
      darkBg: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
      iconBg: isLight ? 'bg-emerald-50 text-emerald-600' : 'bg-neutral-900/60'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            onClick={() => onSelectStatus && onSelectStatus(card.id === 'today' ? 'all' : card.id)}
            className={`p-4 rounded-2xl border transition-all duration-200 hover:scale-[1.02] cursor-pointer ${
              isLight ? card.lightBg : `bg-gradient-to-br backdrop-blur-sm ${card.darkBg}`
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-bold uppercase tracking-wider ${
                isLight ? 'text-slate-500' : 'text-neutral-400'
              }`}>
                {card.title}
              </span>
              <div className={`p-2 rounded-xl ${card.iconBg}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className={`text-3xl font-black tracking-tight ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                {card.value}
              </span>
              {card.badge && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border animate-pulse ${
                  isLight
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  {card.badge}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
