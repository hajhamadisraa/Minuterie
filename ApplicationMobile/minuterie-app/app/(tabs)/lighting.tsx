import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SolarSubMode, useLighting } from '../../hooks/useLighting';

export default function LightingSettings() {
  const {
    state,
    mode,
    solarSubMode,
    solarDelay,
    manualStart,
    manualEnd,
    devices = [],
    updateMode,
    updateManualSchedule,
    updateSolarConfig,
    addDevice,
    toggleDeviceActive,
    deleteDevice
  } = useLighting();

  // Local states for form and time pickers
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDevicePin, setNewDevicePin] = useState('');
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const solarModes: { key: SolarSubMode; label: string; icon: string; desc: string }[] = [
    { key: 'SUNSET_TO_SUNRISE', label: 'Sunset to Sunrise', icon: '🌙', desc: 'On all night long' },
    { key: 'BEFORE_SUNSET', label: 'Before Sunset', icon: '🌅', desc: 'On before sunset' },
    { key: 'AFTER_SUNSET', label: 'After Sunset', icon: '🌇', desc: 'On after sunset' },
    { key: 'BEFORE_SUNRISE', label: 'Before Sunrise', icon: '🌄', desc: 'On before sunrise' },
    { key: 'AFTER_SUNRISE', label: 'After Sunrise', icon: '☀️', desc: 'On after sunrise' },
  ];

  const handleAdd = () => {
    const pin = parseInt(newDevicePin);
    if (!newDeviceName.trim() || isNaN(pin)) {
      Alert.alert("Error", "Please enter a valid name and GPIO pin number");
      return;
    }
    addDevice(newDeviceName.trim(), pin);
    setNewDeviceName('');
    setNewDevicePin('');
    Alert.alert("Success", "Device added and synchronized");
  };

  // ✅ Debug: Display state in console
  React.useEffect(() => {
    console.log('🔍 [LightingSettings] Current state:', state);
  }, [state]);

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Smart Lighting</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        
        {/* ✅ GLOBAL STATUS CARD - ENHANCED */}
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>System Status</Text>
          <View style={styles.statusBadge}>
            <View style={[
              styles.statusDot, 
              { backgroundColor: state ? '#16A34A' : '#DC2626' }
            ]} />
            <Text style={[
              styles.statusValue, 
              { color: state ? '#16A34A' : '#DC2626' }
            ]}>
              {state ? 'SYSTEM ON' : 'SYSTEM OFF'}
            </Text>
          </View>
          
          {/* ✅ NEW: Additional visual indicator */}
          <View style={[
            styles.powerIndicator,
            { backgroundColor: state ? '#16A34A' : '#DC2626' }
          ]}>
            <Text style={styles.powerIndicatorText}>
              {state ? '⚡ ACTIVE' : '⭕ INACTIVE'}
            </Text>
          </View>
        </View>

        {/* MODE SELECTOR (TABS) */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, mode === 'SUNSET_SUNRISE' && styles.tabActive]}
            onPress={() => updateMode('SUNSET_SUNRISE')}
          >
            <Text style={[styles.tabText, mode === 'SUNSET_SUNRISE' && styles.tabTextActive]}>SOLAR</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, mode === 'MANUAL' && styles.tabActive]}
            onPress={() => updateMode('MANUAL')}
          >
            <Text style={[styles.tabText, mode === 'MANUAL' && styles.tabTextActive]}>MANUAL</Text>
          </TouchableOpacity>
        </View>

        {/* ACTIVE MODE CONFIGURATION */}
        <View style={styles.sectionCard}>
          {mode === 'SUNSET_SUNRISE' ? (
            <>
              <Text style={styles.cardInfoTitle}>Solar Configuration</Text>
              {solarModes.map(m => (
                <TouchableOpacity 
                  key={m.key} 
                  style={[styles.card, solarSubMode === m.key && styles.cardActive]}
                  onPress={() => updateSolarConfig(m.key, parseInt(solarDelay))}
                >
                  <Text style={styles.cardIcon}>{m.icon}</Text>
                  <View style={styles.cardTextContainer}>
                    <Text style={styles.cardTitle}>{m.label}</Text>
                    <Text style={styles.cardSubtitle}>{m.desc}</Text>
                  </View>
                  <Text style={styles.cardStatus}>{solarSubMode === m.key ? '✅' : '⚪'}</Text>
                </TouchableOpacity>
              ))}
              
              <View style={styles.delayInputContainer}>
                <Text style={styles.delayLabel}>Delay (minutes):</Text>
                <TextInput 
                  style={styles.delayInput} 
                  value={String(solarDelay)}
                  onChangeText={(t) => updateSolarConfig(solarSubMode, parseInt(t) || 0)}
                  keyboardType="numeric"
                />
              </View>
            </>
          ) : (
            <>
              <Text style={styles.cardInfoTitle}>Manual Schedule</Text>
              <View style={styles.timeRow}>
                <TouchableOpacity onPress={() => setShowStartPicker(true)} style={styles.timeButton}>
                  <Text style={styles.timeButtonLabel}>START</Text>
                  <Text style={styles.timeButtonValue}>{manualStart}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowEndPicker(true)} style={styles.timeButton}>
                  <Text style={styles.timeButtonLabel}>END</Text>
                  <Text style={styles.timeButtonValue}>{manualEnd}</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* DEVICE MANAGEMENT */}
        <Text style={styles.sectionTitle}>Device Management</Text>
        <View style={styles.addDeviceContainer}>
          <View style={styles.addDeviceHeader}>
            <Text style={styles.addDeviceHeaderTitle}>New Device</Text>
            <View style={styles.pinBadge}><Text style={styles.pinBadgeText}>ESP32 GPIO</Text></View>
          </View>
          
          <View style={styles.addForm}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput 
                style={styles.modernInput} 
                placeholder="e.g. Gate Light" 
                value={newDeviceName} 
                onChangeText={setNewDeviceName}
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View style={[styles.inputWrapper, { flex: 0.4 }]}>
              <Text style={styles.inputLabel}>Pin</Text>
              <TextInput 
                style={styles.modernInput} 
                placeholder="25" 
                value={newDevicePin} 
                onChangeText={setNewDevicePin} 
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <TouchableOpacity style={styles.modernAddButton} onPress={handleAdd}>
            <Text style={styles.modernAddButtonText}>Add Device</Text>
            <Text style={styles.plusIcon}>+</Text>
          </TouchableOpacity>
        </View>

        {/* ✅ DEVICE LIST - ENHANCED */}
        {devices && devices.length > 0 ? (
          devices.map(dev => (
            <View key={dev.id} style={styles.deviceItem}>
              <View style={styles.deviceMainInfo}>
                <View style={[
                  styles.deviceIconCircle,
                  { backgroundColor: dev.isActive ? '#DBEAFE' : '#F3F4F6' }
                ]}>
                  <Text style={{fontSize: 18}}>{dev.isActive ? '💡' : '⚫'}</Text>
                </View>
                <View>
                  <Text style={styles.deviceName}>{dev.name}</Text>
                  <Text style={styles.devicePin}>GPIO {dev.pin}</Text>
                  {/* ✅ NEW: Show if device follows global state */}
                  {dev.isActive && (
                    <Text style={styles.deviceStatus}>
                      {state ? '🟢 On' : '🔴 Off'}
                    </Text>
                  )}
                </View>
              </View>
              <View style={styles.deviceActions}>
                <TouchableOpacity 
                  style={[
                    styles.toggleBtn, 
                    { backgroundColor: dev.isActive ? '#0EA5E9' : '#9CA3AF' }
                  ]}
                  onPress={() => toggleDeviceActive(dev.id, dev.isActive)}
                >
                  <Text style={styles.toggleBtnText}>
                    {dev.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => deleteDevice(dev.id)} 
                  style={styles.deleteIconButton}
                >
                  <Text style={{fontSize: 16}}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💡</Text>
            <Text style={styles.emptyStateText}>No devices configured</Text>
            <Text style={styles.emptyStateSubtext}>Add your first light or device</Text>
          </View>
        )}

      </ScrollView>

      {/* TIME PICKERS MODALS */}
      {showStartPicker && (
        <DateTimePicker 
          value={new Date(`2000-01-01T${manualStart}:00`)} 
          mode="time" 
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(e, d) => {
            setShowStartPicker(false);
            if(d) updateManualSchedule(
              `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`, 
              manualEnd
            );
          }}
        />
      )}
      {showEndPicker && (
        <DateTimePicker 
          value={new Date(`2000-01-01T${manualEnd}:00`)} 
          mode="time" 
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(e, d) => {
            setShowEndPicker(false);
            if(d) updateManualSchedule(
              manualStart, 
              `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { 
    paddingTop: 50, 
    paddingBottom: 20, 
    backgroundColor: '#fff', 
    alignItems: 'center', 
    borderBottomWidth: 1, 
    borderBottomColor: '#F3F4F6' 
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  
  statusCard: { 
    backgroundColor: '#fff', 
    padding: 20, 
    borderRadius: 20, 
    alignItems: 'center', 
    margin: 16,
    elevation: 3,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 10
  },
  statusLabel: { 
    color: '#6B7280', 
    fontSize: 13, 
    fontWeight: '600', 
    marginBottom: 8 
  },
  statusBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F3F4F6', 
    paddingHorizontal: 15, 
    paddingVertical: 8, 
    borderRadius: 30 
  },
  statusDot: { 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    marginRight: 10 
  },
  statusValue: { 
    fontSize: 14, 
    fontWeight: '800' 
  },
  powerIndicator: {
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    elevation: 2,
  },
  powerIndicatorText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },

  tabContainer: { 
    flexDirection: 'row', 
    backgroundColor: '#E5E7EB', 
    borderRadius: 14, 
    padding: 4, 
    marginHorizontal: 16, 
    marginBottom: 20 
  },
  tab: { 
    flex: 1, 
    paddingVertical: 12, 
    alignItems: 'center', 
    borderRadius: 11 
  },
  tabActive: { 
    backgroundColor: '#fff', 
    elevation: 2 
  },
  tabText: { 
    fontWeight: '700', 
    color: '#6B7280', 
    fontSize: 13 
  },
  tabTextActive: { 
    color: '#111827' 
  },

  sectionCard: { 
    backgroundColor: '#fff', 
    borderRadius: 20, 
    padding: 15, 
    marginHorizontal: 16, 
    marginBottom: 25 
  },
  cardInfoTitle: { 
    fontSize: 15, 
    fontWeight: '700', 
    color: '#374151', 
    marginBottom: 15, 
    marginLeft: 5 
  },
  
  card: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    borderRadius: 12, 
    backgroundColor: '#fff', 
    borderWidth: 2, 
    borderColor: '#F3F4F6', 
    marginBottom: 10 
  },
  cardActive: { 
    borderColor: '#0EA5E9', 
    backgroundColor: 'rgba(14,165,233,0.05)' 
  },
  cardIcon: { 
    fontSize: 24, 
    marginRight: 12 
  },
  cardTextContainer: { 
    flex: 1 
  },
  cardTitle: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    color: '#111827' 
  },
  cardSubtitle: { 
    fontSize: 12, 
    color: '#6B7280' 
  },
  cardStatus: { 
    fontSize: 18 
  },

  delayInputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 15, 
    paddingHorizontal: 10 
  },
  delayLabel: { 
    flex: 1, 
    fontSize: 14, 
    color: '#4B5563', 
    fontWeight: 'bold' 
  },
  delayInput: { 
    backgroundColor: '#F3F4F6', 
    borderRadius: 8, 
    padding: 8, 
    width: 70, 
    textAlign: 'center', 
    fontWeight: 'bold', 
    borderWidth: 1, 
    borderColor: '#E5E7EB' 
  },

  timeRow: { 
    flexDirection: 'row', 
    gap: 15 
  },
  timeButton: { 
    flex: 1, 
    backgroundColor: '#F9FAFB', 
    padding: 18, 
    borderRadius: 15, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#E5E7EB' 
  },
  timeButtonLabel: { 
    fontSize: 10, 
    color: '#9CA3AF', 
    fontWeight: '800', 
    marginBottom: 5 
  },
  timeButtonValue: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#111827' 
  },

  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '800', 
    color: '#111827', 
    marginHorizontal: 16, 
    marginBottom: 15 
  },
  
  addDeviceContainer: {
    backgroundColor: '#fff', 
    borderRadius: 24, 
    padding: 20, 
    marginHorizontal: 16, 
    marginBottom: 25,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 10 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 15, 
    elevation: 4
  },
  addDeviceHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 20 
  },
  addDeviceHeaderTitle: { 
    fontSize: 13, 
    fontWeight: '700', 
    color: '#9CA3AF', 
    textTransform: 'uppercase' 
  },
  pinBadge: { 
    backgroundColor: '#DBEAFE', 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 8 
  },
  pinBadgeText: { 
    color: '#0369A1', 
    fontSize: 10, 
    fontWeight: '800' 
  },
  addForm: { 
    flexDirection: 'row', 
    gap: 15, 
    marginBottom: 20 
  },
  inputWrapper: { 
    flex: 1 
  },
  inputLabel: { 
    fontSize: 12, 
    fontWeight: '700', 
    color: '#4B5563', 
    marginBottom: 8, 
    marginLeft: 4 
  },
  modernInput: { 
    backgroundColor: '#F9FAFB', 
    borderRadius: 15, 
    padding: 15, 
    fontSize: 15, 
    borderWidth: 1, 
    borderColor: '#F3F4F6' 
  },
  modernAddButton: { 
    backgroundColor: '#0EA5E9', 
    height: 55, 
    borderRadius: 18, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 4
  },
  modernAddButtonText: { 
    color: '#fff', 
    fontWeight: '800', 
    fontSize: 16, 
    marginRight: 10 
  },
  plusIcon: { 
    color: '#fff', 
    fontSize: 24, 
    fontWeight: '300' 
  },

  deviceItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 20, 
    marginHorizontal: 16, 
    marginBottom: 12, 
    elevation: 1
  },
  deviceMainInfo: { 
    flexDirection: 'row', 
    alignItems: 'center',
    flex: 1
  },
  deviceIconCircle: { 
    width: 45, 
    height: 45, 
    borderRadius: 22, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 15 
  },
  deviceName: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#111827' 
  },
  devicePin: { 
    fontSize: 12, 
    color: '#9CA3AF', 
    fontWeight: '600' 
  },
  deviceStatus: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  deviceActions: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12 
  },
  toggleBtn: { 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 10, 
    minWidth: 70, 
    alignItems: 'center' 
  },
  toggleBtnText: { 
    color: '#fff', 
    fontSize: 10, 
    fontWeight: '900' 
  },
  deleteIconButton: { 
    padding: 5 
  },
  
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 40,
    marginHorizontal: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  emptyIcon: { 
    fontSize: 48, 
    marginBottom: 15 
  },
  emptyStateText: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#6B7280', 
    marginBottom: 5 
  },
  emptyStateSubtext: { 
    fontSize: 13, 
    color: '#9CA3AF', 
    textAlign: 'center' 
  },
});