import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
  testFirestoreConnection,
} from '../firebase/config';
import {
  ACHIEVEMENTS_CATALOG,
  DAILY_MISSIONS_CATALOG,
  OFFICIAL_CARDS,
  OFFICIAL_PACKS,
  SEEDED_ANNOUNCEMENTS,
  SEEDED_LEADERBOARD,
  SEEDED_TRADES,
} from '../data/seedData';
import type {
  Announcement,
  AppSettings,
  BattleHistoryRecord,
  Card,
  InventoryItem,
  LeaderboardEntry,
  ModerationReport,
  Pack,
  PackOpening,
  TradeListing,
  Transaction,
  UserProfile,
} from '../types/zhar';
import { calculateLevelFromExp, isValidFirestoreId, RARITY_RANK } from '../utils/gameLogic';
import { openPackOnServer, validateTradeOnServer } from '../services/api';
import { soundEngine } from '../utils/sound';

interface GuestSessionState {
  profile: UserProfile;
  inventory: InventoryItem[];
  customCards: Card[];
  packOpenings: PackOpening[];
  battleHistory: BattleHistoryRecord[];
  trades: TradeListing[];
  transactions: Transaction[];
  missionProgress: Record<string, number>;
}

const GUEST_STORAGE_KEY = 'zharcard_guest_session_v1';
const SETTINGS_STORAGE_KEY = 'zharcard_settings_v1';

function buildInitialGuestSession(): GuestSessionState {
  const now = new Date().toISOString();
  const starterCardIds = [
    'zhar_common_breeze',
    'zhar_common_frost',
    'zhar_uncommon_spark',
    'zhar_rare_kairo',
  ];
  return {
    profile: {
      uid: 'guest_sky_explorer',
      username: 'SkyExplorer',
      email: '',
      avatar: '/src/assets/images/card_sky_seraph_1795133632808.jpg',
      bio: 'Penjelajah pulau langit ZharWorld.',
      level: 1,
      exp: 40,
      coins: 800,
      totalCards: starterCardIds.length,
      totalPacksOpened: 0,
      totalBattles: 0,
      battleWins: 0,
      winRate: 0,
      role: 'user',
      unlockedAchievements: ['first_collection'],
      completedMissionIds: [],
      favoriteCardIds: ['zhar_rare_kairo'],
      joinDate: now.slice(0, 10),
    },
    inventory: starterCardIds.map((cardId) => ({
      id: `guest_sky_explorer_${cardId}`,
      userId: 'guest_sky_explorer',
      cardId,
      quantity: 1,
      isFavorite: cardId === 'zhar_rare_kairo',
      obtainedFrom: 'starter_deck',
      createdAt: now,
      updatedAt: now,
    })),
    customCards: [],
    packOpenings: [],
    battleHistory: [],
    trades: SEEDED_TRADES,
    transactions: [
      {
        id: 'tx_starter_1',
        userId: 'guest_sky_explorer',
        type: 'starter_bonus',
        amount: 800,
        referenceId: 'starter_welcome',
        createdAt: now,
      },
    ],
    missionProgress: {
      mission_login: 1,
      mission_pack: 0,
      mission_battle: 0,
      mission_collect: 4,
    },
  };
}

