import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  Pressable,
} from 'react-native';
import { format, isToday, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useUser, useFirestore, useCollection } from '../firebase';

const moodOptions = [
  { level: 1, label: 'Péssimo', emoji: '😞' },
  { level: 2, label: 'Ruim', emoji: '😟' },
  { level: 3, label: 'Ok', emoji: '😐' },
  { level: 4, label: 'Bom', emoji: '🙂' },
  { level: 5, label: 'Ótimo', emoji: '😄' },
];

const last30Days = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - i);
  d.setHours(0, 0, 0, 0);
  return d;
});

export function MoodCapture() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { user } = useUser();
  const firestore = useFirestore();

  const { data: existingMoods } = useCollection<{ date: string }>(
    firestore,
    user ? `users/${user.uid}/moods` : '',
    { orderBy: 'date', orderDirection: 'desc', limit: 90 }
  );

  const filledDays = useMemo(() => {
    if (!existingMoods) return new Set<string>();
    return new Set(
      existingMoods.map((m) => format(new Date(m.date), 'yyyy-MM-dd'))
    );
  }, [existingMoods]);

  const handleHeartRateChange = (value: string) => {
    setHeartRate(value.replace(/[^0-9]/g, ''));
  };

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
      const dateToSave = new Date(selectedDate);
      dateToSave.setHours(12, 0, 0, 0);
      await addDoc(moodsRef, {
        userId: user.uid,
        mood: selectedMood,
        notes: notes || null,
        heartRate: heartRate ? parseInt(heartRate, 10) : null,
        date: dateToSave.toISOString(),
        createdAt: serverTimestamp(),
      });
      const label = isToday(selectedDate) ? 'hoje' : format(selectedDate, "dd 'de' MMM", { locale: ptBR });
      Alert.alert('Humor Salvo!', `Você registrou seu humor para ${label}. Continue assim!`);
      setSelectedMood(null);
      setNotes('');
      setHeartRate('');
      setSelectedDate(new Date());
    } catch {
      Alert.alert('Erro ao Salvar', 'Não foi possível salvar seu humor. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const dateLabel = isToday(selectedDate)
    ? 'Hoje'
    : format(selectedDate, "dd 'de' MMMM", { locale: ptBR });

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Como você está se sentindo?</Text>

      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowDatePicker(true)}
        disabled={isLoading}
      >
        <Text style={styles.dateButtonText}>📅 {dateLabel}</Text>
        <Text style={styles.dateChevron}>›</Text>
      </TouchableOpacity>

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

      <View style={styles.heartRateRow}>
        <Text style={styles.heartRateLabel}>
          ❤️ Batimentos cardíacos <Text style={styles.optional}>(opcional)</Text>
        </Text>
        <TextInput
          style={styles.heartRateInput}
          placeholder="Ex: 72"
          placeholderTextColor="#94a3b8"
          value={heartRate}
          onChangeText={handleHeartRateChange}
          keyboardType="numeric"
          maxLength={3}
        />
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

      <Modal
        visible={showDatePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowDatePicker(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Selecionar data</Text>
            <FlatList
              data={last30Days}
              keyExtractor={(d) => d.toISOString()}
              style={styles.dateList}
              renderItem={({ item: day }) => {
                const key = format(day, 'yyyy-MM-dd');
                const alreadyFilled = filledDays.has(key);
                const isSelected = isSameDay(day, selectedDate);
                return (
                  <TouchableOpacity
                    style={[
                      styles.dateItem,
                      isSelected && styles.dateItemSelected,
                      alreadyFilled && styles.dateItemDisabled,
                    ]}
                    onPress={() => {
                      if (!alreadyFilled) {
                        setSelectedDate(day);
                        setShowDatePicker(false);
                      }
                    }}
                    disabled={alreadyFilled}
                    activeOpacity={alreadyFilled ? 1 : 0.7}
                  >
                    <Text
                      style={[
                        styles.dateItemText,
                        isSelected && styles.dateItemTextSelected,
                        alreadyFilled && styles.dateItemTextDisabled,
                      ]}
                    >
                      {isToday(day) ? 'Hoje' : format(day, "EEEE, dd 'de' MMM", { locale: ptBR })}
                    </Text>
                    {alreadyFilled && (
                      <Text style={styles.dateItemBadge}>já registrado</Text>
                    )}
                  </TouchableOpacity>
                );
              }}
            />
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setShowDatePicker(false)}
            >
              <Text style={styles.modalCloseText}>Fechar</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 20,
  },
  title: { fontSize: 18, fontWeight: '600', color: '#f8fafc', marginBottom: 12 },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0f172a',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  dateButtonText: { fontSize: 14, color: '#93c5fd' },
  dateChevron: { fontSize: 18, color: '#64748b' },
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
  heartRateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  heartRateLabel: { fontSize: 14, color: '#e2e8f0', flex: 1 },
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
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    paddingTop: 20,
    paddingHorizontal: 0,
    maxHeight: '75%',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  dateList: { flexGrow: 0 },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  dateItemSelected: { backgroundColor: '#1e3a5f' },
  dateItemDisabled: { opacity: 0.4 },
  dateItemText: { fontSize: 14, color: '#f8fafc', textTransform: 'capitalize' },
  dateItemTextSelected: { color: '#93c5fd', fontWeight: '600' },
  dateItemTextDisabled: { color: '#64748b' },
  dateItemBadge: { fontSize: 11, color: '#64748b', fontStyle: 'italic' },
  modalClose: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  modalCloseText: { color: '#94a3b8', fontSize: 15 },
});
