export type Rarity =
  | 'COMMON'
  | 'UNCOMMON'
  | 'RARE'
  | 'EPIC'
  | 'LEGENDARY'
  | 'MYTHIC'
  | 'SECRET';

export type ElementType =
  | 'Fire'
  | 'Water'
  | 'Wind'
  | 'Earth'
  | 'Light'
  | 'Dark'
  | 'Ice'
  | 'Thunder';

export type Language = 'id' | 'en';
export type ThemeMode = 'light' | 'dark';

export type CardTemplate =
  | 'Fantasy Hero'
  | 'Sky Guardian'
  | 'Dragon'
  | 'Angel'
  | 'Demon'
  | 'Mystic Creature'
  | 'Cyber Warrior';

export interface Card {
  id: string;
  name: string;
  nameEn?: string;
  description: string;
  descriptionEn?: string;
  imageUrl: string;
  rarity: Rarity;
  element: ElementType;
  hp: number;
  attack: number;
  defense: number;
  skillName: string;
  skillNameEn?: string;
  skillDescription: string;
  skillDescriptionEn?: string;
  template?: CardTemplate;
  frameStyle?: 'sky-crystal' | 'gold-celestial' | 'obsidian-void' | 'aurora-prism';
  bgStyle?: 'cloud-citadel' | 'starlight-navy' | 'sunset-portal' | 'ice-sanctum';
  borderStyle?: 'clean' | 'ornate' | 'cyber' | 'prism';
  effectStyle?: 'none' | 'shimmer' | 'aurora' | 'lightning';
  typographyStyle?: 'display' | 'serif' | 'mono';
  accentColor?: string;
  isHolographic?: boolean;
  isOfficial: boolean;
  moderationStatus: 'approved' | 'pending' | 'rejected';
  creatorId: string;
  creatorName: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryItem {
  id: string;
  userId: string;
  cardId: string;
  quantity: number;
  isFavorite: boolean;
  obtainedFrom: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pack {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  price: number;
  cardCount: number;
  guaranteedMinRarity: Rarity;
  dropRates: Record<Rarity, number>;
  artworkUrl: string;
  accentHex: string;
}

export interface PackOpening {
  id: string;
  userId: string;
  packId: string;
  packName: string;
  cardIds: string[];
  highestRarity: Rarity;
  cost: number;
  serverSignature: string;
  createdAt: string;
}

export type BattleMode = 'practice' | 'casual' | 'ranked';

export interface BattleLogEntry {
  turn: number;
  actor: 'player' | 'enemy' | 'system';
  action: 'attack' | 'defense' | 'skill' | 'summon' | 'finish';
  damage?: number;
  heal?: number;
  isEffective?: boolean;
  messageId: string;
  messageEn: string;
}

export interface BattleState {
  id: string;
  playerId: string;
  mode: BattleMode;
  status: 'active' | 'finished';
  winner: 'none' | 'player' | 'opponent';
  playerCard: Card;
  enemyCard: Card;
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
  playerEnergy: number;
  enemyEnergy: number;
  playerDefending: boolean;
  enemyDefending: boolean;
  turnCount: number;
  logs: BattleLogEntry[];
  rewardCoins: number;
  rewardExp: number;
}

export interface BattleHistoryRecord {
  id: string;
  userId: string;
  mode: BattleMode;
  result: 'victory' | 'defeat';
  playerCardId: string;
  enemyCardId: string;
  turns: number;
  rewardCoins: number;
  rewardExp: number;
  createdAt: string;
}

export interface TradeListing {
  id: string;
  sellerId: string;
  sellerName: string;
  buyerId?: string;
  buyerName?: string;
  offeredCardId: string;
  requestedCardId?: string;
  priceCoins: number;
  status: 'open' | 'offered' | 'completed' | 'cancelled' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  rewardCoins: number;
  rewardExp: number;
  requirementType: 'cards' | 'legendary' | 'wins' | 'packs';
  requirementValue: number;
}

export interface DailyMission {
  id: string;
  title: string;
  titleEn: string;
  type: 'login' | 'pack' | 'battle' | 'collect';
  targetCount: number;
  rewardCoins: number;
  rewardExp: number;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatar: string;
  level: number;
  totalCards: number;
  battleWins: number;
  legendaryCount: number;
  mythicCount: number;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'pack_open' | 'battle_reward' | 'mission_reward' | 'trade_buy' | 'trade_sell' | 'starter_bonus';
  amount: number;
  referenceId: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  titleEn?: string;
  body: string;
  bodyEn?: string;
  authorId: string;
  createdAt: string;
}

export interface ModerationReport {
  id: string;
  reporterId: string;
  targetCardId: string;
  reason: string;
  status: 'open' | 'resolved';
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  avatar: string;
  bio: string;
  level: number;
  exp: number;
  coins: number;
  totalCards: number;
  totalPacksOpened: number;
  totalBattles: number;
  battleWins: number;
  winRate: number;
  role: 'user' | 'admin';
  unlockedAchievements: string[];
  completedMissionIds: string[];
  favoriteCardIds: string[];
  joinDate: string;
}

export interface AppSettings {
  musicEnabled: boolean;
  sfxEnabled: boolean;
  reducedAnimations: boolean;
  notificationsEnabled: boolean;
}
