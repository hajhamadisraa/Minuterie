import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeDashboard() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.main}>
        {/* Lighting Card */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: '#e0f2ff' }]}
          onPress={() => router.push('/lighting')}
        >
          <Text style={[styles.cardIcon, { marginBottom: 8 }]}>💡</Text>
          <Text style={styles.cardTitle}>Lighting</Text>
          <Text style={styles.cardInfo}>Status: On</Text>
          <Text style={styles.cardSubInfo}>Next Off: 22:30</Text>
        </TouchableOpacity>

        {/* Irrigation Card */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: '#d1fae5' }]}
          onPress={() => router.push('/irrigation')}
        >
          <Text style={[styles.cardIcon, { color: '#10b981', marginBottom: 8 }]}>💧</Text>
          <Text style={styles.cardTitle}>Irrigation</Text>
          <Text style={styles.cardInfo}>Next run: 18:00</Text>
          <Text style={styles.cardSubInfo}>Duration: 15 mins</Text>
        </TouchableOpacity>

        {/* Bell Card */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: '#ffedd5' }]}
          onPress={() => router.push('/bell')}
        >
          <Text style={[styles.cardIcon, { color: '#f97316', marginBottom: 8 }]}>🔔</Text>
          <Text style={styles.cardTitle}>Bell</Text>
          <Text style={styles.cardInfo}>Status: Idle</Text>
          <Text style={styles.cardSubInfo}>Last run: 08:00 AM</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },

  main: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },

  card: {
    width: '80%',
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  cardIcon: { fontSize: 32 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  cardInfo: { fontSize: 14, color: '#60758a', marginBottom: 4 },
  cardSubInfo: { fontSize: 12, color: '#60758a' },
});
