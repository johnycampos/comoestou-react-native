import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCollection, useFirestore, useUser } from '../firebase';

type MoodEntry = { id: string; date: string; mood: number };

const chartConfig = {
  backgroundColor: '#1e293b',
  backgroundGradientFrom: '#1e293b',
  backgroundGradientTo: '#1e293b',
  decimalPlaces: 0,
  color: (opacity: number) => `rgba(59, 130, 246, ${opacity})`,
  labelColor: () => '#94a3b8',
  barPercentage: 0.7,
  propsForLabels: { fontSize: 10 },
};

export function MoodChart() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { data: moodData, loading } = useCollection<MoodEntry>(
    firestore,
    user ? `users/${user.uid}/moods` : '',
    { orderBy: 'date', orderDirection: 'desc', limit: 7 }
  );

  const last7DaysData = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), 6 - i);
    const dateStr = d.toISOString().split('T')[0];
    const entry = moodData?.find((e) => String(e.date).startsWith(dateStr));
    return {
      label: format(d, 'eee', { locale: ptBR }).slice(0, 2),
      mood: entry ? entry.mood : 0,
    };
  });

  const chartData = {
    labels: last7DaysData.map((d) => d.label),
    datasets: [{ data: last7DaysData.map((d) => d.mood) }],
  };

  const screenWidth = Dimensions.get('window').width - 48;

  if (loading) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Tendência Semanal de Humor</Text>
        <Text style={styles.subtitle}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Tendência Semanal de Humor</Text>
      <Text style={styles.subtitle}>Seus níveis de humor nos últimos 7 dias.</Text>
      <BarChart
        data={chartData}
        width={screenWidth}
        height={200}
        yAxisLabel=""
        yAxisSuffix=""
        chartConfig={chartConfig}
        fromZero
        showValuesOnTopOfBars
        style={styles.chart}
      />
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
  chart: { borderRadius: 8 },
});