interface GameContextValue {
  firebaseUser: FirebaseUser | null;
  authReady: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  profile: UserProfile;
  cards: Card[];
  packs: Pack[];
  inventory: InventoryItem[];
  packOpenings: PackOpening[];
  battleHistory: BattleHistoryRecord[];
  trades: TradeListing[];
  leaderboard: LeaderboardEntry[];
  transactions: Transaction[];
  announcements: Announcement[];
  reports: ModerationReport[];
  missionProgress: Record<string, number>;
  settings: AppSettings;
  updateSettings: (next: Partial<AppSettings>) => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, username: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  updateUserProfile: (updates: { username?: string; bio?: string; avatar?: string }) => Promise<void>;
  openPack: (packId: string) => Promise<{ cards: Card[]; highestRarity: string; openingId: string }>;
  saveCustomCard: (card: Omit<Card, 'id' | 'isOfficial' | 'moderationStatus' | 'creatorId' | 'creatorName'>) => Promise<Card>;
  toggleFavoriteCard: (cardId: string) => Promise<void>;
  recordBattleResult: (params: {
    mode: 'practice' | 'casual' | 'ranked';
    result: 'victory' | 'defeat';
    playerCardId: string;
    enemyCardId: string;
    turns: number;
    rewardCoins: number;
    rewardExp: number;
  }) => Promise<void>;
  claimMission: (missionId: string) => Promise<void>;
  createTradeListing: (offeredCardId: string, priceCoins: number, requestedCardId?: string) => Promise<void>;
  buyOrOfferTrade: (trade: TradeListing, action: 'buy' | 'offer') => Promise<void>;
  resolveTradeListing: (trade: TradeListing, action: 'accept' | 'reject' | 'cancel') => Promise<void>;
  reportCard: (cardId: string, reason: string) => Promise<void>;
  adminCreateOfficialCard: (card: Omit<Card, 'id' | 'isOfficial' | 'moderationStatus' | 'creatorId' | 'creatorName'>) => Promise<void>;
  adminModerateCard: (cardId: string, status: 'approved' | 'rejected') => Promise<void>;
  adminUpdatePack: (packId: string, updates: Partial<Pack>) => Promise<void>;
  adminPublishAnnouncement: (title: string, body: string) => Promise<void>;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const [guestState, setGuestState] = useState<GuestSessionState>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(GUEST_STORAGE_KEY);
        if (raw) {
          return JSON.parse(raw) as GuestSessionState;
        }
      } catch {
        // Ignore corrupt local state
      }
    }
    return buildInitialGuestSession();
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (raw) {
          return JSON.parse(raw) as AppSettings;
        }
      } catch {
        // ignore
      }
    }
    return {
      musicEnabled: false,
      sfxEnabled: false,
      reducedAnimations: false,
      notificationsEnabled: true,
    };
  });

  // Firestore-synced state when authenticated
  const [fbProfile, setFbProfile] = useState<UserProfile | null>(null);
  const [fbInventory, setFbInventory] = useState<InventoryItem[]>([]);
  const [fbPackOpenings, setFbPackOpenings] = useState<PackOpening[]>([]);
  const [fbBattleHistory, setFbBattleHistory] = useState<BattleHistoryRecord[]>([]);
  const [fbTrades, setFbTrades] = useState<TradeListing[]>([]);
  const [fbTransactions, setFbTransactions] = useState<Transaction[]>([]);
  const [fbCards, setFbCards] = useState<Card[]>([]);
  const [fbPacks, setFbPacks] = useState<Pack[]>([]);
  const [fbLeaderboard, setFbLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [fbAnnouncements, setFbAnnouncements] = useState<Announcement[]>([]);
  const [fbReports, setFbReports] = useState<ModerationReport[]>([]);

  // Persist guest state
  useEffect(() => {
    if (!firebaseUser && typeof window !== 'undefined') {
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guestState));
    }
  }, [guestState, firebaseUser]);

  // Persist & apply audio settings
  useEffect(() => {
    soundEngine.setMusicEnabled(settings.musicEnabled);
    soundEngine.setSfxEnabled(settings.sfxEnabled);
    if (typeof window !== 'undefined') {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    }
  }, [settings]);

  const updateSettings = (next: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...next }));
  };

  // Startup connection check & Auth listener
  useEffect(() => {
    void testFirestoreConnection();

    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        await ensureUserDocument(user);
      } else {
        setFbProfile(null);
        setFbInventory([]);
        setFbPackOpenings([]);
        setFbBattleHistory([]);
        setFbTransactions([]);
      }
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  async function ensureUserDocument(user: FirebaseUser) {
    const userRef = doc(db, 'users', user.uid);
    const privateRef = doc(db, 'users', user.uid, 'private', 'info');
    try {
      const snap = await getDoc(userRef);
      const isBootstrappedAdmin = user.email === 'fawazoklama@gmail.com' && user.emailVerified;
      if (!snap.exists()) {
        const cleanName = (user.displayName || user.email?.split('@')[0] || 'SkyCollector')
          .replace(/[^a-zA-Z0-9._-]/g, '')
          .slice(0, 24) || 'SkyCollector';

        const starterIds = ['zhar_common_breeze', 'zhar_common_frost', 'zhar_uncommon_spark'];
        const batch = writeBatch(db);
        batch.set(userRef, {
          uid: user.uid,
          username: cleanName,
          avatar: user.photoURL || '/src/assets/images/card_sky_seraph_1795133632808.jpg',
          bio: 'Collector in ZharWorld.',
          level: 1,
          exp: 0,
          coins: 800,
          totalCards: starterIds.length,
          totalPacksOpened: 0,
          totalBattles: 0,
          battleWins: 0,
          winRate: 0,
          role: isBootstrappedAdmin ? 'admin' : 'user',
          unlockedAchievements: ['first_collection'],
          completedMissionIds: [],
          favoriteCardIds: [],
          joinDate: new Date().toISOString().slice(0, 10),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        batch.set(privateRef, {
          uid: user.uid,
          email: user.email || '',
          language: 'id',
          theme: 'light',
          notificationsEnabled: true,
          updatedAt: serverTimestamp(),
        });
        for (const cid of starterIds) {
          const invRef = doc(db, 'card_inventory', `${user.uid}_${cid}`);
          batch.set(invRef, {
            userId: user.uid,
            cardId: cid,
            quantity: 1,
            isFavorite: false,
            obtainedFrom: 'starter_deck',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
        if (user.emailVerified) {
          batch.set(doc(db, 'leaderboard', user.uid), {
            userId: user.uid,
            username: cleanName,
            avatar: user.photoURL || '/src/assets/images/card_sky_seraph_1795133632808.jpg',
            level: 1,
            totalCards: starterIds.length,
            battleWins: 0,
            legendaryCount: 0,
            mythicCount: 0,
            updatedAt: serverTimestamp(),
          });
        }
        await batch.commit();
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    }
  }

  // Public catalogs listeners (safe for all users)
  useEffect(() => {
    const unsubPacks = onSnapshot(
      collection(db, 'packs'),
      (snap) => {
        if (!snap.empty) {
          setFbPacks(snap.docs.map((d) => ({ ...(d.data() as Pack), id: d.id })));
        }
      },
      () => {
        // Keep seeded packs if unseeded in Firestore
      }
    );
    const unsubBoard = onSnapshot(
      collection(db, 'leaderboard'),
      (snap) => {
        if (!snap.empty) {
          setFbLeaderboard(snap.docs.map((d) => d.data() as LeaderboardEntry));
        }
      },
      () => {}
    );
    const unsubAnn = onSnapshot(
      collection(db, 'announcements'),
      (snap) => {
        if (!snap.empty) {
          setFbAnnouncements(
            snap.docs.map((d) => ({ ...(d.data() as Announcement), id: d.id }))
          );
        }
      },
      () => {}
    );
    const unsubCards = onSnapshot(
      query(collection(db, 'cards'), where('moderationStatus', '==', 'approved')),
      (snap) => {
        if (!snap.empty) {
          setFbCards(snap.docs.map((d) => ({ ...(d.data() as Card), id: d.id })));
        }
      },
      () => {}
    );

    return () => {
      unsubPacks();
      unsubBoard();
      unsubAnn();
      unsubCards();
    };
  }, []);

  // Authenticated user-scoped listeners
  useEffect(() => {
    if (!authReady || !firebaseUser) return;
    const uid = firebaseUser.uid;

    const unsubProfile = onSnapshot(
      doc(db, 'users', uid),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as UserProfile;
          setFbProfile({ ...data, email: firebaseUser.email || '' });
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, `users/${uid}`)
    );

    const unsubInv = onSnapshot(
      query(collection(db, 'card_inventory'), where('userId', '==', uid)),
      (snap) => {
        setFbInventory(
          snap.docs.map((d) => ({ ...(d.data() as InventoryItem), id: d.id }))
        );
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'card_inventory')
    );

    const unsubOpenings = onSnapshot(
      query(collection(db, 'pack_openings'), where('userId', '==', uid)),
      (snap) => {
        setFbPackOpenings(
          snap.docs.map((d) => ({ ...(d.data() as PackOpening), id: d.id }))
        );
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'pack_openings')
    );

    const unsubBattles = onSnapshot(
      query(collection(db, 'battle_history'), where('userId', '==', uid)),
      (snap) => {
        setFbBattleHistory(
          snap.docs.map((d) => ({ ...(d.data() as BattleHistoryRecord), id: d.id }))
        );
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'battle_history')
    );

    const unsubTx = onSnapshot(
      query(collection(db, 'transactions'), where('userId', '==', uid)),
      (snap) => {
        setFbTransactions(
          snap.docs.map((d) => ({ ...(d.data() as Transaction), id: d.id }))
        );
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'transactions')
    );

    const unsubTrades = onSnapshot(
      query(collection(db, 'trades'), where('status', 'in', ['open', 'offered'])),
      (snap) => {
        setFbTrades(
          snap.docs.map((d) => ({ ...(d.data() as TradeListing), id: d.id }))
        );
      },
      () => {}
    );

    const unsubOwnCards = onSnapshot(
      query(collection(db, 'cards'), where('creatorId', '==', uid)),
      (snap) => {
        const own = snap.docs.map((d) => ({ ...(d.data() as Card), id: d.id }));
        setFbCards((prev) => {
          const map = new Map<string, Card>();
          prev.forEach((c) => map.set(c.id, c));
          own.forEach((c) => map.set(c.id, c));
          return Array.from(map.values());
        });
      },
      () => {}
    );

    const unsubReports = onSnapshot(
      query(collection(db, 'reports'), where('reporterId', '==', uid)),
      (snap) => {
        setFbReports(snap.docs.map((d) => ({ ...(d.data() as ModerationReport), id: d.id })));
      },
      () => {}
    );

    return () => {
      unsubProfile();
      unsubInv();
      unsubOpenings();
      unsubBattles();
      unsubTx();
      unsubTrades();
      unsubOwnCards();
      unsubReports();
    };
  }, [authReady, firebaseUser]);

  const isAuthenticated = Boolean(firebaseUser);
  const profile = isAuthenticated && fbProfile ? fbProfile : guestState.profile;
  const isAdmin =
    Boolean(firebaseUser?.email === 'fawazoklama@gmail.com' && firebaseUser?.emailVerified) ||
    profile.role === 'admin';

  // Merge official cards + Firestore cards + guest custom cards cleanly
  const cards: Card[] = React.useMemo(() => {
    const map = new Map<string, Card>();
    OFFICIAL_CARDS.forEach((c) => map.set(c.id, c));
    fbCards.forEach((c) => map.set(c.id, c));
    if (!isAuthenticated) {
      guestState.customCards.forEach((c) => map.set(c.id, c));
    }
    return Array.from(map.values());
  }, [fbCards, guestState.customCards, isAuthenticated]);

  const packs = fbPacks.length > 0 ? fbPacks : OFFICIAL_PACKS;
  const inventory = isAuthenticated ? fbInventory : guestState.inventory;
  const packOpenings = isAuthenticated ? fbPackOpenings : guestState.packOpenings;
  const battleHistory = isAuthenticated ? fbBattleHistory : guestState.battleHistory;
  const trades = isAuthenticated && fbTrades.length > 0 ? fbTrades : guestState.trades;
  const transactions = isAuthenticated ? fbTransactions : guestState.transactions;
  const announcements = fbAnnouncements.length > 0 ? fbAnnouncements : SEEDED_ANNOUNCEMENTS;

  const leaderboard: LeaderboardEntry[] = React.useMemo(() => {
    const map = new Map<string, LeaderboardEntry>();
    SEEDED_LEADERBOARD.forEach((e) => map.set(e.userId, e));
    fbLeaderboard.forEach((e) => map.set(e.userId, e));
    // Include current player dynamically
    const invCardIds = new Set(inventory.map((i) => i.cardId));
    const ownedCards = cards.filter((c) => invCardIds.has(c.id));
    const legendaryCount = ownedCards.filter((c) => RARITY_RANK[c.rarity] >= 5).length;
    const mythicCount = ownedCards.filter((c) => RARITY_RANK[c.rarity] >= 6).length;
    map.set(profile.uid, {
      userId: profile.uid,
      username: profile.username,
      avatar: profile.avatar,
      level: profile.level,
      totalCards: inventory.reduce((s, i) => s + i.quantity, 0),
      battleWins: profile.battleWins,
      legendaryCount,
      mythicCount,
      updatedAt: new Date().toISOString(),
    });
    return Array.from(map.values());
  }, [fbLeaderboard, profile, inventory, cards]);

  const missionProgress: Record<string, number> = React.useMemo(() => {
    const totalOwned = inventory.reduce((s, i) => s + i.quantity, 0);
    return {
      mission_login: 1,
      mission_pack: packOpenings.length,
      mission_battle: battleHistory.length,
      mission_collect: totalOwned,
    };
  }, [inventory, packOpenings.length, battleHistory.length]);

  const checkAchievements = (
    currentUnlocked: string[],
    nextInventory: InventoryItem[],
    nextWins: number
  ): string[] => {
    const unlocked = new Set(currentUnlocked);
    const totalOwned = nextInventory.reduce((s, i) => s + i.quantity, 0);
    const legCount = nextInventory.filter((item) => {
      const card = cards.find((c) => c.id === item.cardId);
      return card && RARITY_RANK[card.rarity] >= 5;
    }).length;

    for (const ach of ACHIEVEMENTS_CATALOG) {
      if (ach.requirementType === 'cards' && totalOwned >= ach.requirementValue) {
        unlocked.add(ach.id);
      }
      if (ach.requirementType === 'legendary' && legCount >= ach.requirementValue) {
        unlocked.add(ach.id);
      }
      if (ach.requirementType === 'wins' && nextWins >= ach.requirementValue) {
        unlocked.add(ach.id);
      }
    }
    return Array.from(unlocked);
  };

  // Auth methods
  const loginWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const loginWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const registerWithEmail = async (email: string, password: string, username: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: username });
    await sendEmailVerification(cred.user);
    await ensureUserDocument(cred.user);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const logoutUser = async () => {
    await signOut(auth);
  };

  const updateUserProfile = async (updates: {
    username?: string;
    bio?: string;
    avatar?: string;
  }) => {
    const safeUsername = updates.username?.trim().slice(0, 32);
    const safeBio = updates.bio?.trim().slice(0, 300);
    const safeAvatar = updates.avatar?.trim().slice(0, 500);

    if (isAuthenticated && firebaseUser) {
      try {
        await updateDoc(doc(db, 'users', firebaseUser.uid), {
          ...(safeUsername ? { username: safeUsername } : {}),
          ...(safeBio !== undefined ? { bio: safeBio } : {}),
          ...(safeAvatar ? { avatar: safeAvatar } : {}),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${firebaseUser.uid}`);
      }
    } else {
      setGuestState((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          ...(safeUsername ? { username: safeUsername } : {}),
          ...(safeBio !== undefined ? { bio: safeBio } : {}),
          ...(safeAvatar ? { avatar: safeAvatar } : {}),
        },
      }));
    }
  };

  const openPack = async (packId: string) => {
    const result = await openPackOnServer({
      packId,
      userCoins: profile.coins,
      customPool: cards.filter((c) => c.isOfficial),
      customPacks: packs,
    });

    const newCoins = Math.max(0, profile.coins - result.cost);
    const expGain = 35;
    const nextExp = profile.exp + expGain;
    const { level: nextLevel } = calculateLevelFromExp(nextExp);

    if (isAuthenticated && firebaseUser && firebaseUser.emailVerified) {
      try {
        const uid = firebaseUser.uid;
        const batch = writeBatch(db);

        // Record pack opening
        batch.set(doc(db, 'pack_openings', result.openingId), {
          userId: uid,
          packId: result.packId,
          cardIds: result.cardIds,
          highestRarity: result.highestRarity,
          cost: result.cost,
          serverSignature: result.serverSignature,
          createdAt: serverTimestamp(),
        });

        // Update inventory quantities
        const counts = new Map<string, number>();
        result.cardIds.forEach((cid) => counts.set(cid, (counts.get(cid) || 0) + 1));

        const nextInvMap = new Map<string, InventoryItem>();
        inventory.forEach((item) => nextInvMap.set(item.cardId, item));

        counts.forEach((addedQty, cid) => {
          const existingItem = nextInvMap.get(cid);
          const invRef = doc(db, 'card_inventory', `${uid}_${cid}`);
          if (existingItem) {
            batch.update(invRef, {
              quantity: existingItem.quantity + addedQty,
              obtainedFrom: result.packId,
              updatedAt: serverTimestamp(),
            });
          } else {
            batch.set(invRef, {
              userId: uid,
              cardId: cid,
              quantity: addedQty,
              isFavorite: false,
              obtainedFrom: result.packId,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
        });

        const totalCards =
          inventory.reduce((s, i) => s + i.quantity, 0) + result.cardIds.length;
        const unlocked = checkAchievements(profile.unlockedAchievements, inventory, profile.battleWins);

        batch.update(doc(db, 'users', uid), {
          coins: newCoins,
          exp: nextExp,
          level: nextLevel,
          totalCards,
          totalPacksOpened: profile.totalPacksOpened + 1,
          unlockedAchievements: unlocked,
          updatedAt: serverTimestamp(),
        });

        batch.set(doc(db, 'transactions', `tx_${result.openingId}`), {
          userId: uid,
          type: 'pack_open',
          amount: -result.cost,
          referenceId: result.openingId,
          createdAt: serverTimestamp(),
        });

        await batch.commit();
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'pack_openings');
      }
    } else {
      setGuestState((prev) => {
        const nextInv = [...prev.inventory];
        result.cardIds.forEach((cid) => {
          const idx = nextInv.findIndex((i) => i.cardId === cid);
          if (idx >= 0) {
            nextInv[idx] = {
              ...nextInv[idx],
              quantity: nextInv[idx].quantity + 1,
              updatedAt: result.createdAt,
            };
          } else {
            nextInv.push({
              id: `${prev.profile.uid}_${cid}`,
              userId: prev.profile.uid,
              cardId: cid,
              quantity: 1,
              isFavorite: false,
              obtainedFrom: result.packId,
              createdAt: result.createdAt,
              updatedAt: result.createdAt,
            });
          }
        });

        const totalCards = nextInv.reduce((s, i) => s + i.quantity, 0);
        const unlocked = checkAchievements(prev.profile.unlockedAchievements, nextInv, prev.profile.battleWins);

        return {
          ...prev,
          profile: {
            ...prev.profile,
            coins: newCoins,
            exp: nextExp,
            level: nextLevel,
            totalCards,
            totalPacksOpened: prev.profile.totalPacksOpened + 1,
            unlockedAchievements: unlocked,
          },
          inventory: nextInv,
          packOpenings: [
            {
              id: result.openingId,
              userId: prev.profile.uid,
              packId: result.packId,
              packName: result.packName,
              cardIds: result.cardIds,
              highestRarity: result.highestRarity,
              cost: result.cost,
              serverSignature: result.serverSignature,
              createdAt: result.createdAt,
            },
            ...prev.packOpenings,
          ],
          transactions: [
            {
              id: `tx_${result.openingId}`,
              userId: prev.profile.uid,
              type: 'pack_open',
              amount: -result.cost,
              referenceId: result.openingId,
              createdAt: result.createdAt,
            },
            ...prev.transactions,
          ],
        };
      });
    }

    return {
      cards: result.cards,
      highestRarity: result.highestRarity,
      openingId: result.openingId,
    };
  };

  const saveCustomCard = async (
    cardData: Omit<Card, 'id' | 'isOfficial' | 'moderationStatus' | 'creatorId' | 'creatorName'>
  ): Promise<Card> => {
    const id = `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();
    const newCard: Card = {
      ...cardData,
      id,
      isOfficial: false,
      moderationStatus: 'pending',
      creatorId: profile.uid,
      creatorName: profile.username,
      createdAt: now,
      updatedAt: now,
    };

    if (isAuthenticated && firebaseUser && firebaseUser.emailVerified) {
      try {
        const uid = firebaseUser.uid;
        const batch = writeBatch(db);
        batch.set(doc(db, 'cards', id), {
          ...newCard,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        batch.set(doc(db, 'card_inventory', `${uid}_${id}`), {
          userId: uid,
          cardId: id,
          quantity: 1,
          isFavorite: false,
          obtainedFrom: 'card_creator',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        batch.update(doc(db, 'users', uid), {
          totalCards: profile.totalCards + 1,
          updatedAt: serverTimestamp(),
        });
        await batch.commit();
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `cards/${id}`);
      }
    } else {
      setGuestState((prev) => {
        const nextInv: InventoryItem[] = [
          {
            id: `${prev.profile.uid}_${id}`,
            userId: prev.profile.uid,
            cardId: id,
            quantity: 1,
            isFavorite: false,
            obtainedFrom: 'card_creator',
            createdAt: now,
            updatedAt: now,
          },
          ...prev.inventory,
        ];
        return {
          ...prev,
          customCards: [newCard, ...prev.customCards],
          inventory: nextInv,
          profile: {
            ...prev.profile,
            totalCards: nextInv.reduce((s, i) => s + i.quantity, 0),
          },
        };
      });
    }

    return newCard;
  };

  const toggleFavoriteCard = async (cardId: string) => {
    const existing = inventory.find((i) => i.cardId === cardId);
    if (!existing) return;
    const nextFav = !existing.isFavorite;

    if (isAuthenticated && firebaseUser) {
      try {
        await updateDoc(doc(db, 'card_inventory', `${firebaseUser.uid}_${cardId}`), {
          isFavorite: nextFav,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `card_inventory/${firebaseUser.uid}_${cardId}`);
      }
    } else {
      setGuestState((prev) => ({
        ...prev,
        inventory: prev.inventory.map((i) =>
          i.cardId === cardId ? { ...i, isFavorite: nextFav } : i
        ),
        profile: {
          ...prev.profile,
          favoriteCardIds: nextFav
            ? Array.from(new Set([...prev.profile.favoriteCardIds, cardId]))
            : prev.profile.favoriteCardIds.filter((id) => id !== cardId),
        },
      }));
    }
  };

  const recordBattleResult = async (params: {
    mode: 'practice' | 'casual' | 'ranked';
    result: 'victory' | 'defeat';
    playerCardId: string;
    enemyCardId: string;
    turns: number;
    rewardCoins: number;
    rewardExp: number;
  }) => {
    const historyId = `bh_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();
    const nextBattles = profile.totalBattles + 1;
    const nextWins = profile.battleWins + (params.result === 'victory' ? 1 : 0);
    const nextWinRate = Math.round((nextWins / nextBattles) * 100);
    const nextCoins = profile.coins + params.rewardCoins;
    const nextExp = profile.exp + params.rewardExp;
    const { level: nextLevel } = calculateLevelFromExp(nextExp);

    if (isAuthenticated && firebaseUser && firebaseUser.emailVerified) {
      try {
        const uid = firebaseUser.uid;
        const batch = writeBatch(db);
        batch.set(doc(db, 'battle_history', historyId), {
          userId: uid,
          mode: params.mode,
          result: params.result,
          playerCardId: params.playerCardId,
          enemyCardId: params.enemyCardId,
          turns: params.turns,
          rewardCoins: params.rewardCoins,
          rewardExp: params.rewardExp,
          createdAt: serverTimestamp(),
        });
        batch.set(doc(db, 'transactions', `tx_${historyId}`), {
          userId: uid,
          type: 'battle_reward',
          amount: params.rewardCoins,
          referenceId: historyId,
          createdAt: serverTimestamp(),
        });
        batch.update(doc(db, 'users', uid), {
          coins: nextCoins,
          exp: nextExp,
          level: nextLevel,
          totalBattles: nextBattles,
          battleWins: nextWins,
          winRate: nextWinRate,
          unlockedAchievements: checkAchievements(profile.unlockedAchievements, inventory, nextWins),
          updatedAt: serverTimestamp(),
        });
        await batch.commit();
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'battle_history');
      }
    } else {
      setGuestState((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          coins: nextCoins,
          exp: nextExp,
          level: nextLevel,
          totalBattles: nextBattles,
          battleWins: nextWins,
          winRate: nextWinRate,
          unlockedAchievements: checkAchievements(
            prev.profile.unlockedAchievements,
            prev.inventory,
            nextWins
          ),
        },
        battleHistory: [
          {
            id: historyId,
            userId: prev.profile.uid,
            ...params,
            createdAt: now,
          },
          ...prev.battleHistory,
        ],
        transactions: [
          {
            id: `tx_${historyId}`,
            userId: prev.profile.uid,
            type: 'battle_reward',
            amount: params.rewardCoins,
            referenceId: historyId,
            createdAt: now,
          },
          ...prev.transactions,
        ],
      }));
    }
  };

  const claimMission = async (missionId: string) => {
    if (profile.completedMissionIds.includes(missionId)) return;
    const mission = DAILY_MISSIONS_CATALOG.find((m) => m.id === missionId);
    if (!mission) return;
    const progress = missionProgress[missionId] || 0;
    if (progress < mission.targetCount) return;

    const nextCoins = profile.coins + mission.rewardCoins;
    const nextExp = profile.exp + mission.rewardExp;
    const { level: nextLevel } = calculateLevelFromExp(nextExp);
    const nextCompleted = [...profile.completedMissionIds, missionId];
    const now = new Date().toISOString();
    const txId = `tx_mission_${missionId}_${Date.now()}`;

    if (isAuthenticated && firebaseUser && firebaseUser.emailVerified) {
      try {
        const uid = firebaseUser.uid;
        const batch = writeBatch(db);
        batch.update(doc(db, 'users', uid), {
          coins: nextCoins,
          exp: nextExp,
          level: nextLevel,
          completedMissionIds: nextCompleted,
          updatedAt: serverTimestamp(),
        });
        batch.set(doc(db, 'transactions', txId), {
          userId: uid,
          type: 'mission_reward',
          amount: mission.rewardCoins,
          referenceId: missionId,
          createdAt: serverTimestamp(),
        });
        await batch.commit();
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${firebaseUser.uid}`);
      }
    } else {
      setGuestState((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          coins: nextCoins,
          exp: nextExp,
          level: nextLevel,
          completedMissionIds: nextCompleted,
        },
        transactions: [
          {
            id: txId,
            userId: prev.profile.uid,
            type: 'mission_reward',
            amount: mission.rewardCoins,
            referenceId: missionId,
            createdAt: now,
          },
          ...prev.transactions,
        ],
      }));
    }
  };

  const createTradeListing = async (
    offeredCardId: string,
    priceCoins: number,
    requestedCardId?: string
  ) => {
    if (!isValidFirestoreId(offeredCardId)) return;
    const safePrice = Math.max(10, Math.min(1000000, Math.round(priceCoins)));
    const tradeId = `trade_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();

    if (isAuthenticated && firebaseUser && firebaseUser.emailVerified) {
      try {
        await setDoc(doc(db, 'trades', tradeId), {
          sellerId: firebaseUser.uid,
          sellerName: profile.username,
          offeredCardId,
          ...(requestedCardId ? { requestedCardId } : {}),
          priceCoins: safePrice,
          status: 'open',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `trades/${tradeId}`);
      }
    } else {
      const listing: TradeListing = {
        id: tradeId,
        sellerId: profile.uid,
        sellerName: profile.username,
        offeredCardId,
        requestedCardId,
        priceCoins: safePrice,
        status: 'open',
        createdAt: now,
        updatedAt: now,
      };
      setGuestState((prev) => ({ ...prev, trades: [listing, ...prev.trades] }));
    }
  };

  const buyOrOfferTrade = async (trade: TradeListing, action: 'buy' | 'offer') => {
    if (trade.sellerId === profile.uid) {
      throw new Error('Cannot trade your own listing');
    }
    if (action === 'buy' && profile.coins < trade.priceCoins) {
      throw new Error('Insufficient virtual coins');
    }

    await validateTradeOnServer({
      tradeId: trade.id,
      sellerId: trade.sellerId,
      buyerId: profile.uid,
    });

    const now = new Date().toISOString();

    if (isAuthenticated && firebaseUser && firebaseUser.emailVerified) {
      try {
        const uid = firebaseUser.uid;
        await runTransaction(db, async (tx) => {
          const tradeRef = doc(db, 'trades', trade.id);
          const tradeSnap = await tx.get(tradeRef);
          if (!tradeSnap.exists() || tradeSnap.data().status !== 'open') {
            throw new Error('Listing is no longer open');
          }
          tx.update(tradeRef, {
            buyerId: uid,
            buyerName: profile.username,
            status: action === 'buy' ? 'completed' : 'offered',
            updatedAt: serverTimestamp(),
          });
          if (action === 'buy') {
            const invRef = doc(db, 'card_inventory', `${uid}_${trade.offeredCardId}`);
            const invSnap = await tx.get(invRef);
            if (invSnap.exists()) {
              tx.update(invRef, {
                quantity: (invSnap.data().quantity || 0) + 1,
                obtainedFrom: `trade_${trade.id}`,
                updatedAt: serverTimestamp(),
              });
            } else {
              tx.set(invRef, {
                userId: uid,
                cardId: trade.offeredCardId,
                quantity: 1,
                isFavorite: false,
                obtainedFrom: `trade_${trade.id}`,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            }
            tx.update(doc(db, 'users', uid), {
              coins: profile.coins - trade.priceCoins,
              totalCards: profile.totalCards + 1,
              updatedAt: serverTimestamp(),
            });
          }
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `trades/${trade.id}`);
      }
    } else {
      setGuestState((prev) => {
        const nextTrades = prev.trades.map((t) =>
          t.id === trade.id
            ? {
                ...t,
                buyerId: prev.profile.uid,
                buyerName: prev.profile.username,
                status: action === 'buy' ? ('completed' as const) : ('offered' as const),
                updatedAt: now,
              }
            : t
        );
        if (action === 'offer') {
          return { ...prev, trades: nextTrades };
        }
        const nextInv = [...prev.inventory];
        const idx = nextInv.findIndex((i) => i.cardId === trade.offeredCardId);
        if (idx >= 0) {
          nextInv[idx] = { ...nextInv[idx], quantity: nextInv[idx].quantity + 1, updatedAt: now };
        } else {
          nextInv.push({
            id: `${prev.profile.uid}_${trade.offeredCardId}`,
            userId: prev.profile.uid,
            cardId: trade.offeredCardId,
            quantity: 1,
            isFavorite: false,
            obtainedFrom: `trade_${trade.id}`,
            createdAt: now,
            updatedAt: now,
          });
        }
        return {
          ...prev,
          trades: nextTrades,
          inventory: nextInv,
          profile: {
            ...prev.profile,
            coins: prev.profile.coins - trade.priceCoins,
            totalCards: nextInv.reduce((s, i) => s + i.quantity, 0),
          },
          transactions: [
            {
              id: `tx_trade_${trade.id}`,
              userId: prev.profile.uid,
              type: 'trade_buy',
              amount: -trade.priceCoins,
              referenceId: trade.id,
              createdAt: now,
            },
            ...prev.transactions,
          ],
        };
      });
    }
  };

  const resolveTradeListing = async (
    trade: TradeListing,
    action: 'accept' | 'reject' | 'cancel'
  ) => {
    const nextStatus =
      action === 'accept' ? 'completed' : action === 'reject' ? 'rejected' : 'cancelled';
    const now = new Date().toISOString();

    if (isAuthenticated && firebaseUser && firebaseUser.emailVerified) {
      try {
        await updateDoc(doc(db, 'trades', trade.id), {
          status: nextStatus,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `trades/${trade.id}`);
      }
    } else {
      setGuestState((prev) => ({
        ...prev,
        trades: prev.trades.map((t) =>
          t.id === trade.id ? { ...t, status: nextStatus, updatedAt: now } : t
        ),
      }));
    }
  };

  const reportCard = async (cardId: string, reason: string) => {
    const reportId = `rep_${Date.now()}`;
    const now = new Date().toISOString();
    if (isAuthenticated && firebaseUser && firebaseUser.emailVerified) {
      try {
        await setDoc(doc(db, 'reports', reportId), {
          reporterId: firebaseUser.uid,
          targetCardId: cardId,
          reason: reason.slice(0, 300),
          status: 'open',
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `reports/${reportId}`);
      }
    } else {
      setFbReports((prev) => [
        { id: reportId, reporterId: profile.uid, targetCardId: cardId, reason, status: 'open', createdAt: now },
        ...prev,
      ]);
    }
  };

  const adminCreateOfficialCard = async (
    cardData: Omit<Card, 'id' | 'isOfficial' | 'moderationStatus' | 'creatorId' | 'creatorName'>
  ) => {
    if (!isAdmin) throw new Error('Admin privileges required');
    const id = `zhar_official_${Date.now()}`;
    const newCard: Card = {
      ...cardData,
      id,
      isOfficial: true,
      moderationStatus: 'approved',
      creatorId: profile.uid,
      creatorName: 'ZharWorld Official',
    };
    if (isAuthenticated) {
      try {
        await setDoc(doc(db, 'cards', id), {
          ...newCard,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `cards/${id}`);
      }
    } else {
      setFbCards((prev) => [newCard, ...prev]);
    }
  };

  const adminModerateCard = async (cardId: string, status: 'approved' | 'rejected') => {
    if (!isAdmin) throw new Error('Admin privileges required');
    if (isAuthenticated) {
      try {
        await updateDoc(doc(db, 'cards', cardId), {
          moderationStatus: status,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `cards/${cardId}`);
      }
    }
  };

  const adminUpdatePack = async (packId: string, updates: Partial<Pack>) => {
    if (!isAdmin) throw new Error('Admin privileges required');
    const target = packs.find((p) => p.id === packId);
    if (!target) return;
    const merged = { ...target, ...updates };
    if (isAuthenticated) {
      try {
        await setDoc(doc(db, 'packs', packId), {
          ...merged,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `packs/${packId}`);
      }
    }
  };

  const adminPublishAnnouncement = async (title: string, body: string) => {
    if (!isAdmin) throw new Error('Admin privileges required');
    const id = `ann_${Date.now()}`;
    if (isAuthenticated && firebaseUser) {
      try {
        await setDoc(doc(db, 'announcements', id), {
          title: title.slice(0, 100),
          body: body.slice(0, 500),
          authorId: firebaseUser.uid,
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `announcements/${id}`);
      }
    }
  };

  return (
    <GameContext.Provider
      value={{
        firebaseUser,
        authReady,
        isAuthenticated,
        isAdmin,
        profile,
        cards,
        packs,
        inventory,
        packOpenings,
        battleHistory,
        trades,
        leaderboard,
        transactions,
        announcements,
        reports: fbReports,
        missionProgress,
        settings,
        updateSettings,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        resetPassword,
        logoutUser,
        updateUserProfile,
        openPack,
        saveCustomCard,
        toggleFavoriteCard,
        recordBattleResult,
        claimMission,
        createTradeListing,
        buyOrOfferTrade,
        resolveTradeListing,
        reportCard,
        adminCreateOfficialCard,
        adminModerateCard,
        adminUpdatePack,
        adminPublishAnnouncement,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  return ctx;
}
