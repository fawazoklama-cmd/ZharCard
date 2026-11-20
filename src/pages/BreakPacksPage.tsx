import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, PackageOpen, Sparkles, Info, History } from 'lucide-react';
import { useI18n } from '../context/I18nContext';
import { useGame } from '../context/GameContext';
import type { Card, Pack, Rarity } from '../types/zhar';
import { RARITY_ORDER, RARITY_RANK } from '../utils/gameLogic';
import { ZharCardTile } from '../components/ZharCardTile';
import { soundEngine } from '../utils/sound';

type OpeningStage = 'idle' | 'floating' | 'burst' | 'reveal';

export function BreakPacksPage() {
  const { lang, t } = useI18n();
  const { profile, packs, cards, packOpenings, openPack } = useGame();
  const [searchParams] = useSearchParams();

  const [selectedPackId, setSelectedPackId] = useState<string>(
    () => searchParams.get('pack') || packs[0]?.id || 'starter_pack'
  );
  const [stage, setStage] = useState<OpeningStage>('idle');
  const [pulledCards, setPulledCards] = useState<Card[]>([]);
  const [highestRarity, setHighestRarity] = useState<Rarity>('COMMON');
  const [revealedIdx, setRevealedIdx] = useState(0);
  const [error, setError] = useState('');

  const activePack: Pack = packs.find((p) => p.id === selectedPackId) || packs[0];

  useEffect(() => {
    const paramPack = searchParams.get('pack');
    if (paramPack && packs.some((p) => p.id === paramPack)) {
      setSelectedPackId(paramPack);
    }
  }, [searchParams, packs]);

  const handleOpenPack = async () => {
    if (!activePack) return;
    setError('');
    if (profile.coins < activePack.price) {
      setError(t.breaker.notEnoughCoins);
      return;
    }

    setStage('floating');
    soundEngine.playPackShake();

    try {
      const serverPromise = openPack(activePack.id);
      await new Promise((r) => setTimeout(r, 950));
      setStage('burst');
      const result = await serverPromise;
      await new Promise((r) => setTimeout(r, 550));

      setPulledCards(result.cards);
      setHighestRarity(result.highestRarity as Rarity);
      setRevealedIdx(0);
      setStage('reveal');

      const isSpecial = RARITY_RANK[result.highestRarity as Rarity] >= 5;
      soundEngine.playCardFlip(isSpecial);
    } catch (err) {
      setStage('idle');
      setError(err instanceof Error ? err.message : t.common.errorGeneric);
    }
  };

  useEffect(() => {
    if (stage !== 'reveal' || revealedIdx >= pulledCards.length) return;
    const timer = window.setTimeout(() => {
      const nextCard = pulledCards[revealedIdx];
      if (nextCard) {
        soundEngine.playCardFlip(RARITY_RANK[nextCard.rarity] >= 5);
      }
      setRevealedIdx((idx) => idx + 1);
    }, 320);
    return () => clearTimeout(timer);
  }, [stage, revealedIdx, pulledCards]);

  const isUltraPull = RARITY_RANK[highestRarity] >= 6;

  return (
    <div className="space-y-8">
      {/* Header + Balance */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#101C32] dark:text-white">
            {t.breaker.title}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            {t.breaker.subtitle}
          </p>
        </div>

        <div className="rounded-2xl bg-white dark:bg-[#162644] border border-[#75C9FF]/40 px-5 py-3 flex items-center gap-3 shadow-sm">
          <Coins className="w-5 h-5 text-amber-500" />
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {t.breaker.coinsLabel}
            </div>
            <div className="font-mono tabular-nums font-bold text-lg text-[#101C32] dark:text-[#FFD76A]">
              {profile.coins.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div role="alert" className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-700 text-sm text-rose-700 dark:text-rose-200">
          {error}
        </div>
      )}

      {/* Pack Grid + Selected Pack Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: 6 Pack Choices */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {packs.map((pack) => {
            const isSelected = pack.id === activePack.id;
            return (
              <button
                key={pack.id}
                type="button"
                onClick={() => {
                  setSelectedPackId(pack.id);
                  setError('');
                  soundEngine.playClick();
                }}
                className={`text-left rounded-2xl border-2 p-4 transition-all flex items-center gap-4 ${
                  isSelected
                    ? 'border-[#2377B9] dark:border-[#75C9FF] bg-[#DDF3FF]/70 dark:bg-[#1a2e52] shadow-md'
                    : 'border-[#75C9FF]/30 bg-white dark:bg-[#162644] hover:border-[#75C9FF]'
                }`}
              >
                <div className="w-16 h-24 rounded-xl overflow-hidden shrink-0 border border-[#75C9FF]/40 bg-[#101C32]">
                  <img
                    src={pack.artworkUrl}
                    alt={pack.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="font-display font-bold text-base text-[#101C32] dark:text-white truncate">
                    {lang === 'en' ? pack.nameEn : pack.name}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                    {lang === 'en' ? pack.descriptionEn : pack.description}
                  </div>
                  <div className="font-mono tabular-nums text-xs font-bold text-[#2377B9] dark:text-[#75C9FF] pt-1">
                    {pack.price} Coins · {pack.cardCount} {t.breaker.cardsPerPack}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Active Pack Inspector & Open Action */}
        <div className="lg:col-span-5 rounded-3xl bg-white dark:bg-[#162644] border border-[#75C9FF]/40 p-6 space-y-5 shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-24 h-32 rounded-2xl overflow-hidden border-2 border-[#75C9FF]/50 shadow-md shrink-0 bg-[#101C32]">
              <img
                src={activePack.artworkUrl}
                alt={activePack.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-1.5">
              <h2 className="font-display font-bold text-xl text-[#101C32] dark:text-white">
                {lang === 'en' ? activePack.nameEn : activePack.name}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {lang === 'en' ? activePack.descriptionEn : activePack.description}
              </p>
              <div className="text-xs font-semibold text-[#2377B9] dark:text-[#75C9FF]">
                {t.breaker.guaranteedLabel}: {activePack.guaranteedMinRarity}+
              </div>
            </div>
          </div>

          {/* Drop Rates Breakdown */}
          <div className="rounded-2xl bg-[#F4FBFF] dark:bg-[#101C32] border border-[#75C9FF]/25 p-4 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#101C32] dark:text-white">
              <Info className="w-4 h-4 text-[#2377B9] dark:text-[#75C9FF]" />
              {t.breaker.dropRatesTitle}
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
              {RARITY_ORDER.map((rarity) => (
                <div key={rarity} className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300">{rarity}</span>
                  <span className="font-mono tabular-nums font-semibold text-[#101C32] dark:text-white">
                    {activePack.dropRates[rarity]}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            disabled={stage !== 'idle'}
            onClick={() => void handleOpenPack()}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#2377B9] hover:bg-[#1b6199] text-white font-display font-bold text-sm shadow-lg shadow-[#2377B9]/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <PackageOpen className="w-5 h-5" />
            {t.breaker.openPackBtn} · {activePack.price} Coins
          </button>
        </div>
      </div>

      {/* Pack Opening History */}
      <section className="rounded-2xl bg-white dark:bg-[#162644] border border-[#75C9FF]/30 p-6 space-y-4">
        <h2 className="font-display font-bold text-lg text-[#101C32] dark:text-white flex items-center gap-2">
          <History className="w-5 h-5 text-[#2377B9] dark:text-[#75C9FF]" />
          {t.breaker.historyTitle}
        </h2>
        {packOpenings.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">{t.breaker.emptyHistory}</p>
        ) : (
          <div className="space-y-3">
            {packOpenings.slice(0, 6).map((opening) => {
              const packMeta = packs.find((p) => p.id === opening.packId);
              const displayPackName =
                lang === 'en' && packMeta ? packMeta.nameEn : packMeta?.name || opening.packName || opening.packId;
              return (
              <div
                key={opening.id}
                className="rounded-xl bg-[#F4FBFF] dark:bg-[#101C32] border border-[#75C9FF]/25 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div>
                  <span className="font-bold text-[#101C32] dark:text-white">
                    {displayPackName}
                  </span>
                  <span className="mx-2 text-slate-400">·</span>
                  <span className="text-slate-600 dark:text-slate-300">
                    {opening.cardIds
                      .map((cid) => {
                        const found = cards.find((c) => c.id === cid);
                        if (!found) return cid;
                        return lang === 'en' && found.nameEn ? found.nameEn : found.name;
                      })
                      .slice(0, 3)
                      .join(', ')}
                    {opening.cardIds.length > 3 ? ` +${opening.cardIds.length - 3}` : ''}
                  </span>
                </div>
                <div className="font-mono tabular-nums font-bold text-[#2377B9] dark:text-[#75C9FF]">
                  Top: {opening.highestRarity} · -{opening.cost} Coins
                </div>
              </div>
              );
            })}
          </div>
        )}
      </section>

      {/* FULL-SCREEN PACK OPENING ANIMATION MODAL */}
      <AnimatePresence>
        {stage !== 'idle' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label={t.breaker.opening}
            className="fixed inset-0 z-50 bg-[#101C32]/90 flex flex-col items-center justify-center p-4 sm:p-8 overflow-y-auto"
          >
            {(stage === 'floating' || stage === 'burst') && (
              <div className="flex flex-col items-center text-center space-y-6">
                <motion.div
                  animate={
                    stage === 'burst'
                      ? { scale: [1, 1.35, 0.9], opacity: [1, 1, 0] }
                      : { y: [-8, 8, -8] }
                  }
                  transition={{ duration: stage === 'burst' ? 0.5 : 0.9, repeat: stage === 'floating' ? Infinity : 0 }}
                  className={`w-48 h-64 rounded-3xl overflow-hidden border-4 border-[#75C9FF] shadow-2xl shadow-[#75C9FF]/50 ${
                    stage === 'floating' ? 'animate-pack-shake' : ''
                  }`}
                >
                  <img
                    src={activePack.artworkUrl}
                    alt={activePack.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                <div className="text-white font-display font-bold text-xl">
                  {t.breaker.opening}
                </div>
              </div>
            )}

            {stage === 'reveal' && (
              <div className="max-w-5xl w-full space-y-6 text-center">
                {isUltraPull && (
                  <motion.div
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-2xl bg-gradient-to-r from-[#75C9FF] via-[#FFAED2] to-[#FFD76A] text-[#101C32] font-display font-extrabold text-sm shadow-xl"
                  >
                    <Sparkles className="w-4 h-4" />
                    {t.breaker.specialPullBanner} ({highestRarity})
                  </motion.div>
                )}

                <h2 className="font-display font-bold text-2xl sm:text-3xl text-white pb-2">
                  {t.breaker.recentPullsTitle}
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 justify-center">
                  {pulledCards.map((card, index) => {
                    const isFlipped = index < revealedIdx;
                    return (
                      <motion.div
                        key={`${card.id}_${index}`}
                        initial={{ rotateY: 180, opacity: 0, scale: 0.85 }}
                        animate={
                          isFlipped
                            ? { rotateY: 0, opacity: 1, scale: 1 }
                            : { rotateY: 180, opacity: 0.4, scale: 0.9 }
                        }
                        transition={{ duration: 0.35 }}
                      >
                        <ZharCardTile card={card} />
                      </motion.div>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setStage('idle')}
                    className="px-6 py-3 rounded-xl bg-white text-[#101C32] font-semibold text-sm hover:bg-[#DDF3FF] transition-colors"
                  >
                    {t.breaker.closeReveal}
                  </button>
                  <button
                    type="button"
                    disabled={profile.coins < activePack.price}
                    onClick={() => {
                      setStage('idle');
                      setTimeout(() => void handleOpenPack(), 60);
                    }}
                    className="px-6 py-3 rounded-xl bg-[#2377B9] hover:bg-[#1b6199] text-white font-semibold text-sm transition-colors disabled:opacity-50"
                  >
                    {t.breaker.openAnother} ({activePack.price} Coins)
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
