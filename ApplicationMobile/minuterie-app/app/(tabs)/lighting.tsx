import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type SolarSubMode = 
  | 'SUNSET_TO_SUNRISE'
  | 'BEFORE_SUNSET'
  | 'AFTER_SUNSET'
  | 'BEFORE_SUNRISE'
  | 'AFTER_SUNRISE';

export default function LightingSettings() {
  const [mode, setMode] = useState<'SUNSET_SUNRISE' | 'MANUAL'>('SUNSET_SUNRISE');
  const [solarSubMode, setSolarSubMode] = useState<SolarSubMode>('SUNSET_TO_SUNRISE');
  const [solarDelay, setSolarDelay] = useState('0'); // renommé Offset → Delay
  const [manualStart, setManualStart] = useState('19:00');
  const [manualEnd, setManualEnd] = useState('06:30');

  const solarModes: { key: SolarSubMode; label: string; desc: string; icon: string }[] = [
    { key: 'SUNSET_TO_SUNRISE', label: 'Sunset to Sunrise', desc: 'Lighting is ON during this interval', icon: '🌙' },
    { key: 'BEFORE_SUNSET', label: 'Before Sunset', desc: 'Lighting is ON before sunset', icon: '🌅' },
    { key: 'AFTER_SUNSET', label: 'After Sunset', desc: 'Lighting is ON after sunset', icon: '🌇' },
    { key: 'BEFORE_SUNRISE', label: 'Before Sunrise', desc: 'Lighting is ON before sunrise', icon: '🌄' },
    { key: 'AFTER_SUNRISE', label: 'After Sunrise', desc: 'Lighting is ON after sunrise', icon: '☀️' },
  ];

  const requiresDelay = ['BEFORE_SUNSET','AFTER_SUNSET','BEFORE_SUNRISE','AFTER_SUNRISE'].includes(solarSubMode);

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lighting Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Mode Selector */}
      <View style={styles.modeSelector}>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'SUNSET_SUNRISE' && styles.active]}
          onPress={() => setMode('SUNSET_SUNRISE')}
        >
          <Text style={mode === 'SUNSET_SUNRISE' ? styles.activeText : styles.text}>
            SUNSET/SUNRISE
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeButton, mode === 'MANUAL' && styles.active]}
          onPress={() => setMode('MANUAL')}
        >
          <Text style={mode === 'MANUAL' ? styles.activeText : styles.text}>Manual</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.main} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Solar Sub-Modes */}
        {mode === 'SUNSET_SUNRISE' && (
          <View style={styles.cardContainer}>
            {solarModes.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[styles.card, solarSubMode === item.key && styles.cardActive]}
                onPress={() => setSolarSubMode(item.key)}
              >
                <Text style={styles.cardIcon}>{item.icon}</Text>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>{item.label}</Text>
                  <Text style={styles.cardSubtitle}>{item.desc}</Text>
                </View>
                <Text style={styles.cardStatus}>{solarSubMode === item.key ? '✅' : '⚪'}</Text>
              </TouchableOpacity>
            ))}

            {requiresDelay && (
              <View style={styles.delayContainer}>
                <Text style={styles.delayLabel}>Delay (minutes):</Text>
                <TextInput
                  style={styles.delayInput}
                  value={solarDelay}
                  onChangeText={setSolarDelay}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
            )}
          </View>
        )}

        {/* Manual Mode */}
        {mode === 'MANUAL' && (
          <View style={styles.manualCard}>
            <Text style={styles.cardTitle}>Manual Time</Text>
            <View style={styles.manualTimeContainer}>
              <View style={styles.manualTime}>
                <Text style={styles.manualLabel}>Start Time</Text>
                <TextInput
                  style={styles.manualInput}
                  value={manualStart}
                  onChangeText={setManualStart}
                  placeholder="HH:MM"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.manualTime}>
                <Text style={styles.manualLabel}>End Time</Text>
                <TextInput
                  style={styles.manualInput}
                  value={manualEnd}
                  onChangeText={setManualEnd}
                  placeholder="HH:MM"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveText}> Save Configuration</Text>
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
  backIcon: { fontSize: 20 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', flex: 1, textAlign: 'center' },

  main: { flex: 1 },

  // Mode selector (style IrrigationSettings)
  modeSelector: {
    flexDirection: 'row',
    margin: 16,
    backgroundColor: '#f0f2f5',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modeButton: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  active: { backgroundColor: '#fff', elevation: 3 },
  text: { color: '#60758a', fontWeight: '600' },
  activeText: { color: '#111', fontWeight: '600' },

  // Cards
  cardContainer: { padding: 16 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: 12,
  },
  cardActive: { borderColor: '#3B82F6', backgroundColor: 'rgba(59,130,246,0.05)' },
  cardIcon: { fontSize: 24, marginRight: 12 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: 'bold', color: '#111418' },
  cardSubtitle: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  cardStatus: { fontSize: 18 },

  // Delay input
  delayContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 12, marginLeft: 16 },
  delayLabel: { fontSize: 14, fontWeight: 'bold', marginRight: 8 },
  delayInput: { padding: 8, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, width: 80, textAlign: 'center' },

  // Manual card
  manualCard: { padding: 16, borderRadius: 12, backgroundColor: '#fff', margin: 16 },
  manualTimeContainer: { flexDirection: 'row', marginTop: 12 },
  manualTime: { flex: 1, marginRight: 8 },
  manualLabel: { fontSize: 12, fontWeight: 'bold', color: '#6B7280', marginBottom: 4 },
  manualInput: { padding: 12, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, fontSize: 16 },

  // Footer
  footer: { padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  saveButton: { backgroundColor: '#0d7fff', paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  saveText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
