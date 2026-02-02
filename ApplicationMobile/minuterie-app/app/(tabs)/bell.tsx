import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { NormalBell, SpecialBell, useBell } from '../../hooks/useBell';

type BellType = 'normal' | 'special';
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function BellScreen() {
  const {
    normalBells,
    specialBells,
    nextBell,
    lastTriggered,
    syncNormalBells,
    syncSpecialBells,
    deleteNormalBell,
    deleteSpecialBell,
  } = useBell();

  const [mode, setMode] = useState<BellType>('normal');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBell, setEditingBell] = useState<NormalBell | SpecialBell | null>(null);
  const [newHour, setNewHour] = useState<number>(0);
  const [newMinute, setNewMinute] = useState<number>(0);
  const [newLabel, setNewLabel] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Format helpers
  const formatTime = (hour: number, minute: number) =>
    `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  const formatDate = (date: Date) =>
    `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;

  // Toggle day selection
  const toggleDay = (day: string) => {
    setSelectedDays(prev => (prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]));
  };

  // Enable/Disable bell
  const toggleEnabled = (id: string, type: BellType) => {
    if (type === 'normal') {
      const updated = normalBells.map(b => (b.id === id ? { ...b, enabled: !b.enabled } : b));
      syncNormalBells(updated);
    } else {
      const updated = specialBells.map(b => (b.id === id ? { ...b, enabled: !b.enabled } : b));
      syncSpecialBells(updated);
    }
  };

  // Delete bell
  const handleDelete = (id: string, type: BellType) => {
    Alert.alert('Delete Bell', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          if (type === 'normal') deleteNormalBell(id);
          else deleteSpecialBell(id);
        },
      },
    ]);
  };

  // Reset modal state
  const resetModal = () => {
    setModalVisible(false);
    setEditingBell(null);
    setNewHour(0);
    setNewMinute(0);
    setNewLabel('');
    setSelectedDays([]);
    setStartDate(new Date());
    setEndDate(new Date());
  };

  // Save or update bell
  const handleSave = () => {
    if (mode === 'normal') {
      if (!newLabel || selectedDays.length === 0) {
        Alert.alert('Error', 'Please fill all fields and select days');
        return;
      }
      let updated: NormalBell[];
      if (editingBell) {
        updated = normalBells.map(b =>
          b.id === editingBell.id ? { ...b, hour: newHour, minute: newMinute, label: newLabel, days: selectedDays } : b
        );
      } else {
        updated = [
          ...normalBells,
          {
            id: Date.now().toString(),
            hour: newHour,
            minute: newMinute,
            label: newLabel,
            enabled: true,
            days: selectedDays,
          },
        ];
      }
      syncNormalBells(updated);
    } else {
      if (!newLabel) {
        Alert.alert('Error', 'Please fill all fields');
        return;
      }
      let updated: SpecialBell[];
      if (editingBell) {
        updated = specialBells.map(b =>
          b.id === editingBell.id
            ? {
                ...b,
                hour: newHour,
                minute: newMinute,
                label: newLabel,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
              }
            : b
        );
      } else {
        updated = [
          ...specialBells,
          {
            id: Date.now().toString(),
            hour: newHour,
            minute: newMinute,
            label: newLabel,
            enabled: true,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          },
        ];
      }
      syncSpecialBells(updated);
    }
    resetModal();
  };

  // Edit bell
  const handleEdit = (bell: NormalBell | SpecialBell, type: BellType) => {
    setEditingBell(bell);
    setMode(type);
    setNewHour(bell.hour);
    setNewMinute(bell.minute);
    setNewLabel(bell.label);
    if (type === 'normal') setSelectedDays((bell as NormalBell).days || []);
    else {
      setStartDate(new Date((bell as SpecialBell).startDate));
      setEndDate(new Date((bell as SpecialBell).endDate));
    }
    setModalVisible(true);
  };

  // ✅ Vérifier si une cloche est récemment déclenchée (dans les 2 dernières minutes)
  const isBellRecentlyTriggered = () => {
    if (!lastTriggered) return false;
    const triggeredTime = new Date(lastTriggered.triggeredAt);
    const now = new Date();
    const diffMinutes = (now.getTime() - triggeredTime.getTime()) / 1000 / 60;
    return diffMinutes < 2;
  };

  // Grouper normal bells par jour
  const normalBellsByDay: Record<string, NormalBell[]> = {};
  DAYS.forEach(day => {
    normalBellsByDay[day] = normalBells
      .filter(b => b.enabled && b.days.includes(day))
      .sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute));
  });

  // Calculer le nombre total de cloches actives
  const activeNormalBells = normalBells?.filter(b => b.enabled).length || 0;
  const activeSpecialBells = specialBells?.filter(b => b.enabled).length || 0;
  const totalActiveBells = activeNormalBells + activeSpecialBells;

  return (
    <View style={styles.container}>
      {/* ✅ HEADER - Style unifié */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bell Schedule</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        
        {/* ✅ GLOBAL STATUS CARD */}
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Bell System Status</Text>
          <View style={styles.statusBadge}>
            <View style={[
              styles.statusDot, 
              { backgroundColor: isBellRecentlyTriggered() ? '#F59E0B' : (totalActiveBells > 0 ? '#16A34A' : '#6B7280') }
            ]} />
            <Text style={[
              styles.statusValue, 
              { color: isBellRecentlyTriggered() ? '#F59E0B' : (totalActiveBells > 0 ? '#16A34A' : '#6B7280') }
            ]}>
              {isBellRecentlyTriggered() ? 'RINGING' : (totalActiveBells > 0 ? 'READY' : 'NO BELLS ACTIVE')}
            </Text>
          </View>
          
          {/* ✅ Indicateur visuel supplémentaire */}
          <View style={[
            styles.powerIndicator,
            { backgroundColor: isBellRecentlyTriggered() ? '#F59E0B' : (totalActiveBells > 0 ? '#16A34A' : '#6B7280') }
          ]}>
            <Text style={styles.powerIndicatorText}>
              {isBellRecentlyTriggered() ? '🔔 ACTIVE' : (totalActiveBells > 0 ? `${totalActiveBells} SCHEDULED` : '⭕ INACTIVE')}
            </Text>
          </View>
        </View>

        {/* ✅ NEXT BELL INFO CARD */}
        {nextBell && (
          <View style={styles.nextBellCard}>
            <View style={styles.nextBellHeader}>
              <Text style={styles.nextBellIcon}>⏭️</Text>
              <View style={styles.nextBellInfo}>
                <Text style={styles.nextBellLabel}>Next Bell</Text>
                <Text style={styles.nextBellTime}>{nextBell.time}</Text>
              </View>
            </View>
            <Text style={styles.nextBellTitle}>{nextBell.label}</Text>
            <View style={styles.nextBellTypeBadge}>
              <Text style={styles.nextBellTypeText}>
                {nextBell.type === 'normal' ? '📅 Normal Schedule' : '⭐ Special Event'}
              </Text>
            </View>
          </View>
        )}

        {/* ✅ MODE SELECTOR (TABS) - Style unifié */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, mode === 'normal' && styles.tabActive]}
            onPress={() => setMode('normal')}
          >
            <Text style={[styles.tabText, mode === 'normal' && styles.tabTextActive]}>NORMAL</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, mode === 'special' && styles.tabActive]}
            onPress={() => setMode('special')}
          >
            <Text style={[styles.tabText, mode === 'special' && styles.tabTextActive]}>SPECIAL</Text>
          </TouchableOpacity>
        </View>

        {/* ✅ SECTION TITLE */}
        <Text style={styles.sectionTitle}>
          {mode === 'normal' ? 'Normal Bells Schedule' : 'Special Event Bells'}
        </Text>

        {/* ✅ NORMAL BELLS - Groupés par jour */}
        {mode === 'normal' && (
          <>
            {DAYS.map(day => {
              const dayBells = normalBellsByDay[day];
              if (!dayBells || dayBells.length === 0) return null;
              return (
                <View key={day} style={styles.dayGroup}>
                  <View style={styles.dayHeader}>
                    <Text style={styles.dayTitle}>{day}</Text>
                    <View style={styles.dayBadge}>
                      <Text style={styles.dayBadgeText}>{dayBells.length} bells</Text>
                    </View>
                  </View>
                  
                  {dayBells.map((bell, index) => (
                    <View key={`${day}-${bell.id}-${index}`} style={styles.deviceItem}>
                      <View style={styles.deviceMainInfo}>
                        <View style={[
                          styles.deviceIconCircle,
                          { backgroundColor: bell.enabled ? '#FEF3C7' : '#F3F4F6' }
                        ]}>
                          <Text style={{fontSize: 18}}>{bell.enabled ? '🔔' : '🔕'}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.deviceName}>{bell.label}</Text>
                          <Text style={styles.devicePin}>{formatTime(bell.hour, bell.minute)}</Text>
                          <Text style={styles.deviceStatus}>
                            {bell.days.join(', ')}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.deviceActions}>
                        <TouchableOpacity 
                          onPress={() => handleEdit(bell, 'normal')} 
                          style={styles.editIconButton}
                        >
                          <Text style={{fontSize: 16}}>✏️</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          onPress={() => handleDelete(bell.id, 'normal')} 
                          style={styles.deleteIconButton}
                        >
                          <Text style={{fontSize: 16}}>🗑️</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              );
            })}

            {normalBells.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🔔</Text>
                <Text style={styles.emptyStateText}>No normal bells configured</Text>
                <Text style={styles.emptyStateSubtext}>Add your first bell schedule</Text>
              </View>
            )}
          </>
        )}

        {/* ✅ SPECIAL BELLS */}
        {mode === 'special' && (
          <>
            {specialBells.map((bell, index) => (
              <View key={`${bell.id}-${index}`} style={styles.deviceItem}>
                <View style={styles.deviceMainInfo}>
                  <View style={[
                    styles.deviceIconCircle,
                    { backgroundColor: bell.enabled ? '#FEF3C7' : '#F3F4F6' }
                  ]}>
                    <Text style={{fontSize: 18}}>{bell.enabled ? '⭐' : '🔕'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.deviceName}>{bell.label}</Text>
                    <Text style={styles.devicePin}>{formatTime(bell.hour, bell.minute)}</Text>
                    <Text style={styles.deviceStatus}>
                      {formatDate(new Date(bell.startDate))} → {formatDate(new Date(bell.endDate))}
                    </Text>
                  </View>
                </View>
                <View style={styles.deviceActions}>
                  <TouchableOpacity 
                    onPress={() => handleEdit(bell, 'special')} 
                    style={styles.editIconButton}
                  >
                    <Text style={{fontSize: 16}}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => handleDelete(bell.id, 'special')} 
                    style={styles.deleteIconButton}
                  >
                    <Text style={{fontSize: 16}}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {specialBells.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>⭐</Text>
                <Text style={styles.emptyStateText}>No special bells configured</Text>
                <Text style={styles.emptyStateSubtext}>Add bells for special events or holidays</Text>
              </View>
            )}
          </>
        )}

      </ScrollView>

      {/* ✅ ADD BUTTON - Style moderne */}
      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => { 
          setEditingBell(null); 
          setNewHour(8);
          setNewMinute(0);
          setNewLabel('');
          setSelectedDays([]);
          setModalVisible(true); 
        }}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      {/* ✅ MODAL - Style amélioré */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingBell ? '✏️ Edit Bell' : '➕ Add New Bell'}
            </Text>

            <View style={styles.modalForm}>
              {/* Time Picker */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Time</Text>
                <TouchableOpacity 
                  onPress={() => setShowTimePicker(true)}
                  style={styles.timeInputButton}
                >
                  <Text style={styles.timeInputText}>🕐 {formatTime(newHour, newMinute)}</Text>
                </TouchableOpacity>
              </View>

              {showTimePicker && (
                <DateTimePicker
                  value={new Date(1970, 0, 1, newHour, newMinute)}
                  mode="time"
                  is24Hour={true}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(e, d) => {
                    setShowTimePicker(false);
                    if (d) {
                      setNewHour(d.getHours());
                      setNewMinute(d.getMinutes());
                    }
                  }}
                />
              )}

              {/* Label */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Label</Text>
                <TextInput 
                  style={styles.modernInput} 
                  value={newLabel} 
                  onChangeText={setNewLabel}
                  placeholder="e.g. Morning Bell"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Normal Mode: Days */}
              {mode === 'normal' && (
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Repeat Days</Text>
                  <View style={styles.daysContainer}>
                    {DAYS.map(day => (
                      <TouchableOpacity
                        key={day}
                        style={[styles.dayButton, selectedDays.includes(day) && styles.dayButtonSelected]}
                        onPress={() => toggleDay(day)}
                      >
                        <Text style={[
                          styles.dayButtonText, 
                          selectedDays.includes(day) && styles.dayButtonTextSelected
                        ]}>
                          {day}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Special Mode: Date Range */}
              {mode === 'special' && (
                <>
                  <View style={styles.dateRangeRow}>
                    <View style={styles.dateInputWrapper}>
                      <Text style={styles.inputLabel}>Start Date</Text>
                      <TouchableOpacity 
                        onPress={() => setShowStartPicker(true)}
                        style={styles.dateInputButton}
                      >
                        <Text style={styles.dateInputText}>📅 {formatDate(startDate)}</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.dateInputWrapper}>
                      <Text style={styles.inputLabel}>End Date</Text>
                      <TouchableOpacity 
                        onPress={() => setShowEndPicker(true)}
                        style={styles.dateInputButton}
                      >
                        <Text style={styles.dateInputText}>📅 {formatDate(endDate)}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {showStartPicker && (
                    <DateTimePicker
                      value={startDate}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(e, d) => {
                        setShowStartPicker(false);
                        if (e.type === 'set' && d) {
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
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(e, d) => {
                        setShowEndPicker(false);
                        if (e.type === 'set' && d) {
                          if (d < startDate) {
                            Alert.alert('Invalid Date', 'End Date cannot be before Start Date');
                            return;
                          }
                          setEndDate(d);
                        }
                      }}
                    />
                  )}
                </>
              )}
            </View>

            {/* Modal Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={resetModal}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={handleSave}>
                <Text style={styles.confirmButtonText}>
                  {editingBell ? 'Update' : 'Add Bell'}
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
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  
  header: { 
    paddingTop: 50, 
    paddingBottom: 20, 
    backgroundColor: '#fff', 
    alignItems: 'center', 
    borderBottomWidth: 1, 
    borderBottomColor: '#F3F4F6',
    elevation: 2,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 3
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  
  statusCard: { 
    backgroundColor: '#fff', 
    padding: 20, 
    borderRadius: 20, 
    alignItems: 'center', 
    marginBottom: 16,
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

  nextBellCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  nextBellHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  nextBellIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  nextBellInfo: {
    flex: 1,
  },
  nextBellLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  nextBellTime: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  nextBellTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  nextBellTypeBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  nextBellTypeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },

  tabContainer: { 
    flexDirection: 'row', 
    backgroundColor: '#E5E7EB', 
    borderRadius: 14, 
    padding: 4, 
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

  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '800', 
    color: '#111827', 
    marginBottom: 15 
  },

  dayGroup: {
    marginBottom: 20,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0EA5E9',
  },
  dayBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dayBadgeText: {
    color: '#0369A1',
    fontSize: 11,
    fontWeight: '800',
  },

  deviceItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 20, 
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
    fontWeight: '600',
    marginTop: 2,
  },
  deviceStatus: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 4,
  },
  deviceActions: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12 
  },
  editIconButton: { 
    padding: 5 
  },
  deleteIconButton: { 
    padding: 5 
  },
  
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 40,
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

  addButton: {
    position: 'absolute',
    bottom: 32,
    right: 32,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0EA5E9',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  addButtonText: {
    fontSize: 36,
    color: '#fff',
    fontWeight: '300',
    lineHeight: 36,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 500,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 24,
    textAlign: 'center',
    color: '#111827',
  },
  modalForm: {
    gap: 16,
  },
  inputWrapper: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B5563',
    marginLeft: 4,
  },
  modernInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 15,
    padding: 15,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    color: '#111827',
  },
  timeInputButton: {
    backgroundColor: '#F9FAFB',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  timeInputText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  dayButtonSelected: {
    backgroundColor: '#0EA5E9',
    borderColor: '#0EA5E9',
  },
  dayButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
  },
  dayButtonTextSelected: {
    color: '#fff',
  },
  dateRangeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInputWrapper: {
    flex: 1,
    gap: 8,
  },
  dateInputButton: {
    backgroundColor: '#F9FAFB',
    borderRadius: 15,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  dateInputText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontWeight: '700',
    fontSize: 15,
    color: '#6B7280',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#0EA5E9',
    paddingVertical: 14,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 2,
  },
  confirmButtonText: {
    fontWeight: '800',
    fontSize: 15,
    color: '#fff',
  },
});