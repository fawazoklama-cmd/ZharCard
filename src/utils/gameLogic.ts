import type { BattleMode, Card, ElementType, Pack, Rarity } from '../types/zhar';

export const RARITY_ORDER: Rarity[] = [
  'COMMON',
  'UNCOMMON',
  'RARE',
  'EPIC',
  'LEGENDARY',
  'MYTHIC',
  'SECRET',
];

export const RARITY_RANK: Record<Rarity, number> = {
  COMMON: 1,
  UNCOMMON: 2,
  RARE: 3,
  EPIC: 4,
  LEGENDARY: 5,
  MYTHIC: 6,
  SECRET: 7,
};

export const RARITY_STYLES: Record<
  Rarity,
  {
    label: string;
    badgeBg: string;
    badgeText: string;
    border: string;
    glow: string;
    isSpecial: boolean;
  }
> = {
  COMMON: {
    label: 'Common',
    badgeBg: 'bg-slate-200 dark:bg-slate-700',
    badgeText: 'text-slate-800 dark:text-slate-100',
    border: 'border-slate-300 dark:border-slate-600',
    glow: '',
    isSpecial: false,
  },
  UNCOMMON: {
    label: 'Uncommon',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-900/60',
    badgeText: 'text-emerald-800 dark:text-emerald-200',
    border: 'border-emerald-400 dark:border-emerald-500',
    glow: 'shadow-emerald-400/20',
    isSpecial: false,
  },
  RARE: {
    label: 'Rare',
    badgeBg: 'bg-sky-100 dark:bg-sky-900/60',
    badgeText: 'text-sky-800 dark:text-sky-200',
    border: 'border-[#75C9FF]',
    glow: 'shadow-[#75C9FF]/30',
    isSpecial: false,
  },
  EPIC: {
    label: 'Epic',
    badgeBg: 'bg-violet-100 dark:bg-violet-900/60',
    badgeText: 'text-violet-800 dark:text-violet-200',
    border: 'border-[#A78BFA]',
    glow: 'shadow-[#A78BFA]/35',
    isSpecial: false,
  },
  LEGENDARY: {
    label: 'Legendary',
    badgeBg: 'bg-amber-100 dark:bg-amber-900/60',
    badgeText: 'text-amber-900 dark:text-amber-200',
    border: 'border-[#FFD76A]',
    glow: 'shadow-[#FFD76A]/45',
    isSpecial: true,
  },
  MYTHIC: {
    label: 'Mythic',
    badgeBg: 'bg-pink-100 dark:bg-pink-900/60',
    badgeText: 'text-pink-900 dark:text-pink-200',
    border: 'border-[#FFAED2]',
    glow: 'shadow-[#FFAED2]/50',
    isSpecial: true,
  },
  SECRET: {
    label: 'Secret',
    badgeBg: 'bg-gradient-to-r from-[#75C9FF] via-[#FFAED2] to-[#FFD76A]',
    badgeText: 'text-[#101C32]',
    border: 'border-[#75C9FF]',
    glow: 'shadow-[#75C9FF]/60',
    isSpecial: true,
  },
};

const ELEMENT_STRENGTHS: Record<ElementType, ElementType[]> = {
  Fire: ['Ice', 'Wind'],
  Water: ['Fire', 'Earth'],
  Wind: ['Earth', 'Thunder'],
  Earth: ['Thunder', 'Fire'],
  Ice: ['Wind', 'Water'],
  Thunder: ['Water', 'Ice'],
  Light: ['Dark'],
  Dark: ['Light'],
};

export function getElementalMultiplier(attacker: ElementType, defender: ElementType): number {
  if (ELEMENT_STRENGTHS[attacker]?.includes(defender)) {
    return 1.35;
  }
  if (ELEMENT_STRENGTHS[defender]?.includes(attacker)) {
    return 0.8;
  }
  return 1.0;
}

export function calculateLevelFromExp(exp: number): {
  level: number;
  currentLevelExp: number;
  nextLevelExp: number;
  progressPercent: number;
} {
  const safeExp = Math.max(0, Math.floor(exp));
  const level = Math.floor(Math.sqrt(safeExp / 100)) + 1;
  const floorExp = Math.pow(level - 1, 2) * 100;
  const nextExp = Math.pow(level, 2) * 100;
  const span = Math.max(100, nextExp - floorExp);
  const currentLevelExp = safeExp - floorExp;
  const progressPercent = Math.min(100, Math.max(0, Math.round((currentLevelExp / span) * 100)));
  return { level, currentLevelExp, nextLevelExp: span, progressPercent };
}

