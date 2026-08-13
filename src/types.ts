/**
 * Types & Interfaces for 3D Subway Surfers Engine
 */

export type Lane = -1 | 0 | 1; // -1: Left, 0: Center, 1: Right

export type PowerUpType = 'magnet' | 'hoverboard' | 'jetpack' | 'multiplier' | 'sneakers';

export interface PowerUpActiveState {
  type: PowerUpType;
  duration: number; // remaining duration in seconds
  maxDuration: number;
}

export interface ConsumableInventory {
  hoverboardCount: number; // Single-use hoverboard shields
  headstartCount: number; // Single-use Headstart Rocket boosts
  magnetBoostCount: number; // Single-use Magnet start boosts
  scoreBoosterCount: number; // Single-use +5x Score Multiplier boosts
}

export interface PermanentUpgrades {
  baseSpeedLevel: number; // 1 to 5
  baseMultiplierLevel: number; // 1 to 5
  magnetLevel: number; // 1 to 5
  hoverboardLevel: number; // 1 to 5
  jetpackLevel: number; // 1 to 5
  multiplierLevel: number; // 1 to 5
  sneakersLevel: number; // 1 to 5
}

export interface DailyTaskState {
  id: string;
  type: 'collect_coins' | 'run_distance' | 'dodge_combo' | 'use_hoverboard' | 'collect_powerups' | 'score_points';
  title: string;
  description: string;
  targetValue: number;
  currentProgress: number;
  claimed: boolean;
  rewardCoins: number;
  rewardHoverboards?: number;
  icon: string;
  color: string;
  completedAt?: number;
}

export interface DailyChallengeState {
  dateKey: string; // YYYY-MM-DD
  tasks: DailyTaskState[];
  challengeId?: string;
  currentProgress?: number;
  targetValue?: number;
  claimed?: boolean;
  rewardCoins?: number;
  rewardHoverboards?: number;
  completedAt?: number;
}

export interface PlayerStats {
  coins: number;
  totalCoinsCollected: number;
  highScore: number;
  longestTime?: number; // Longest run time record in seconds
  currentScore: number;
  distance: number;
  multiplier: number;
  selectedCharacter: string;
  selectedBoard: string;
  unlockedCharacters: string[];
  unlockedBoards: string[];
  selectedSkins?: Record<string, string>; // e.g. { 'Jake Hero': 'jake_brooklyn' }
  unlockedSkins?: string[]; // list of unlocked skin ids e.g. ['jake_default', 'jake_brooklyn']
  dailyChallenge?: DailyChallengeState;
  powerUpUpgrades: {
    magnetLevel: number;
    hoverboardLevel: number;
    jetpackLevel: number;
    multiplierLevel: number;
    sneakersLevel: number;
  };
  consumables?: ConsumableInventory;
  permanentUpgrades?: PermanentUpgrades;
}

export interface ShopConsumableItem {
  id: keyof ConsumableInventory;
  name: string;
  price: number;
  unitAmount: number;
  description: string;
  iconName: string;
  badgeText: string;
  color: string;
}

export interface ShopPermanentUpgrade {
  id: keyof PermanentUpgrades;
  name: string;
  basePrice: number;
  maxLevel: number;
  description: string;
  perLevelBonus: string;
  iconName: string;
  color: string;
}

export interface ShopCharacter {
  id: string;
  name: string;
  price: number;
  unlocked: boolean;
  color: string;
  description: string;
  perk: string;
  avatarIcon: string;
  effect_logic: string;
  skins?: CharacterSkin[];
}

export interface CharacterSkin {
  id: string;
  characterId: string;
  name: string;
  price: number;
  unlocked: boolean;
  color: string;
  description: string;
  perk: string;
  avatarIcon: string;
  torsoColorHex?: number;
  pantsColorHex?: number;
  hairColorHex?: number;
  hatColorHex?: number;
  emissiveHex?: number;
  emissiveIntensity?: number;
  accessoryType?: 'backpack' | 'glasses' | 'headband' | 'crown' | 'headphones' | 'scarf' | 'freight_helmet';
}

export interface ShopBoard {
  id: string;
  name: string;
  price: number;
  unlocked: boolean;
  color: string;
  description: string;
  perk: string;
  effect_logic: string;
  trailType: 'flame' | 'plasma' | 'neon' | 'rainbow' | 'standard';
}

export interface PerformanceMetrics {
  fps: number;
  frameTimeMs: number;
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
  activePoolObjects: number;
  totalPoolObjects: number;
  spatialGridNodes: number;
  workerLatencyMs: number;
}

export interface TouchGesture {
  type: 'swipe_left' | 'swipe_right' | 'swipe_up' | 'swipe_down' | 'double_tap';
  timestamp: number;
}

export interface ObstacleData {
  id: string;
  type: 'train' | 'cargo_container' | 'barrier_low' | 'barrier_high' | 'ramp' | 'arch';
  lane: Lane;
  positionZ: number;
  height: number;
  width: number;
  length: number;
  active: boolean;
  dodged?: boolean;
}

export interface ComboState {
  comboCount: number;
  comboTimer: number;
  comboMaxTimer: number;
  bonusMultiplier: number;
  lastDodgeText?: string;
  lastDodgeTimestamp?: number;
}

export interface CoinData {
  id: string;
  lane: Lane;
  positionY: number;
  positionZ: number;
  collected: boolean;
  active: boolean;
  magneticLerp?: number;
}

export interface PowerUpData {
  id: string;
  type: PowerUpType;
  lane: Lane;
  positionZ: number;
  active: boolean;
  collected: boolean;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  coins: number;
  character: string;
  board: string;
  country: string;
  date: string;
}

