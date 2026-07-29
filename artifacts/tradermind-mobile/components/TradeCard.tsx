import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { ResultBadge } from './ResultBadge';
import type { Trade } from '@/types';
import { DIRECTION_LABELS, SESSION_LABELS } from '@/types';

interface TradeCardProps {
  trade: Trade;
  onDelete: (id: string) => void;
}

function formatPnl(pnl: number | null): string {
  if (pnl == null) return '—';
  const sign = pnl >= 0 ? '+' : '';
  return `${sign}$${Math.abs(pnl).toFixed(2)}`;
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' });
}

export function TradeCard({ trade, onDelete }: TradeCardProps) {
  const colors = useColors();

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('حذف معامله', 'آیا مطمئن هستید?', [
      { text: 'انصراف', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: () => onDelete(trade.id) },
    ]);
  };

  const pnlColor = (trade.profitLoss ?? 0) >= 0 ? colors.success : colors.destructive;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Header row */}
      <View style={styles.row}>
        <TouchableOpacity onPress={handleDelete} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <Feather name="trash-2" size={16} color={colors.mutedForeground} />
        </TouchableOpacity>

        <View style={styles.headerRight}>
          <ResultBadge result={trade.result} />
          <View style={[styles.dirBadge, {
            backgroundColor: trade.direction === 'long' ? colors.success + '20' : colors.destructive + '20',
          }]}>
            <Text style={[styles.dirText, {
              color: trade.direction === 'long' ? colors.success : colors.destructive,
            }]}>
              {DIRECTION_LABELS[trade.direction]}
            </Text>
          </View>
          <Text style={[styles.symbol, { color: colors.foreground }]}>{trade.symbol}</Text>
        </View>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <Text style={[styles.date, { color: colors.mutedForeground }]}>
          {formatDate(trade.timestamp)}
          {trade.tradingSession ? `  ·  ${SESSION_LABELS[trade.tradingSession]}` : ''}
        </Text>

        <View style={styles.metricsRight}>
          {trade.rMultiple != null && (
            <Text style={[styles.metric, { color: colors.mutedForeground }]}>
              {trade.rMultiple >= 0 ? '+' : ''}{trade.rMultiple.toFixed(1)}R
            </Text>
          )}
          {trade.profitLoss != null && (
            <Text style={[styles.pnl, { color: pnlColor }]}>
              {formatPnl(trade.profitLoss)}
            </Text>
          )}
        </View>
      </View>

      {trade.notes ? (
        <Text style={[styles.notes, { color: colors.mutedForeground }]} numberOfLines={1}>
          {trade.notes}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  symbol: {
    fontSize: 16,
    fontWeight: '700',
  },
  dirBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  dirText: {
    fontSize: 11,
    fontWeight: '600',
  },
  pnl: {
    fontSize: 15,
    fontWeight: '700',
  },
  metric: {
    fontSize: 13,
    fontWeight: '500',
  },
  date: {
    fontSize: 12,
  },
  notes: {
    fontSize: 12,
    textAlign: 'right',
  },
});
