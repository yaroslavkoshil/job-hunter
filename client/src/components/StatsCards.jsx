import React from 'react';
import { Sparkles, BellRing, Clock, CheckCircle2 } from 'lucide-react';

export default function StatsCards({ stats, onSelectStatus }) {
  if (!stats) return null;

  const cards = [
    {
      id: 'all',
      title: 'Всього знайдено',
      value: stats.total || 0,
      icon: Sparkles,
      color: 'from-purple-500/20 to-indigo-500/20 text-purple-400 border-purple-500/30',
      textColor: 'text-purple-300'
    },
    {
      id: 'new',
      title: 'Нові (без відповіді)',
      value: stats.newCount || 0,
      icon: BellRing,
      color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
      textColor: 'text-amber-300',
      badge: stats.newCount > 0 ? 'Потрібна реакція' : null
    },
    {
      id: 'today',
      title: 'Знайдено за 24г',
      value: stats.todayCount || 0,
      icon: Clock,
      color: 'from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30',
      textColor: 'text-cyan-300'
    },
    {
      id: 'contacted',
      title: 'Відгукнувся / В роботі',
      value: (stats.contactedCount || 0) + (stats.inProgressCount || 0),
      icon: CheckCircle2,
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
      textColor: 'text-emerald-300'
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
            className={`p-4 rounded-xl border bg-gradient-to-br backdrop-blur-sm cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${card.color}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
                {card.title}
              </span>
              <div className="p-2 rounded-lg bg-neutral-900/60">
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold tracking-tight text-white">
                {card.value}
              </span>
              {card.badge && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
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
