import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useI18n } from '../context/I18nContext';
import { useGame } from '../context/GameContext';
import type { Card, Rarity } from '../types/zhar';
import { RARITY_ORDER, RARITY_RANK } from '../utils/gameLogic';
import { ZharCardTile } from '../components/ZharCardTile';
import { CardDetailModal } from '../components/CardDetailModal';

export function CollectionPage() {
  const { t } = useI18n();
  const { cards, inventory, toggleFavoriteCard } = useGame();

  const [tab, setTab] = useState<'ALL' | 'OFFICIAL' | 'CUSTOM' | 'FAVORITES'>('ALL');
  const [rarityFilter, setRarityFilter] = useState<'ALL' | Rarity>('ALL');
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState<'rarity' | 'newest' | 'oldest'>('rarity');
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  const ownedEntries = inventory
    .map((item) => ({ item, card: cards.find((c) => c.id === item.cardId) }))
    .filter((entry): entry is { item: typeof entry.item; card: Card } => Boolean(entry.card));

  const officialCount = cards.filter((c) => c.isOfficial).length;
  const ownedOfficialUnique = ownedEntries.filter((e) => e.card.isOfficial).length;
  const completionPct =
    officialCount > 0 ? Math.min(100, Math.round((ownedOfficialUnique / officialCount) * 100)) : 0;

  const rarityCounts = RARITY_ORDER.reduce<Record<Rarity, number>>((acc, r) => {
    acc[r] = ownedEntries
      .filter((e) => e.card.rarity === r)
      .reduce((sum, e) => sum + e.item.quantity, 0);
    return acc;
  }, {} as Record<Rarity, number>);

  const filtered = ownedEntries
    .filter(({ item, card }) => {
      if (tab === 'OFFICIAL' && !card.isOfficial) return false;
      if (tab === 'CUSTOM' && card.isOfficial) return false;
      if (tab === 'FAVORITES' && !item.isFavorite) return false;
      if (rarityFilter !== 'ALL' && card.rarity !== rarityFilter) return false;
      if (searchText.trim()) {
        const q = searchText.toLowerCase();
        return (
          card.name.toLowerCase().includes(q) ||
          (card.nameEn || '').toLowerCase().includes(q) ||
          card.skillName.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'rarity') {
        return RARITY_RANK[b.card.rarity] - RARITY_RANK[a.card.rarity];
      }
      if (sortBy === 'newest') {
        return b.item.createdAt.localeCompare(a.item.createdAt);
      }
      return a.item.createdAt.localeCompare(b.item.createdAt);
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#101C32] dark:text-white">
            {t.collection.title}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            {t.collection.subtitle}
          </p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-[#162644] border border-[#75C9FF]/35 px-4 py-2.5 text-xs">
          <span className="text-slate-500 dark:text-slate-400">{t.collection.completionLabel}: </span>
          <span className="font-mono tabular-nums font-bold text-[#2377B9] dark:text-[#75C9FF]">
            {ownedOfficialUnique}/{officialCount} ({completionPct}%)
          </span>
        </div>
      </div>

      {/* Rarity Breakdown Strip */}
      <div className="rounded-2xl bg-white dark:bg-[#162644] border border-[#75C9FF]/30 p-4">
        <div className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-3">
          {t.collection.rarityBreakdown}
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 text-center">
          {RARITY_ORDER.map((r) => (
            <div
              key={r}
              className="rounded-xl bg-[#F4FBFF] dark:bg-[#101C32] border border-[#75C9FF]/20 py-2 px-1"
            >
              <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                {r}
              </div>
              <div className="font-mono tabular-nums font-bold text-sm text-[#101C32] dark:text-white">
                {rarityCounts[r]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters & Search */}
      <div className="rounded-2xl bg-white dark:bg-[#162644] border border-[#75C9FF]/30 p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder={t.collection.searchPlaceholder}
              aria-label={t.common.search}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[#F4FBFF] dark:bg-[#101C32] text-sm"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'rarity' | 'newest' | 'oldest')}
            aria-label="Sort cards"
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[#F4FBFF] dark:bg-[#101C32] text-sm"
          >
            <option value="rarity">{t.collection.sortRarity}</option>
            <option value="newest">{t.collection.sortNewest}</option>
            <option value="oldest">{t.collection.sortOldest}</option>
          </select>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#DDF3FF]/60 dark:bg-[#101C32]">
            {(
              [
                ['ALL', t.collection.tabAll],
                ['OFFICIAL', t.collection.tabOfficial],
                ['CUSTOM', t.collection.tabCustom],
                ['FAVORITES', t.collection.tabFavorites],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-colors truncate ${
                  tab === key ? 'bg-[#2377B9] text-white' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setRarityFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              rarityFilter === 'ALL'
                ? 'bg-[#2377B9] text-white'
                : 'bg-[#F4FBFF] dark:bg-[#101C32] text-slate-700 dark:text-slate-300'
            }`}
          >
            {t.common.all}
          </button>
          {RARITY_ORDER.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRarityFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                rarityFilter === r
                  ? 'bg-[#2377B9] text-white'
                  : 'bg-[#F4FBFF] dark:bg-[#101C32] text-slate-700 dark:text-slate-300'
              }`}
            >
              {r}
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
          {filtered.map(({ item, card }) => (
            <ZharCardTile
              key={card.id}
              card={card}
              quantity={item.quantity}
              isFavorite={item.isFavorite}
              onToggleFavorite={toggleFavoriteCard}
              onSelect={setSelectedCard}
            />
          ))}
        </div>
      )}

      <CardDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />
    </div>
  );
}
