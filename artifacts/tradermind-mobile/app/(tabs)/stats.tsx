import React from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { StatCard } from '@/components/StatCard';
import { useTrades, useAllStats } from '@/context/TradesContext';
import type { TradeResult } from '@/types';

// Simple bar chart using Views
function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? value / max : 0;
  return (
    <View style={barStyles.container}>
      <View style={[barStyles.fill, { flex: pct, backgroundColor: color }]} />
      <View style={{ flex: 1 - pct }} />
    </View>
  );
}

const barStyles = StyleSheet.create({
  container: { height: 6, borderRadius: 3, flexDirection: 'row', overflow: 'hidden', backgroundColor: 'transparent' },
  fill: { borderRadius: 3 },
});

// Distribution by result
function ResultDistribution({ trades }: { trades: any[] }) {
  const colors = useColors();

  const counts: Record<TradeResult, number> = {
    win: 0, 'partial-win': 0, loss: 0, 'partial-loss': 0, breakeven: 0,
  };
  for (const t of trades) counts[t.result as TradeResult]++;
  const max = Math.max(...Object.values(counts), 1);

  const rows: { label: string; result: TradeResult; color: string }[] = [
    { label: 'سود', result: 'win', color: colors.success },
    { label: 'سود جزئی', result: 'partial-win', color: colors.success + 'aa' },
    { label: 'ضرر', result: 'loss', color: colors.destructive },
    { label: 'ضرر جزئی', result: 'partial-loss', color: colors.destructive + 'aa' },
    { label: 'سربه‌سر', result: 'breakeven', color: colors.mutedForeground },
  ];

  return (
    <View style={[distStyles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[distStyles.title, { color: colors.foreground }]}>توزیع نتایج</Text>
      {rows.map(r => (
        <View key={r.result} style={distStyles.row}>
          <Text style={[distStyles.count, { color: colors.mutedForeground }]}>{counts[r.result]}</Text>
          <View style={distStyles.barWrap}>
            <MiniBar value={counts[r.result]} max={max} color={r.color} />
          </View>
          <Text style={[distStyles.label, { color: colors.foreground }]}>{r.label}</Text>
        </View>
      ))}
    </View>
  );
}

const distStyles = StyleSheet.create({
  card: { borderRadius: 12, borderWidth: 1, padding: 16, gap: 12 },
  title: { fontSize: 14, fontWeight: '600', textAlign: 'right', marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  barWrap: { flex: 1 },
  label: { fontSize: 13, textAlign: 'right', minWidth: 60 },
  count: { fontSize: 12, minWidth: 24, textAlign: 'left' },
});

// Monthly P&L summary
function MonthlyChart({ trades }: { trades: any[] }) {
  const colors = useColors();

  // Last 6 months
  const months: { label: string; pnl: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const pnl = trades
      .filter(t => t.timestamp >= d.getTime() && t.timestamp < next.getTime())
      .reduce((s: number, t: any) => s + (t.profitLoss ?? 0), 0);
    months.push({
      label: d.toLocaleDateString('fa-IR', { month: 'short' }),
      pnl,
    });
  }

  const maxAbs = Math.max(...months.map(m => Math.abs(m.pnl)), 1);
  const barHeight = 60;

  return (
    <View style={[chartStyles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[chartStyles.title, { color: colors.foreground }]}>سود/زیان ماهانه ($)</Text>
      <View style={chartStyles.bars}>
        {months.map((m, i) => {
          const ratio = Math.abs(m.pnl) / maxAbs;
          const h = Math.max(ratio * barHeight, 2);
          const isPos = m.pnl >= 0;
          return (
            <View key={i} style={chartStyles.barCol}>
              <Text style={[chartStyles.value, { color: isPos ? colors.success : colors.destructive }]}>
                {m.pnl === 0 ? '' : (isPos ? '+' : '') + m.pnl.toFixed(0)}
              </Text>
              <View style={[chartStyles.bar, { height: h, backgroundColor: isPos ? colors.success : colors.destructive }]} />
              <Text style={[chartStyles.monthLabel, { color: colors.mutedForeground }]}>{m.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const chartStyles = StyleSheet.create({
  card: { borderRadius: 12, borderWidth: 1, padding: 16 },
  title: { fontSize: 14, fontWeight: '600', textAlign: 'right', marginBottom: 16 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 90 },
  barCol: { alignItems: 'center', gap: 4, flex: 1 },
  bar: { borderRadius: 4, width: '60%', minHeight: 2 },
  value: { fontSize: 9, fontWeight: '600' },
  monthLabel: { fontSize: 10 },
});

export default function StatsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { trades, loading } = useTrades();
  const stats = useAllStats(trades);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const pnlColor = stats.totalPnl >= 0 ? colors.success : colors.destructive;
  const pnlStr = stats.totalPnl >= 0
    ? `+$${stats.totalPnl.toFixed(2)}`
    : `-$${Math.abs(stats.totalPnl).toFixed(2)}`;

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: topPad + 16, paddingBottom: Platform.OS === 'web' ? 100 : 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>آمار کلی</Text>

        {/* Top stats */}
        <View style={styles.row}>
          <StatCard label="کل معاملات" value={String(stats.total)} flex={1} />
          <StatCard label="نرخ برد" value={stats.total > 0 ? `${stats.winRate.toFixed(1)}%` : '—'} flex={1} />
        </View>
        <View style={styles.row}>
          <StatCard
            label="سود/زیان کل"
            value={stats.total > 0 ? pnlStr : '—'}
            accent={stats.total > 0 ? pnlColor : undefined}
            flex={1}
          />
          <StatCard
            label="میانگین R"
            value={stats.total > 0 ? `${stats.avgR >= 0 ? '+' : ''}${stats.avgR.toFixed(2)}R` : '—'}
            accent={stats.total > 0 ? (stats.avgR >= 0 ? colors.success : colors.destructive) : undefined}
            flex={1}
          />
        </View>

        {/* Streak */}
        {stats.streak > 1 && (
          <View style={[styles.streakCard, {
            backgroundColor: stats.streakType === 'win' ? colors.success + '20' : colors.destructive + '20',
            borderColor: stats.streakType === 'win' ? colors.success : colors.destructive,
          }]}>
            <Text style={[styles.streakText, { color: stats.streakType === 'win' ? colors.success : colors.destructive }]}>
              {stats.streak} معامله متوالی {stats.streakType === 'win' ? 'برنده 🔥' : 'بازنده'}
            </Text>
          </View>
        )}

        {/* Charts */}
        {trades.length > 0 ? (
          <>
            <ResultDistribution trades={trades} />
            <MonthlyChart trades={trades} />
          </>
        ) : (
          <View style={[styles.empty, { borderColor: colors.border }]}>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              هنوز داده‌ای برای نمایش نیست
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 16, gap: 12 },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'right', marginBottom: 8 },
  row: { flexDirection: 'row', gap: 10 },
  streakCard: { borderRadius: 12, borderWidth: 1, padding: 14, alignItems: 'center' },
  streakText: { fontSize: 15, fontWeight: '600' },
  empty: { borderWidth: 1, borderStyle: 'dashed', borderRadius: 12, padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 14 },
});
