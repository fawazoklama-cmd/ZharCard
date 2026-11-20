import React, { useState } from 'react';
import { Search, Store, ArrowLeftRight, Coins } from 'lucide-react';
import { useI18n } from '../context/I18nContext';
import { useGame } from '../context/GameContext';
import type { Card, Rarity } from '../types/zhar';
import { RARITY_ORDER } from '../utils/gameLogic';
import { ZharCardTile } from '../components/ZharCardTile';
import { CardDetailModal } from '../components/CardDetailModal';

export function MarketplacePage() {
  const { lang, t } = useI18n();
  const {
    profile,
    cards,
    inventory,
    trades,
    createTradeListing,
    buyOrOfferTrade,
    resolveTradeListing,
  } = useGame();

  const [tab, setTab] = useState<'browse' | 'mine'>('browse');
  const [search, setSearch] = useState('');
  const [rarityFilter, setRarityFilter] = useState<'ALL' | Rarity>('ALL');
  const [offeredCardId, setOfferedCardId] = useState(inventory[0]?.cardId || '');
  const [priceCoins, setPriceCoins] = useState(250);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const ownedCards = inventory
    .map((i) => cards.find((c) => c.id === i.cardId))
    .filter((c): c is Card => Boolean(c));

  const visibleTrades = trades.filter((trade) => {
    const card = cards.find((c) => c.id === trade.offeredCardId);
    if (!card) return false;
    if (tab === 'browse' && trade.status !== 'open' && trade.status !== 'offered') return false;
    if (tab === 'mine' && trade.sellerId !== profile.uid && trade.buyerId !== profile.uid) {
      return false;
    }
    if (rarityFilter !== 'ALL' && card.rarity !== rarityFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        card.name.toLowerCase().includes(q) ||
        (card.nameEn && card.nameEn.toLowerCase().includes(q)) ||
        trade.sellerName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    const chosenId = offeredCardId || ownedCards[0]?.id;
    if (!chosenId) return;
    try {
      await createTradeListing(chosenId, priceCoins);
      setFeedback({
        type: 'ok',
        text:
          lang === 'en'
            ? 'Listing posted to the ZharCard Marketplace!'
            : 'Listing berhasil dipublikasikan di Marketplace!',
      });
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : t.common.errorGeneric,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#101C32] dark:text-white">
            {t.marketplace.title}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            {t.marketplace.subtitle}
          </p>
        </div>

        <div className="rounded-2xl bg-white dark:bg-[#162644] border border-[#75C9FF]/35 px-4 py-2.5 flex items-center gap-2 text-sm font-bold">
          <Coins className="w-4 h-4 text-amber-500" />
          <span className="font-mono tabular-nums">{profile.coins.toLocaleString()}</span>
        </div>
      </div>

      {/* Create Listing Form */}
      {ownedCards.length > 0 && (
        <form
          onSubmit={handleCreateListing}
          className="rounded-2xl bg-white dark:bg-[#162644] border border-[#75C9FF]/30 p-5 space-y-4"
        >
          <div className="font-display font-bold text-base flex items-center gap-2">
            <Store className="w-4 h-4 text-[#2377B9] dark:text-[#75C9FF]" />
            {t.marketplace.createListingTitle}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div>
              <label htmlFor="mp-card" className="block text-xs font-semibold mb-1">
                {t.marketplace.selectOwnedCard}
              </label>
              <select
                id="mp-card"
                value={offeredCardId || ownedCards[0]?.id}
                onChange={(e) => setOfferedCardId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[#F4FBFF] dark:bg-[#101C32] text-sm"
              >
                {ownedCards.map((c) => (
                  <option key={c.id} value={c.id}>
                    {lang === 'en' && c.nameEn ? c.nameEn : c.name} ({c.rarity})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="mp-price" className="block text-xs font-semibold mb-1">
                {t.marketplace.priceCoins}
              </label>
              <input
                id="mp-price"
                type="number"
                min={10}
                max={1000000}
                value={priceCoins}
                onChange={(e) => setPriceCoins(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[#F4FBFF] dark:bg-[#101C32] text-sm font-mono"
              />
            </div>

            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl bg-[#2377B9] hover:bg-[#1b6199] text-white font-semibold text-sm transition-colors"
            >
              {t.marketplace.postListing}
            </button>
          </div>
        </form>
      )}

      {feedback && (
        <div
          role="status"
          className={`p-3.5 rounded-xl text-xs font-semibold border ${
            feedback.type === 'ok'
              ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 text-emerald-700 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 text-rose-700 dark:text-rose-200'
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* Tabs & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white dark:bg-[#162644] border border-[#75C9FF]/30">
          <button
            type="button"
            onClick={() => setTab('browse')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold ${
              tab === 'browse' ? 'bg-[#2377B9] text-white' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            {t.marketplace.browseTab}
          </button>
          <button
            type="button"
            onClick={() => setTab('mine')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold ${
              tab === 'mine' ? 'bg-[#2377B9] text-white' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            {t.marketplace.myTradesTab}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.common.search}
              aria-label={t.common.search}
              className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162644] text-xs"
            />
          </div>
          <select
            value={rarityFilter}
            onChange={(e) => setRarityFilter(e.target.value as 'ALL' | Rarity)}
            aria-label="Filter rarity"
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162644] text-xs"
          >
            <option value="ALL">{t.common.all} Rarity</option>
            {RARITY_ORDER.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Listings Grid */}
      {visibleTrades.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-[#162644] border border-[#75C9FF]/30 p-10 text-center text-sm text-slate-500 dark:text-slate-300">
          {t.marketplace.emptyMarket}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleTrades.map((trade) => {
            const card = cards.find((c) => c.id === trade.offeredCardId);
            if (!card) return null;
            const isSeller = trade.sellerId === profile.uid;

            const statusLabel =
              trade.status === 'open'
                ? t.marketplace.statusOpen
                : trade.status === 'offered'
                ? t.marketplace.statusOffered
                : trade.status === 'completed'
                ? t.marketplace.statusCompleted
                : trade.status === 'rejected'
                ? t.marketplace.statusRejected
                : t.marketplace.statusCancelled;
            const displayCardName = lang === 'en' && card.nameEn ? card.nameEn : card.name;

            return (
              <div
                key={trade.id}
                className="rounded-2xl bg-white dark:bg-[#162644] border border-[#75C9FF]/30 p-4 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs gap-2">
                    <span className="text-slate-500 dark:text-slate-400 truncate">
                      {t.marketplace.offeredBy}:{' '}
                      <strong className="text-[#101C32] dark:text-white">{trade.sellerName}</strong>
                    </span>
                    <span className="font-mono font-bold text-[#2377B9] dark:text-[#75C9FF] uppercase whitespace-nowrap">
                      {statusLabel}
                    </span>
                  </div>
                  <ZharCardTile card={card} compact onSelect={setSelectedCard} />
                </div>

                <div className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-300">
                      {lang === 'en' ? 'Price' : 'Harga'}
                    </span>
                    <span className="font-mono tabular-nums font-bold text-[#101C32] dark:text-[#FFD76A]">
                      {trade.priceCoins} Coins
                    </span>
                  </div>

                  {!isSeller && trade.status === 'open' && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          setFeedback(null);
                          try {
                            await buyOrOfferTrade(trade, 'buy');
                            setFeedback({
                              type: 'ok',
                              text:
                                lang === 'en'
                                  ? `Purchased ${displayCardName}!`
                                  : `Berhasil membeli ${displayCardName}!`,
                            });
                          } catch (err) {
                            setFeedback({
                              type: 'err',
                              text: err instanceof Error ? err.message : t.common.errorGeneric,
                            });
                          }
                        }}
                        className="py-2 px-2.5 rounded-xl bg-[#2377B9] hover:bg-[#1b6199] text-white text-xs font-semibold transition-colors whitespace-nowrap"
                      >
                        {t.marketplace.buyNow}
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          setFeedback(null);
                          try {
                            await buyOrOfferTrade(trade, 'offer');
                            setFeedback({
                              type: 'ok',
                              text:
                                lang === 'en'
                                  ? 'Trade offer sent to seller.'
                                  : 'Tawaran pertukaran dikirim ke penjual.',
                            });
                          } catch (err) {
                            setFeedback({
                              type: 'err',
                              text: err instanceof Error ? err.message : t.common.errorGeneric,
                            });
                          }
                        }}
                        className="py-2 px-2.5 rounded-xl bg-[#DDF3FF] dark:bg-[#101C32] text-[#101C32] dark:text-[#75C9FF] text-xs font-semibold inline-flex items-center justify-center gap-1 whitespace-nowrap"
                      >
                        <ArrowLeftRight className="w-3.5 h-3.5 shrink-0" />
                        {t.marketplace.sendOffer}
                      </button>
                    </div>
                  )}

                  {isSeller && (trade.status === 'open' || trade.status === 'offered') && (
                    <div className="flex gap-2">
                      {trade.status === 'offered' && (
                        <>
                          <button
                            type="button"
                            onClick={() => void resolveTradeListing(trade, 'accept')}
                            className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold"
                          >
                            {t.marketplace.acceptOffer}
                          </button>
                          <button
                            type="button"
                            onClick={() => void resolveTradeListing(trade, 'reject')}
                            className="flex-1 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold"
                          >
                            {t.marketplace.rejectOffer}
                          </button>
                        </>
                      )}
                      {trade.status === 'open' && (
                        <button
                          type="button"
                          onClick={() => void resolveTradeListing(trade, 'cancel')}
                          className="w-full py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-semibold"
                        >
                          {t.marketplace.cancelListing}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CardDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />
    </div>
  );
}
