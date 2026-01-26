export enum Rarity {
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
  MYTHIC = 'MYTHIC',
  CONTRABAND = 'CONTRABAND',
  GODLIKE = 'GODLIKE'
}

export type ItemType = 'equipment' | 'character' | 'key' | 'artifact';

export interface Item {
  id: string; // Unique instance ID
  templateId: string; // ID of the item template
  name: string;
  rarity: Rarity;
  value: number;
  icon: string; // Lucide icon name or image URL placeholder
  type: ItemType;
  obtainedAt: number;
}

export interface ItemTemplate {
  id: string;
  name: string;
  rarity: Rarity;
  baseValue: number;
  icon: string;
  type: ItemType;
  circulation: number; // Estimated number in existence
  hidden?: boolean; // If true, won't show in shop/flash sales
}

export interface AuctionListing {
  id: string;
  item: ItemTemplate;
  price: number;
  seller: string;
  expiresAt: number;
}

export interface TradeOffer {
  code: string;
  item: Item;
  creator: string;
  createdAt: number;
}

export interface Case {
  id: string;
  name: string;
  price: number; // Cost of the case itself (if any, usually 0 if requiring key)
  keyTemplateId?: string; // ID of the key required to open
  image: string;
  levelRequired: number;
  description: string;
  contains: {
    templateId: string;
    weight: number;
  }[];
}

export interface PlayerStats {
  casesOpened: number;
  itemsUpgraded: number;
  jackpotsHit: number;
  totalClicks: number;
  // New Stats
  totalMoneySpent: number;
  totalItemValueObtained: number; // From cases/slots
  bestDropValue: number;
  bestDropName: string;
  worstLossValue: number; // Highest diff between cost and item value
  legendariesPulled: number;
  mythicsPulled: number;
  contrabandsPulled: number;
}

export interface PromoCode {
  code: string;
  reward: number;
  maxUses: number;
  currentUses: number;
}

export interface GameState {
  username: string | null;
  // Email removed
  isAdmin: boolean;
  isPremium: boolean;
  rememberMe: boolean;
  balance: number;
  xp: number;
  level: number;
  inventory: Item[];
  stats: PlayerStats;
  lastDailyReward: number;
  auctionListings: AuctionListing[];
  userListings: { id: string; item: Item; price: number; listedAt: number }[];
  activeTrades: TradeOffer[];
  
  // Admin / Event State
  globalLuckMultiplier: number;
  activeEvent: string | null;
  maintenanceMode: boolean; // New: Maintenance Mode
  circulationCounts: Record<string, number>; // New: Dynamic Circulation
  promoCodes: PromoCode[];
  redeemedCodes: string[]; // List of codes this user has redeemed
}

export const RARITY_COLORS = {
  [Rarity.COMMON]: { text: 'text-slate-400', bg: 'bg-slate-500', border: 'border-slate-500', glow: 'shadow-slate-500/50' },
  [Rarity.UNCOMMON]: { text: 'text-green-400', bg: 'bg-green-500', border: 'border-green-500', glow: 'shadow-green-500/50' },
  [Rarity.RARE]: { text: 'text-blue-400', bg: 'bg-blue-500', border: 'border-blue-500', glow: 'shadow-blue-500/50' },
  [Rarity.EPIC]: { text: 'text-purple-400', bg: 'bg-purple-500', border: 'border-purple-500', glow: 'shadow-purple-500/50' },
  [Rarity.LEGENDARY]: { text: 'text-yellow-400', bg: 'bg-yellow-500', border: 'border-yellow-500', glow: 'shadow-yellow-500/50' },
  [Rarity.MYTHIC]: { text: 'text-red-500', bg: 'bg-red-600', border: 'border-red-600', glow: 'shadow-red-600/50' },
  [Rarity.CONTRABAND]: { text: 'text-amber-600', bg: 'bg-amber-700', border: 'border-amber-600', glow: 'shadow-amber-600/50' },
  [Rarity.GODLIKE]: { text: 'text-cyan-400', bg: 'bg-cyan-900', border: 'border-cyan-500', glow: 'shadow-cyan-500/100' },
};

export const RARITY_ORDER = [
  Rarity.COMMON,
  Rarity.UNCOMMON,
  Rarity.RARE,
  Rarity.EPIC,
  Rarity.LEGENDARY,
  Rarity.MYTHIC,
  Rarity.CONTRABAND,
  Rarity.GODLIKE
];