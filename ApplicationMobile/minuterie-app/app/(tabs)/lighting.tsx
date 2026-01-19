import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLighting } from '../../hooks/useLighting';

type SolarSubMode =
  | 'SUNSET_TO_SUNRISE'
  | 'BEFORE_SUNSET'
  | 'AFTER_SUNSET'
  | 'BEFORE_SUNRISE'
  | 'AFTER_SUNRISE';

export default function LightingSettings() {
  const {
    state,
    mode,
    solarSubMode,
    solarDelay,
    manualStart,
    manualEnd,
    setState,
    setMode,
    setManualSchedule,
    setSolarScheduleDelay,
    setSolarSubMode,
  } = useLighting();

  const [startTime, setStartTime] = useState(manualStart);
  const [endTime, setEndTime] = useState(manualEnd);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const solarModes: { key: SolarSubMode; label: string; desc: string; icon: string }[] = [
    { key: 'SUNSET_TO_SUNRISE', label: 'Sunset to Sunrise', desc: 'Lighting is ON during this interval', icon: '🌙' },
    { key: 'BEFORE_SUNSET', label: 'Before Sunset', desc: 'Lighting is ON before sunset', icon: '🌅' },
    { key: 'AFTER_SUNSET', label: 'After Sunset', desc: 'Lighting is ON after sunset', icon: '🌇' },
    { key: 'BEFORE_SUNRISE', label: 'Before Sunrise', desc: 'Lighting is ON before sunrise', icon: '🌄' },
    { key: 'AFTER_SUNRISE', label: 'After Sunrise', desc: 'Lighting is ON after sunrise', icon: '☀️' },
  ];

  const requiresDelay = mode === 'SUNSET_SUNRISE';

  const handleSave = () => {
    setState(state);
    setMode(mode);

    if (mode === 'MANUAL') {
      setManualSchedule(startTime, endTime);
    } else {
      setSolarScheduleDelay(solarDelay);
    }

    Alert.alert('Saved ✅', 'Configuration saved successfully');
  };

  const onChangeStart = (event: any, selectedDate?: Date) => {
    setShowStartPicker(false);
    if (selectedDate) {
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      const time = `${hours}:${minutes}`;
      setStartTime(time);
      setManualSchedule(time, endTime);
    }
  };

  const onChangeEnd = (event: any, selectedDate?: Date) => {
    setShowEndPicker(false);
    if (selectedDate) {
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      const time = `${hours}:${minutes}`;
      setEndTime(time);
      setManualSchedule(startTime, time);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.headerTitle}>Lighting Settings</Text>
      </View>

      {/* Lighting Status */}
      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>Lighting Status</Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusIcon}>💡</Text>
          <Text style={[styles.statusText, state === 'on' ? styles.statusOn : styles.statusOff]}>
            {state === 'on' ? 'ON' : 'OFF'}
          </Text>
        </View>
      </View>

      {/* Mode Selector */}
      <View style={styles.modeSelector}>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'SUNSET_SUNRISE' && styles.active]}
          onPress={() => setMode('SUNSET_SUNRISE')}
        >
          <Text style={mode === 'SUNSET_SUNRISE' ? styles.activeText : styles.text}>
            SUNSET / SUNRISE
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
        {/* Solar Mode */}
        {mode === 'SUNSET_SUNRISE' && (
          <View style={styles.cardContainer}>
            {solarModes.map(item => (
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

            {/* Delay global */}
            {requiresDelay && (
              <View style={styles.delayContainer}>
                <Text style={styles.delayLabel}>Delay (minutes):</Text>
                <TextInput
                  style={styles.delayInput}
                  value={solarDelay}
                  onChangeText={text => setSolarScheduleDelay(text)}
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

            {/* Start Time */}
            <TouchableOpacity
              style={styles.manualInput}
              onPress={() => setShowStartPicker(true)}
            >
              <Text>Start Time: {startTime}</Text>
            </TouchableOpacity>
            {showStartPicker && (
              <DateTimePicker
                value={new Date(`2023-01-01T${startTime}:00`)}
                mode="time"
                display="spinner"
                onChange={onChangeStart}
              />
            )}

            {/* End Time */}
            <TouchableOpacity
              style={styles.manualInput}
              onPress={() => setShowEndPicker(true)}
            >
              <Text>End Time: {endTime}</Text>
            </TouchableOpacity>
            {showEndPicker && (
              <DateTimePicker
                value={new Date(`2023-01-01T${endTime}:00`)}
                mode="time"
                display="spinner"
                onChange={onChangeEnd}
              />
            )}
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>Save Configuration</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ======= STYLES (inchangés) =======
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },

  topBar: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center' },

  statusCard: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    elevation: 2,
  },
  statusTitle: { fontSize: 14, fontWeight: 'bold', color: '#6B7280', marginBottom: 8 },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  statusIcon: { fontSize: 26, marginRight: 10 },
  statusText: { fontSize: 20, fontWeight: 'bold' },
  statusOn: { color: '#16A34A' },
  statusOff: { color: '#DC2626' },

  modeSelector: { flexDirection: 'row', margin: 16, backgroundColor: '#f0f2f5', borderRadius: 12, overflow: 'hidden' },
  modeButton: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  active: { backgroundColor: '#fff', elevation: 3 },
  text: { color: '#60758a', fontWeight: '600' },
  activeText: { color: '#111', fontWeight: '600' },

  main: { flex: 1 },
  cardContainer: { padding: 16 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, backgroundColor: '#fff', borderWidth: 2, borderColor: 'transparent', marginBottom: 12 },
  cardActive: { borderColor: '#3B82F6', backgroundColor: 'rgba(59,130,246,0.05)' },
  cardIcon: { fontSize: 24, marginRight: 12 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: 'bold' },
  cardSubtitle: { fontSize: 12, color: '#6B7280' },
  cardStatus: { fontSize: 18 },
  delayContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 12, marginLeft: 16 },
  delayLabel: { fontWeight: 'bold', marginRight: 8 },
  delayInput: { padding: 8, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, width: 80, textAlign: 'center' },
  manualCard: { padding: 16, borderRadius: 12, backgroundColor: '#fff', margin: 16 },
  manualInput: { padding: 12, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, marginVertical: 8 },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: '#E5E7EB', backgroundColor: '#fff' },
  saveButton: { backgroundColor: '#0d7fff', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
