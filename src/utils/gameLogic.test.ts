import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateLevelFromExp,
  getElementalMultiplier,
  isValidFirestoreId,
  RARITY_RANK,
  resolveBattleTurn,
  rollPackCards,
  rollRarityFromRates,
} from './gameLogic';
import type { Card, Pack } from '../types/zhar';

const sampleCards: Card[] = [
  {
    id: 'c_common',
    name: 'Cloud Sprite',
    description: 'Gentle sky spirit',
    imageUrl: '',
    rarity: 'COMMON',
    element: 'Wind',
    hp: 100,
    attack: 25,
    defense: 15,
    skillName: 'Gale',
    skillDescription: 'Light wind strike',
    isOfficial: true,
    moderationStatus: 'approved',
    creatorId: 'system',
    creatorName: 'ZharWorld',
  },
  {
    id: 'c_legend',
    name: 'Aetherion',
    description: 'Celestial guardian',
    imageUrl: '',
    rarity: 'LEGENDARY',
    element: 'Light',
    hp: 240,
    attack: 72,
    defense: 48,
    skillName: 'Solar Judgment',
    skillDescription: 'Radiant beam',
    isOfficial: true,
    moderationStatus: 'approved',
    creatorId: 'system',
    creatorName: 'ZharWorld',
  },
];

const samplePack: Pack = {
  id: 'starter',
  name: 'Starter Pack',
  nameEn: 'Starter Pack',
  description: 'Starter',
  descriptionEn: 'Starter',
  price: 100,
  cardCount: 3,
  guaranteedMinRarity: 'LEGENDARY',
  dropRates: {
    COMMON: 60,
    UNCOMMON: 20,
    RARE: 10,
    EPIC: 5,
    LEGENDARY: 4,
    MYTHIC: 0.8,
    SECRET: 0.2,
  },
  artworkUrl: '',
  accentHex: '#75C9FF',
};

test('elemental advantage multiplier balances strengths and weaknesses', () => {
  assert.equal(getElementalMultiplier('Water', 'Fire'), 1.35);
  assert.equal(getElementalMultiplier('Fire', 'Water'), 0.8);
  assert.equal(getElementalMultiplier('Fire', 'Dark'), 1.0);
});

test('rollRarityFromRates respects minimum guaranteed rarity floor', () => {
  const rolled = rollRarityFromRates(samplePack.dropRates, 0.01, 'LEGENDARY');
  assert.ok(RARITY_RANK[rolled] >= RARITY_RANK['LEGENDARY']);
});

test('rollPackCards outputs exact cardCount and honors guaranteed rarity on final card', () => {
  const result = rollPackCards(samplePack, sampleCards, () => 0.05);
  assert.equal(result.cards.length, 3);
  assert.ok(RARITY_RANK[result.highestRarity] >= RARITY_RANK['LEGENDARY']);
});

test('resolveBattleTurn validates skill energy, elemental damage, and victory rewards', () => {
  const res = resolveBattleTurn({
    playerCard: sampleCards[1],
    enemyCard: { ...sampleCards[0], element: 'Dark', hp: 50 },
    playerHp: 240,
    enemyHp: 50,
    playerEnergy: 60,
    enemyEnergy: 0,
    playerAction: 'skill',
    mode: 'ranked',
    turnCount: 0,
    rngFloat: () => 0.5,
  });

  assert.equal(res.status, 'finished');
  assert.equal(res.winner, 'player');
  assert.equal(res.enemyHp, 0);
  assert.equal(res.rewardCoins, 240);
  assert.equal(res.playerEffective, true);
  assert.equal(res.turnCount, 1);
});

test('calculateLevelFromExp computes accurate level and progress', () => {
  const lvl1 = calculateLevelFromExp(0);
  assert.equal(lvl1.level, 1);
  const lvl2 = calculateLevelFromExp(150);
  assert.equal(lvl2.level, 2);
});

test('isValidFirestoreId rejects unsafe path traversal or long IDs', () => {
  assert.equal(isValidFirestoreId('card_123-abc'), true);
  assert.equal(isValidFirestoreId('../secret'), false);
  assert.equal(isValidFirestoreId('a'.repeat(130)), false);
});
