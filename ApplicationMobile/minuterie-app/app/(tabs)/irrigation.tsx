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
import { SolarSubModeIrrigation, useIrrigation } from '../../hooks/useIrrigation';

export default function IrrigationSettings() {
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
  } = useIrrigation();

  const [startTime, setStartTime] = useState(manualStart);
  const [endTime, setEndTime] = useState(manualEnd);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const solarModes: { key: SolarSubModeIrrigation; label: string; icon: string }[] = [
    { key: 'BEFORE_SUNRISE', label: 'Before Sunrise', icon: '🌄' },
    { key: 'AFTER_SUNSET', label: 'After Sunset', icon: '🌇' },
  ];

  const requiresDelay = ['BEFORE_SUNRISE', 'AFTER_SUNSET'].includes(solarSubMode);

  const handleSave = () => {
    setState(state);
    setMode(mode);
    if (mode === 'MANUAL') setManualSchedule(startTime, endTime);
    else setSolarScheduleDelay(solarDelay);
    Alert.alert('Saved ✅', 'Configuration saved successfully');
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity><Text style={styles.backIcon}></Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Irrigation Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Irrigation Status */}
      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>Irrigation Status</Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusIcon}>💧</Text>
          <Text style={[styles.statusText, state==='on'?styles.statusOn:styles.statusOff]}>
            {state==='on'?'ON':'OFF'}
          </Text>
        </View>
      </View>

      {/* Mode Selector */}
      <View style={styles.modeSelector}>
        <TouchableOpacity style={[styles.modeButton, mode==='SUNSET_SUNRISE' && styles.active]} onPress={()=>setMode('SUNSET_SUNRISE')}>
          <Text style={mode==='SUNSET_SUNRISE'?styles.activeText:styles.text}>SUNSET/SUNRISE</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.modeButton, mode==='MANUAL' && styles.active]} onPress={()=>setMode('MANUAL')}>
          <Text style={mode==='MANUAL'?styles.activeText:styles.text}>Manual</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.main} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Solar Mode */}
        {mode==='SUNSET_SUNRISE' && (
          <View style={styles.cardContainer}>
            {solarModes.map(item => (
              <TouchableOpacity key={item.key} style={[styles.card, solarSubMode===item.key && styles.cardActive]} onPress={()=>setSolarSubMode(item.key)}>
                <Text style={styles.cardIcon}>{item.icon}</Text>
                <View style={styles.cardText}><Text style={styles.cardTitle}>{item.label}</Text></View>
                <Text style={styles.cardStatus}>{solarSubMode===item.key?'✅':'⚪'}</Text>
              </TouchableOpacity>
            ))}
            {requiresDelay && (
              <View style={styles.delayContainer}>
                <Text style={styles.delayLabel}>Delay (minutes):</Text>
                <TextInput style={styles.delayInput} value={solarDelay} onChangeText={setSolarScheduleDelay} placeholder="0" keyboardType="numeric"/>
              </View>
            )}
          </View>
        )}

        {/* Manual Mode */}
        {mode==='MANUAL' && (
          <View style={styles.manualCard}>
            <Text style={styles.cardTitle}>Manual Watering Time</Text>

            {/* Start Time */}
            <TouchableOpacity style={styles.manualInput} onPress={()=>setShowStartPicker(true)}>
              <Text style={{ fontSize: 16 }}>Start Time: {startTime}</Text>
            </TouchableOpacity>
            {showStartPicker && (
              <DateTimePicker value={new Date(`1970-01-01T${startTime}:00`)} mode="time" display="spinner"
                onChange={(e,d)=>{setShowStartPicker(false); if(d){const h=d.getHours().toString().padStart(2,'0'); const m=d.getMinutes().toString().padStart(2,'0'); setStartTime(`${h}:${m}`); setManualSchedule(`${h}:${m}`, endTime);}}}
              />
            )}

            {/* End Time */}
            <TouchableOpacity style={styles.manualInput} onPress={()=>setShowEndPicker(true)}>
              <Text style={{ fontSize: 16 }}>End Time: {endTime}</Text>
            </TouchableOpacity>
            {showEndPicker && (
              <DateTimePicker value={new Date(`1970-01-01T${endTime}:00`)} mode="time" display="spinner"
                onChange={(e,d)=>{setShowEndPicker(false); if(d){const h=d.getHours().toString().padStart(2,'0'); const m=d.getMinutes().toString().padStart(2,'0'); setEndTime(`${h}:${m}`); setManualSchedule(startTime, `${h}:${m}`);}}}
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

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#F9FAFB'},
  topBar:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',padding:16,borderBottomWidth:1,borderBottomColor:'#E5E7EB'},
  backIcon:{fontSize:24,color:'#0d7fff',fontWeight:'bold'},
  headerTitle:{fontSize:18,fontWeight:'bold',textAlign:'center',flex:1},
  statusCard:{marginHorizontal:16,marginTop:12,padding:16,borderRadius:12,backgroundColor:'#fff',alignItems:'center',elevation:2},
  statusTitle:{fontSize:14,fontWeight:'bold',color:'#6B7280',marginBottom:8},
  statusRow:{flexDirection:'row',alignItems:'center'},
  statusIcon:{fontSize:26,marginRight:10},
  statusText:{fontSize:20,fontWeight:'bold'},
  statusOn:{color:'#16A34A'},
  statusOff:{color:'#DC2626'},
  main:{flex:1},
  modeSelector:{flexDirection:'row',margin:16,backgroundColor:'#f0f2f5',borderRadius:12,overflow:'hidden'},
  modeButton:{flex:1,paddingVertical:10,alignItems:'center'},
  active:{backgroundColor:'#fff',elevation:3},
  text:{color:'#60758a',fontWeight:'600'},
  activeText:{color:'#111',fontWeight:'600'},
  cardContainer:{padding:16},
  card:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',padding:16,borderRadius:12,backgroundColor:'#fff',borderWidth:2,borderColor:'transparent',marginBottom:12},
  cardActive:{borderColor:'#3B82F6',backgroundColor:'rgba(59,130,246,0.05)'},
  cardIcon:{fontSize:24,marginRight:12},
  cardText:{flex:1},
  cardTitle:{fontSize:14,fontWeight:'bold',color:'#111418'},
  cardStatus:{fontSize:18},
  delayContainer:{flexDirection:'row',alignItems:'center',marginTop:12,marginLeft:16},
  delayLabel:{fontSize:14,fontWeight:'bold',marginRight:8},
  delayInput:{padding:8,borderWidth:1,borderColor:'#E5E7EB',borderRadius:8,width:80,textAlign:'center'},
  manualCard:{padding:16,borderRadius:12,backgroundColor:'#fff',margin:16},
  manualInput:{padding:12,borderWidth:1,borderColor:'#E5E7EB',borderRadius:8,marginVertical:8},
  footer:{padding:16,borderTopWidth:1,borderTopColor:'#E5E7EB',backgroundColor:'#fff'},
  saveButton:{backgroundColor:'#0d7fff',paddingVertical:14,borderRadius:12,alignItems:'center'},
  saveText:{color:'#fff',fontWeight:'bold',fontSize:16},
});
