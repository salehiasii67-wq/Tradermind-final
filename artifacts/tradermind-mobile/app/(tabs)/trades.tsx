import React, { useState } from 'react';
import {
  FlatList,
  Platform,
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
import { TradeCard } from '@/components/TradeCard';
import { useTrades } from '@/context/TradesContext';
import type { TradeResult } from '@/types';

const FILTERS: { label: string; value: TradeResult | 'all' }[] = [
  { label: 'همه', value: 'all' },
  { label: 'سود', value: 'win' },
  { label: 'ضرر', value: 'loss' },
  { label: 'سربه‌سر', value: 'breakeven' },
];

export default function TradesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { trades, deleteTrade } = useTrades();
  const [filter, setFilter] = useState<TradeResult | 'all'>('all');

  const filtered = filter === 'all' ? trades : trades.filter(t => t.result === filter);
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Fixed header */}
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={styles.titleRow}>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/trade-form');
            }}
          >
            <Feather name="plus" size={18} color="#fff" />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.foreground }]}>معاملات</Text>
        </View>

        {/* Filter chips */}
        <View style={styles.filters}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f.value}
              style={[
                styles.chip,
                {
                  backgroundColor: filter === f.value ? colors.primary : colors.secondary,
                  borderColor: filter === f.value ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setFilter(f.value)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, { color: filter === f.value ? '#fff' : colors.mutedForeground }]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={t => t.id}
        renderItem={({ item }) => <TradeCard trade={item} onDelete={deleteTrade} />}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: Platform.OS === 'web' ? 100 : 32 },
        ]}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        scrollEnabled={!!filtered.length}
        ListEmptyComponent={
          <View style={[styles.empty, { borderColor: colors.border }]}>
            <Feather name="inbox" size={36} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              {filter === 'all' ? 'هیچ معامله‌ای ثبت نشده' : 'نتیجه‌ای یافت نشد'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { fontSize: 22, fontWeight: '700' },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filters: { flexDirection: 'row', gap: 8, justifyContent: 'flex-end' },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontWeight: '500' },
  list: { padding: 16 },
  empty: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    gap: 10,
    margin: 16,
  },
  emptyText: { fontSize: 14, textAlign: 'center' },
});
