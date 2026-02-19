import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useUser, useFirestore } from '../firebase';

const moodOptions = [
  { level: 1, label: 'Péssimo', emoji: '😞' },
  { level: 2, label: 'Ruim', emoji: '😟' },
  { level: 3, label: 'Ok', emoji: '😐' },
  { level: 4, label: 'Bom', emoji: '🙂' },
  { level: 5, label: 'Ótimo', emoji: '😄' },
];

export function MoodCapture() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const firestore = useFirestore();

  const handleSubmit = async () => {
    if (selectedMood === null) {
      Alert.alert('Entrada Incompleta', 'Por favor, selecione um humor antes de salvar.');
      return;
    }
    if (!user || !firestore) {
      Alert.alert('Erro', 'Você precisa estar logado para salvar seu humor.');
      return;
    }

    setIsLoading(true);
    try {
      const moodsRef = collection(firestore, `users/${user.uid}/moods`);
      await addDoc(moodsRef, {
        userId: user.uid,
        mood: selectedMood,
        notes: notes || null,
        date: new Date().toISOString(),
        createdAt: serverTimestamp(),
      });
      Alert.alert('Humor Salvo!', 'Você registrou seu humor para hoje. Continue assim!');
      setSelectedMood(null);
      setNotes('');
    } catch {
      Alert.alert('Erro ao Salvar', 'Não foi possível salvar seu humor. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Como você está se sentindo hoje?</Text>
      <Text style={styles.subtitle}>Selecione um humor e adicione as notas que tiver.</Text>

      <View style={styles.moodRow}>
        {moodOptions.map((m) => (
          <TouchableOpacity
            key={m.level}
            style={[
              styles.moodButton,
              selectedMood === m.level && styles.moodButtonSelected,
            ]}
            onPress={() => setSelectedMood(m.level)}
          >
            <Text style={styles.moodEmoji}>{m.emoji}</Text>
            <Text
              style={[
                styles.moodLabel,
                selectedMood === m.level && styles.moodLabelSelected,
              ]}
            >
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.textarea}
        placeholder="Adicione algumas notas sobre o seu dia..."
        placeholderTextColor="#94a3b8"
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
      />

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Salvar Humor</Text>
        )}
      </TouchableOpacity>
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
  moodRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  moodButton: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  moodButtonSelected: {
    backgroundColor: '#334155',
    transform: [{ scale: 1.1 }],
  },
  moodEmoji: { fontSize: 28, marginBottom: 4 },
  moodLabel: { fontSize: 10, color: '#94a3b8', fontWeight: '500' },
  moodLabelSelected: { color: '#3b82f6' },
  textarea: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 12,
    color: '#f8fafc',
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