export function isValidFirestoreId(id: string): boolean {
  return typeof id === 'string' && id.length >= 1 && id.length <= 128 && /^[a-zA-Z0-9_-]+$/.test(id);
}

export function rollRarityFromRates(
  dropRates: Record<Rarity, number>,
  randomFloat01: number,
  minRarity: Rarity = 'COMMON'
): Rarity {
  const total = RARITY_ORDER.reduce((acc, r) => acc + Math.max(0, dropRates[r] || 0), 0);
  const clamped = Math.min(0.999999, Math.max(0, randomFloat01));
  let cursor = 0;
  let picked: Rarity = 'COMMON';

  for (const rarity of RARITY_ORDER) {
    const weight = total > 0 ? Math.max(0, dropRates[rarity] || 0) / total : 0;
    cursor += weight;
    if (clamped <= cursor) {
      picked = rarity;
      break;
    }
  }

  if (RARITY_RANK[picked] < RARITY_RANK[minRarity]) {
    return minRarity;
  }
  return picked;
}

export function rollPackCards(
  pack: Pack,
  officialPool: Card[],
  rngFloat: () => number
): { cards: Card[]; highestRarity: Rarity } {
  const cards: Card[] = [];
  let highest: Rarity = 'COMMON';

  for (let i = 0; i < pack.cardCount; i++) {
    const isLastCard = i === pack.cardCount - 1;
    const minRarity = isLastCard ? pack.guaranteedMinRarity : 'COMMON';
    const rolledRarity = rollRarityFromRates(pack.dropRates, rngFloat(), minRarity);

    let matching = officialPool.filter((c) => c.rarity === rolledRarity && c.isOfficial);
    if (matching.length === 0) {
      matching = officialPool.filter(
        (c) => RARITY_RANK[c.rarity] >= RARITY_RANK[minRarity] && c.isOfficial
      );
    }
    if (matching.length === 0) {
      matching = officialPool;
    }

    const idx = Math.min(matching.length - 1, Math.floor(rngFloat() * matching.length));
    const chosen = matching[idx];
    cards.push(chosen);

    if (RARITY_RANK[chosen.rarity] > RARITY_RANK[highest]) {
      highest = chosen.rarity;
    }
  }

  return { cards, highestRarity: highest };
}

export interface TurnResolutionInput {
  playerCard: Card;
  enemyCard: Card;
  playerHp: number;
  enemyHp: number;
  playerEnergy: number;
  enemyEnergy: number;
  playerAction: 'attack' | 'defense' | 'skill';
  mode: BattleMode;
  turnCount: number;
  rngFloat: () => number;
}

export interface TurnResolutionOutput {
  playerHp: number;
  enemyHp: number;
  playerEnergy: number;
  enemyEnergy: number;
  playerDamageDealt: number;
  enemyDamageDealt: number;
  playerHealed: number;
  enemyAction: 'attack' | 'defense' | 'skill';
  playerEffective: boolean;
  enemyEffective: boolean;
  status: 'active' | 'finished';
  winner: 'none' | 'player' | 'opponent';
  rewardCoins: number;
  rewardExp: number;
  turnCount: number;
}

