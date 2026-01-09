import React, { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

type BellTime = {
  id: string;
  time: string;
  label: string;
  enabled: boolean;
};

export default function BellSettings() {
  const [mode, setMode] = useState<'Normal' | 'Special'>('Normal');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBell, setEditingBell] = useState<BellTime | null>(null);
  const [newTime, setNewTime] = useState('');
  const [newLabel, setNewLabel] = useState('');

  const [bellTimes, setBellTimes] = useState<BellTime[]>([
    { id: '1', time: '08:00 AM', label: 'Morning Ring', enabled: true },
    { id: '2', time: '10:30 AM', label: 'Break Time', enabled: true },
    { id: '3', time: '12:00 PM', label: 'Lunch Bell', enabled: true },
    { id: '4', time: '03:30 PM', label: 'Dismissal', enabled: true },
  ]);

  // Ajouter une nouvelle sonnerie
  const handleAddBell = () => {
    if (!newTime || !newLabel) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const newBell: BellTime = {
      id: Date.now().toString(),
      time: newTime,
      label: newLabel,
      enabled: true,
    };

    setBellTimes([...bellTimes, newBell]);
    setModalVisible(false);
    setNewTime('');
    setNewLabel('');
  };

  // Modifier une sonnerie
  const handleEditBell = (bell: BellTime) => {
    setEditingBell(bell);
    setNewTime(bell.time);
    setNewLabel(bell.label);
    setModalVisible(true);
  };

  // Sauvegarder les modifications
  const handleSaveEdit = () => {
    if (!editingBell || !newTime || !newLabel) return;

    setBellTimes(
      bellTimes.map((bell) =>
        bell.id === editingBell.id
          ? { ...bell, time: newTime, label: newLabel }
          : bell
      )
    );

    setModalVisible(false);
    setEditingBell(null);
    setNewTime('');
    setNewLabel('');
  };

  // Supprimer une sonnerie
  const handleDeleteBell = (id: string) => {
    Alert.alert(
      'Delete Bell Time',
      'Are you sure you want to delete this bell time?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setBellTimes(bellTimes.filter((bell) => bell.id !== id)),
        },
      ]
    );
  };

  // Activer/désactiver une sonnerie
  const toggleBellEnabled = (id: string) => {
    setBellTimes(
      bellTimes.map((bell) =>
        bell.id === id ? { ...bell, enabled: !bell.enabled } : bell
      )
    );
  };

  // Sauvegarder la configuration
  const handleSaveConfiguration = () => {
    Alert.alert(
      'Success',
      'Configuration saved successfully!',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {}}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bell Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Mode Selector */}
      <View style={styles.modeSelector}>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'Normal' && styles.modeButtonActive]}
          onPress={() => setMode('Normal')}
        >
          <Text style={mode === 'Normal' ? styles.modeTextActive : styles.modeText}>
            Normal Mode
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'Special' && styles.modeButtonActive]}
          onPress={() => setMode('Special')}
        >
          <Text style={mode === 'Special' ? styles.modeTextActive : styles.modeText}>
            Special Mode
          </Text>
        </TouchableOpacity>
      </View>

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Scheduled Times</Text>
        <Text style={styles.sectionSubtitle}>ESP32 Linked</Text>
      </View>

      {/* Scrollable List */}
      <ScrollView style={styles.scrollList} contentContainerStyle={{ paddingBottom: 120 }}>
        {bellTimes.map((bell) => (
          <View key={bell.id} style={styles.listItem}>
            <TouchableOpacity
              style={styles.listItemLeft}
              onPress={() => handleEditBell(bell)}
            >
              <View style={[styles.iconWrapper, !bell.enabled && styles.iconWrapperDisabled]}>
                <Text style={styles.icon}>⏰</Text>
              </View>
              <View>
                <Text style={[styles.listItemTime, !bell.enabled && styles.textDisabled]}>
                  {bell.time}
                </Text>
                <Text style={[styles.listItemLabel, !bell.enabled && styles.textDisabled]}>
                  {bell.label}
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.listItemRight}>
              <Switch
                value={bell.enabled}
                onValueChange={() => toggleBellEnabled(bell.id)}
                trackColor={{ false: '#e0e0e0', true: '#0d7fff' }}
                thumbColor="#fff"
              />
              <TouchableOpacity
                onPress={() => handleDeleteBell(bell.id)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteIcon}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Add Time Button */}
        <TouchableOpacity
          onPress={() => {
            setEditingBell(null);
            setNewTime('');
            setNewLabel('');
            setModalVisible(true);
          }}
          style={styles.addButton}
        >
          <Text style={styles.addIcon}>➕</Text>
          <Text style={styles.addText}>Add Time</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Fixed Footer */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={handleSaveConfiguration} style={styles.saveButton}>
          <Text style={styles.saveText}>Save Configuration</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for Add/Edit */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingBell ? 'Edit Bell Time' : 'Add New Bell Time'}
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
              placeholder="e.g., Morning Ring"
              value={newLabel}
              onChangeText={setNewLabel}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  setEditingBell(null);
                  setNewTime('');
                  setNewLabel('');
                }}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={editingBell ? handleSaveEdit : handleAddBell}
                style={styles.confirmButton}
              >
                <Text style={styles.confirmButtonText}>
                  {editingBell ? 'Save' : 'Add'}
                </Text>
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

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backIcon: { fontSize: 20, color: '#111' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', flex: 1 },

  // Mode selector
  modeSelector: {
    flexDirection: 'row',
    margin: 16,
    borderRadius: 12,
    backgroundColor: '#f0f2f5',
    overflow: 'hidden',
  },
  modeButton: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  modeButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  modeText: { color: '#60758a', fontWeight: '600' },
  modeTextActive: { color: '#111', fontWeight: '600' },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#111' },
  sectionSubtitle: {
    fontSize: 10,
    color: '#0d7fff',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // List
  scrollList: { flex: 1 },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  listItemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  listItemRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(13,127,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconWrapperDisabled: {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  icon: { fontSize: 20, color: '#0d7fff' },
  listItemTime: { fontSize: 14, fontWeight: '600', color: '#111' },
  listItemLabel: { fontSize: 10, color: '#60758a', textTransform: 'uppercase' },
  textDisabled: { opacity: 0.4 },
  deleteButton: { padding: 8 },
  deleteIcon: { fontSize: 18 },

  // Add Button
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: 'rgba(13,127,255,0.3)',
    borderStyle: 'dashed',
    borderRadius: 12,
  },
  addIcon: { fontSize: 16, marginRight: 8, color: '#0d7fff' },
  addText: { fontSize: 14, fontWeight: 'bold', color: '#0d7fff' },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  saveButton: {
    backgroundColor: '#0d7fff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
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
});