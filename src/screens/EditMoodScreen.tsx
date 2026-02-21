import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useFirestore, useUser } from '../firebase';

const moodOptions = [
  { level: 1, label: 'Péssimo', emoji: '😞' },
  { level: 2, label: 'Ruim', emoji: '😟' },
  { level: 3, label: 'Ok', emoji: '😐' },
  { level: 4, label: 'Bom', emoji: '🙂' },
  { level: 5, label: 'Ótimo', emoji: '😄' },
];

type MoodEntry = {
  id: string;
  date: string;
  mood: number;
  notes?: string | null;
  heartRate?: number | null;
};

interface Props {
  route: { params: { entry: MoodEntry } };
  navigation: { goBack: () => void };
}

export function EditMoodScreen({ route, navigation }: Props) {
  const { entry } = route.params;
  const firestore = useFirestore();
  const { user } = useUser();

  const [selectedMood, setSelectedMood] = useState<number>(entry.mood);
  const [notes, setNotes] = useState(entry.notes ?? '');
  const [heartRate, setHeartRate] = useState(
    entry.heartRate != null ? String(entry.heartRate) : ''
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleHeartRateChange = (value: string) => {
    setHeartRate(value.replace(/[^0-9]/g, ''));
  };

  const handleSave = async () => {
    if (!firestore || !user) return;
    setIsSaving(true);
    try {
      const ref = doc(firestore, `users/${user.uid}/moods/${entry.id}`);
      await updateDoc(ref, {
        mood: selectedMood,
        notes: notes.trim() || null,
        heartRate: heartRate ? parseInt(heartRate, 10) : null,
      });
      navigation.goBack();
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar as alterações. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Excluir entrada',
      'Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            if (!firestore || !user) return;
            setIsDeleting(true);
            try {
              const ref = doc(firestore, `users/${user.uid}/moods/${entry.id}`);
              await deleteDoc(ref);
              navigation.goBack();
            } catch {
              Alert.alert('Erro', 'Não foi possível excluir o registro. Tente novamente.');
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const isLoading = isSaving || isDeleting;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={navigation.goBack} style={styles.backButton} disabled={isLoading}>
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar registro</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Como você estava se sentindo?</Text>
          <View style={styles.moodRow}>
            {moodOptions.map((m) => (
              <TouchableOpacity
                key={m.level}
                style={[
                  styles.moodButton,
                  selectedMood === m.level && styles.moodButtonSelected,
                ]}
                onPress={() => setSelectedMood(m.level)}
                disabled={isLoading}
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

          <View style={styles.heartRateRow}>
            <Text style={styles.fieldLabel}>
              ❤️ Batimentos cardíacos{' '}
              <Text style={styles.optional}>(opcional)</Text>
            </Text>
            <TextInput
              style={styles.heartRateInput}
              placeholder="Ex: 72"
              placeholderTextColor="#94a3b8"
              value={heartRate}
              onChangeText={handleHeartRateChange}
              keyboardType="numeric"
              maxLength={3}
              editable={!isLoading}
            />
          </View>

          <Text style={styles.fieldLabel}>Notas</Text>
          <TextInput
            style={styles.textarea}
            placeholder="Adicione algumas notas sobre o seu dia..."
            placeholderTextColor="#94a3b8"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            editable={!isLoading}
          />

          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={isLoading}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Salvar alterações</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.deleteButton, isLoading && styles.buttonDisabled]}
            onPress={handleDelete}
            disabled={isLoading}
          >
            {isDeleting ? (
              <ActivityIndicator color="#f87171" />
            ) : (
              <Text style={styles.deleteButtonText}>Excluir registro</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0f172a' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  backButton: { width: 80 },
  backText: { color: '#3b82f6', fontSize: 15 },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#f8fafc' },
  content: { padding: 16 },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 20,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: 14,
  },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  moodButton: { alignItems: 'center', padding: 8, borderRadius: 8 },
  moodButtonSelected: {
    backgroundColor: '#334155',
    transform: [{ scale: 1.1 }],
  },
  moodEmoji: { fontSize: 28, marginBottom: 4 },
  moodLabel: { fontSize: 10, color: '#94a3b8', fontWeight: '500' },
  moodLabelSelected: { color: '#3b82f6' },
  heartRateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  fieldLabel: { fontSize: 14, color: '#e2e8f0', flex: 1, marginBottom: 6 },
  optional: { fontSize: 12, color: '#64748b' },
  heartRateInput: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 10,
    color: '#f8fafc',
    fontSize: 14,
    width: 80,
    textAlign: 'center',
  },
  textarea: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 12,
    color: '#f8fafc',
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  deleteButton: {
    borderWidth: 1,
    borderColor: '#f87171',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  deleteButtonText: { color: '#f87171', fontSize: 16, fontWeight: '600' },
  buttonDisabled: { opacity: 0.5 },
});
