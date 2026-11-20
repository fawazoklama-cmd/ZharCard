import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useI18n } from '../context/I18nContext';
import { useGame } from '../context/GameContext';
import type { ElementType, Rarity } from '../types/zhar';
import { RARITY_ORDER } from '../utils/gameLogic';

export function AdminPage() {
  const { t } = useI18n();
  const {
    isAdmin,
    cards,
    packs,
    leaderboard,
    reports,
    adminCreateOfficialCard,
    adminModerateCard,
    adminUpdatePack,
    adminPublishAnnouncement,
  } = useGame();

  const [tab, setTab] = useState<'overview' | 'cards' | 'packs' | 'moderation' | 'users'>('overview');
  const [annTitle, setAnnTitle] = useState('');
  const [annBody, setAnnBody] = useState('');

  // Official Card Creation state
  const [cardName, setCardName] = useState('');
  const [cardDesc, setCardDesc] = useState('');
  const [cardRarity, setCardRarity] = useState<Rarity>('RARE');
  const [cardElement, setCardElement] = useState<ElementType>('Light');
  const [cardSkill, setCardSkill] = useState('');
  const [msg, setMsg] = useState('');

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto rounded-3xl bg-white dark:bg-[#162644] border border-rose-300 dark:border-rose-700 p-8 text-center space-y-3">
        <ShieldCheck className="w-10 h-10 text-rose-500 mx-auto" />
        <h1 className="font-display font-bold text-xl text-[#101C32] dark:text-white">
          {t.admin.title}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {t.admin.accessDenied}
        </p>
      </div>
    );
  }

  const pendingCustomCards = cards.filter((c) => !c.isOfficial && c.moderationStatus === 'pending');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#101C32] dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-[#2377B9] dark:text-[#75C9FF]" />
          {t.admin.title}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
          {t.admin.subtitle}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1.5 rounded-2xl bg-white dark:bg-[#162644] border border-[#75C9FF]/30 w-fit">
        {(
          [
            ['overview', t.admin.tabs.overview],
            ['cards', t.admin.tabs.cards],
            ['packs', t.admin.tabs.packs],
            ['moderation', t.admin.tabs.moderation],
            ['users', t.admin.tabs.users],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold ${
              tab === k ? 'bg-[#2377B9] text-white' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {msg && (
        <div role="status" className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-xs font-semibold text-emerald-700 dark:text-emerald-200">
          {msg}
        </div>
      )}

      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-white dark:bg-[#162644] border border-[#75C9FF]/30 p-6 space-y-4">
            <h2 className="font-display font-bold text-base">Platform Metrics</h2>
            <div className="grid grid-cols-2 gap-4 font-mono tabular-nums">
              <div className="p-4 rounded-xl bg-[#F4FBFF] dark:bg-[#101C32]">
                <div className="text-xs text-slate-500">Total Cards</div>
                <div className="text-2xl font-bold">{cards.length}</div>
              </div>
              <div className="p-4 rounded-xl bg-[#F4FBFF] dark:bg-[#101C32]">
                <div className="text-xs text-slate-500">Active Packs</div>
                <div className="text-2xl font-bold">{packs.length}</div>
              </div>
              <div className="p-4 rounded-xl bg-[#F4FBFF] dark:bg-[#101C32]">
                <div className="text-xs text-slate-500">Pending Moderation</div>
                <div className="text-2xl font-bold">{pendingCustomCards.length}</div>
              </div>
              <div className="p-4 rounded-xl bg-[#F4FBFF] dark:bg-[#101C32]">
                <div className="text-xs text-slate-500">Open Reports</div>
                <div className="text-2xl font-bold">{reports.length}</div>
              </div>
            </div>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!annTitle.trim() || !annBody.trim()) return;
              await adminPublishAnnouncement(annTitle, annBody);
              setAnnTitle('');
              setAnnBody('');
              setMsg('Pengumuman berhasil diterbitkan.');
            }}
            className="rounded-2xl bg-white dark:bg-[#162644] border border-[#75C9FF]/30 p-6 space-y-4"
          >
            <h2 className="font-display font-bold text-base">{t.admin.publishAnnouncement}</h2>
            <input
              type="text"
              value={annTitle}
              onChange={(e) => setAnnTitle(e.target.value)}
              placeholder="Announcement Title"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[#F4FBFF] dark:bg-[#101C32] text-sm"
            />
            <textarea
              rows={3}
              value={annBody}
              onChange={(e) => setAnnBody(e.target.value)}
              placeholder="Announcement message..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[#F4FBFF] dark:bg-[#101C32] text-sm"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#2377B9] text-white text-xs font-semibold"
            >
              {t.admin.publishAnnouncement}
            </button>
          </form>
        </div>
      )}

      {tab === 'cards' && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (cardName.trim().length < 2 || cardDesc.trim().length < 4) return;
            await adminCreateOfficialCard({
              name: cardName.trim(),
              description: cardDesc.trim(),
              imageUrl: '/src/assets/images/card_sky_seraph_1795133632808.jpg',
              rarity: cardRarity,
              element: cardElement,
              hp: 240,
              attack: 75,
              defense: 55,
              skillName: cardSkill.trim() || 'Crystal Surge',
              skillDescription: 'Official ZharWorld elemental skill.',
            });
            setCardName('');
            setCardDesc('');
            setCardSkill('');
            setMsg('Kartu resmi baru berhasil dibuat.');
          }}
          className="rounded-2xl bg-white dark:bg-[#162644] border border-[#75C9FF]/30 p-6 space-y-4 max-w-xl"
        >
          <h2 className="font-display font-bold text-base">{t.admin.createOfficialCard}</h2>
          <input
            type="text"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            placeholder="Official Card Name"
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[#F4FBFF] dark:bg-[#101C32] text-sm"
          />
          <textarea
            rows={2}
            value={cardDesc}
            onChange={(e) => setCardDesc(e.target.value)}
            placeholder="Lore / Description"
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[#F4FBFF] dark:bg-[#101C32] text-sm"
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              value={cardRarity}
              onChange={(e) => setCardRarity(e.target.value as Rarity)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[#F4FBFF] dark:bg-[#101C32] text-sm"
            >
              {RARITY_ORDER.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <select
              value={cardElement}
              onChange={(e) => setCardElement(e.target.value as ElementType)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[#F4FBFF] dark:bg-[#101C32] text-sm"
            >
              {(['Fire', 'Water', 'Wind', 'Earth', 'Light', 'Dark', 'Ice', 'Thunder'] as ElementType[]).map(
                (el) => (
                  <option key={el} value={el}>
                    {el}
                  </option>
                )
              )}
            </select>
          </div>
          <input
            type="text"
            value={cardSkill}
            onChange={(e) => setCardSkill(e.target.value)}
            placeholder="Skill Name"
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[#F4FBFF] dark:bg-[#101C32] text-sm"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#2377B9] text-white text-xs font-semibold"
          >
            {t.admin.createOfficialCard}
          </button>
        </form>
      )}

      {tab === 'packs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {packs.map((pack) => (
            <div
              key={pack.id}
              className="rounded-2xl bg-white dark:bg-[#162644] border border-[#75C9FF]/30 p-5 space-y-3"
            >
              <div className="font-display font-bold text-base">{pack.name}</div>
              <div className="text-xs font-mono tabular-nums text-slate-600 dark:text-slate-300">
                Price: {pack.price} Coins · Cards: {pack.cardCount} · Min: {pack.guaranteedMinRarity}
              </div>
              <button
                type="button"
                onClick={async () => {
                  await adminUpdatePack(pack.id, { price: pack.price });
                  setMsg(`Pack ${pack.name} disinkronkan.`);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-[#DDF3FF] dark:bg-[#101C32] text-xs font-semibold text-[#2377B9] dark:text-[#75C9FF]"
              >
                {t.admin.savePackConfig}
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'moderation' && (
        <div className="space-y-3">
          {pendingCustomCards.length === 0 ? (
            <div className="rounded-2xl bg-white dark:bg-[#162644] border border-[#75C9FF]/30 p-6 text-sm text-slate-500">
              No pending custom cards awaiting moderation.
            </div>
          ) : (
            pendingCustomCards.map((card) => (
              <div
                key={card.id}
                className="rounded-2xl bg-white dark:bg-[#162644] border border-[#75C9FF]/30 p-4 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="font-bold text-sm">{card.name}</div>
                  <div className="text-xs text-slate-500">
                    Creator: {card.creatorName} · {card.rarity} · {card.element}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void adminModerateCard(card.id, 'approved')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold"
                  >
                    {t.admin.approve}
                  </button>
                  <button
                    type="button"
                    onClick={() => void adminModerateCard(card.id, 'rejected')}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold"
                  >
                    {t.admin.reject}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'users' && (
        <div className="rounded-2xl bg-white dark:bg-[#162644] border border-[#75C9FF]/30 divide-y divide-slate-200 dark:divide-slate-700">
          {leaderboard.map((u) => (
            <div key={u.userId} className="p-4 flex items-center justify-between text-sm">
              <span className="font-semibold">{u.username}</span>
              <span className="font-mono tabular-nums text-xs text-slate-500">
                Lv.{u.level} · {u.totalCards} Cards · {u.battleWins} Wins
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
