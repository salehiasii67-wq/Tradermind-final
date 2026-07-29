import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import type { TradeResult } from '@/types';
import { RESULT_LABELS } from '@/types';

interface ResultBadgeProps {
  result: TradeResult;
}

export function ResultBadge({ result }: ResultBadgeProps) {
  const colors = useColors();

  const config: Record<TradeResult, { bg: string; text: string }> = {
    win: { bg: colors.success + '26', text: colors.success },
    'partial-win': { bg: colors.success + '1a', text: colors.success },
    loss: { bg: colors.destructive + '26', text: colors.destructive },
    'partial-loss': { bg: colors.destructive + '1a', text: colors.destructive },
    breakeven: { bg: colors.mutedForeground + '26', text: colors.mutedForeground },
  };

  const { bg, text } = config[result];

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.label, { color: text }]}>{RESULT_LABELS[result]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
});
