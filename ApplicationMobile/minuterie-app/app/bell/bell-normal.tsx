import React, { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

type BellTime = {
  id: string;
  time: string; // format 24h HH:MM
  label: string;
  enabled: boolean;
  days: string[]; // jours de répétition e.g., ['Mon', 'Wed']
};

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function BellNormal() {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBell, setEditingBell] = useState<BellTime | null>(null);
  const [newTime, setNewTime] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const [bellTimes, setBellTimes] = useState<BellTime[]>([
    { id: '1', time: '08:00', label: 'Morning Ring', enabled: true, days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
    { id: '2', time: '10:30', label: 'Break Time', enabled: true, days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
    { id: '3', time: '12:00', label: 'Lunch Bell', enabled: true, days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
    { id: '4', time: '15:30', label: 'Dismissal', enabled: true, days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
  ]);

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleAddBell = () => {
    if (!newTime || !newLabel || selectedDays.length === 0) {
      Alert.alert('Error', 'Please fill in all fields and select at least one day');
      return;
    }

    const newBell: BellTime = {
      id: Date.now().toString(),
      time: newTime,
      label: newLabel,
      enabled: true,
      days: selectedDays,
    };

    setBellTimes([...bellTimes, newBell]);
    setModalVisible(false);
    setNewTime('');
    setNewLabel('');
    setSelectedDays([]);
  };

  const handleEditBell = (bell: BellTime) => {
    setEditingBell(bell);
    setNewTime(bell.time);
    setNewLabel(bell.label);
    setSelectedDays(bell.days);
    setModalVisible(true);
  };

  const handleSaveEdit = () => {
    if (!editingBell || !newTime || !newLabel || selectedDays.length === 0) return;

    setBellTimes(
      bellTimes.map(bell =>
        bell.id === editingBell.id ? { ...bell, time: newTime, label: newLabel, days: selectedDays } : bell
      )
    );

    setModalVisible(false);
    setEditingBell(null);
    setNewTime('');
    setNewLabel('');
    setSelectedDays([]);
  };

  const handleDeleteBell = (id: string) => {
    Alert.alert('Delete Bell Time', 'Are you sure you want to delete this bell time?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setBellTimes(bellTimes.filter(b => b.id !== id)) },
    ]);
  };

  const toggleBellEnabled = (id: string) => {
    setBellTimes(
      bellTimes.map(bell => (bell.id === id ? { ...bell, enabled: !bell.enabled } : bell))
    );
  };

  // Grouper par jour
  const groupedByDay: Record<string, BellTime[]> = {};
  DAYS.forEach(day => {
    groupedByDay[day] = bellTimes.filter(bell => bell.days.includes(day));
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {DAYS.map(day => (
          groupedByDay[day].length > 0 && (
            <View key={day} style={styles.dayGroup}>
              <Text style={styles.dayTitle}>{day}</Text>
              {groupedByDay[day].map(bell => (
                <View key={bell.id} style={styles.listItem}>
                  <TouchableOpacity style={styles.listItemLeft} onPress={() => handleEditBell(bell)}>
                    <View style={[styles.iconWrapper, !bell.enabled && styles.iconWrapperDisabled]}>
                      <Text style={styles.icon}>⏰</Text>
                    </View>
                    <View>
                      <Text style={[styles.listItemTime, !bell.enabled && styles.textDisabled]}>{bell.time}</Text>
                      <Text style={[styles.listItemLabel, !bell.enabled && styles.textDisabled]}>{bell.label}</Text>
                    </View>
                  </TouchableOpacity>
                  <View style={styles.listItemRight}>
                    <Switch
                      value={bell.enabled}
                      onValueChange={() => toggleBellEnabled(bell.id)}
                      trackColor={{ false: '#e0e0e0', true: '#0d7fff' }}
                      thumbColor="#fff"
                    />
                    <TouchableOpacity onPress={() => handleDeleteBell(bell.id)} style={styles.deleteButton}>
                      <Text style={styles.deleteIcon}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )
        ))}

        <TouchableOpacity
          onPress={() => { setEditingBell(null); setNewTime(''); setNewLabel(''); setSelectedDays([]); setModalVisible(true); }}
          style={styles.addButton}
        >
          <Text style={styles.addIcon}>➕</Text>
          <Text style={styles.addText}>Add Time</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={() => Alert.alert('Saved', 'Configuration saved successfully')}>
          <Text style={styles.saveText}>Save Configuration</Text>
        </TouchableOpacity>
      </View>

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingBell ? 'Edit Bell Time' : 'Add New Bell Time'}</Text>

            <Text style={styles.inputLabel}>Time (HH:MM 24h)</Text>
            <TextInput style={styles.input} placeholder="08:00" value={newTime} onChangeText={setNewTime} keyboardType="numeric" />

            <Text style={styles.inputLabel}>Label</Text>
            <TextInput style={styles.input} placeholder="Morning Ring" value={newLabel} onChangeText={setNewLabel} />

            <Text style={[styles.inputLabel, { marginTop: 16 }]}>Repeat Days</Text>
            <View style={styles.daysContainer}>
              {DAYS.map(day => (
                <TouchableOpacity
                  key={day}
                  style={[styles.dayButton, selectedDays.includes(day) && styles.dayButtonSelected]}
                  onPress={() => toggleDay(day)}
                >
                  <Text style={[styles.dayButtonText, selectedDays.includes(day) && styles.dayButtonTextSelected]}>{day}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => { setModalVisible(false); setEditingBell(null); }}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={editingBell ? handleSaveEdit : handleAddBell}>
                <Text style={styles.confirmButtonText}>{editingBell ? 'Save' : 'Add'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  dayGroup: { marginTop: 16, paddingHorizontal: 16 },
  dayTitle: { fontSize: 16, fontWeight: 'bold', color: '#0d7fff', marginBottom: 8 },
  listItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  listItemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  listItemRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrapper: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(13,127,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  iconWrapperDisabled: { backgroundColor: 'rgba(0,0,0,0.05)' },
  icon: { fontSize: 20, color: '#0d7fff' },
  listItemTime: { fontSize: 14, fontWeight: '600', color: '#111' },
  listItemLabel: { fontSize: 10, color: '#60758a', textTransform: 'uppercase' },
  textDisabled: { opacity: 0.4 },
  deleteButton: { padding: 8 },
  deleteIcon: { fontSize: 18 },
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', margin: 16, paddingVertical: 12, borderWidth: 2, borderColor: 'rgba(13,127,255,0.3)', borderStyle: 'dashed', borderRadius: 12 },
  addIcon: { fontSize: 16, marginRight: 8, color: '#0d7fff' },
  addText: { fontSize: 14, fontWeight: 'bold', color: '#0d7fff' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: 'rgba(255,255,255,0.95)', borderTopWidth: 1, borderTopColor: '#eee' },
  saveButton: { backgroundColor: '#0d7fff', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: '#fff', borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#111', marginBottom: 8, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16 },
  daysContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dayButton: { paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8 },
  dayButtonSelected: { backgroundColor: '#0d7fff', borderColor: '#0d7fff' },
  dayButtonText: { fontSize: 12, fontWeight: '600', color: '#111' },
  dayButtonTextSelected: { color: '#fff' },
  modalButtons: { flexDirection: 'row', marginTop: 24, gap: 12 },
  cancelButton: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: '#f0f2f5', alignItems: 'center' },
  cancelButtonText: { fontSize: 16, fontWeight: '600', color: '#60758a' },
  confirmButton: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: '#0d7fff', alignItems: 'center' },
  confirmButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});
