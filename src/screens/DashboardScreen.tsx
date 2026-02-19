import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { MoodCapture } from '../components/MoodCapture';
import { MoodChart } from '../components/MoodChart';
import { MoodTimeline } from '../components/MoodTimeline';
import { UserNav } from '../components/UserNav';

interface Props {
  onSignOut?: () => void;
}

export function DashboardScreen({ onSignOut }: Props) {
  return (
    <View style={styles.container}>
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
        <View style={styles.timeline}>
          <MoodTimeline />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#f8fafc' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  grid: { flexDirection: 'column', gap: 16, marginBottom: 24 },
  half: {},
  timeline: { marginTop: 0 },
});
