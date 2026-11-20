import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Shield, Sparkles, Swords, Trophy, RotateCcw } from 'lucide-react';
import { useI18n } from '../context/I18nContext';
import { useGame } from '../context/GameContext';
import type { BattleLogEntry, BattleMode, Card } from '../types/zhar';
import { resolveBattleTurnOnServer } from '../services/api';
import { ZharCardTile } from '../components/ZharCardTile';
import { soundEngine } from '../utils/sound';

export function BattlePage() {
  const { lang, t } = useI18n();
  const { profile, cards, inventory, battleHistory, recordBattleResult } = useGame();
  const [searchParams] = useSearchParams();

  const ownedCards = inventory
    .map((i) => cards.find((c) => c.id === i.cardId))
    .filter((c): c is Card => Boolean(c));

  const [mode, setMode] = useState<BattleMode>('practice');
  const eligibleCards =
    mode === 'ranked' ? ownedCards.filter((c) => c.isOfficial) : ownedCards;

  const initialCardId = searchParams.get('card');
  const [selectedCardId, setSelectedCardId] = useState<string>(
    () =>
      (initialCardId && eligibleCards.some((c) => c.id === initialCardId)
        ? initialCardId
        : eligibleCards[0]?.id) || ''
  );

  useEffect(() => {
    if (initialCardId && eligibleCards.some((c) => c.id === initialCardId)) {
      setSelectedCardId(initialCardId);
      return;
    }
    if (!eligibleCards.some((c) => c.id === selectedCardId) && eligibleCards[0]) {
      setSelectedCardId(eligibleCards[0].id);
    }
  }, [initialCardId, mode, eligibleCards, selectedCardId]);

  const [phase, setPhase] = useState<'setup' | 'fighting' | 'ended'>('setup');
  const [playerCard, setPlayerCard] = useState<Card | null>(null);
  const [enemyCard, setEnemyCard] = useState<Card | null>(null);
  const [playerHp, setPlayerHp] = useState(0);
  const [enemyHp, setEnemyHp] = useState(0);
  const [playerEnergy, setPlayerEnergy] = useState(25);
  const [enemyEnergy, setEnemyEnergy] = useState(20);
  const [turnCount, setTurnCount] = useState(0);
  const [winner, setWinner] = useState<'none' | 'player' | 'opponent'>('none');
  const [reward, setReward] = useState({ coins: 0, exp: 0 });
  const [logs, setLogs] = useState<BattleLogEntry[]>([]);
  const [busy, setBusy] = useState(false);
  const [animEffect, setAnimEffect] = useState<'none' | 'player-hit' | 'enemy-hit' | 'shield'>('none');

  const startBattle = () => {
    const chosen = eligibleCards.find((c) => c.id === selectedCardId) || eligibleCards[0];
    if (!chosen) return;

    const officialOpponents = cards.filter((c) => c.isOfficial && c.id !== chosen.id);
    const enemy =
      officialOpponents[Math.floor(Math.random() * officialOpponents.length)] || cards[0];

    setPlayerCard(chosen);
    setEnemyCard(enemy);
    setPlayerHp(chosen.hp);
    setEnemyHp(enemy.hp);
    setPlayerEnergy(25);
    setEnemyEnergy(20);
    setTurnCount(0);
    setWinner('none');
    setReward({ coins: 0, exp: 0 });
    setLogs([
      {
        turn: 0,
        actor: 'system',
        action: 'summon',
        messageId: `${chosen.name} memasuki arena melawan ${enemy.name}!`,
        messageEn: `${chosen.nameEn || chosen.name} enters the arena against ${enemy.nameEn || enemy.name}!`,
      },
    ]);
    setPhase('fighting');
    soundEngine.playCardFlip(false);
  };

  const handleTurnAction = async (action: 'attack' | 'defense' | 'skill') => {
    if (!playerCard || !enemyCard || busy || phase !== 'fighting') return;
    setBusy(true);

    if (action === 'attack') soundEngine.playAttack();
    else if (action === 'defense') soundEngine.playDefense();
    else soundEngine.playSkill();

    try {
      const res = await resolveBattleTurnOnServer({
        playerCard,
        enemyCard,
        playerHp,
        enemyHp,
        playerEnergy,
        enemyEnergy,
        playerAction: action,
        mode,
        turnCount,
      });

      setPlayerHp(res.playerHp);
      setEnemyHp(res.enemyHp);
      setPlayerEnergy(res.playerEnergy);
      setEnemyEnergy(res.enemyEnergy);
      setTurnCount(res.turnCount);

      if (action === 'defense') {
        setAnimEffect('shield');
      } else {
        setAnimEffect('enemy-hit');
      }
      setTimeout(() => setAnimEffect('none'), 350);

      const newLogs: BattleLogEntry[] = [
        {
          turn: res.turnCount,
          actor: 'player',
          action,
          damage: res.playerDamageDealt,
          heal: res.playerHealed,
          isEffective: res.playerEffective,
          messageId:
            action === 'defense'
              ? `${playerCard.name} bertahan (+${res.playerHealed} HP, +Energi).`
              : `${playerCard.name} menggunakan ${action === 'skill' ? playerCard.skillName : 'serangan'} -> ${res.playerDamageDealt} DMG${res.playerEffective ? ' (Efektif!)' : ''}.`,
          messageEn:
            action === 'defense'
              ? `${playerCard.nameEn || playerCard.name} defends (+${res.playerHealed} HP, +Energy).`
              : `${playerCard.nameEn || playerCard.name} uses ${action === 'skill' ? playerCard.skillNameEn || playerCard.skillName : 'Strike'} -> ${res.playerDamageDealt} DMG${res.playerEffective ? ' (Effective!)' : ''}.`,
        },
      ];

      if (res.enemyHp > 0 || res.enemyDamageDealt > 0) {
        newLogs.push({
          turn: res.turnCount,
          actor: 'enemy',
          action: res.enemyAction,
          damage: res.enemyDamageDealt,
          messageId:
            res.enemyAction === 'defense'
              ? `${enemyCard.name} memperkuat pertahanan.`
              : `${enemyCard.name} membalas (${res.enemyDamageDealt} DMG).`,
          messageEn:
            res.enemyAction === 'defense'
              ? `${enemyCard.nameEn || enemyCard.name} reinforces guard.`
              : `${enemyCard.nameEn || enemyCard.name} counters (${res.enemyDamageDealt} DMG).`,
        });
      }

      setLogs((prev) => [...newLogs, ...prev]);

      if (res.status === 'finished') {
        setWinner(res.winner);
        setReward({ coins: res.rewardCoins, exp: res.rewardExp });
        setPhase('ended');
        if (res.winner === 'player') soundEngine.playVictory();
        else soundEngine.playDefeat();

        await recordBattleResult({
          mode,
          result: res.winner === 'player' ? 'victory' : 'defeat',
          playerCardId: playerCard.id,
          enemyCardId: enemyCard.id,
          turns: res.turnCount,
          rewardCoins: res.rewardCoins,
          rewardExp: res.rewardExp,
        });
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#101C32] dark:text-white">
          {t.battle.title}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
          {t.battle.subtitle}
        </p>
      </div>

      {/* Mode Selector */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-[#162644] border border-[#75C9FF]/30 w-fit">
        {(
          [
            ['practice', t.battle.modePractice],
            ['casual', t.battle.modeCasual],
            ['ranked', t.battle.modeRanked],
          ] as const
        ).map(([m, label]) => (
          <button
            key={m}
            type="button"
            disabled={phase === 'fighting'}
            onClick={() => {
              setMode(m);
              if (m === 'ranked') {
                const firstOfficial = ownedCards.find((c) => c.isOfficial);
                if (firstOfficial) setSelectedCardId(firstOfficial.id);
              }
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap disabled:opacity-60 ${
              mode === m
                ? 'bg-[#2377B9] text-white'
                : 'text-slate-700 dark:text-slate-300 hover:bg-[#DDF3FF] dark:hover:bg-slate-800'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === 'ranked' && (
        <div className="text-xs font-medium text-[#2377B9] dark:text-[#75C9FF]">
          {t.battle.rankedRuleNote}
        </div>
      )}

      {/* SETUP PHASE */}
      {phase === 'setup' && (
        <div className="space-y-6">
          {eligibleCards.length === 0 ? (
            <div className="rounded-2xl bg-white dark:bg-[#162644] border border-[#75C9FF]/30 p-8 text-center space-y-3">
              <p className="text-sm text-slate-600 dark:text-slate-300">{t.battle.emptyDeck}</p>
              <Link
                to="/break"
                className="inline-block px-5 py-2.5 rounded-xl bg-[#2377B9] text-white text-xs font-semibold"
              >
                {t.nav.breakPacks}
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-lg text-[#101C32] dark:text-white">
                  {t.battle.selectCardTitle}
                </h2>
                <button
                  type="button"
                  data-start="true"
                  onClick={startBattle}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2377B9] hover:bg-[#1b6199] text-white font-semibold text-sm shadow-md"
                >
                  <Swords className="w-4 h-4" />
                  {t.battle.startBattle}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {eligibleCards.map((card) => {
                  const active = card.id === selectedCardId;
                  return (
                    <div
                      key={card.id}
                      className={`rounded-2xl p-1 transition-all ${
                        active ? 'ring-3 ring-[#2377B9] dark:ring-[#75C9FF]' : ''
                      }`}
                    >
                      <ZharCardTile card={card} onSelect={(c) => setSelectedCardId(c.id)} />
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* ACTIVE FIGHTING & ENDED ARENA */}
      {phase !== 'setup' && playerCard && enemyCard && (
        <div className="rounded-3xl bg-gradient-to-b from-[#DDF3FF] to-white dark:from-[#0e1a30] dark:to-[#162644] border border-[#75C9FF]/40 p-5 sm:p-8 space-y-6 shadow-lg">
          {/* Top Turn Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#75C9FF]/25">
            <div className="font-display font-bold text-sm text-[#2377B9] dark:text-[#75C9FF]">
              {mode.toUpperCase()} · {t.battle.turnLabel} {turnCount}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 font-semibold">
              {profile.username} vs Guardian Bot
            </div>
          </div>

          {/* Battle Field: Player vs Enemy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Player Side */}
            <motion.div
              animate={animEffect === 'shield' ? { scale: [1, 1.03, 1] } : {}}
              className="rounded-2xl bg-white/90 dark:bg-[#101C32]/90 border border-[#75C9FF]/40 p-4 space-y-3"
            >
              <div className="flex items-center justify-between text-xs font-bold">
                <span>{profile.username}</span>
                <span className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                  HP: {playerHp}/{playerCard.hp}
                </span>
              </div>
              <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${Math.round((playerHp / playerCard.hp) * 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span>{t.battle.energyLabel}</span>
                <span className="font-mono tabular-nums font-bold text-[#2377B9] dark:text-[#75C9FF]">
                  {playerEnergy}/100
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-[#75C9FF] transition-all duration-300"
                  style={{ width: `${playerEnergy}%` }}
                />
              </div>

              <div className="max-w-[210px] mx-auto pt-2">
                <ZharCardTile card={playerCard} compact />
              </div>
            </motion.div>

            {/* Enemy Side */}
            <motion.div
              animate={animEffect === 'enemy-hit' ? { x: [0, 8, -8, 0] } : {}}
              transition={{ duration: 0.25 }}
              className="rounded-2xl bg-white/90 dark:bg-[#101C32]/90 border border-rose-300/60 dark:border-rose-500/30 p-4 space-y-3"
            >
              <div className="flex items-center justify-between text-xs font-bold">
                <span>Sky Bot · {lang === 'en' ? enemyCard.nameEn || enemyCard.name : enemyCard.name}</span>
                <span className="font-mono tabular-nums text-rose-600 dark:text-rose-400">
                  HP: {enemyHp}/{enemyCard.hp}
                </span>
              </div>
              <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-rose-500 transition-all duration-300"
                  style={{ width: `${Math.round((enemyHp / enemyCard.hp) * 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span>{t.battle.energyLabel}</span>
                <span className="font-mono tabular-nums font-bold text-amber-500">
                  {enemyEnergy}/100
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-amber-400 transition-all duration-300"
                  style={{ width: `${enemyEnergy}%` }}
                />
              </div>

              <div className="max-w-[210px] mx-auto pt-2">
                <ZharCardTile card={enemyCard} compact />
              </div>
            </motion.div>
          </div>

          {/* Action Buttons or Outcome Banner */}
          {phase === 'fighting' ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={() => void handleTurnAction('attack')}
                className="py-3.5 px-4 rounded-xl bg-[#2377B9] hover:bg-[#1b6199] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <Swords className="w-4 h-4" />
                {t.battle.attackBtn}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void handleTurnAction('defense')}
                className="py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <Shield className="w-4 h-4" />
                {t.battle.defenseBtn}
              </button>
              <button
                type="button"
                disabled={busy || playerEnergy < 50}
                onClick={() => void handleTurnAction('skill')}
                className="py-3.5 px-4 rounded-xl bg-[#A78BFA] hover:bg-violet-600 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-45"
              >
                <Sparkles className="w-4 h-4" />
                {t.battle.skillBtn}
              </button>
            </div>
          ) : (
            <div className="rounded-2xl bg-[#101C32] text-white p-6 text-center space-y-4">
              <Trophy
                className={`w-10 h-10 mx-auto ${
                  winner === 'player' ? 'text-[#FFD76A]' : 'text-slate-400'
                }`}
              />
              <h2 className="font-display font-bold text-2xl">
                {winner === 'player' ? t.battle.victoryTitle : t.battle.defeatTitle}
              </h2>
              <div className="font-mono tabular-nums text-sm text-[#75C9FF]">
                +{reward.coins} Coins · +{reward.exp} EXP
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={startBattle}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2377B9] hover:bg-[#1b6199] text-white font-semibold text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  {t.battle.playAgain}
                </button>
                <button
                  type="button"
                  onClick={() => setPhase('setup')}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm"
                >
                  {t.battle.changeCard}
                </button>
              </div>
            </div>
          )}

          {/* Battle Log */}
          <div className="rounded-2xl bg-white dark:bg-[#101C32] border border-[#75C9FF]/25 p-4 space-y-2 max-h-48 overflow-y-auto">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {t.battle.battleLogTitle}
            </div>
            {logs.map((entry, idx) => (
              <div key={idx} className="text-xs text-slate-700 dark:text-slate-200">
                <span className="font-mono text-[#2377B9] dark:text-[#75C9FF] mr-2">
                  [T{entry.turn}]
                </span>
                {lang === 'en' ? entry.messageEn : entry.messageId}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Battle History */}
      <section className="rounded-2xl bg-white dark:bg-[#162644] border border-[#75C9FF]/30 p-6 space-y-3">
        <h2 className="font-display font-bold text-lg text-[#101C32] dark:text-white">
          {t.battle.historyTitle}
        </h2>
        {battleHistory.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.dashboard.emptyActivity}
          </p>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {battleHistory.slice(0, 6).map((b) => (
              <div key={b.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold uppercase mr-2">{b.mode}</span>
                  <span
                    className={
                      b.result === 'victory'
                        ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                        : 'text-rose-600 dark:text-rose-400 font-semibold'
                    }
                  >
                    {b.result.toUpperCase()}
                  </span>
                </div>
                <div className="font-mono tabular-nums text-slate-600 dark:text-slate-300">
                  +{b.rewardCoins} Coins · {b.turns} Turns
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
