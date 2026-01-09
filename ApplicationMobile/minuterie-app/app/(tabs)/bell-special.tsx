import React, { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

type SpecialRing = {
  id: string;
  time: string;
  label: string;
  icon: string;
  enabled: boolean;
};

type ScheduleMode = 'Custom Range' | 'Ramadan' | 'Exams' | 'Holidays';

export default function BellSettingsSpecial() {
  const [mode, setMode] = useState<'Normal' | 'Special'>('Special');
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>('Custom Range');
  const [modalVisible, setModalVisible] = useState(false);
  const [modePickerVisible, setModePickerVisible] = useState(false);
  const [editingRing, setEditingRing] = useState<SpecialRing | null>(null);
  const [newTime, setNewTime] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newIcon, setNewIcon] = useState('🔔');

  const [startDate, setStartDate] = useState('May 12, 2024');
  const [endDate, setEndDate] = useState('Jun 12, 2024');

  const [specialRings, setSpecialRings] = useState<SpecialRing[]>([
    { id: '1', time: '08:00 AM', label: 'Morning Break', icon: '🔔', enabled: true },
    { id: '2', time: '12:30 PM', label: 'Iftar Bell', icon: '🍽️', enabled: true },
    { id: '3', time: '04:15 PM', label: 'Exam End', icon: '🏫', enabled: true },
  ]);

  const scheduleModes: ScheduleMode[] = ['Custom Range', 'Ramadan', 'Exams', 'Holidays'];
  const iconOptions = ['🔔', '🍽️', '🏫', '📚', '⏰', '🌙', '☀️', '🎓'];

  // Ajouter une nouvelle sonnerie
  const handleAddRing = () => {
    if (!newTime || !newLabel) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const newRing: SpecialRing = {
      id: Date.now().toString(),
      time: newTime,
      label: newLabel,
      icon: newIcon,
      enabled: true,
    };

    setSpecialRings([...specialRings, newRing]);
    setModalVisible(false);
    resetForm();
  };

  // Modifier une sonnerie
  const handleEditRing = (ring: SpecialRing) => {
    setEditingRing(ring);
    setNewTime(ring.time);
    setNewLabel(ring.label);
    setNewIcon(ring.icon);
    setModalVisible(true);
  };

  // Sauvegarder les modifications
  const handleSaveEdit = () => {
    if (!editingRing || !newTime || !newLabel) return;

    setSpecialRings(
      specialRings.map((ring) =>
        ring.id === editingRing.id
          ? { ...ring, time: newTime, label: newLabel, icon: newIcon }
          : ring
      )
    );

    setModalVisible(false);
    setEditingRing(null);
    resetForm();
  };

  // Supprimer une sonnerie
  const handleDeleteRing = (id: string) => {
    Alert.alert(
      'Delete Ring',
      'Are you sure you want to delete this ring?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setSpecialRings(specialRings.filter((ring) => ring.id !== id)),
        },
      ]
    );
  };

  // Activer/désactiver une sonnerie
  const toggleRingEnabled = (id: string) => {
    setSpecialRings(
      specialRings.map((ring) =>
        ring.id === id ? { ...ring, enabled: !ring.enabled } : ring
      )
    );
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setNewTime('');
    setNewLabel('');
    setNewIcon('🔔');
  };

  // Sauvegarder la configuration
  const handleSaveConfiguration = () => {
    Alert.alert(
      'Success',
      'Special configuration saved successfully!',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Navigation Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => {}}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bell Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.main} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Alert Banner */}
        <View style={styles.alertBanner}>
          <Text style={styles.alertIcon}>ℹ️</Text>
          <View style={styles.alertText}>
            <Text style={styles.alertTitle}>Special Schedule Overrides Normal Mode</Text>
            <Text style={styles.alertDesc}>This schedule will take priority until the set end date.</Text>
          </View>
        </View>

        {/* Mode Toggle */}
        <View style={styles.modeSelector}>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'Normal' && styles.modeButtonActive]}
            onPress={() => setMode('Normal')}
          >
            <Text style={mode === 'Normal' ? styles.modeTextActive : styles.modeText}>Normal Mode</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'Special' && styles.modeButtonActive]}
            onPress={() => setMode('Special')}
          >
            <Text style={mode === 'Special' ? styles.modeTextActive : styles.modeText}>Special Mode</Text>
          </TouchableOpacity>
        </View>

        {/* Period / Dates */}
        <View style={styles.configSection}>
          <Text style={styles.configLabel}>Select Mode</Text>
          <TouchableOpacity 
            style={styles.fakeSelect}
            onPress={() => setModePickerVisible(true)}
          >
            <Text style={styles.selectText}>{scheduleMode}</Text>
            <Text style={styles.selectArrow}>▼</Text>
          </TouchableOpacity>

          <View style={styles.dateRow}>
            <View style={[styles.datePicker, { marginRight: 8 }]}>
              <Text style={styles.dateLabel}>Start Date</Text>
              <TouchableOpacity style={styles.dateBox}>
                <Text style={styles.dateText}>📅 {startDate}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.datePicker}>
              <Text style={styles.dateLabel}>End Date</Text>
              <TouchableOpacity style={styles.dateBox}>
                <Text style={styles.dateText}>📅 {endDate}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Special Rings List */}
        <View style={styles.ringList}>
          <View style={styles.ringHeader}>
            <Text style={styles.ringHeaderTitle}>Special Rings</Text>
            <Text style={styles.ringHeaderCount}>{specialRings.length} Scheduled</Text>
          </View>

          {specialRings.map((ring) => (
            <View key={ring.id} style={styles.ringItem}>
              <TouchableOpacity 
                style={styles.ringLeft}
                onPress={() => handleEditRing(ring)}
              >
                <View style={[styles.ringIcon, !ring.enabled && styles.ringIconDisabled]}>
                  <Text style={styles.ringIconText}>{ring.icon}</Text>
                </View>
                <View>
                  <Text style={[styles.ringTime, !ring.enabled && styles.textDisabled]}>
                    {ring.time}
                  </Text>
                  <Text style={[styles.ringLabel, !ring.enabled && styles.textDisabled]}>
                    {ring.label}
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.ringRight}>
                <Switch
                  value={ring.enabled}
                  onValueChange={() => toggleRingEnabled(ring.id)}
                  trackColor={{ false: '#e0e0e0', true: '#0d7fff' }}
                  thumbColor="#fff"
                />
                <TouchableOpacity 
                  style={styles.deleteButton} 
                  onPress={() => handleDeleteRing(ring.id)}
                >
                  <Text style={styles.deleteIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <TouchableOpacity 
            style={styles.addButton} 
            onPress={() => {
              setEditingRing(null);
              resetForm();
              setModalVisible(true);
            }}
          >
            <Text style={styles.addIcon}>➕</Text>
            <Text style={styles.addText}>Add Time</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveConfiguration}>
          <Text style={styles.saveText}>Save Special Configuration</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for Add/Edit Ring */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingRing ? 'Edit Ring' : 'Add New Ring'}
            </Text>

            <Text style={styles.inputLabel}>Time</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 08:00 AM"
              value={newTime}
              onChangeText={setNewTime}
            />

            <Text style={styles.inputLabel}>Label</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Morning Break"
              value={newLabel}
              onChangeText={setNewLabel}
            />

            <Text style={styles.inputLabel}>Icon</Text>
            <View style={styles.iconSelector}>
              {iconOptions.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  style={[
                    styles.iconOption,
                    newIcon === icon && styles.iconOptionSelected,
                  ]}
                  onPress={() => setNewIcon(icon)}
                >
                  <Text style={styles.iconOptionText}>{icon}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  setEditingRing(null);
                  resetForm();
                }}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={editingRing ? handleSaveEdit : handleAddRing}
                style={styles.confirmButton}
              >
                <Text style={styles.confirmButtonText}>
                  {editingRing ? 'Save' : 'Add'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Mode Picker Modal */}
      <Modal
        visible={modePickerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModePickerVisible(false)}
      >
        <TouchableOpacity 
          style={styles.pickerOverlay}
          activeOpacity={1}
          onPress={() => setModePickerVisible(false)}
        >
          <View style={styles.pickerContent}>
            <Text style={styles.pickerTitle}>Select Schedule Mode</Text>
            {scheduleModes.map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.pickerOption,
                  scheduleMode === mode && styles.pickerOptionSelected,
                ]}
                onPress={() => {
                  setScheduleMode(mode);
                  setModePickerVisible(false);
                }}
              >
                <Text style={[
                  styles.pickerOptionText,
                  scheduleMode === mode && styles.pickerOptionTextSelected,
                ]}>
                  {mode}
                </Text>
                {scheduleMode === mode && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#dbe0e6' 
  },
  backButton: { padding: 8, borderRadius: 20 },
  backIcon: { fontSize: 20 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', flex: 1 },

  main: { flex: 1, paddingHorizontal: 16 },

  alertBanner: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    backgroundColor: '#fff4e6', 
    borderWidth: 1, 
    borderColor: '#ffd8a8', 
    borderRadius: 12, 
    padding: 12, 
    marginVertical: 8 
  },
  alertIcon: { fontSize: 20, color: '#e67e22', marginRight: 8 },
  alertText: { flex: 1 },
  alertTitle: { fontSize: 14, fontWeight: 'bold', color: '#862e1e' },
  alertDesc: { fontSize: 12, color: '#a0522d', marginTop: 2 },

  modeSelector: { 
    flexDirection: 'row', 
    marginVertical: 8, 
    borderRadius: 12, 
    backgroundColor: '#e5e7eb', 
    overflow: 'hidden' 
  },
  modeButton: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  modeButtonActive: { 
    backgroundColor: '#fff', 
    shadowColor: '#000', 
    shadowOpacity: 0.1, 
    shadowOffset: { width: 0, height: 2 }, 
    shadowRadius: 4, 
    elevation: 3 
  },
  modeText: { color: '#60758a', fontWeight: '600' },
  modeTextActive: { color: '#0d7fff', fontWeight: '600' },

  configSection: { marginVertical: 8 },
  configLabel: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  fakeSelect: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1, 
    borderColor: '#dbe0e6', 
    borderRadius: 12, 
    padding: 12, 
    backgroundColor: '#fff', 
    marginBottom: 12 
  },
  selectText: { fontSize: 14, color: '#111' },
  selectArrow: { fontSize: 12, color: '#60758a' },

  dateRow: { flexDirection: 'row' },
  datePicker: { flex: 1 },
  dateLabel: { fontSize: 12, fontWeight: '600', color: '#6b7280', marginBottom: 2 },
  dateBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#dbe0e6', 
    borderRadius: 12, 
    padding: 10, 
    backgroundColor: '#fff' 
  },
  dateText: { fontSize: 14 },

  ringList: { marginVertical: 8 },
  ringHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  ringHeaderTitle: { 
    fontSize: 12, 
    fontWeight: 'bold', 
    color: '#6b7280', 
    textTransform: 'uppercase' 
  },
  ringHeaderCount: { fontSize: 10, fontWeight: '500', color: '#0d7fff' },

  ringItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 12, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#dbe0e6', 
    backgroundColor: '#fff', 
    marginBottom: 8 
  },
  ringLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  ringRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ringIcon: { 
    width: 36, 
    height: 36, 
    borderRadius: 8, 
    backgroundColor: 'rgba(13,127,255,0.1)', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 8,
  },
  ringIconDisabled: {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  ringIconText: { fontSize: 18 },
  ringTime: { fontSize: 14, fontWeight: 'bold' },
  ringLabel: { fontSize: 10, color: '#6b7280' },
  textDisabled: { opacity: 0.4 },
  deleteButton: { padding: 8 },
  deleteIcon: { fontSize: 16 },

  addButton: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 12, 
    borderWidth: 2, 
    borderColor: '#dbe0e6', 
    borderStyle: 'dashed', 
    borderRadius: 12, 
    marginVertical: 8 
  },
  addIcon: { marginRight: 4, fontSize: 16 },
  addText: { fontWeight: 'bold', color: '#0d7fff' },

  footer: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    padding: 16, 
    backgroundColor: 'rgba(255,255,255,0.95)', 
    borderTopWidth: 1, 
    borderTopColor: '#dbe0e6' 
  },
  saveButton: { 
    backgroundColor: '#0d7fff', 
    paddingVertical: 16, 
    borderRadius: 12, 
    alignItems: 'center' 
  },
  saveText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  iconSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconOptionSelected: {
    borderColor: '#0d7fff',
    backgroundColor: 'rgba(13,127,255,0.1)',
  },
  iconOptionText: {
    fontSize: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f0f2f5',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#60758a',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#0d7fff',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },

  // Picker Modal
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  pickerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  pickerOptionSelected: {
    backgroundColor: 'rgba(13,127,255,0.1)',
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#111',
  },
  pickerOptionTextSelected: {
    fontWeight: '600',
    color: '#0d7fff',
  },
  checkmark: {
    fontSize: 18,
    color: '#0d7fff',
    fontWeight: 'bold',
  },
});