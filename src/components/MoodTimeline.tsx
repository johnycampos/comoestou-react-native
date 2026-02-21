import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCollection, useFirestore, useUser } from '../firebase';

type MoodEntry = { id: string; date: string; mood: number; notes?: string | null; heartRate?: number | null };

const moodEmojis: Record<number, string> = {
  1: '😞',
  2: '😟',
  3: '😐',
  4: '🙂',
  5: '😄',
};

interface Props {
  onEntryPress: (entry: MoodEntry) => void;
}

export function MoodTimeline({ onEntryPress }: Props) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { data: moodData, loading } = useCollection<MoodEntry>(
    firestore,
    user ? `users/${user.uid}/moods` : '',
    { orderBy: 'date', orderDirection: 'desc', limit: 30 }
  );

  if (loading) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Seu Histórico de Humor</Text>
        <Text style={styles.subtitle}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Seu Histórico de Humor</Text>
      <Text style={styles.subtitle}>Uma retrospectiva de suas entradas recentes.</Text>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {!moodData || moodData.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              Nenhuma entrada de humor ainda.{'\n'}
              Comece a registrar seu humor para ver seu histórico aqui.
            </Text>
          </View>
        ) : (
          moodData.map((entry, index) => (
            <View key={entry.id}>
              <TouchableOpacity style={styles.row} onPress={() => onEntryPress(entry)} activeOpacity={0.7}>
                <View style={styles.emojiCol}>
                  <Text style={styles.emoji}>{moodEmojis[entry.mood] ?? '😐'}</Text>
                  {entry.heartRate != null && (
                    <View style={styles.heartRateTag}>
                      <Text style={styles.heartRateText}>❤️ {entry.heartRate}</Text>
                    </View>
                  )}
                  <Text style={styles.date}>
                    {format(new Date(entry.date), "dd 'de' MMM", { locale: ptBR })}
                  </Text>
                </View>
                <View style={styles.notesCol}>
                  <Text style={entry.notes ? styles.notes : styles.notesEmpty}>
                    {entry.notes || 'Nenhuma nota para este dia.'}
                  </Text>
                </View>
              </TouchableOpacity>
              {index < moodData.length - 1 && <View style={styles.separator} />}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 20,
  },
  title: { fontSize: 18, fontWeight: '600', color: '#f8fafc', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#94a3b8', marginBottom: 16 },
  scroll: { maxHeight: 400 },
  empty: {
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 22,
  },
  row: { flexDirection: 'row', gap: 16, paddingVertical: 16 },
  emojiCol: { alignItems: 'center', width: 64 },
  emoji: { fontSize: 28, marginBottom: 4 },
  date: { fontSize: 12, color: '#94a3b8' },
  notesCol: { flex: 1 },
  notes: { fontSize: 14, color: '#f8fafc' },
  notesEmpty: { fontSize: 14, color: '#64748b', fontStyle: 'italic' },
  separator: { height: 1, backgroundColor: '#334155' },
  heartRateTag: { marginBottom: 4 },
  heartRateText: { fontSize: 11, color: '#f87171', fontWeight: '600' },
});
