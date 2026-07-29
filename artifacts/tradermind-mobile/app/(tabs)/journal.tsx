import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useTrades } from '@/context/TradesContext';
import type { Emotion, Adherence } from '@/types';
import { EMOTION_LABELS, ADHERENCE_LABELS } from '@/types';

const EMOTIONS: Emotion[] = ['calm', 'confident', 'neutral', 'anxious', 'fearful', 'greedy'];
const ADHERENCES: Adherence[] = ['fully', 'mostly', 'partially', 'not'];

const EMOTION_ICONS: Record<Emotion, string> = {
  calm: '😌', confident: '💪', anxious: '😰', greedy: '🤑', fearful: '😨', neutral: '😐',
};

export default function JournalScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { todayJournal, saveJournal, loading } = useTrades();

  const [emotion, setEmotion] = useState<Emotion>('neutral');
  const [adherence, setAdherence] = useState<Adherence>('fully');
  const [reflection, setReflection] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (todayJournal) {
      setEmotion(todayJournal.emotion);
      setAdherence(todayJournal.adherence);
      setReflection(todayJournal.reflection);
    }
  }, [todayJournal]);

  const handleSave = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await saveJournal({ emotion, adherence, reflection });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
        contentContainerStyle={[styles.content, { paddingTop: topPad + 16, paddingBottom: Platform.OS === 'web' ? 100 : 40 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.date, { color: colors.mutedForeground }]}>
            {new Date().toLocaleDateString('fa-IR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Text>
          <Text style={[styles.title, { color: colors.foreground }]}>ژورنال روزانه</Text>
        </View>

        {/* Emotion picker */}
        <Text style={[styles.label, { color: colors.mutedForeground }]}>احساس امروز</Text>
        <View style={styles.emotionGrid}>
          {EMOTIONS.map(e => (
            <TouchableOpacity
              key={e}
              style={[
                styles.emotionBtn,
                {
                  backgroundColor: emotion === e ? colors.primary + '33' : colors.card,
                  borderColor: emotion === e ? colors.primary : colors.border,
                },
              ]}
              onPress={() => { Haptics.selectionAsync(); setEmotion(e); }}
              activeOpacity={0.7}
            >
              <Text style={styles.emotionIcon}>{EMOTION_ICONS[e]}</Text>
              <Text style={[styles.emotionLabel, { color: emotion === e ? colors.primary : colors.mutedForeground }]}>
                {EMOTION_LABELS[e]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Adherence */}
        <Text style={[styles.label, { color: colors.mutedForeground }]}>پایبندی به پلن</Text>
        <View style={styles.adherenceRow}>
          {ADHERENCES.map(a => (
            <TouchableOpacity
              key={a}
              style={[
                styles.adherenceBtn,
                {
                  backgroundColor: adherence === a ? colors.primary : colors.secondary,
                  borderColor: adherence === a ? colors.primary : colors.border,
                },
              ]}
              onPress={() => { Haptics.selectionAsync(); setAdherence(a); }}
              activeOpacity={0.7}
            >
              <Text style={[styles.adherenceText, { color: adherence === a ? '#fff' : colors.mutedForeground }]}>
                {ADHERENCE_LABELS[a]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Reflection */}
        <Text style={[styles.label, { color: colors.mutedForeground }]}>بازتاب و درس‌های امروز</Text>
        <TextInput
          style={[styles.textarea, {
            backgroundColor: colors.card,
            borderColor: colors.border,
            color: colors.foreground,
          }]}
          value={reflection}
          onChangeText={setReflection}
          placeholder="چه اتفاقی افتاد؟ چه یاد گرفتی؟"
          placeholderTextColor={colors.mutedForeground}
          multiline
          numberOfLines={6}
          textAlign="right"
          textAlignVertical="top"
        />

        {/* Save */}
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: saved ? colors.success : colors.primary }]}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          <Feather name={saved ? 'check' : 'save'} size={18} color="#fff" />
          <Text style={styles.saveBtnText}>{saved ? 'ذخیره شد' : 'ذخیره ژورنال'}</Text>
        </TouchableOpacity>

        {/* Past entries count */}
        {todayJournal && (
          <Text style={[styles.existingNote, { color: colors.mutedForeground }]}>
            ✓ ژورنال امروز ذخیره شده — ویرایش می‌کنید
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 16, gap: 12 },
  header: { alignItems: 'flex-end', marginBottom: 8 },
  date: { fontSize: 12, marginBottom: 4 },
  title: { fontSize: 24, fontWeight: '700' },
  label: { fontSize: 12, fontWeight: '600', textAlign: 'right', textTransform: 'uppercase', letterSpacing: 0.4 },
  emotionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'flex-end' },
  emotionBtn: {
    width: '30%',
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 4,
  },
  emotionIcon: { fontSize: 22 },
  emotionLabel: { fontSize: 12, fontWeight: '500' },
  adherenceRow: { flexDirection: 'row', gap: 8, justifyContent: 'flex-end' },
  adherenceBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  adherenceText: { fontSize: 13, fontWeight: '500' },
  textarea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    minHeight: 120,
    lineHeight: 22,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    gap: 8,
    marginTop: 4,
  },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  existingNote: { fontSize: 12, textAlign: 'center', marginTop: -4 },
});
