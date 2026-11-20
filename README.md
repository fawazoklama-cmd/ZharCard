# ZharCard — Break. Create. Collect. Battle.

Modern Sky Blue Fantasy digital collectible trading card game set in **ZharWorld**.

- **Creator & Idea**: [@wazzz.dotcom](https://www.instagram.com/wazzz.dotcom/)
- **Stack**: React 19, TypeScript, Tailwind CSS v4, Motion, React Router, Express, Firebase Auth & Cloud Firestore

## Features
- **Bilingual (i18n)**: Bahasa Indonesia (default) and English with persistent preference.
- **Dual Theme**: Light Mode (Sky Blue / Ice Blue) and Dark Mode (Midnight Navy / Electric Sky).
- **Card Breaker**: 6 packs (Starter, Silver, Gold, Diamond, Legendary, Mystery) powered by server-side CSPRNG (`/api/packs/open`) with multi-stage flip & Mythic/Secret reveals.
- **Card Creator**: 7 fantasy templates, frame/border/effect/holo customization, live zoom preview, and high-res PNG download.
- **Card Collection**: Album completion metrics, rarity breakdown, search, sort, duplicate counts, favorites, and 3D flip modal.
- **Card Battle**: Turn-based elemental duels (Practice, Casual, Ranked) validated server-side (`/api/battle/turn`).
- **Marketplace & Trading**: Atomic virtual-coin listings and player trade offers (`/api/trades/validate`).
- **Leaderboard, Achievements, Daily Missions, Profile, Settings & Admin Console**.

## Local Development
```bash
npm install
npm run dev
```
Open `http://localhost:3000`.

## Testing & Verification
```bash
npx --yes tsx --test src/utils/gameLogic.test.ts
npx --yes tsx --test firestore.rules.test.ts
npx eslint firestore.rules
npm run lint
npm run build
```

## Vercel Deployment
1. Push repository to GitHub (never commit `.env` or secret credentials).
2. Configure environment variables in Vercel (`ZHARCARD_SIGNING_SECRET`, `APP_URL`).
3. `vercel.json` handles SPA routing fallback automatically.
4. Deploy Firestore rules using Firebase CLI: `firebase deploy --only firestore:rules`.
