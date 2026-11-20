import React from 'react';
import { Flame, Droplets, Wind, Mountain, Sun, Moon, Snowflake, Zap, Heart, Sparkles } from 'lucide-react';
import type { Card, ElementType } from '../types/zhar';
import { RARITY_STYLES } from '../utils/gameLogic';
import { useI18n } from '../context/I18nContext';

interface ZharCardTileProps {
  card: Card;
  quantity?: number;
  isFavorite?: boolean;
  onSelect?: (card: Card) => void;
  onToggleFavorite?: (cardId: string) => void;
  compact?: boolean;
  zoom?: number;
}

const ELEMENT_ICONS: Record<ElementType, React.ReactNode> = {
  Fire: <Flame className="w-3.5 h-3.5 text-orange-500" aria-hidden="true" />,
  Water: <Droplets className="w-3.5 h-3.5 text-sky-500" aria-hidden="true" />,
  Wind: <Wind className="w-3.5 h-3.5 text-teal-500" aria-hidden="true" />,
  Earth: <Mountain className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" aria-hidden="true" />,
  Light: <Sun className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />,
  Dark: <Moon className="w-3.5 h-3.5 text-violet-500" aria-hidden="true" />,
  Ice: <Snowflake className="w-3.5 h-3.5 text-cyan-500" aria-hidden="true" />,
  Thunder: <Zap className="w-3.5 h-3.5 text-yellow-500" aria-hidden="true" />,
};

export function ZharCardTile({
  card,
  quantity,
  isFavorite,
  onSelect,
  onToggleFavorite,
  compact = false,
  zoom = 1,
}: ZharCardTileProps) {
  const { lang, t } = useI18n();
  const [imgError, setImgError] = React.useState(false);

  const rarityStyle = RARITY_STYLES[card.rarity];
  const displayName = lang === 'en' && card.nameEn ? card.nameEn : card.name;
  const displaySkill = lang === 'en' && card.skillNameEn ? card.skillNameEn : card.skillName;
  const isHolo = Boolean(card.isHolographic || rarityStyle.isSpecial);

  const frameClass =
    card.frameStyle === 'gold-celestial'
      ? 'border-amber-400 dark:border-amber-400/80'
      : card.frameStyle === 'obsidian-void'
      ? 'border-slate-700 dark:border-indigo-400/60'
      : card.frameStyle === 'aurora-prism'
      ? 'border-[#75C9FF] dark:border-[#FFAED2]'
      : rarityStyle.border;

  return (
    <div
      style={zoom !== 1 ? { transform: `scale(${zoom})`, transformOrigin: 'top center' } : undefined}
      className={`group relative rounded-2xl border-2 ${frameClass} bg-white dark:bg-[#162644] transition-transform duration-200 hover:-translate-y-1 shadow-md ${rarityStyle.glow} overflow-hidden flex flex-col`}
    >
      {isHolo && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 holo-foil opacity-35 mix-blend-overlay z-10"
        />
      )}

      {/* Card Top Action Strip (Favorite & Duplicate) */}
      <div className="relative z-20 flex items-center justify-between px-3 pt-2.5 pb-1.5 text-xs">
        <div className="flex items-center gap-1.5 min-w-0">
          {ELEMENT_ICONS[card.element]}
          <span className="font-semibold text-[#101C32] dark:text-sky-100 truncate">
            {card.element}
          </span>
          <span aria-hidden="true" className="text-slate-400">·</span>
          <span className={`font-bold ${rarityStyle.badgeText}`}>{card.rarity}</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {quantity && quantity > 1 && (
            <span className="font-mono tabular-nums text-[11px] font-bold text-[#2377B9] dark:text-[#75C9FF]">
              x{quantity}
            </span>
          )}
          {onToggleFavorite && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(card.id);
              }}
              aria-label={isFavorite ? `Remove ${displayName} from favorites` : `Favorite ${displayName}`}
              className="p-1.5 rounded-lg hover:bg-[#DDF3FF] dark:hover:bg-slate-800 transition-colors focus-visible:outline-2 focus-visible:outline-[#2377B9]"
            >
              <Heart
                className={`w-4 h-4 ${
                  isFavorite
                    ? 'fill-[#FFAED2] text-pink-500'
                    : 'text-slate-400 hover:text-pink-500'
                }`}
              />
            </button>
          )}
        </div>
      </div>

      {/* Main Clickable Card Area */}
      <button
        type="button"
        onClick={() => onSelect?.(card)}
        disabled={!onSelect}
        className="relative z-20 text-left flex-1 flex flex-col focus-visible:outline-2 focus-visible:outline-[#2377B9] disabled:cursor-default"
      >
        {/* Artwork Frame */}
        <div className={`relative mx-3 rounded-xl overflow-hidden bg-gradient-to-br from-[#DDF3FF] via-[#BDEBFF] to-[#75C9FF]/40 dark:from-[#0d1629] dark:to-[#1d355e] ${compact ? 'aspect-[4/3]' : 'aspect-[3/4]'}`}>
          {!imgError && card.imageUrl ? (
            <img
              src={card.imageUrl}
              alt={displayName}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
              <Sparkles className="w-8 h-8 text-[#2377B9] dark:text-[#75C9FF] mb-2" />
              <span className="text-xs font-semibold text-[#101C32] dark:text-sky-100">
                {displayName}
              </span>
            </div>
          )}

          {!card.isOfficial && (
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#101C32]/85 text-[#FFD76A] text-[10px] font-bold tracking-wide">
              {t.common.custom}
            </div>
          )}
        </div>

        {/* Name & Stats */}
        <div className="p-3 flex-1 flex flex-col justify-between gap-2">
          <div>
            <h3 className="font-display font-bold text-sm text-[#101C32] dark:text-white leading-snug line-clamp-1">
              {displayName}
            </h3>
            {!compact && (
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-1">
                {displaySkill}
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-1.5 pt-1.5 border-t border-slate-200/80 dark:border-slate-700/70 text-center">
            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">HP</div>
              <div className="font-mono tabular-nums text-xs font-bold text-[#101C32] dark:text-white">
                {card.hp}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">ATK</div>
              <div className="font-mono tabular-nums text-xs font-bold text-[#2377B9] dark:text-[#75C9FF]">
                {card.attack}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">DEF</div>
              <div className="font-mono tabular-nums text-xs font-bold text-slate-700 dark:text-slate-200">
                {card.defense}
              </div>
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}
