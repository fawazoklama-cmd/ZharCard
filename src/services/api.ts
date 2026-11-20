import type { BattleMode, Card, Pack, Rarity } from '../types/zhar';
import type { TurnResolutionOutput } from '../utils/gameLogic';

export interface PackOpenApiResponse {
  openingId: string;
  packId: string;
  packName: string;
  cost: number;
  cards: Card[];
  cardIds: string[];
  highestRarity: Rarity;
  serverSignature: string;
  createdAt: string;
}

export async function openPackOnServer(params: {
  packId: string;
  userCoins: number;
  customPool: Card[];
  customPacks: Pack[];
}): Promise<PackOpenApiResponse> {
  const res = await fetch('/api/packs/open', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to open pack');
  }
  return data as PackOpenApiResponse;
}

export async function resolveBattleTurnOnServer(params: {
  playerCard: Card;
  enemyCard: Card;
  playerHp: number;
  enemyHp: number;
  playerEnergy: number;
  enemyEnergy: number;
  playerAction: 'attack' | 'defense' | 'skill';
  mode: BattleMode;
  turnCount: number;
}): Promise<TurnResolutionOutput> {
  const res = await fetch('/api/battle/turn', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to compute battle turn');
  }
  return data as TurnResolutionOutput;
}

export async function validateTradeOnServer(params: {
  tradeId: string;
  sellerId: string;
  buyerId: string;
}): Promise<{ approved: boolean; lockToken: string }> {
  const res = await fetch('/api/trades/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Trade validation failed');
  }
  return data as { approved: boolean; lockToken: string };
}
