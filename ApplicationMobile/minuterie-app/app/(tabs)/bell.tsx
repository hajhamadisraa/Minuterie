import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
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

  // Grouper normal bells par jour
  const normalBellsByDay: Record<string, NormalBell[]> = {};
  DAYS.forEach(day => {
    normalBellsByDay[day] = normalBells
      .filter(b => b.enabled && b.days.includes(day))
      .sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute));
  });

  // Next bell display
  const nextBellStatus = nextBell
    ? `Next Bell: ${nextBell.label} at ${nextBell.time} (${nextBell.type})`
    : 'No upcoming bell';

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View />
        <Text style={styles.headerTitle}>Bell Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Mode Selector */}
      <View style={styles.modeSelector}>
        <TouchableOpacity style={[styles.modeButton, mode === 'normal' && styles.active]} onPress={() => setMode('normal')}>
          <Text style={mode === 'normal' ? styles.activeText : styles.text}>Normal</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.modeButton, mode === 'special' && styles.active]} onPress={() => setMode('special')}>
          <Text style={mode === 'special' ? styles.activeText : styles.text}>Special</Text>
        </TouchableOpacity>
      </View>

      {/* Next Bell */}
      <View style={styles.nextBellBox}>
        <Text style={styles.nextBellText}>{nextBellStatus}</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* NORMAL BELLS */}
        {mode === 'normal' &&
          DAYS.map(day => {
            const dayBells = normalBellsByDay[day];
            if (!dayBells || dayBells.length === 0) return null;
            return (
              <View key={day} style={styles.dayGroup}>
                <Text style={styles.dayTitle}>{day}</Text>
                {dayBells.map((bell, index) => (
                  <View key={`${day}-${bell.id}-${index}`} style={styles.listItem}>
                    <TouchableOpacity style={styles.listItemLeft} onPress={() => handleEdit(bell, 'normal')}>
                      <View style={[styles.iconWrapper, !bell.enabled && styles.iconWrapperDisabled]}>
                        <Text style={styles.icon}>⏰</Text>
                      </View>
                      <View>
                        <Text style={[styles.listItemTime, !bell.enabled && styles.textDisabled]}>
                          {formatTime(bell.hour, bell.minute)}
                        </Text>
                        <Text style={[styles.listItemLabel, !bell.enabled && styles.textDisabled]}>{bell.label}</Text>
                      </View>
                    </TouchableOpacity>
                    <View style={styles.listItemRight}>
                      <TouchableOpacity onPress={() => handleDelete(bell.id, 'normal')}>
                        <Text style={styles.deleteIcon}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            );
          })}

        {/* SPECIAL BELLS */}
        {mode === 'special' && (
          <>
            <View style={styles.dateRow}>
              <TouchableOpacity style={styles.dateBox} onPress={() => setShowStartPicker(true)}>
                <Text style={styles.dateTitle}>Start Date</Text>
                <Text style={styles.dateValue}>{formatDate(startDate)}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dateBox} onPress={() => setShowEndPicker(true)}>
                <Text style={styles.dateTitle}>End Date</Text>
                <Text style={styles.dateValue}>{formatDate(endDate)}</Text>
              </TouchableOpacity>
            </View>

            {showStartPicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="spinner"
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
                display="spinner"
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

            {specialBells.map((bell, index) => (
              <View key={`${bell.id}-${index}`} style={styles.listItem}>
                <TouchableOpacity style={styles.listItemLeft} onPress={() => handleEdit(bell, 'special')}>
                  <View style={[styles.iconWrapper, !bell.enabled && styles.iconWrapperDisabled]}>
                    <Text style={styles.icon}>⏰</Text>
                  </View>
                  <View>
                    <Text style={[styles.listItemTime, !bell.enabled && styles.textDisabled]}>
                      {formatTime(bell.hour, bell.minute)}
                    </Text>
                    <Text style={[styles.listItemLabel, !bell.enabled && styles.textDisabled]}>
                      {bell.label} ({formatDate(new Date(bell.startDate))} - {formatDate(new Date(bell.endDate))})
                    </Text>
                  </View>
                </TouchableOpacity>
                <View style={styles.listItemRight}>
                  <TouchableOpacity onPress={() => handleDelete(bell.id, 'special')}>
                    <Text style={styles.deleteIcon}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingBell ? 'Edit Bell' : 'Add Bell'}</Text>

            <Text style={styles.inputLabel}>Time</Text>
            <TouchableOpacity onPress={() => setShowTimePicker(true)}>
              <Text style={[styles.input, { paddingVertical: 12 }]}>{formatTime(newHour, newMinute)}</Text>
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                value={new Date(1970, 0, 1, newHour, newMinute)}
                mode="time"
                display="spinner"
                onChange={(e, d) => {
                  setShowTimePicker(false);
                  if (d) {
                    setNewHour(d.getHours());
                    setNewMinute(d.getMinutes());
                  }
                }}
              />
            )}

            <Text style={styles.inputLabel}>Label</Text>
            <TextInput style={styles.input} value={newLabel} onChangeText={setNewLabel} />

            {mode === 'normal' && (
              <>
                <Text style={[styles.inputLabel, { marginTop: 16 }]}>Repeat Days</Text>
                <View style={styles.daysContainer}>
                  {DAYS.map(day => (
                    <TouchableOpacity
                      key={day}
                      style={[styles.dayButton, selectedDays.includes(day) && styles.dayButtonSelected]}
                      onPress={() => toggleDay(day)}
                    >
                      <Text style={[styles.dayButtonText, selectedDays.includes(day) && styles.dayButtonTextSelected]}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={resetModal}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={handleSave}>
                <Text style={styles.confirmButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ADD BUTTON */}
      <TouchableOpacity style={styles.addButton} onPress={() => { setEditingBell(null); setModalVisible(true); }}>
        <Text style={styles.addButtonText}>＋</Text>
      </TouchableOpacity>
    </View>
  );
}

// Styles inchangés
const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#F9FAFB'},
  topBar:{padding:16,borderBottomWidth:1,borderBottomColor:'#E5E7EB',flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
  headerTitle:{fontSize:18,fontWeight:'bold',textAlign:'center',flex:1},
  modeSelector:{flexDirection:'row',margin:16,backgroundColor:'#f0f2f5',borderRadius:12,overflow:'hidden'},
  modeButton:{flex:1,paddingVertical:10,alignItems:'center'},
  active:{backgroundColor:'#fff',elevation:3},
  text:{color:'#60758a',fontWeight:'600'},
  activeText:{color:'#111',fontWeight:'600'},
  dayGroup:{marginTop:12},
  dayTitle:{fontSize:16,fontWeight:'bold',color:'#0d7fff',marginLeft:16,marginBottom:8},
  listItem:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:14,marginBottom:12,marginHorizontal:16,backgroundColor:'#FFFFFF',borderRadius:12,borderWidth:1,borderColor:'#E5E7EB',elevation:2},
  listItemLeft:{flexDirection:'row',alignItems:'center',flex:1},
  listItemRight:{flexDirection:'row',alignItems:'center',gap:12},
  iconWrapper:{width:44,height:44,borderRadius:12,backgroundColor:'rgba(13,127,255,0.1)',justifyContent:'center',alignItems:'center',marginRight:12},
  iconWrapperDisabled:{backgroundColor:'rgba(0,0,0,0.05)'},
  icon:{fontSize:20,color:'#0d7fff'},
  listItemTime:{fontSize:14,fontWeight:'600',color:'#111'},
  listItemLabel:{fontSize:10,color:'#60758a',textTransform:'uppercase'},
  textDisabled:{opacity:0.4},
  deleteIcon:{fontSize:18},
  dateRow:{flexDirection:'row',gap:12,marginBottom:16,marginHorizontal:16},
  dateBox:{flex:1,borderWidth:1,borderColor:'#ddd',borderRadius:12,padding:12},
  dateTitle:{fontSize:12,color:'#60758a',fontWeight:'600'},
  dateValue:{fontSize:14,fontWeight:'bold',color:'#111'},
  modalOverlay:{flex:1,backgroundColor:'rgba(0,0,0,0.5)',justifyContent:'center',alignItems:'center'},
  modalContent:{width:'85%',backgroundColor:'#fff',borderRadius:16,padding:24},
  modalTitle:{fontSize:20,fontWeight:'bold',marginBottom:20,textAlign:'center'},
  inputLabel:{fontSize:14,fontWeight:'600',marginBottom:6},
  input:{borderWidth:1,borderColor:'#ddd',borderRadius:8,padding:12,marginBottom:12},
  daysContainer:{flexDirection:'row',flexWrap:'wrap',gap:8},
  dayButton:{paddingVertical:6,paddingHorizontal:12,borderWidth:1,borderColor:'#ddd',borderRadius:8},
  dayButtonSelected:{backgroundColor:'#0d7fff',borderColor:'#0d7fff'},
  dayButtonText:{fontSize:12,fontWeight:'600',color:'#111'},
  dayButtonTextSelected:{color:'#fff'},
  modalButtons:{flexDirection:'row',gap:12,marginTop:16},
  cancelButton:{flex:1,backgroundColor:'#f0f2f5',paddingVertical:12,borderRadius:8,alignItems:'center'},
  cancelButtonText:{fontWeight:'600',color:'#60758a'},
  confirmButton:{flex:1,backgroundColor:'#0d7fff',paddingVertical:12,borderRadius:8,alignItems:'center'},
  confirmButtonText:{fontWeight:'600',color:'#fff'},
  nextBellBox: {
  padding: 12,
  marginHorizontal: 16,
  marginBottom: 12,
  backgroundColor: '#e0f0ff',
  borderRadius: 12,
  alignItems: 'center',
},
nextBellText: {
  fontSize: 14,
  fontWeight: '600',
  color: '#0d7fff',
},

  addButton:{position:'absolute',bottom:32,right:32,width:56,height:56,borderRadius:28,backgroundColor:'#0d7fff',justifyContent:'center',alignItems:'center',elevation:5},
  addButtonText:{fontSize:32,color:'#fff',lineHeight:32}
});
