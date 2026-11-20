import React, { useState } from 'react';
import { Award, Edit3, LogOut, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../context/I18nContext';
import { useGame } from '../context/GameContext';
import { ACHIEVEMENTS_CATALOG } from '../data/seedData';
import { ZharCardTile } from '../components/ZharCardTile';
import { CardDetailModal } from '../components/CardDetailModal';
import type { Card } from '../types/zhar';

export function ProfilePage() {
  const { lang, t } = useI18n();
  const {
    profile,
    isAuthenticated,
    cards,
    inventory,
    transactions,
    updateUserProfile,
    logoutUser,
  } = useGame();

  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [savedToast, setSavedToast] = useState('');

  const favoriteCards = inventory
    .filter((i) => i.isFavorite)
    .map((i) => cards.find((c) => c.id === i.cardId))
    .filter((c): c is Card => Boolean(c));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().length < 2) return;
    await updateUserProfile({ username: username.trim(), bio: bio.trim() });
    setEditing(false);
    setSavedToast('Profil berhasil diperbarui.');
    setTimeout(() => setSavedToast(''), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Header Profile Card */}
      <section className="rounded-3xl bg-white dark:bg-[#162644] border border-[#75C9FF]/35 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={profile.avatar}
              alt={profile.username}
              referrerPolicy="no-referrer"
              className="w-20 h-20 rounded-2xl object-cover border-2 border-[#75C9FF]"
            />
            <div>
              <h1 className="font-display font-bold text-2xl text-[#101C32] dark:text-white">
                {profile.username}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                {profile.bio}
              </p>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                Lv.{profile.level} · {t.profile.joinDate}: {profile.joinDate} ·{' '}
                {t.profile.winRate}: <span className="font-mono tabular-nums">{profile.winRate}%</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => {
                setUsername(profile.username);
                setBio(profile.bio);
                setEditing((v) => !v);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#DDF3FF] dark:bg-[#101C32] text-[#101C32] dark:text-[#75C9FF] text-xs font-semibold"
            >
              <Edit3 className="w-3.5 h-3.5" />
              {t.profile.editProfile}
            </button>

            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => void logoutUser()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-rose-300 text-rose-600 dark:text-rose-300 text-xs font-semibold"
              >
                <LogOut className="w-3.5 h-3.5" />
                {t.nav.logout}
              </button>
            ) : (
              <Link
                to="/auth"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2377B9] text-white text-xs font-semibold"
              >
                {t.nav.login}
              </Link>
            )}
          </div>
        </div>

        {savedToast && (
          <div role="status" className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-xs font-semibold text-emerald-700 dark:text-emerald-200">
            {savedToast}
          </div>
        )}

        {editing && (
          <form onSubmit={handleSave} className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="prof-username" className="block text-xs font-semibold mb-1">
                  {t.auth.usernameLabel}
                </label>
                <input
                  id="prof-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  maxLength={32}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[#F4FBFF] dark:bg-[#101C32] text-sm"
                />
              </div>
              <div>
                <label htmlFor="prof-bio" className="block text-xs font-semibold mb-1">
                  {t.profile.bioLabel}
                </label>
                <input
                  id="prof-bio"
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={300}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[#F4FBFF] dark:bg-[#101C32] text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2377B9] text-white text-xs font-semibold"
              >
                <Save className="w-3.5 h-3.5" />
                {t.profile.saveProfile}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-semibold"
              >
                {t.profile.cancel}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Achievements Grid */}
      <section className="space-y-4">
        <h2 className="font-display font-bold text-xl text-[#101C32] dark:text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-[#FFD76A]" />
          {t.profile.achievementsTitle}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ACHIEVEMENTS_CATALOG.map((ach) => {
            const unlocked = profile.unlockedAchievements.includes(ach.id);
            return (
              <div
                key={ach.id}
                className={`rounded-2xl border p-4 space-y-1.5 ${
                  unlocked
                    ? 'bg-white dark:bg-[#162644] border-[#75C9FF]/50'
                    : 'bg-slate-100/80 dark:bg-[#0e182b] border-slate-200 dark:border-slate-800 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-sm text-[#101C32] dark:text-white">
                    {lang === 'en' ? ach.titleEn : ach.title}
                  </span>
                  <span
                    className={`text-[11px] font-bold ${
                      unlocked ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                    }`}
                  >
                    {unlocked ? t.profile.unlocked : t.profile.locked}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {lang === 'en' ? ach.descriptionEn : ach.description}
                </p>
                <div className="font-mono tabular-nums text-[11px] text-[#2377B9] dark:text-[#75C9FF] pt-1">
                  +{ach.rewardCoins} Coins · +{ach.rewardExp} EXP
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Favorite Cards */}
      <section className="space-y-4">
        <h2 className="font-display font-bold text-xl text-[#101C32] dark:text-white">
          {t.dashboard.favoriteCards}
        </h2>
        {favoriteCards.length === 0 ? (
          <div className="rounded-2xl bg-white dark:bg-[#162644] border border-[#75C9FF]/30 p-6 text-sm text-slate-500">
            {t.dashboard.emptyFavorites}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {favoriteCards.map((card) => (
              <ZharCardTile key={card.id} card={card} compact onSelect={setSelectedCard} />
            ))}
          </div>
        )}
      </section>

      {/* Transaction History */}
      <section className="rounded-2xl bg-white dark:bg-[#162644] border border-[#75C9FF]/30 p-6 space-y-3">
        <h2 className="font-display font-bold text-lg text-[#101C32] dark:text-white">
          {t.profile.transactionsTitle}
        </h2>
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {transactions.slice(0, 8).map((tx) => (
            <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs">
              <span className="capitalize font-medium">{tx.type.replace('_', ' ')}</span>
              <span
                className={`font-mono tabular-nums font-bold ${
                  tx.amount >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {tx.amount >= 0 ? `+${tx.amount}` : tx.amount} Coins
              </span>
            </div>
          ))}
        </div>
      </section>

      <CardDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />
    </div>
  );
}
