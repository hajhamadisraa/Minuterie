import React from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LightingSettings() {
  return (
    <View style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity>
          <Text style={styles.icon}>⬅️</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Lighting Settings</Text>
        <TouchableOpacity>
          <Text style={styles.icon}>📶</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.main} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Mode Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mode Selection</Text>
          <Text style={styles.sectionSubtitle}>
            Choose a solar interval or set a manual schedule for your lights.
          </Text>
        </View>

        {/* Mode Cards */}
        <View style={styles.cardContainer}>
          {/* Sunrise to Sunset */}
          <TouchableOpacity style={styles.card}>
            <View style={[styles.cardIconContainer, { backgroundColor: '#FEF3C7' }]}>
              <Text style={[styles.cardIcon, { color: '#F59E0B' }]}>🌞</Text>
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Sunrise to Sunset</Text>
              <Text style={styles.cardSubtitle}>Lighting is OFF during this interval</Text>
            </View>
            <Text style={styles.cardStatus}>⚪</Text>
          </TouchableOpacity>

          {/* Sunset to Sunrise */}
          <TouchableOpacity style={[styles.card, styles.cardActive]}>
            <View style={[styles.cardIconContainer, { backgroundColor: '#E0E7FF' }]}>
              <Text style={[styles.cardIcon, { color: '#4F46E5' }]}>🌙</Text>
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Sunset to Sunrise</Text>
              <Text style={styles.cardSubtitle}>Lighting is ON during this interval</Text>
            </View>
            <Text style={styles.cardStatus}>✅</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Manual Time (Disabled) */}
          <View style={styles.manualCard}>
            <View style={styles.manualRow}>
              <View style={[styles.cardIconContainer, { backgroundColor: '#EDE9FE' }]}>
                <Text style={[styles.cardIcon, { color: '#8B5CF6' }]}>⏰</Text>
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>Manual Time</Text>
                <Text style={styles.cardSubtitle}>Disabled while solar interval is active</Text>
              </View>
              <Text style={styles.cardStatus}>⚪</Text>
            </View>

            <View style={styles.manualTimeContainer}>
              <View style={[styles.manualTime, { marginRight: 12 }]}>
                <Text style={styles.manualLabel}>Start Time</Text>
                <View style={styles.manualValueContainer}>
                  <Text style={styles.manualValue}>19:00</Text>
                </View>
              </View>
              <View style={styles.manualTime}>
                <Text style={styles.manualLabel}>End Time</Text>
                <View style={styles.manualValueContainer}>
                  <Text style={styles.manualValue}>06:30</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Device Status */}
        <View style={styles.deviceCard}>
          <View style={{ flex: 2, marginRight: 8 }}>
            <Text style={styles.cardTitle}>Device Status</Text>
            <Text style={styles.cardSubtitle}>
              ESP32 Controller active. Current mode: Sunset Override.
            </Text>
          </View>
          <ImageBackground
            style={styles.deviceImage}
            source={{
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANKqLPjSr0eOA9aBofF1euiDd1BVPyY_mwn9dM1BjhprtND6j8bqABgNRkWzKUreWku2lIDULDygWBVzF1dFdmZs1NTZjEKpmSGBhhB7eejSvFFgK5ENhgvwr4_ouEFID4JG4n53n2rZwGniO1XusNsyuBL90XxKNdgSyCjnCIxNI6tLYPCUu_PGgY5s0sGa-1SuxC1xxgfrMYlVobJLMOmf7HjiqoFAApkyIPpCxhxeWaSZ6ZXa2MZwJqECJOM9Sb3RMgdV8guOw',
            }}
            resizeMode="cover"
          />
        </View>
      </ScrollView>

      {/* Footer Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>💾 Save Configuration</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  icon: { fontSize: 20 },
  title: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', flex: 1 },

  main: { flex: 1 },

  section: { paddingHorizontal: 16, paddingVertical: 8 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', paddingTop: 8 },
  sectionSubtitle: { fontSize: 14, color: '#6B7280', paddingTop: 4 },

  cardContainer: { paddingHorizontal: 16, paddingVertical: 8 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, backgroundColor: '#fff', borderWidth: 2, borderColor: 'transparent', marginBottom: 12 },
  cardActive: { borderColor: '#3B82F6', backgroundColor: 'rgba(59,130,246,0.05)' },
  cardIconContainer: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cardIcon: { fontSize: 24 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: 'bold', color: '#111418' },
  cardSubtitle: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  cardStatus: { fontSize: 18 },

  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 12 },

  manualCard: { opacity: 0.4, padding: 16, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: 'transparent' },
  manualRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  manualTimeContainer: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 12 },
  manualTime: { flex: 1 },
  manualLabel: { fontSize: 10, fontWeight: 'bold', color: '#9CA3AF', marginBottom: 4, letterSpacing: 1 },
  manualValueContainer: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' },
  manualValue: { fontSize: 16, fontWeight: 'bold', color: '#9CA3AF' },

  deviceCard: { flexDirection: 'row', padding: 16, borderRadius: 12, backgroundColor: '#fff', marginHorizontal: 16, marginTop: 8, overflow: 'hidden' },
  deviceImage: { width: 100, height: 100, borderRadius: 12 },

  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: 'rgba(255,255,255,0.8)', borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  saveButton: { backgroundColor: '#3B82F6', paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});