export function resolveBattleTurn(input: TurnResolutionInput): TurnResolutionOutput {
  const {
    playerCard,
    enemyCard,
    playerAction,
    mode,
    turnCount,
    rngFloat,
  } = input;

  let playerHp = Math.max(0, input.playerHp);
  let enemyHp = Math.max(0, input.enemyHp);
  let playerEnergy = Math.min(100, Math.max(0, input.playerEnergy));
  let enemyEnergy = Math.min(100, Math.max(0, input.enemyEnergy));

  const playerMult = getElementalMultiplier(playerCard.element, enemyCard.element);
  const enemyMult = getElementalMultiplier(enemyCard.element, playerCard.element);

  let enemyAction: 'attack' | 'defense' | 'skill' = 'attack';
  if (enemyEnergy >= 50 && rngFloat() > 0.38) {
    enemyAction = 'skill';
  } else if (enemyHp < enemyCard.hp * 0.35 && rngFloat() > 0.55) {
    enemyAction = 'defense';
  }

  const enemyDefending = enemyAction === 'defense';
  const playerDefending = playerAction === 'defense';

  let playerDamageDealt = 0;
  let playerHealed = 0;
  let enemyDamageDealt = 0;

  if (playerAction === 'attack') {
    const raw = playerCard.attack * playerMult - enemyCard.defense * 0.38;
    const variance = 0.92 + rngFloat() * 0.16;
    const base = Math.max(12, Math.round(raw * variance));
    playerDamageDealt = enemyDefending ? Math.max(6, Math.round(base * 0.45)) : base;
    enemyHp = Math.max(0, enemyHp - playerDamageDealt);
    playerEnergy = Math.min(100, playerEnergy + 25);
  } else if (playerAction === 'defense') {
    playerHealed = Math.round(playerCard.hp * 0.08);
    playerHp = Math.min(playerCard.hp, playerHp + playerHealed);
    playerEnergy = Math.min(100, playerEnergy + 35);
  } else if (playerAction === 'skill') {
    if (playerEnergy >= 50) {
      playerEnergy -= 50;
      const raw = playerCard.attack * 1.65 * playerMult - enemyCard.defense * 0.25;
      const base = Math.max(24, Math.round(raw));
      playerDamageDealt = enemyDefending ? Math.max(12, Math.round(base * 0.55)) : base;
      enemyHp = Math.max(0, enemyHp - playerDamageDealt);
    } else {
      const raw = playerCard.attack * playerMult - enemyCard.defense * 0.38;
      playerDamageDealt = Math.max(10, Math.round(raw));
      enemyHp = Math.max(0, enemyHp - playerDamageDealt);
      playerEnergy = Math.min(100, playerEnergy + 20);
    }
  }

  // Enemy acts only if still standing
  if (enemyHp > 0) {
    if (enemyAction === 'attack') {
      const raw = enemyCard.attack * enemyMult - playerCard.defense * 0.38;
      const variance = 0.9 + rngFloat() * 0.16;
      const base = Math.max(10, Math.round(raw * variance));
      enemyDamageDealt = playerDefending ? Math.max(5, Math.round(base * 0.42)) : base;
      playerHp = Math.max(0, playerHp - enemyDamageDealt);
      enemyEnergy = Math.min(100, enemyEnergy + 25);
    } else if (enemyAction === 'defense') {
      enemyHp = Math.min(enemyCard.hp, enemyHp + Math.round(enemyCard.hp * 0.07));
      enemyEnergy = Math.min(100, enemyEnergy + 35);
    } else if (enemyAction === 'skill' && enemyEnergy >= 50) {
      enemyEnergy -= 50;
      const raw = enemyCard.attack * 1.55 * enemyMult - playerCard.defense * 0.25;
      const base = Math.max(20, Math.round(raw));
      enemyDamageDealt = playerDefending ? Math.max(10, Math.round(base * 0.5)) : base;
      playerHp = Math.max(0, playerHp - enemyDamageDealt);
    }
  }

  let status: 'active' | 'finished' = 'active';
  let winner: 'none' | 'player' | 'opponent' = 'none';
  let rewardCoins = 0;
  let rewardExp = 0;

  if (enemyHp <= 0) {
    status = 'finished';
    winner = 'player';
    rewardCoins = mode === 'ranked' ? 240 : mode === 'casual' ? 140 : 80;
    rewardExp = mode === 'ranked' ? 180 : mode === 'casual' ? 110 : 60;
  } else if (playerHp <= 0) {
    status = 'finished';
    winner = 'opponent';
    rewardCoins = mode === 'ranked' ? 40 : 25;
    rewardExp = 35;
  }

  return {
    playerHp,
    enemyHp,
    playerEnergy,
    enemyEnergy,
    playerDamageDealt,
    enemyDamageDealt,
    playerHealed,
    enemyAction,
    playerEffective: playerMult > 1,
    enemyEffective: enemyMult > 1,
    status,
    winner,
    rewardCoins,
    rewardExp,
    turnCount: turnCount + 1,
  };
}
