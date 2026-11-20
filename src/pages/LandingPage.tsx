import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, PackageOpen, Sparkles, Trophy, Users, Layers, Swords } from 'lucide-react';
import { useI18n } from '../context/I18nContext';
import { useGame } from '../context/GameContext';
import { FEATURED_CREATORS, HERO_ARTWORK_URL } from '../data/seedData';
import { ZharCardTile } from '../components/ZharCardTile';
import { CardDetailModal } from '../components/CardDetailModal';
import type { Card, ElementType } from '../types/zhar';
import { RARITY_RANK } from '../utils/gameLogic';

export function LandingPage() {
  const { lang, t } = useI18n();
  const { cards, packs, leaderboard } = useGame();
  const navigate = useNavigate();

  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [elementFilter, setElementFilter] = useState<'ALL' | ElementType>('ALL');

  const featuredCards = cards
    .filter((c) => RARITY_RANK[c.rarity] >= 5 && c.isOfficial)
    .slice(0, 4);

  const discoverCards = cards
    .filter((c) => (elementFilter === 'ALL' ? true : c.element === elementFilter))
    .slice(0, 8);

  const elements: ('ALL' | ElementType)[] = [
    'ALL',
    'Light',
    'Fire',
    'Ice',
    'Thunder',
    'Water',
    'Wind',
    'Dark',
    'Earth',
  ];

  return (
    <div className="overflow-x-hidden">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#DDF3FF] via-[#EBF8FF] to-[#F4FBFF] dark:from-[#0c1629] dark:via-[#101C32] dark:to-[#101C32] border-b border-[#75C9FF]/30">
        {/* Subtle Drifting Cloud SVG */}
        <svg
          aria-hidden="true"
          viewBox="0 0 1440 160"
          className="pointer-events-none absolute top-4 left-0 w-full opacity-40 dark:opacity-15 animate-cloud-drift"
        >
          <path
            fill="#FFFFFF"
            d="M120 90c20-30 65-35 90-10 18-24 62-20 76 6 24 0 42 20 38 42H88c-16-18 2-44 32-38zm880-20c22-28 70-32 95-8 20-20 60-16 74 8 22 2 36 22 32 42h-228c-14-18 2-46 27-42z"
          />
        </svg>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Copy Column */}
          <div className="lg:col-span-6 space-y-6 relative z-10">
            <div className="text-sm font-semibold text-[#2377B9] dark:text-[#75C9FF]">
              ZharCard · ZharWorld Collectible Card Game
            </div>

            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-[54px] leading-[1.08] tracking-tight text-[#101C32] dark:text-white text-balance">
              {t.landing.headline}
            </h1>

            <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 max-w-xl leading-relaxed">
              {t.landing.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <button
                type="button"
                data-start="true"
                onClick={() => navigate('/break')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#2377B9] hover:bg-[#1b6199] text-white font-semibold text-sm shadow-lg shadow-[#2377B9]/25 transition-all whitespace-nowrap"
              >
                <PackageOpen className="w-4 h-4" />
                {t.landing.ctaStart}
              </button>
              <Link
                to="/discover"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white dark:bg-[#162644] border border-[#75C9FF]/50 text-[#101C32] dark:text-white font-semibold text-sm hover:bg-[#DDF3FF] dark:hover:bg-[#1d3257] transition-colors whitespace-nowrap"
              >
                {t.landing.ctaExplore}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right ZharWorld Key Art + Floating Legendary Cards */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden border border-[#75C9FF]/40 shadow-2xl aspect-[16/10] bg-[#BDEBFF] dark:bg-[#162644]">
              <img
                src={HERO_ARTWORK_URL}
                alt="ZharWorld floating sky islands and crystal castles"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[#101C32]/50 via-transparent to-transparent"
              />
            </div>

            {/* Floating Legendary Cards */}
            {featuredCards[0] && (
              <div className="hidden sm:block absolute -bottom-6 -left-4 w-44 animate-float-slow z-20">
                <ZharCardTile
                  card={featuredCards[0]}
                  compact
                  onSelect={setSelectedCard}
                />
              </div>
            )}
            {featuredCards[1] && (
              <div
                className="hidden sm:block absolute -top-5 -right-3 w-40 animate-float-slow z-20"
                style={{ animationDelay: '1.6s' }}
              >
                <ZharCardTile
                  card={featuredCards[1]}
                  compact
                  onSelect={setSelectedCard}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION A: FEATURED CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#101C32] dark:text-white">
              {t.landing.featuredCardsTitle}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              {t.landing.featuredCardsDesc}
            </p>
          </div>
          <Link
            to="/discover"
            className="text-sm font-semibold text-[#2377B9] dark:text-[#75C9FF] hover:underline inline-flex items-center gap-1"
          >
            {t.landing.ctaExplore}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCards.map((card) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0.9, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25 }}
            >
              <ZharCardTile card={card} onSelect={setSelectedCard} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION B: DISCOVER NEW CARDS */}
      <section className="bg-white/70 dark:bg-[#0d1629]/70 border-y border-[#75C9FF]/20 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#101C32] dark:text-white">
                {t.landing.discoverTitle}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                {t.landing.discoverDesc}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 bg-[#DDF3FF]/70 dark:bg-[#162644] p-1 rounded-xl">
              {elements.map((el) => (
                <button
                  key={el}
                  type="button"
                  onClick={() => setElementFilter(el)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                    elementFilter === el
                      ? 'bg-[#2377B9] text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-slate-800'
                  }`}
                >
                  {el === 'ALL' ? t.common.all : el}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {discoverCards.map((card) => (
              <ZharCardTile key={card.id} card={card} onSelect={setSelectedCard} />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION C: EXPLORE CARD PACKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#101C32] dark:text-white">
              {t.landing.packsTitle}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              {t.landing.packsDesc}
            </p>
          </div>
          <Link
            to="/break"
            className="px-4 py-2 rounded-xl bg-[#2377B9] hover:bg-[#1b6199] text-white text-xs font-semibold transition-colors whitespace-nowrap"
          >
            {t.nav.breakPacks}
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {packs.map((pack) => (
            <div
              key={pack.id}
              className="rounded-2xl bg-white dark:bg-[#162644] border border-[#75C9FF]/35 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-20 h-28 rounded-xl overflow-hidden shrink-0 border border-[#75C9FF]/40 bg-[#101C32]">
                <img
                  src={pack.artworkUrl}
                  alt={pack.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0 space-y-1.5">
                <h3 className="font-display font-bold text-base text-[#101C32] dark:text-white truncate">
                  {lang === 'en' ? pack.nameEn : pack.name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                  {lang === 'en' ? pack.descriptionEn : pack.description}
                </p>
                <div className="text-xs text-[#2377B9] dark:text-[#75C9FF] font-semibold font-mono tabular-nums pt-1">
                  {pack.price} Coins · {pack.cardCount} {t.breaker.cardsPerPack}
                </div>
                <div className="pt-1">
                  <Link
                    to={`/break?pack=${pack.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#101C32] dark:text-white hover:text-[#2377B9] dark:hover:text-[#75C9FF]"
                  >
                    {t.breaker.openPackBtn}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION D: HOW TO PLAY */}
      <section className="bg-[#DDF3FF]/50 dark:bg-[#162644]/50 border-y border-[#75C9FF]/25 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#101C32] dark:text-white mb-8">
            {t.landing.howToPlayTitle}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.landing.howToPlaySteps.map((step) => (
              <div
                key={step.num}
                className="rounded-2xl bg-white dark:bg-[#101C32] border border-[#75C9FF]/30 p-6 space-y-2.5"
              >
                <div className="font-mono tabular-nums text-sm font-bold text-[#2377B9] dark:text-[#75C9FF]">
                  {step.num}
                </div>
                <h3 className="font-display font-bold text-lg text-[#101C32] dark:text-white">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION E & F: FEATURED CREATORS + COMMUNITY STATISTICS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 space-y-12">
        <div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#101C32] dark:text-white">
            {t.landing.creatorsTitle}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 mb-6">
            {t.landing.creatorsDesc}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURED_CREATORS.map((creator) => (
              <div
                key={creator.handle}
                className="rounded-2xl bg-white dark:bg-[#162644] border border-[#75C9FF]/30 p-5 flex items-center gap-4"
              >
                <img
                  src={creator.avatar}
                  alt={creator.handle}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-[#75C9FF]/40"
                />
                <div className="min-w-0">
                  <div className="font-display font-bold text-base text-[#101C32] dark:text-white truncate">
                    {creator.handle}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 truncate">
                    {lang === 'en' ? creator.roleEn : creator.roleId}
                  </div>
                  <div className="text-xs font-mono tabular-nums text-[#2377B9] dark:text-[#75C9FF] mt-1">
                    {creator.cardsCreated} Cards Forged
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Community Statistics */}
        <div>
          <h2 className="font-display font-bold text-2xl text-[#101C32] dark:text-white mb-5">
            {t.landing.statsTitle}
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-white dark:bg-[#162644] border border-[#75C9FF]/30 p-5">
              <Layers className="w-5 h-5 text-[#2377B9] dark:text-[#75C9FF] mb-2" />
              <div className="font-display font-extrabold text-2xl sm:text-3xl font-mono tabular-nums">
                48,920
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                {t.landing.stats.cardsCollected}
              </div>
            </div>
            <div className="rounded-2xl bg-white dark:bg-[#162644] border border-[#75C9FF]/30 p-5">
              <PackageOpen className="w-5 h-5 text-[#2377B9] dark:text-[#75C9FF] mb-2" />
              <div className="font-display font-extrabold text-2xl sm:text-3xl font-mono tabular-nums">
                16,410
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                {t.landing.stats.packsBroken}
              </div>
            </div>
            <div className="rounded-2xl bg-white dark:bg-[#162644] border border-[#75C9FF]/30 p-5">
              <Swords className="w-5 h-5 text-[#2377B9] dark:text-[#75C9FF] mb-2" />
              <div className="font-display font-extrabold text-2xl sm:text-3xl font-mono tabular-nums">
                9,840
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                {t.landing.stats.battlesFought}
              </div>
            </div>
            <div className="rounded-2xl bg-white dark:bg-[#162644] border border-[#75C9FF]/30 p-5">
              <Users className="w-5 h-5 text-[#2377B9] dark:text-[#75C9FF] mb-2" />
              <div className="font-display font-extrabold text-2xl sm:text-3xl font-mono tabular-nums">
                3,250
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                {t.landing.stats.activeCollectors}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION G: LEADERBOARD PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-14">
        <div className="rounded-3xl bg-white dark:bg-[#162644] border border-[#75C9FF]/35 p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-[#FFD76A]" />
              <h2 className="font-display font-bold text-xl sm:text-2xl text-[#101C32] dark:text-white">
                {t.landing.leaderboardTitle}
              </h2>
            </div>
            <Link
              to="/leaderboard"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2377B9] dark:text-[#75C9FF] hover:underline"
            >
              {t.landing.leaderboardCta}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {leaderboard.slice(0, 4).map((entry, idx) => (
              <div
                key={entry.userId}
                className="py-3.5 flex items-center justify-between gap-4 text-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono tabular-nums font-bold text-base w-6 text-[#2377B9] dark:text-[#75C9FF]">
                    #{idx + 1}
                  </span>
                  <img
                    src={entry.avatar}
                    alt={entry.username}
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-xl object-cover border border-[#75C9FF]/40"
                  />
                  <div className="min-w-0">
                    <div className="font-semibold text-[#101C32] dark:text-white truncate">
                      {entry.username}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Lv.{entry.level}
                    </div>
                  </div>
                </div>
                <div className="font-mono tabular-nums text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                  {entry.totalCards} Cards · {entry.battleWins} Wins
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CardDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />
    </div>
  );
}
