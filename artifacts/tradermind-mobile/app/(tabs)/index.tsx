import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { StatCard } from '@/components/StatCard';
import { TradeCard } from '@/components/TradeCard';
import { useTrades, useTodayStats } from '@/context/TradesContext';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'صبح بخیر';
  if (h < 17) return 'ظهر بخیر';
  return 'عصر بخیر';
}

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { trades, loading, deleteTrade } = useTrades();
  const todayStats = useTodayStats(trades);

  const pnlColor = todayStats.totalPnl >= 0 ? colors.success : colors.destructive;
  const pnlStr = todayStats.totalPnl >= 0
    ? `+$${todayStats.totalPnl.toFixed(2)}`
    : `-$${Math.abs(todayStats.totalPnl).toFixed(2)}`;

  const recentTrades = trades.slice(0, 5);

  const handleAdd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/trade-form');
  };

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

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
        contentContainerStyle={[styles.content, { paddingTop: topPad + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={handleAdd}
            activeOpacity={0.8}
          >
            <Feather name="plus" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={[styles.greeting, { color: colors.mutedForeground }]}>{getGreeting()}</Text>
            <Text style={[styles.title, { color: colors.foreground }]}>TraderMind</Text>
          </View>
        </View>

        {/* Today Stats */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>امروز</Text>
        <View style={styles.statsRow}>
          <StatCard
            label="معاملات"
            value={String(todayStats.count)}
            sub="امروز"
            flex={1}
          />
          <StatCard
            label="نرخ برد"
            value={todayStats.count > 0 ? `${todayStats.winRate.toFixed(0)}%` : '—'}
            flex={1}
          />
          <StatCard
            label="سود/زیان"
            value={todayStats.count > 0 ? pnlStr : '—'}
            accent={todayStats.count > 0 ? pnlColor : undefined}
            flex={1}
          />
        </View>

        {/* Recent Trades */}
        <View style={styles.sectionHeader}>
          <TouchableOpacity onPress={() => router.push('/(tabs)/trades')}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>همه</Text>
          </TouchableOpacity>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginBottom: 0 }]}>
            آخرین معاملات
          </Text>
        </View>

        {recentTrades.length === 0 ? (
          <View style={[styles.empty, { borderColor: colors.border }]}>
            <Feather name="bar-chart-2" size={32} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              هنوز معامله‌ای ثبت نشده
            </Text>
            <TouchableOpacity
              style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
              onPress={handleAdd}
              activeOpacity={0.8}
            >
              <Text style={styles.emptyBtnText}>ثبت اولین معامله</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.list}>
            {recentTrades.map(trade => (
              <TradeCard key={trade.id} trade={trade} onDelete={deleteTrade} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 16, paddingBottom: Platform.OS === 'web' ? 100 : 32 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerText: { alignItems: 'flex-end' },
  greeting: { fontSize: 13, marginBottom: 2 },
  title: { fontSize: 26, fontWeight: '700' },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 10,
  },
  seeAll: { fontSize: 13, fontWeight: '500' },
  statsRow: { flexDirection: 'row', gap: 10 },
  list: { gap: 10 },
  empty: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  emptyText: { fontSize: 14, textAlign: 'center' },
  emptyBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  emptyBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
