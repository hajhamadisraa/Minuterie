import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function IrrigationSettings() {
  return (
    <View style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity>
          <Text style={styles.icon}>⬅️</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Irrigation Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.main} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Connection Status */}
        <View style={styles.connectionStatus}>
          <View style={styles.connectedDot} />
          <Text style={styles.connectionText}>ESP32 Connected: Garden_Zone_01</Text>
        </View>

        {/* Operating Mode Header */}
        <Text style={styles.sectionHeader}>Operating Mode</Text>

        {/* Mode Selection Grid */}
        <View style={styles.modeGrid}>
          {/* Sunrise */}
          <TouchableOpacity style={styles.modeCard}>
            <View style={[styles.modeIconContainer, { backgroundColor: '#FFE5B4', marginBottom: 4 }]}>
              <Text style={[styles.modeIcon, { color: '#FFA500' }]}>🌅</Text>
            </View>
            <Text style={styles.modeLabel}>Sunrise</Text>
          </TouchableOpacity>
          {/* Sunset */}
          <TouchableOpacity style={styles.modeCard}>
            <View style={[styles.modeIconContainer, { backgroundColor: '#E0E7FF', marginBottom: 4 }]}>
              <Text style={[styles.modeIcon, { color: '#4B0082' }]}>🌇</Text>
            </View>
            <Text style={styles.modeLabel}>Sunset</Text>
          </TouchableOpacity>
          {/* Manual */}
          <TouchableOpacity style={[styles.modeCard, styles.activeCard]}>
            <View style={[styles.modeIconContainer, { backgroundColor: '#D1FAE5', marginBottom: 4 }]}>
              <Text style={[styles.modeIcon, { color: '#10B981' }]}>💧</Text>
            </View>
            <Text style={styles.modeLabel}>Manual</Text>
          </TouchableOpacity>
        </View>

        {/* Watering Duration */}
        <Text style={styles.sectionHeader}>Watering Duration</Text>
        <Text style={styles.sectionSubHeader}>
          Set how long the irrigation should remain active.
        </Text>

        {/* WheelPicker Placeholder */}
        <View style={styles.wheelPicker}>
          <View style={styles.wheelColumn}>
            <Text style={styles.wheelValue}>00</Text>
            <View style={styles.wheelSelected}>
              <Text style={styles.wheelSelectedText}>00</Text>
              <Text style={styles.wheelUnit}>HRS</Text>
            </View>
            <Text style={styles.wheelValue}>01</Text>
          </View>
          <Text style={styles.wheelSeparator}>:</Text>
          <View style={styles.wheelColumn}>
            <Text style={styles.wheelValue}>10</Text>
            <View style={styles.wheelSelected}>
              <Text style={styles.wheelSelectedText}>15</Text>
              <Text style={styles.wheelUnit}>MIN</Text>
            </View>
            <Text style={styles.wheelValue}>20</Text>
          </View>
        </View>

        {/* Summary Info */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryIcon}>ℹ️</Text>
          <Text style={styles.summaryText}>
            In <Text style={styles.boldPrimary}>Manual Mode</Text>, the irrigation
            system will run once for <Text style={styles.boldPrimary}>15 minutes</Text> upon activation.
          </Text>
        </View>
      </ScrollView>

      {/* Fixed Footer Save Button */}
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

  // Top Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  icon: { fontSize: 20 },
  title: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', flex: 1 },

  // Main content
  main: { flex: 1 },

  // Connection Status
  connectionStatus: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 },
  connectedDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    marginRight: 8,
  },
  connectionText: { fontSize: 12, color: '#6B7280' },

  // Section headers
  sectionHeader: { fontSize: 16, fontWeight: 'bold', color: '#111418', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 },
  sectionSubHeader: { fontSize: 12, color: '#6B7280', paddingHorizontal: 16, paddingBottom: 8 },

  // Mode grid
  modeGrid: { flexDirection: 'row', justifyContent: 'space-between', padding: 16 },
  modeCard: { flex: 1, marginHorizontal: 4, padding: 12, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  activeCard: { borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.1)' },
  modeIconContainer: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  modeIcon: { fontSize: 24 },
  modeLabel: { fontSize: 12, fontWeight: 'bold', color: '#111418', textAlign: 'center', marginTop: 4 },

  // Wheel picker
  wheelPicker: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, marginTop: 8 },
  wheelColumn: { flex: 1, alignItems: 'center' },
  wheelValue: { fontSize: 16, color: '#9CA3AF', height: 48, textAlignVertical: 'center' },
  wheelSelected: { height: 56, width: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: 8 },
  wheelSelectedText: { fontSize: 20, fontWeight: '900', color: '#3B82F6' },
  wheelUnit: { position: 'absolute', right: 8, fontSize: 10, fontWeight: 'bold', color: 'rgba(59,130,246,0.5)' },
  wheelSeparator: { fontSize: 24, fontWeight: 'bold', color: '#D1D5DB', marginHorizontal: 8 },

  // Summary card
  summaryCard: { flexDirection: 'row', padding: 12, marginHorizontal: 16, marginTop: 16, borderRadius: 12, backgroundColor: 'rgba(59, 130, 246, 0.1)', borderWidth: 1, borderColor: 'rgba(59,130,246,0.1)', alignItems: 'flex-start' },
  summaryIcon: { fontSize: 18, marginTop: 2, marginRight: 8 },
  summaryText: { fontSize: 12, color: '#111418', flex: 1, lineHeight: 18 },
  boldPrimary: { fontWeight: 'bold', color: '#3B82F6' },

  // Footer
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: 'rgba(255,255,255,0.8)', borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  saveButton: { backgroundColor: '#3B82F6', paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});
