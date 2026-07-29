export type Direction = 'long' | 'short';
export type TradeResult = 'win' | 'loss' | 'breakeven' | 'partial-win' | 'partial-loss';
export type TradingSession = 'london' | 'newyork' | 'asian' | 'overlap';
export type Emotion = 'calm' | 'confident' | 'anxious' | 'greedy' | 'fearful' | 'neutral';
export type Adherence = 'fully' | 'mostly' | 'partially' | 'not';

export interface Trade {
  id: string;
  symbol: string;
  direction: Direction;
  result: TradeResult;
  profitLoss: number | null;
  rMultiple: number | null;
  tradingSession: TradingSession | null;
  notes: string;
  timestamp: number; // openedAt ms
  createdAt: number;
}

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  emotion: Emotion;
  adherence: Adherence;
  reflection: string;
  timestamp: number;
}

export const RESULT_LABELS: Record<TradeResult, string> = {
  win: 'سود',
  loss: 'ضرر',
  breakeven: 'سربه‌سر',
  'partial-win': 'سود جزئی',
  'partial-loss': 'ضرر جزئی',
};

export const DIRECTION_LABELS: Record<Direction, string> = {
  long: 'خرید',
  short: 'فروش',
};

export const SESSION_LABELS: Record<TradingSession, string> = {
  london: 'لندن',
  newyork: 'نیویورک',
  asian: 'آسیا',
  overlap: 'تداخل',
};

export const EMOTION_LABELS: Record<Emotion, string> = {
  calm: 'آرام',
  confident: 'مطمئن',
  anxious: 'مضطرب',
  greedy: 'طمع‌کار',
  fearful: 'ترسیده',
  neutral: 'خنثی',
};

export const ADHERENCE_LABELS: Record<Adherence, string> = {
  fully: 'کامل',
  mostly: 'اکثراً',
  partially: 'نسبی',
  not: 'خیر',
};
