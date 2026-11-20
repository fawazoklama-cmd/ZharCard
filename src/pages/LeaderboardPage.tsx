import React, { useState } from 'react';
import { Trophy } from 'lucide-react';
import { useI18n } from '../context/I18nContext';
import { useGame } from '../context/GameContext';

type CategoryKey = 'collectors' | 'battlers' | 'level' | 'legendary' | 'mythic';

export function LeaderboardPage() {
  const { t } = useI18n();
  const { leaderboard, profile } = useGame();
  const [category, setCategory] = useState<CategoryKey>('collectors');

  const sorted = [...leaderboard].sort((a, b) => {
    if (category === 'collectors') return b.totalCards - a.totalCards;
    if (category === 'battlers') return b.battleWins - a.battleWins;
    if (category === 'level') return b.level - a.level;
    if (category === 'legendary') return b.legendaryCount - a.legendaryCount;
    return b.mythicCount - a.mythicCount;
  });

  const statLabel = (entry: (typeof sorted)[number]) => {
    if (category === 'collectors') return `${entry.totalCards} Cards`;
    if (category === 'battlers') return `${entry.battleWins} Wins`;
    if (category === 'level') return `Level ${entry.level}`;
    if (category === 'legendary') return `${entry.legendaryCount} Legendary+`;
    return `${entry.mythicCount} Mythic+`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#101C32] dark:text-white flex items-center gap-2.5">
          <Trophy className="w-7 h-7 text-[#FFD76A]" />
          {t.leaderboard.title}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
          {t.leaderboard.subtitle}
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1.5 rounded-2xl bg-white dark:bg-[#162644] border border-[#75C9FF]/30 w-fit">
        {(
          [
            ['collectors', t.leaderboard.tabs.collectors],
            ['battlers', t.leaderboard.tabs.battlers],
            ['level', t.leaderboard.tabs.level],
            ['legendary', t.leaderboard.tabs.legendary],
            ['mythic', t.leaderboard.tabs.mythic],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setCategory(key)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
              category === key
                ? 'bg-[#2377B9] text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-[#DDF3FF] dark:hover:bg-slate-800'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Leaderboard Table */}
      <div className="rounded-3xl bg-white dark:bg-[#162644] border border-[#75C9FF]/35 overflow-hidden shadow-sm">
        <div className="grid grid-cols-12 px-5 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 bg-[#F4FBFF] dark:bg-[#101C32]">
          <div className="col-span-2">{t.leaderboard.rankCol}</div>
          <div className="col-span-6">{t.leaderboard.playerCol}</div>
          <div className="col-span-2 text-center">{t.leaderboard.levelCol}</div>
          <div className="col-span-2 text-right">{t.leaderboard.statCol}</div>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {sorted.map((entry, idx) => {
            const isCurrent = entry.userId === profile.uid;
            return (
              <div
                key={entry.userId}
                className={`grid grid-cols-12 items-center px-5 py-4 text-sm ${
                  isCurrent ? 'bg-[#DDF3FF]/50 dark:bg-[#1c335c]' : ''
                }`}
              >
                <div className="col-span-2 font-mono tabular-nums font-bold text-base text-[#2377B9] dark:text-[#75C9FF]">
                  #{idx + 1}
                </div>
                <div className="col-span-6 flex items-center gap-3 min-w-0">
                  <img
                    src={entry.avatar}
                    alt={entry.username}
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-xl object-cover border border-[#75C9FF]/40 shrink-0"
                  />
                  <span className="font-semibold text-[#101C32] dark:text-white truncate">
                    {entry.username}
                  </span>
                </div>
                <div className="col-span-2 text-center font-mono tabular-nums text-xs font-semibold">
                  Lv.{entry.level}
                </div>
                <div className="col-span-2 text-right font-mono tabular-nums text-xs sm:text-sm font-bold text-[#101C32] dark:text-[#FFD76A]">
                  {statLabel(entry)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
