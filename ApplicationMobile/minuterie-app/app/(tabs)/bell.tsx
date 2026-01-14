import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import BellNormal from '../bell/bell-normal';
import BellSpecial from '../bell/bell-special';


type BellMode = 'Normal' | 'Special';

export default function BellScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<BellMode>('Normal');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bell Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Mode Selector (CENTRALISÉ) */}
      <View style={styles.modeSelector}>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'Normal' && styles.active]}
          onPress={() => setMode('Normal')}
        >
          <Text style={mode === 'Normal' ? styles.activeText : styles.text}>
            Normal Mode
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeButton, mode === 'Special' && styles.active]}
          onPress={() => setMode('Special')}
        >
          <Text style={mode === 'Special' ? styles.activeText : styles.text}>
            Special Mode
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        {mode === 'Normal' ? <BellNormal /> : <BellSpecial />}
      </View>
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
    borderBottomColor: '#eee',
  },
  backIcon: { fontSize: 20 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', flex: 1, textAlign: 'center' },

  modeSelector: {
    flexDirection: 'row',
    margin: 16,
    backgroundColor: '#f0f2f5',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  active: {
    backgroundColor: '#fff',
    elevation: 3,
  },
  text: { color: '#60758a', fontWeight: '600' },
  activeText: { color: '#111', fontWeight: '600' },
});
