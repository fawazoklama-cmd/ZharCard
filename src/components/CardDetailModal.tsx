import React, { useEffect, useState } from 'react';
import { RotateCw, Swords, X, Flag, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Card } from '../types/zhar';
import { useI18n } from '../context/I18nContext';
import { useGame } from '../context/GameContext';
import { ZharCardTile } from './ZharCardTile';

interface CardDetailModalProps {
  card: Card | null;
  onClose: () => void;
}

export function CardDetailModal({ card, onClose }: CardDetailModalProps) {
  const { lang, t } = useI18n();
  const { inventory, toggleFavoriteCard, reportCard } = useGame();
  const navigate = useNavigate();
  const [flipped, setFlipped] = useState(false);
  const [reportSent, setReportSent] = useState(false);

  useEffect(() => {
    setFlipped(false);
    setReportSent(false);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (card) {
      window.addEventListener('keydown', onKeyDown);
    }
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [card, onClose]);

  if (!card) return null;

  const invItem = inventory.find((i) => i.cardId === card.id);
  const displayName = lang === 'en' && card.nameEn ? card.nameEn : card.name;
  const displayDesc = lang === 'en' && card.descriptionEn ? card.descriptionEn : card.description;
  const displaySkillName = lang === 'en' && card.skillNameEn ? card.skillNameEn : card.skillName;
  const displaySkillDesc =
    lang === 'en' && card.skillDescriptionEn ? card.skillDescriptionEn : card.skillDescription;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={displayName}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#101C32]/75 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative max-w-2xl w-full rounded-3xl bg-white dark:bg-[#162644] border border-[#75C9FF]/40 shadow-2xl p-5 sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="font-display font-bold text-lg sm:text-xl text-[#101C32] dark:text-white">
              {displayName}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">
              {card.rarity} · {card.element} ·{' '}
              {card.isOfficial ? t.common.official : t.common.custom}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.common.close}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-[#DDF3FF] dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-5 items-center">
          {/* Interactive Flip Card Stage */}
          <div className="max-w-[270px] w-full mx-auto">
            {!flipped ? (
              <ZharCardTile
                card={card}
                quantity={invItem?.quantity}
                isFavorite={invItem?.isFavorite}
                onToggleFavorite={invItem ? toggleFavoriteCard : undefined}
              />
            ) : (
              <div className="aspect-[3/4] rounded-2xl border-2 border-[#75C9FF] bg-gradient-to-br from-[#DDF3FF] via-white to-[#BDEBFF] dark:from-[#0e192d] dark:via-[#152849] dark:to-[#101C32] p-4 flex flex-col justify-between shadow-inner relative overflow-hidden">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#2377B9] dark:text-[#75C9FF] border-b border-[#75C9FF]/30 pb-2">
                  <span>ZHARWORLD</span>
                  <span className="font-bold">{card.rarity}</span>
                </div>

                {/* ZharWorld Crystal Emblem Centerpiece */}
                <div className="flex flex-col items-center justify-center text-center my-auto py-2 space-y-2">
                  <div className="w-16 h-16 rounded-2xl bg-[#2377B9]/10 dark:bg-[#75C9FF]/15 border border-[#75C9FF]/45 flex items-center justify-center shadow-sm">
                    <svg viewBox="0 0 48 48" className="w-9 h-9" aria-hidden="true">
                      <polygon
                        points="24,4 38,20 24,44 10,20"
                        fill="currentColor"
                        className="text-[#2377B9] dark:text-[#75C9FF]"
                        opacity="0.85"
                      />
                      <polygon
                        points="24,10 32,20 24,36 16,20"
                        fill="currentColor"
                        className="text-white dark:text-[#101C32]"
                        opacity="0.65"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm text-[#101C32] dark:text-white leading-snug">
                      {displayName}
                    </h3>
                    <div className="text-[11px] text-[#2377B9] dark:text-[#75C9FF] font-semibold mt-0.5">
                      {card.template || card.element} · PWR{' '}
                      <span className="font-mono tabular-nums">
                        {card.attack + card.defense + Math.round(card.hp / 4)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2.5 border-t border-[#75C9FF]/30 text-[11px]">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="font-semibold text-[#2377B9] dark:text-[#75C9FF]">
                      {displaySkillName}
                    </span>
                    <span className="font-mono">{card.element}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span className="truncate max-w-[130px] font-mono">#{card.id}</span>
                    <span className="truncate">{card.creatorName}</span>
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setFlipped((f) => !f)}
              className="mt-3 w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-[#DDF3FF] dark:bg-slate-800 text-[#101C32] dark:text-[#75C9FF] font-semibold text-xs hover:bg-[#BDEBFF] dark:hover:bg-slate-700 transition-colors"
            >
              <RotateCw className="w-4 h-4" />
              {flipped ? t.collection.backToFront : t.collection.flipCard}
            </button>
          </div>

          {/* Card Details & Actions */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                {t.creator.cardDesc}
              </h3>
              <p className="text-sm text-[#101C32] dark:text-slate-100 leading-relaxed">
                {displayDesc}
              </p>
            </div>

            <div className="rounded-2xl bg-[#F4FBFF] dark:bg-[#101C32] border border-[#75C9FF]/30 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#2377B9] dark:text-[#75C9FF]">
                  {displaySkillName}
                </span>
                <span className="text-slate-500 dark:text-slate-400">{card.element}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {displaySkillDesc}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-slate-50 dark:bg-[#101C32] p-2.5 border border-slate-200 dark:border-slate-700">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">HP</div>
                <div className="font-mono tabular-nums font-bold text-base text-[#101C32] dark:text-white">
                  {card.hp}
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-[#101C32] p-2.5 border border-slate-200 dark:border-slate-700">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Attack</div>
                <div className="font-mono tabular-nums font-bold text-base text-[#2377B9] dark:text-[#75C9FF]">
                  {card.attack}
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-[#101C32] p-2.5 border border-slate-200 dark:border-slate-700">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Defense</div>
                <div className="font-mono tabular-nums font-bold text-base text-[#101C32] dark:text-white">
                  {card.defense}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-2">
              {invItem && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate(`/battle?card=${encodeURIComponent(card.id)}`);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#2377B9] hover:bg-[#1b6199] text-white font-semibold text-xs transition-colors whitespace-nowrap"
                  >
                    <Swords className="w-4 h-4" />
                    {t.collection.useInBattle}
                  </button>
                  <button
                    type="button"
                    onClick={() => void toggleFavoriteCard(card.id)}
                    className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-[#101C32] dark:text-white hover:bg-[#DDF3FF] dark:hover:bg-slate-800 transition-colors"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        invItem.isFavorite ? 'fill-[#FFAED2] text-pink-500' : ''
                      }`}
                    />
                  </button>
                </>
              )}
              {!card.isOfficial && (
                <button
                  type="button"
                  disabled={reportSent}
                  onClick={async () => {
                    await reportCard(card.id, 'Community moderation review requested');
                    setReportSent(true);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-rose-600 disabled:opacity-50"
                >
                  <Flag className="w-3.5 h-3.5" />
                  {reportSent ? 'Reported' : t.collection.reportCard}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
