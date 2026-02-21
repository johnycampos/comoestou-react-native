import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MoodCapture } from '../components/MoodCapture';
import { MoodChart } from '../components/MoodChart';
import { HeartRateChart } from '../components/HeartRateChart';
import { MoodTimeline } from '../components/MoodTimeline';
import { UserNav } from '../components/UserNav';

type MoodEntry = { id: string; date: string; mood: number; notes?: string | null; heartRate?: number | null };

interface Props {
  onSignOut?: () => void;
  navigation: { navigate: (screen: string, params?: object) => void };
}

export function DashboardScreen({ onSignOut, navigation }: Props) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Como Estou</Text>
        <UserNav onSignOut={onSignOut} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          <View style={styles.half}>
            <MoodCapture />
          </View>
          <View style={styles.half}>
            <MoodChart />
          </View>
        </View>
        <View style={styles.heartRate}>
          <HeartRateChart />
        </View>
        <View style={styles.timeline}>
          <MoodTimeline
            onEntryPress={(entry: MoodEntry) => navigation.navigate('EditMood', { entry })}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#f8fafc' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  grid: { flexDirection: 'column', gap: 16, marginBottom: 24 },
  half: {},
  heartRate: { marginBottom: 16 },
  timeline: { marginTop: 0 },
});
