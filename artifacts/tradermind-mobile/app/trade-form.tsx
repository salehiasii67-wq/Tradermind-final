import React, { useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useTrades } from '@/context/TradesContext';
import type { Direction, TradeResult, TradingSession } from '@/types';
import { DIRECTION_LABELS, RESULT_LABELS, SESSION_LABELS } from '@/types';

const SYMBOLS = ['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD', 'BTCUSD', 'ETHUSD', 'US30', 'US100', 'GBPJPY', 'AUDUSD'];
const DIRECTIONS: Direction[] = ['long', 'short'];
const RESULTS: TradeResult[] = ['win', 'partial-win', 'loss', 'partial-loss', 'breakeven'];
const SESSIONS: TradingSession[] = ['london', 'newyork', 'asian', 'overlap'];

interface ToggleGroupProps<T extends string> {
  options: T[];
  labels: Record<T, string>;
  value: T;
  onChange: (v: T) => void;
  colorFn?: (v: T) => string;
}

function ToggleGroup<T extends string>({ options, labels, value, onChange, colorFn }: ToggleGroupProps<T>) {
  const colors = useColors();
  return (
    <View style={tgStyles.row}>
      {options.map(o => {
        const active = value === o;
        const accent = colorFn ? colorFn(o) : colors.primary;
        return (
          <TouchableOpacity
            key={o}
            style={[tgStyles.btn, {
              backgroundColor: active ? accent + '33' : colors.secondary,
              borderColor: active ? accent : colors.border,
            }]}
            onPress={() => { Haptics.selectionAsync(); onChange(o); }}
            activeOpacity={0.7}
          >
            <Text style={[tgStyles.label, { color: active ? accent : colors.mutedForeground }]}>
              {labels[o]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const tgStyles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end' },
  btn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, borderWidth: 1 },
  label: { fontSize: 13, fontWeight: '500' },
});

export default function TradeFormScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addTrade } = useTrades();

  const [symbol, setSymbol] = useState('EURUSD');
  const [customSymbol, setCustomSymbol] = useState('');
  const [direction, setDirection] = useState<Direction>('long');
  const [result, setResult] = useState<TradeResult>('win');
  const [session, setSession] = useState<TradingSession>('london');
  const [pnlStr, setPnlStr] = useState('');
  const [rStr, setRStr] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const finalSymbol = symbol === '__custom__' ? customSymbol.toUpperCase() : symbol;

  const handleSave = async () => {
    if (!finalSymbol.trim()) return;
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      await addTrade({
        symbol: finalSymbol.trim(),
        direction,
        result,
        profitLoss: pnlStr ? parseFloat(pnlStr) : null,
        rMultiple: rStr ? parseFloat(rStr) : null,
        tradingSession: session,
        notes,
      });
      router.back();
    } finally {
      setSaving(false);
    }
  };

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const dirColor = (d: Direction) => d === 'long' ? colors.success : colors.destructive;
  const resultColor = (r: TradeResult) =>
    r === 'win' || r === 'partial-win' ? colors.success :
    r === 'loss' || r === 'partial-loss' ? colors.destructive :
    colors.mutedForeground;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: colors.border, backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="x" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>ثبت معامله</Text>
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: saving ? colors.muted : colors.primary }]}
          onPress={handleSave}
          disabled={saving || !finalSymbol.trim()}
          activeOpacity={0.8}
        >
          <Text style={styles.saveBtnText}>ذخیره</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Platform.OS === 'web' ? 100 : insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Symbol */}
        <Text style={[styles.label, { color: colors.mutedForeground }]}>نماد</Text>
        <View style={tgStyles.row}>
          {SYMBOLS.map(s => (
            <TouchableOpacity
              key={s}
              style={[tgStyles.btn, {
                backgroundColor: symbol === s ? colors.primary + '33' : colors.secondary,
                borderColor: symbol === s ? colors.primary : colors.border,
              }]}
              onPress={() => { setSymbol(s); Haptics.selectionAsync(); }}
              activeOpacity={0.7}
            >
              <Text style={[tgStyles.label, { color: symbol === s ? colors.primary : colors.mutedForeground }]}>{s}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[tgStyles.btn, {
              backgroundColor: symbol === '__custom__' ? colors.primary + '33' : colors.secondary,
              borderColor: symbol === '__custom__' ? colors.primary : colors.border,
            }]}
            onPress={() => { setSymbol('__custom__'); Haptics.selectionAsync(); }}
            activeOpacity={0.7}
          >
            <Text style={[tgStyles.label, { color: symbol === '__custom__' ? colors.primary : colors.mutedForeground }]}>سایر</Text>
          </TouchableOpacity>
        </View>
        {symbol === '__custom__' && (
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
            value={customSymbol}
            onChangeText={setCustomSymbol}
            placeholder="نام نماد را وارد کنید"
            placeholderTextColor={colors.mutedForeground}
            autoCapitalize="characters"
            textAlign="right"
          />
        )}

        {/* Direction */}
        <Text style={[styles.label, { color: colors.mutedForeground }]}>جهت</Text>
        <ToggleGroup
          options={DIRECTIONS}
          labels={DIRECTION_LABELS}
          value={direction}
          onChange={setDirection}
          colorFn={dirColor}
        />

        {/* Result */}
        <Text style={[styles.label, { color: colors.mutedForeground }]}>نتیجه</Text>
        <ToggleGroup
          options={RESULTS}
          labels={RESULT_LABELS}
          value={result}
          onChange={setResult}
          colorFn={resultColor}
        />

        {/* Session */}
        <Text style={[styles.label, { color: colors.mutedForeground }]}>جلسه معاملاتی</Text>
        <ToggleGroup
          options={SESSIONS}
          labels={SESSION_LABELS}
          value={session}
          onChange={setSession}
        />

        {/* P&L + R */}
        <View style={styles.numRow}>
          <View style={styles.numField}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>R Multiple</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
              value={rStr}
              onChangeText={setRStr}
              placeholder="مثال: 2.5"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="decimal-pad"
              textAlign="right"
            />
          </View>
          <View style={styles.numField}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>سود/زیان ($)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
              value={pnlStr}
              onChangeText={setPnlStr}
              placeholder="مثال: -50"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="decimal-pad"
              textAlign="right"
            />
          </View>
        </View>

        {/* Notes */}
        <Text style={[styles.label, { color: colors.mutedForeground }]}>یادداشت</Text>
        <TextInput
          style={[styles.textarea, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
          value={notes}
          onChangeText={setNotes}
          placeholder="چه اتفاقی افتاد؟ درس؟"
          placeholderTextColor={colors.mutedForeground}
          multiline
          numberOfLines={4}
          textAlign="right"
          textAlignVertical="top"
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 17, fontWeight: '600' },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  content: { padding: 16, gap: 10 },
  label: { fontSize: 12, fontWeight: '600', textAlign: 'right', textTransform: 'uppercase', letterSpacing: 0.4 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
  },
  textarea: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    minHeight: 90,
    lineHeight: 22,
  },
  numRow: { flexDirection: 'row', gap: 12 },
  numField: { flex: 1, gap: 6 },
});
