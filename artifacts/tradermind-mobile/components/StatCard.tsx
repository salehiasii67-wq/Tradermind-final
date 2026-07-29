import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  accent?: string; // override color for value
  flex?: number;
}

export function StatCard({ label, value, sub, accent, flex = 1 }: StatCardProps) {
  const colors = useColors();

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, flex }]}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.value, { color: accent ?? colors.foreground }]}>{value}</Text>
      {sub ? <Text style={[styles.sub, { color: colors.mutedForeground }]}>{sub}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'right',
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'right',
  },
  sub: {
    fontSize: 11,
    textAlign: 'right',
  },
});
