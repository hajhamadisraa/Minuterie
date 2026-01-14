import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type SpecialRing = {
  id: string;
  time: string;
  label: string;
  enabled: boolean;
};

export default function BellSpecial() {
  const [specialRings, setSpecialRings] = useState<SpecialRing[]>([
    { id: '1', time: '08:00', label: 'Morning Break', enabled: true },
    { id: '2', time: '12:30', label: 'Iftar Bell', enabled: true },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingRing, setEditingRing] = useState<SpecialRing | null>(null);
  const [newTime, setNewTime] = useState('');
  const [newLabel, setNewLabel] = useState('');

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  /* ===== FORMAT DATE DD/MM/YYYY ===== */
  const formatDate = (date: Date) => {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  /* ===== ADD ===== */
  const handleAdd = () => {
    if (!newTime || !newLabel) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setSpecialRings(r => [
      ...r,
      {
        id: Date.now().toString(),
        time: newTime,
        label: newLabel,
        enabled: true,
      },
    ]);

    resetModal();
  };

  /* ===== EDIT ===== */
  const handleEdit = (ring: SpecialRing) => {
    setEditingRing(ring);
    setNewTime(ring.time);
    setNewLabel(ring.label);
    setModalVisible(true);
  };

  const handleSaveEdit = () => {
    if (!editingRing || !newTime || !newLabel) return;

    setSpecialRings(r =>
      r.map(item =>
        item.id === editingRing.id
          ? { ...item, time: newTime, label: newLabel }
          : item
      )
    );

    resetModal();
  };

  const resetModal = () => {
    setModalVisible(false);
    setEditingRing(null);
    setNewTime('');
    setNewLabel('');
  };

  /* ===== DELETE ===== */
  const handleDelete = (id: string) => {
    Alert.alert('Delete Alarm', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          setSpecialRings(r => r.filter(item => item.id !== id)),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* ===== DATE RANGE ===== */}
        <View style={styles.dateRow}>
          <TouchableOpacity
            style={styles.dateBox}
            onPress={() => setShowStartPicker(prev => !prev)} // toggle
          >
            <Text style={styles.dateTitle}>Start Date</Text>
            <Text style={styles.dateValue}>{formatDate(startDate)}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateBox}
            onPress={() => setShowEndPicker(prev => !prev)} // toggle
          >
            <Text style={styles.dateTitle}>End Date</Text>
            <Text style={styles.dateValue}>{formatDate(endDate)}</Text>
          </TouchableOpacity>
        </View>

        {/* ===== DATE PICKERS ===== */}
        {showStartPicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="spinner"
            onChange={(event, d) => {
              setShowStartPicker(false); // fermer toujours
              if (event.type === 'set' && d) {
                setStartDate(d);
                if (d > endDate) setEndDate(d);
              }
            }}
          />
        )}

        {showEndPicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="spinner"
            onChange={(event, d) => {
              setShowEndPicker(false); // fermer toujours
              if (event.type === 'set' && d) {
                if (d < startDate) {
                  Alert.alert(
                    'Invalid Date',
                    'End Date cannot be before Start Date'
                  );
                  return;
                }
                setEndDate(d);
              }
            }}
          />
        )}

        {/* ===== ALARMS LIST ===== */}
        {specialRings.map(r => (
          <View key={r.id} style={styles.listItem}>
            <TouchableOpacity
              style={styles.listItemLeft}
              onPress={() => handleEdit(r)}
            >
              <View
                style={[
                  styles.iconWrapper,
                  !r.enabled && styles.iconWrapperDisabled,
                ]}
              >
                <Text style={styles.icon}>⏰</Text>
              </View>

              <View>
                <Text
                  style={[
                    styles.listItemTime,
                    !r.enabled && styles.textDisabled,
                  ]}
                >
                  {r.time}
                </Text>
                <Text
                  style={[
                    styles.listItemLabel,
                    !r.enabled && styles.textDisabled,
                  ]}
                >
                  {r.label}
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.listItemRight}>
              <Switch
                value={r.enabled}
                onValueChange={() =>
                  setSpecialRings(items =>
                    items.map(i =>
                      i.id === r.id ? { ...i, enabled: !i.enabled } : i
                    )
                  )
                }
                trackColor={{ false: '#e0e0e0', true: '#0d7fff' }}
                thumbColor="#fff"
              />

              <TouchableOpacity onPress={() => handleDelete(r.id)}>
                <Text style={styles.deleteIcon}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* ===== ADD BUTTON ===== */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setEditingRing(null);
            setNewTime('');
            setNewLabel('');
            setModalVisible(true);
          }}
        >
          <Text style={styles.addIcon}>➕</Text>
          <Text style={styles.addText}>Add Alarm</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ===== MODAL ===== */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingRing ? 'Edit Alarm' : 'Add New Alarm'}
            </Text>

            <Text style={styles.inputLabel}>Time (HH:MM)</Text>
            <TextInput
              style={styles.input}
              placeholder="08:00"
              value={newTime}
              onChangeText={setNewTime}
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>Label</Text>
            <TextInput
              style={styles.input}
              placeholder="Special Bell"
              value={newLabel}
              onChangeText={setNewLabel}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={resetModal}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={editingRing ? handleSaveEdit : handleAdd}
              >
                <Text style={styles.confirmButtonText}>
                  {editingRing ? 'Save' : 'Add'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },

  dateRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  dateBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12,
  },
  dateTitle: { fontSize: 12, color: '#60758a', fontWeight: '600' },
  dateValue: { fontSize: 14, fontWeight: 'bold', color: '#111' },

  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
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
  iconWrapperDisabled: { backgroundColor: 'rgba(0,0,0,0.05)' },
  icon: { fontSize: 20, color: '#0d7fff' },

  listItemTime: { fontSize: 14, fontWeight: '600', color: '#111' },
  listItemLabel: { fontSize: 10, color: '#60758a', textTransform: 'uppercase' },
  textDisabled: { opacity: 0.4 },

  deleteIcon: { fontSize: 18 },

  addButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(13,127,255,0.3)',
    borderRadius: 12,
  },
  addIcon: { marginRight: 8, color: '#0d7fff' },
  addText: { fontWeight: 'bold', color: '#0d7fff' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: { width: '85%', backgroundColor: '#fff', borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },

  inputLabel: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12 },

  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 12 },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: { fontWeight: '600', color: '#60758a' },
  confirmButton: {
    flex: 1,
    backgroundColor: '#0d7fff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: { fontWeight: '600', color: '#fff' },
});
