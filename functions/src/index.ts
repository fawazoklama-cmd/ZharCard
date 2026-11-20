// Production Firebase Cloud Functions reference for Blaze-plan deployments.
// The Express server in /server.ts runs the exact same authoritative CSPRNG & battle math locally/on Cloud Run.
import crypto from 'node:crypto';
import { OFFICIAL_CARDS, OFFICIAL_PACKS } from '../../src/data/seedData';
import { resolveBattleTurn, rollPackCards } from '../../src/utils/gameLogic';
import type { BattleMode, Card } from '../../src/types/zhar';

export function serverOpenPack(packId: string, userCoins: number, secret: string) {
  const pack = OFFICIAL_PACKS.find((p) => p.id === packId);
  if (!pack) throw new Error('Pack not found');
  if (userCoins < pack.price) throw new Error('Insufficient virtual coins');

  const officialPool = OFFICIAL_CARDS.filter((c) => c.isOfficial);
  const csprngFloat = () => crypto.randomInt(0, 1_000_000) / 1_000_000;
  const result = rollPackCards(pack, officialPool, csprngFloat);
  const openingId = `po_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;
  const cardIds = result.cards.map((c) => c.id);
  const serverSignature = crypto
    .createHmac('sha256', secret)
    .update(`${openingId}:${pack.id}:${pack.price}:${cardIds.join(',')}`)
    .digest('hex');

  return { openingId, packId: pack.id, cost: pack.price, cards: result.cards, cardIds, highestRarity: result.highestRarity, serverSignature };
}

export function serverResolveBattleTurn(params: {
  playerCard: Card;
  enemyCard: Card;
  playerHp: number;
  enemyHp: number;
  playerEnergy: number;
  enemyEnergy: number;
  playerAction: 'attack' | 'defense' | 'skill';
  mode: BattleMode;
  turnCount: number;
}) {
  if (params.mode === 'ranked' && !params.playerCard.isOfficial) {
    throw new Error('Custom cards cannot be used in Ranked Battle');
  }
  const csprngFloat = () => crypto.randomInt(0, 1_000_000) / 1_000_000;
  return resolveBattleTurn({ ...params, rngFloat: csprngFloat });
}
