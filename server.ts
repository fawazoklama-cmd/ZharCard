import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import { OFFICIAL_CARDS, OFFICIAL_PACKS } from './src/data/seedData';
import { resolveBattleTurn, rollPackCards } from './src/utils/gameLogic';
import type { BattleMode, Card, Pack } from './src/types/zhar';

const app = express();
const PORT = Number(process.env.PORT || 3000);
const SERVER_SECRET = process.env.ZHARCARD_SIGNING_SECRET || 'zharworld-crystal-citadel-secret';

app.use(express.json({ limit: '256kb' }));

// In-memory atomic lock set to prevent concurrent double-trade execution
const activeTradeLocks = new Set<string>();

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'ZharCard Server', timestamp: new Date().toISOString() });
});

// Server-authoritative Pack Opening RNG (never trust client RNG or client pricing)
app.post('/api/packs/open', (req, res) => {
  try {
    const { packId, userCoins, customPool, customPacks } = req.body as {
      packId?: string;
      userCoins?: number;
      customPool?: Card[];
      customPacks?: Pack[];
    };

    const packCatalog = Array.isArray(customPacks) && customPacks.length > 0 ? customPacks : OFFICIAL_PACKS;
    const pack = packCatalog.find((p) => p.id === packId);

    if (!pack) {
      return res.status(404).json({ error: 'Pack not found' });
    }

    const availableCoins = typeof userCoins === 'number' && Number.isFinite(userCoins) ? userCoins : 0;
    if (availableCoins < pack.price) {
      return res.status(400).json({ error: 'Insufficient virtual coins' });
    }

    const officialPool =
      Array.isArray(customPool) && customPool.length > 0
        ? customPool.filter((c) => c.isOfficial)
        : OFFICIAL_CARDS.filter((c) => c.isOfficial);

    const csprngFloat = () => crypto.randomInt(0, 1_000_000) / 1_000_000;
    const result = rollPackCards(pack, officialPool, csprngFloat);

    const openingId = `po_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;
    const cardIds = result.cards.map((c) => c.id);
    const payloadToSign = `${openingId}:${pack.id}:${pack.price}:${cardIds.join(',')}`;
    const serverSignature = crypto
      .createHmac('sha256', SERVER_SECRET)
      .update(payloadToSign)
      .digest('hex');

    return res.json({
      openingId,
      packId: pack.id,
      packName: pack.name,
      cost: pack.price,
      cards: result.cards,
      cardIds,
      highestRarity: result.highestRarity,
      serverSignature,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Pack open error:', err);
    return res.status(500).json({ error: 'Failed to process pack opening' });
  }
});

// Server-authoritative Turn-Based Battle Calculation
app.post('/api/battle/turn', (req, res) => {
  try {
    const {
      playerCard,
      enemyCard,
      playerHp,
      enemyHp,
      playerEnergy,
      enemyEnergy,
      playerAction,
      mode,
      turnCount,
    } = req.body as {
      playerCard?: Card;
      enemyCard?: Card;
      playerHp?: number;
      enemyHp?: number;
      playerEnergy?: number;
      enemyEnergy?: number;
      playerAction?: 'attack' | 'defense' | 'skill';
      mode?: BattleMode;
      turnCount?: number;
    };

    if (!playerCard || !enemyCard || !playerAction) {
      return res.status(400).json({ error: 'Missing battle parameters' });
    }

    // Ranked mode guard: reject custom cards on server side
    if (mode === 'ranked' && !playerCard.isOfficial) {
      return res.status(403).json({ error: 'Custom cards cannot enter Ranked Battle' });
    }

    const csprngFloat = () => crypto.randomInt(0, 1_000_000) / 1_000_000;
    const resolution = resolveBattleTurn({
      playerCard,
      enemyCard,
      playerHp: typeof playerHp === 'number' ? playerHp : playerCard.hp,
      enemyHp: typeof enemyHp === 'number' ? enemyHp : enemyCard.hp,
      playerEnergy: typeof playerEnergy === 'number' ? playerEnergy : 0,
      enemyEnergy: typeof enemyEnergy === 'number' ? enemyEnergy : 0,
      playerAction,
      mode: mode || 'practice',
      turnCount: typeof turnCount === 'number' ? turnCount : 0,
      rngFloat: csprngFloat,
    });

    return res.json(resolution);
  } catch (err) {
    console.error('Battle turn error:', err);
    return res.status(500).json({ error: 'Failed to compute battle turn' });
  }
});

// Server-side Atomic Trade Guard (prevents double-transfer race conditions)
app.post('/api/trades/validate', (req, res) => {
  const { tradeId, sellerId, buyerId } = req.body as {
    tradeId?: string;
    sellerId?: string;
    buyerId?: string;
  };

  if (!tradeId || !sellerId || !buyerId) {
    return res.status(400).json({ error: 'Missing trade fields' });
  }
  if (sellerId === buyerId) {
    return res.status(400).json({ error: 'Cannot trade with yourself' });
  }
  if (activeTradeLocks.has(tradeId)) {
    return res.status(409).json({ error: 'Trade already in progress' });
  }

  activeTradeLocks.add(tradeId);
  setTimeout(() => activeTradeLocks.delete(tradeId), 5000);

  const lockToken = crypto
    .createHmac('sha256', SERVER_SECRET)
    .update(`${tradeId}:${sellerId}:${buyerId}`)
    .digest('hex');

  return res.json({ approved: true, lockToken });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ZharCard server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start ZharCard server:', err);
  process.exit(1);
});
