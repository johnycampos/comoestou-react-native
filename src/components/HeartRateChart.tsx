import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCollection, useFirestore, useUser } from '../firebase';

type MoodEntry = { id: string; date: string; heartRate?: number | null };

const chartConfig = {
  backgroundColor: '#1e293b',
  backgroundGradientFrom: '#1e293b',
  backgroundGradientTo: '#1e293b',
  decimalPlaces: 0,
  color: (opacity: number) => `rgba(248, 113, 113, ${opacity})`,
  labelColor: () => '#94a3b8',
  propsForLabels: { fontSize: 10 },
  propsForDots: {
    r: '4',
    strokeWidth: '2',
    stroke: '#f87171',
  },
};

export function HeartRateChart() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { data: moodData, loading } = useCollection<MoodEntry>(
    firestore,
    user ? `users/${user.uid}/moods` : '',
    { orderBy: 'date', orderDirection: 'desc', limit: 7 }
  );

  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), 6 - i);
    const dateStr = d.toISOString().split('T')[0];
    const entry = moodData?.find((e) => String(e.date).startsWith(dateStr));
    return {
      label: format(d, 'eee', { locale: ptBR }).slice(0, 2),
      bpm: entry?.heartRate ?? 0,
    };
  });

  const hasAnyData = last7Days.some((d) => d.bpm > 0);

  const screenWidth = Dimensions.get('window').width - 48;

  if (loading) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>❤️ Batimentos da Semana</Text>
        <Text style={styles.subtitle}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>❤️ Batimentos da Semana</Text>
      <Text style={styles.subtitle}>Frequência cardíaca nos últimos 7 dias.</Text>

      {hasAnyData ? (
        <LineChart
          data={{
            labels: last7Days.map((d) => d.label),
            datasets: [{ data: last7Days.map((d) => d.bpm) }],
          }}
          width={screenWidth}
          height={180}
          chartConfig={chartConfig}
          bezier
          fromZero
          style={styles.chart}
          withInnerLines={false}
          yAxisSuffix=""
        />
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            Nenhum batimento registrado esta semana.{'\n'}
            Adicione ao registrar seu humor.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 20,
    overflow: 'hidden',
  },
  title: { fontSize: 18, fontWeight: '600', color: '#f8fafc', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#94a3b8', marginBottom: 16 },
  chart: { borderRadius: 8, marginLeft: -16 },
  empty: {
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748b',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 22,
  },
});
