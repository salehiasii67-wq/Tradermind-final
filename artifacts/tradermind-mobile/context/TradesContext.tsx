import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Trade, JournalEntry, TradeResult, Direction, TradingSession, Emotion, Adherence } from '@/types';

const TRADES_KEY = '@tradermind:trades';
const JOURNAL_KEY = '@tradermind:journal';

function genId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface NewTrade {
  symbol: string;
  direction: Direction;
  result: TradeResult;
  profitLoss: number | null;
  rMultiple: number | null;
  tradingSession: TradingSession | null;
  notes: string;
}

export interface NewJournalEntry {
  emotion: Emotion;
  adherence: Adherence;
  reflection: string;
}

interface TradesContextValue {
  trades: Trade[];
  journal: JournalEntry[];
  loading: boolean;
  addTrade: (t: NewTrade) => Promise<void>;
  deleteTrade: (id: string) => Promise<void>;
  todayJournal: JournalEntry | null;
  saveJournal: (entry: NewJournalEntry) => Promise<void>;
}

// ── Context ──────────────────────────────────────────────────────────────────

const TradesContext = createContext<TradesContextValue | null>(null);

export function TradesProvider({ children }: { children: React.ReactNode }) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Load
  useEffect(() => {
    (async () => {
      try {
        const [tRaw, jRaw] = await Promise.all([
          AsyncStorage.getItem(TRADES_KEY),
          AsyncStorage.getItem(JOURNAL_KEY),
        ]);
        if (tRaw) setTrades(JSON.parse(tRaw));
        if (jRaw) setJournal(JSON.parse(jRaw));
      } catch {
        // ignore parse errors
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const addTrade = useCallback(async (t: NewTrade) => {
    const trade: Trade = {
      id: genId(),
      ...t,
      timestamp: Date.now(),
      createdAt: Date.now(),
    };
    const next = [trade, ...trades];
    setTrades(next);
    await AsyncStorage.setItem(TRADES_KEY, JSON.stringify(next));
  }, [trades]);

  const deleteTrade = useCallback(async (id: string) => {
    const next = trades.filter(t => t.id !== id);
    setTrades(next);
    await AsyncStorage.setItem(TRADES_KEY, JSON.stringify(next));
  }, [trades]);

  const todayStr_ = todayStr();
  const todayJournal = journal.find(j => j.date === todayStr_) ?? null;

  const saveJournal = useCallback(async (entry: NewJournalEntry) => {
    const existing = journal.find(j => j.date === todayStr_);
    let next: JournalEntry[];
    if (existing) {
      next = journal.map(j => j.date === todayStr_
        ? { ...j, ...entry, timestamp: Date.now() }
        : j
      );
    } else {
      const newEntry: JournalEntry = {
        id: genId(),
        date: todayStr_,
        ...entry,
        timestamp: Date.now(),
      };
      next = [newEntry, ...journal];
    }
    setJournal(next);
    await AsyncStorage.setItem(JOURNAL_KEY, JSON.stringify(next));
  }, [journal, todayStr_]);

  return (
    <TradesContext.Provider value={{ trades, journal, loading, addTrade, deleteTrade, todayJournal, saveJournal }}>
      {children}
    </TradesContext.Provider>
  );
}

export function useTrades(): TradesContextValue {
  const ctx = useContext(TradesContext);
  if (!ctx) throw new Error('useTrades must be used within TradesProvider');
  return ctx;
}

// ── Selectors ────────────────────────────────────────────────────────────────

export function useTodayStats(trades: Trade[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTs = today.getTime();

  const todayTrades = trades.filter(t => t.timestamp >= todayTs);
  const closed = todayTrades.filter(t => t.result !== 'win' || true); // all
  const wins = todayTrades.filter(t => t.result === 'win' || t.result === 'partial-win');
  const totalPnl = todayTrades.reduce((s, t) => s + (t.profitLoss ?? 0), 0);
  const winRate = closed.length > 0 ? (wins.length / closed.length) * 100 : 0;

  return { count: todayTrades.length, winRate, totalPnl };
}

export function useAllStats(trades: Trade[]) {
  const closed = trades;
  const wins = trades.filter(t => t.result === 'win' || t.result === 'partial-win');
  const losses = trades.filter(t => t.result === 'loss' || t.result === 'partial-loss');
  const totalPnl = trades.reduce((s, t) => s + (t.profitLoss ?? 0), 0);
  const winRate = closed.length > 0 ? (wins.length / closed.length) * 100 : 0;
  const avgR = trades.filter(t => t.rMultiple != null).length > 0
    ? trades.reduce((s, t) => s + (t.rMultiple ?? 0), 0) / trades.filter(t => t.rMultiple != null).length
    : 0;

  // Current streak
  let streak = 0;
  let streakType: 'win' | 'loss' | null = null;
  for (const t of trades) {
    const isWin = t.result === 'win' || t.result === 'partial-win';
    const isLoss = t.result === 'loss' || t.result === 'partial-loss';
    if (streak === 0) {
      if (isWin) { streakType = 'win'; streak = 1; }
      else if (isLoss) { streakType = 'loss'; streak = 1; }
    } else if (streakType === 'win' && isWin) streak++;
    else if (streakType === 'loss' && isLoss) streak++;
    else break;
  }

  return { total: closed.length, wins: wins.length, losses: losses.length, winRate, totalPnl, avgR, streak, streakType };
}
