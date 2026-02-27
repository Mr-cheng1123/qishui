// Soda Smugglers 游戏类型定义

// 行李箱卡片
export interface SuitcaseCard {
  id: string;
  bottles: number; // 0, 1, 2, 3
}

// 事件卡
export interface EventCard {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  effect: EventEffect;
}

export type EventEffect = 
  | 'night_shift'      // +1 接受贿赂
  | 'holiday_season'   // 每个旅行者打包3个行李箱
  | 'temptation'       // 边境守卫可以拿走所有贿赂
  | 'birthday'         // 守卫获得2瓶盖，2瓶合法
  | 'sniffer_dog'      // 揭示最多瓶子的行李箱
  | 'superior_officer' // +1 检查，可重复检查同一人
  | 'tip_off'          // +1 逮捕，错误无惩罚
  | 'breakage';        // 失去1逮捕代币，合法限制变为0

// 玩家
export interface Player {
  id: string;
  name: string;
  avatar: string;
  bottleCaps: number;
  isBorderGuard: boolean;
  isReady: boolean;
  isConnected: boolean;
}

// 旅行者状态
export interface TravelerState {
  playerId: string;
  luggage: SuitcaseCard[];  // 2张行李卡（面朝下）
  bribe: SuitcaseCard | null; // 1张贿赂卡
  revealedLuggage: SuitcaseCard[]; // 已揭示的行李
  isBribeAccepted: boolean;
  isArrested: boolean;
  isWavedThrough: boolean;
}

// 游戏阶段
export type GamePhase = 
  | 'waiting'      // 等待玩家加入
  | 'setup'        // 游戏设置
  | 'event'        // 揭示事件卡
  | 'selecting'    // 旅行者选择行李和贿赂
  | 'bribe_reveal' // 揭示贿赂
  | 'guard_action' // 边境守卫行动
  | 'resolution'   // 结算阶段
  | 'scoring'      // 计分阶段
  | 'game_end';    // 游戏结束

// 边境守卫行动
export type GuardAction = 
  | 'accept_bribe'
  | 'inspect_suitcase'
  | 'arrest';

// 行动令牌
export interface ActionToken {
  type: GuardAction;
  used: boolean;
  targetPlayerId?: string;
}

// 游戏房间
export interface GameRoom {
  id: string;
  code: string;
  players: Player[];
  phase: GamePhase;
  round: number;
  maxRounds: number;
  currentBorderGuardId: string;
  eventCard: EventCard | null;
  suitcaseDeck: SuitcaseCard[];
  discardPile: SuitcaseCard[];
  travelerStates: Map<string, TravelerState>;
  actionTokens: ActionToken[];
  generalStock: number; // 总库存瓶盖数
  legalLimit: number; // 合法限制（通常为1）
}

// 游戏配置
export interface GameConfig {
  minPlayers: number;
  maxPlayers: number;
  bottleCapValues: number[];
  initialBottleCaps: number;
  suitcasesPerTraveler: number;
  actionTokensByPlayerCount: Record<number, { acceptBribe: number; inspect: number; arrest: number }>;
}

// 游戏设置
export const GAME_CONFIG: GameConfig = {
  minPlayers: 3,
  maxPlayers: 8,
  bottleCapValues: [1, 1, 3, 5, 10, 20, 30],
  initialBottleCaps: 10,
  suitcasesPerTraveler: 5,
  actionTokensByPlayerCount: {
    3: { acceptBribe: 1, inspect: 1, arrest: 1 },
    4: { acceptBribe: 1, inspect: 1, arrest: 1 },
    5: { acceptBribe: 1, inspect: 1, arrest: 2 },
    6: { acceptBribe: 1, inspect: 2, arrest: 2 },
    7: { acceptBribe: 2, inspect: 2, arrest: 2 },
    8: { acceptBribe: 2, inspect: 2, arrest: 3 },
  }
};

// 8张事件卡
export const EVENT_CARDS: EventCard[] = [
  {
    id: 'night_shift',
    name: '夜班',
    nameEn: 'Night Shift',
    description: '边境守卫在本回合获得一个额外的"接受贿赂"行动令牌',
    effect: 'night_shift'
  },
  {
    id: 'holiday_season',
    name: '假日季节',
    nameEn: 'Holiday Season',
    description: '每个旅行者打包3个行李箱而不是2个（但仍只允许携带1瓶过境）',
    effect: 'holiday_season'
  },
  {
    id: 'temptation',
    name: '诱惑',
    nameEn: 'Temptation',
    description: '边境守卫可以接受所有旅行者的贿赂（不限数量）',
    effect: 'temptation'
  },
  {
    id: 'birthday',
    name: '生日',
    nameEn: 'Birthday',
    description: '边境守卫获得2个瓶盖。本回合每位旅行者可以合法携带2瓶汽水过境',
    effect: 'birthday'
  },
  {
    id: 'sniffer_dog',
    name: '嗅探犬',
    nameEn: 'Sniffer Dog',
    description: '边境守卫选择一名旅行者，该旅行者必须展示装有最多瓶子的行李箱',
    effect: 'sniffer_dog'
  },
  {
    id: 'superior_officer',
    name: '上级警官',
    nameEn: 'Superior Officer',
    description: '边境守卫获得一个额外的"检查行李箱"令牌，可以用于已经检查过的旅行者',
    effect: 'superior_officer'
  },
  {
    id: 'tip_off',
    name: '线报',
    nameEn: 'Tip-Off',
    description: '边境守卫获得一个额外的"逮捕"令牌，且错误逮捕时没有惩罚',
    effect: 'tip_off'
  },
  {
    id: 'breakage',
    name: '破损',
    nameEn: 'Breakage',
    description: '边境守卫失去1个"逮捕"令牌。本回合合法携带限制变为0瓶',
    effect: 'breakage'
  }
];

// 行李箱卡组配置
export const SUITCASE_DECK_CONFIG = {
  zeroBottles: 5,
  oneBottle: 12,
  twoBottles: 12,
  threeBottles: 7
};

// 生成行李箱卡组
export function generateSuitcaseDeck(): SuitcaseCard[] {
  const deck: SuitcaseCard[] = [];
  let id = 0;
  
  for (let i = 0; i < SUITCASE_DECK_CONFIG.zeroBottles; i++) {
    deck.push({ id: `suitcase_${id++}`, bottles: 0 });
  }
  for (let i = 0; i < SUITCASE_DECK_CONFIG.oneBottle; i++) {
    deck.push({ id: `suitcase_${id++}`, bottles: 1 });
  }
  for (let i = 0; i < SUITCASE_DECK_CONFIG.twoBottles; i++) {
    deck.push({ id: `suitcase_${id++}`, bottles: 2 });
  }
  for (let i = 0; i < SUITCASE_DECK_CONFIG.threeBottles; i++) {
    deck.push({ id: `suitcase_${id++}`, bottles: 3 });
  }
  
  return shuffleDeck(deck);
}

// 洗牌
export function shuffleDeck<T>(deck: T[]): T[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// 生成房间代码
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// 计算总瓶盖数
export function calculateTotalBottleCaps(bottleCaps: number[]): number {
  return bottleCaps.reduce((sum, cap) => sum + cap, 0);
}
