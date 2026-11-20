import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Coins,
  Layers,
  Megaphone,
  PackageOpen,
  Swords,
  Trophy,
  Sparkles,
} from 'lucide-react';
import { useI18n } from '../context/I18nContext';
import { useGame } from '../context/GameContext';
import { calculateLevelFromExp } from '../utils/gameLogic';
import { DAILY_MISSIONS_CATALOG } from '../data/seedData';
import { ZharCardTile } from '../components/ZharCardTile';
import { CardDetailModal } from '../components/CardDetailModal';
import type { Card } from '../types/zhar';

export function DashboardPage() {
  const { lang, t } = useI18n();
  const {
    profile,
    cards,
    packs,
    inventory,
    transactions,
    announcements,
    missionProgress,
    claimMission,
    toggleFavoriteCard,
  } = useGame();

  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  const expInfo = calculateLevelFromExp(profile.exp);
  const officialTotal = cards.filter((c) => c.isOfficial).length;
  const ownedOfficialCount = inventory.filter((item) =>
    cards.some((c) => c.id === item.cardId && c.isOfficial)
  ).length;
  const completionPct =
    officialTotal > 0 ? Math.min(100, Math.round((ownedOfficialCount / officialTotal) * 100)) : 0;

  const recentCards = inventory
    .slice(0, 4)
    .map((item) => ({ item, card: cards.find((c) => c.id === item.cardId) }))
    .filter((pair): pair is { item: typeof pair.item; card: Card } => Boolean(pair.card));

  const favoriteCards = inventory
    .filter((i) => i.isFavorite)
    .slice(0, 4)
    .map((item) => ({ item, card: cards.find((c) => c.id === item.cardId) }))
    .filter((pair): pair is { item: typeof pair.item; card: Card } => Boolean(pair.card));

  const recommendedCards = cards
    .filter((c) => c.isOfficial && !inventory.some((i) => i.cardId === c.id))
    .slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Top Welcome Hero Card with Decorative Floating Sky Island SVG */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#2377B9] via-[#3d94d6] to-[#75C9FF] text-white p-6 sm:p-8 shadow-lg">
        {/* Floating Sky Island Illustration SVG */}
        <svg
          aria-hidden="true"
          viewBox="0 0 240 160"
          className="hidden md:block absolute right-6 bottom-2 w-52 opacity-90 pointer-events-none"
        >
          <ellipse cx="120" cy="135" rx="68" ry="12" fill="rgba(16,28,50,0.22)" />
          <path d="M55 82 L185 82 L150 130 L90 130 Z" fill="#2377B9" />
          <path d="M50 82 Q120 65 190 82 Q120 96 50 82 Z" fill="#DDF3FF" />
          <polygon points="118,24 134,74 102,74" fill="#FFFFFF" />
          <polygon points="145,42 156,76 134,76" fill="#BDEBFF" />
          <circle cx="84" cy="56" r="14" fill="#FFD76A" opacity="0.9" />
        </svg>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-5 max-w-2xl">
          <img
            src={profile.avatar}
            alt={profile.username}
            referrerPolicy="no-referrer"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white/80 shadow-md shrink-0"
          />
          <div className="flex-1 space-y-2">
            <div className="text-xs font-semibold text-[#DDF3FF]">
              {t.dashboard.welcomeBack}
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight">
              {profile.username}
            </h1>
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>
                  {t.dashboard.level} {expInfo.level}
                </span>
                <span className="font-mono tabular-nums">
                  {expInfo.currentLevelExp} / {expInfo.nextLevelExp} EXP
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-[#101C32]/30 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#FFD76A] transition-all duration-300"
                  style={{ width: `${expInfo.progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5 Key Statistics */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="rounded-2xl bg-white dark:bg-[#162644] border border-[#75C9FF]/30 p-4">
          <div className="text-xs text-slate-500 dark:text-slate-300">{t.dashboard.stats.totalCards}</div>
          <div className="font-display font-bold text-2xl font-mono tabular-nums mt-1">
            {profile.totalCards}
          </div>
        </div>
        <div className="rounded-2xl bg-white dark:bg-[#162644] border border-[#75C9FF]/30 p-4">
          <div className="text-xs text-slate-500 dark:text-slate-300">{t.dashboard.stats.packsOpened}</div>
          <div className="font-display font-bold text-2xl font-mono tabular-nums mt-1">
            {profile.totalPacksOpened}
          </div>
        </div>
        <div className="rounded-2xl bg-white dark:bg-[#162644] border border-[#75C9FF]/30 p-4">
          <div className="text-xs text-slate-500 dark:text-slate-300">{t.dashboard.stats.totalBattles}</div>
          <div className="font-display font-bold text-2xl font-mono tabular-nums mt-1">
            {profile.totalBattles}
          </div>
        </div>
        <div className="rounded-2xl bg-white dark:bg-[#162644] border border-[#75C9FF]/30 p-4">
          <div className="text-xs text-slate-500 dark:text-slate-300">{t.dashboard.stats.battleWins}</div>
          <div className="font-display font-bold text-2xl font-mono tabular-nums mt-1 text-[#2377B9] dark:text-[#75C9FF]">
            {profile.battleWins}
          </div>
        </div>
        <div className="rounded-2xl bg-white dark:bg-[#162644] border border-[#75C9FF]/30 p-4 col-span-2 sm:col-span-1">
          <div className="text-xs text-slate-500 dark:text-slate-300">{t.dashboard.stats.completion}</div>
          <div className="font-display font-bold text-2xl font-mono tabular-nums mt-1 text-emerald-600 dark:text-emerald-400">
            {completionPct}%
          </div>
        </div>
      </section>

      {/* Announcements + Daily Missions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-7 rounded-2xl bg-white dark:bg-[#162644] border border-[#75C9FF]/30 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg text-[#101C32] dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#2377B9] dark:text-[#75C9FF]" />
              {t.dashboard.dailyMissions}
            </h2>
            <span className="text-xs font-mono tabular-nums text-[#2377B9] dark:text-[#75C9FF] font-semibold">
              {profile.completedMissionIds.length}/{DAILY_MISSIONS_CATALOG.length}
            </span>
          </div>

          <div className="space-y-3">
            {DAILY_MISSIONS_CATALOG.map((mission) => {
              const current = Math.min(mission.targetCount, missionProgress[mission.id] || 0);
              const isClaimed = profile.completedMissionIds.includes(mission.id);
              const isReady = current >= mission.targetCount && !isClaimed;

              return (
                <div
                  key={mission.id}
                  className="rounded-xl bg-[#F4FBFF] dark:bg-[#101C32] border border-[#75C9FF]/25 p-3.5 flex flex-wrap items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-semibold text-sm text-[#101C32] dark:text-white">
                      {lang === 'en' ? mission.titleEn : mission.title}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono tabular-nums">
                      {current}/{mission.targetCount} · +{mission.rewardCoins} Coins · +{mission.rewardExp} EXP
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={!isReady}
                    onClick={() => void claimMission(mission.id)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                      isClaimed
                        ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                        : isReady
                        ? 'bg-[#2377B9] hover:bg-[#1b6199] text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {isClaimed ? (
                      <span className="inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {t.dashboard.claimed}
                      </span>
                    ) : isReady ? (
                      t.dashboard.claimReward
                    ) : (
                      t.dashboard.inProgress
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Announcements & Latest Activity */}
        <section className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl bg-white dark:bg-[#162644] border border-[#75C9FF]/30 p-6 space-y-3">
            <h2 className="font-display font-bold text-lg text-[#101C32] dark:text-white flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-[#2377B9] dark:text-[#75C9FF]" />
              {t.dashboard.announcements}
            </h2>
            {announcements.slice(0, 2).map((ann) => (
              <div
                key={ann.id}
                className="rounded-xl bg-[#DDF3FF]/50 dark:bg-[#101C32] p-3.5 border border-[#75C9FF]/25"
              >
                <div className="font-semibold text-sm text-[#101C32] dark:text-white">
                  {lang === 'en' && ann.titleEn ? ann.titleEn : ann.title}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  {lang === 'en' && ann.bodyEn ? ann.bodyEn : ann.body}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl bg-white dark:bg-[#162644] border border-[#75C9FF]/30 p-6 space-y-3">
            <h2 className="font-display font-bold text-lg text-[#101C32] dark:text-white flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-500" />
              {t.dashboard.latestActivity}
            </h2>
            {transactions.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.dashboard.emptyActivity}
              </p>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {transactions.slice(0, 4).map((tx) => (
                  <div key={tx.id} className="py-2 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-200 capitalize">
                      {tx.type.replace('_', ' ')}
                    </span>
                    <span
                      className={`font-mono tabular-nums font-bold ${
                        tx.amount >= 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {tx.amount >= 0 ? `+${tx.amount}` : tx.amount} Coins
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Recently Collected */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-xl text-[#101C32] dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#2377B9] dark:text-[#75C9FF]" />
            {t.dashboard.recentlyCollected}
          </h2>
          <Link to="/collection" className="text-xs font-semibold text-[#2377B9] dark:text-[#75C9FF] hover:underline">
            {t.nav.collection}
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          {recentCards.map(({ item, card }) => (
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
      </section>

      {/* Favorite Cards */}
      <section className="space-y-4">
        <h2 className="font-display font-bold text-xl text-[#101C32] dark:text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[#FFAED2]" />
          {t.dashboard.favoriteCards}
        </h2>
        {favoriteCards.length === 0 ? (
          <div className="rounded-2xl bg-white dark:bg-[#162644] border border-[#75C9FF]/30 p-6 text-sm text-slate-500 dark:text-slate-300">
            {t.dashboard.emptyFavorites}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {favoriteCards.map(({ item, card }) => (
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
      </section>

      {/* Featured Packs & Recommended Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-5 rounded-2xl bg-white dark:bg-[#162644] border border-[#75C9FF]/30 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg text-[#101C32] dark:text-white flex items-center gap-2">
              <PackageOpen className="w-5 h-5 text-[#2377B9] dark:text-[#75C9FF]" />
              {t.dashboard.featuredPacks}
            </h2>
            <Link to="/break" className="text-xs font-semibold text-[#2377B9] dark:text-[#75C9FF] hover:underline">
              {t.nav.breakPacks}
            </Link>
          </div>
          <div className="space-y-3">
            {packs.slice(0, 3).map((pack) => (
              <Link
                key={pack.id}
                to={`/break?pack=${pack.id}`}
                className="flex items-center justify-between p-3 rounded-xl bg-[#F4FBFF] dark:bg-[#101C32] border border-[#75C9FF]/25 hover:border-[#2377B9] transition-colors"
              >
                <div>
                  <div className="font-semibold text-sm text-[#101C32] dark:text-white">
                    {lang === 'en' ? pack.nameEn : pack.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {pack.cardCount} {t.breaker.cardsPerPack}
                  </div>
                </div>
                <div className="font-mono tabular-nums text-xs font-bold text-[#2377B9] dark:text-[#75C9FF]">
                  {pack.price} Coins
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg text-[#101C32] dark:text-white flex items-center gap-2">
              <Swords className="w-5 h-5 text-[#2377B9] dark:text-[#75C9FF]" />
              {t.dashboard.recommendedCards}
            </h2>
            <Link to="/discover" className="text-xs font-semibold text-[#2377B9] dark:text-[#75C9FF] hover:underline">
              {t.nav.discover}
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {recommendedCards.map((card) => (
              <ZharCardTile key={card.id} card={card} compact onSelect={setSelectedCard} />
            ))}
          </div>
        </section>
      </div>

      <CardDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />
    </div>
  );
}
