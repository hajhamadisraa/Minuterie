import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TimerSettingsSuccess() {
  return (
    <View style={styles.container}>
      {/* Background Layer (Simulated Settings Screen) */}
      <View style={styles.settingsBackground}>
        {/* Top App Bar */}
        <View style={styles.topBar}>
          <Text style={styles.icon}>⬅️</Text>
          <Text style={styles.headerTitle}>Timer Settings</Text>
          <View style={{ width: 24 }} /> {/* placeholder for alignment */}
        </View>

        {/* Settings List Content */}
        <ScrollView contentContainerStyle={styles.settingsList}>
          {/* Lighting Schedule */}
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <Text>💡</Text>
              </View>
              <View>
                <Text style={styles.settingTitle}>Lighting Schedule</Text>
                <Text style={styles.settingSubtitle}>6:00 PM - 11:00 PM</Text>
              </View>
            </View>
            <View style={styles.toggle}>
              <View style={styles.toggleKnob} />
            </View>
          </View>

          <View style={styles.divider} />

          {/* Irrigation Duration */}
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <Text>💧</Text>
              </View>
              <View>
                <Text style={styles.settingTitle}>Irrigation Duration</Text>
                <Text style={styles.settingSubtitle}>15 minutes daily</Text>
              </View>
            </View>
            <View style={[styles.toggle, { backgroundColor: '#f0f2f5' }]}>
              <View style={styles.toggleKnob} />
            </View>
          </View>

          <View style={styles.divider} />

          {/* Bell Alert */}
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <Text>🔔</Text>
              </View>
              <View>
                <Text style={styles.settingTitle}>Bell Alert</Text>
                <Text style={styles.settingSubtitle}>Every hour</Text>
              </View>
            </View>
            <View style={styles.toggle}>
              <View style={styles.toggleKnob} />
            </View>
          </View>

          <TouchableOpacity style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Success Confirmation Overlay */}
      <View style={styles.overlay}>
        <View style={styles.successBox}>
          {/* Success Icon */}
          <View style={styles.successIconOuter}>
            <View style={styles.successIconInner}>
              <Text style={styles.checkIcon}>✅</Text>
            </View>
          </View>

          {/* Message */}
          <Text style={styles.successTitle}>Configuration saved successfully</Text>
          <Text style={styles.successMessage}>
            Your ESP32 timer settings have been synchronized.
          </Text>

          <TouchableOpacity style={styles.dismissButton}>
            <Text style={styles.dismissButtonText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* iOS Bottom Handle Indication */}
      <View style={styles.bottomHandle}>
        <View style={styles.bottomHandleInner} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },

  // Settings Background
  settingsBackground: { flex: 1, opacity: 0.5 },

  // Top App Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: 'white',
  },
  icon: { fontSize: 24, color: '#111' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', flex: 1 },

  // Settings List
  settingsList: { paddingVertical: 8 },

  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    minHeight: 72,
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center' },
  settingIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f0f2f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingTitle: { fontSize: 16, fontWeight: '500', color: '#111' },
  settingSubtitle: { fontSize: 12, color: '#60758a' },

  toggle: {
    width: 51,
    height: 31,
    borderRadius: 50,
    backgroundColor: '#0d7fff',
    padding: 2,
    justifyContent: 'flex-end',
  },
  toggleKnob: {
    width: 27,
    height: '100%',
    borderRadius: 50,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
  },

  divider: { height: 1, backgroundColor: '#eee', marginHorizontal: 16 },

  saveButton: {
    marginTop: 32,
    backgroundColor: '#0d7fff',
    borderRadius: 16,
    paddingVertical: 16,
    marginHorizontal: 16,
    alignItems: 'center',
  },
  saveButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

  // Success Overlay
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successBox: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  successIconOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#d1fae5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successIconInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#a7f3d0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: { fontSize: 40, color: '#10b981' },

  successTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  successMessage: { fontSize: 14, textAlign: 'center', color: '#60758a', marginBottom: 16 },

  dismissButton: {
    width: '100%',
    backgroundColor: '#0d7fff',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  dismissButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

  // iOS bottom handle
  bottomHandle: { position: 'absolute', bottom: 0, left: 0, width: '100%', alignItems: 'center', paddingBottom: 8 },
  bottomHandleInner: { width: 128, height: 6, borderRadius: 3, backgroundColor: '#ccc', opacity: 0.5 },
});
