import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useI18n } from '../context/I18nContext';
import { useGame } from '../context/GameContext';
import { ZharCardTile } from '../components/ZharCardTile';
import { CardDetailModal } from '../components/CardDetailModal';
import type { Card, ElementType, Rarity } from '../types/zhar';
import { RARITY_ORDER } from '../utils/gameLogic';

export function DiscoverPage() {
  const { t } = useI18n();
  const { cards } = useGame();

  const [queryText, setQueryText] = useState('');
  const [rarityFilter, setRarityFilter] = useState<'ALL' | Rarity>('ALL');
  const [elementFilter, setElementFilter] = useState<'ALL' | ElementType>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'OFFICIAL' | 'CUSTOM'>('ALL');
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  const filtered = cards.filter((card) => {
    if (rarityFilter !== 'ALL' && card.rarity !== rarityFilter) return false;
    if (elementFilter !== 'ALL' && card.element !== elementFilter) return false;
    if (typeFilter === 'OFFICIAL' && !card.isOfficial) return false;
    if (typeFilter === 'CUSTOM' && card.isOfficial) return false;
    if (queryText.trim()) {
      const q = queryText.toLowerCase();
      return (
        card.name.toLowerCase().includes(q) ||
        (card.nameEn || '').toLowerCase().includes(q) ||
        card.skillName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#101C32] dark:text-white">
          {t.nav.discover}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
          {t.landing.discoverDesc}
        </p>
      </div>

      {/* Filters */}
      <div className="rounded-2xl bg-white dark:bg-[#162644] border border-[#75C9FF]/30 p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder={t.collection.searchPlaceholder}
              aria-label={t.common.search}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[#F4FBFF] dark:bg-[#101C32] text-sm"
            />
          </div>

          <select
            value={elementFilter}
            onChange={(e) => setElementFilter(e.target.value as 'ALL' | ElementType)}
            aria-label={t.creator.element}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[#F4FBFF] dark:bg-[#101C32] text-sm"
          >
            <option value="ALL">{t.common.all} {t.creator.element}</option>
            {(['Fire', 'Water', 'Wind', 'Earth', 'Light', 'Dark', 'Ice', 'Thunder'] as ElementType[]).map(
              (el) => (
                <option key={el} value={el}>
                  {el}
                </option>
              )
            )}
          </select>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#DDF3FF]/60 dark:bg-[#101C32]">
            {(['ALL', 'OFFICIAL', 'CUSTOM'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setTypeFilter(tab)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  typeFilter === tab
                    ? 'bg-[#2377B9] text-white'
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                {tab === 'ALL'
                  ? t.common.all
                  : tab === 'OFFICIAL'
                  ? t.common.official
                  : t.common.custom}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setRarityFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              rarityFilter === 'ALL'
                ? 'bg-[#2377B9] text-white'
                : 'bg-[#F4FBFF] dark:bg-[#101C32] text-slate-700 dark:text-slate-300'
            }`}
          >
            {t.common.all}
          </button>
          {RARITY_ORDER.map((rarity) => (
            <button
              key={rarity}
              type="button"
              onClick={() => setRarityFilter(rarity)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                rarityFilter === rarity
                  ? 'bg-[#2377B9] text-white'
                  : 'bg-[#F4FBFF] dark:bg-[#101C32] text-slate-700 dark:text-slate-300'
              }`}
            >
              {rarity}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-[#162644] border border-[#75C9FF]/30 p-10 text-center text-sm text-slate-500 dark:text-slate-300">
          {t.collection.emptyState}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map((card) => (
            <ZharCardTile key={card.id} card={card} onSelect={setSelectedCard} />
          ))}
        </div>
      )}

      <CardDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />
    </div>
  );
}
