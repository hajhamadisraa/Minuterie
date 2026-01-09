import React from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeDashboard() {
  return (
    <View style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.topBar}>
        <View style={styles.topIcon}>
          <Text style={styles.materialIcon}>⚙️</Text>
        </View>
        <Text style={styles.topTitle}>Smart Minuterie</Text>
        <View style={styles.topRight}>
          <TouchableOpacity style={styles.topButton}>
            <Text style={styles.materialIcon}>📶</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Headline */}
      <View style={styles.headline}>
        <Text style={styles.headlineTitle}>Home Dashboard</Text>
        <Text style={styles.headlineStatus}>
          ESP32: <Text style={styles.statusConnected}>Connected</Text>
        </Text>
      </View>

      <ScrollView style={styles.main} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Lighting Card */}
        <View style={styles.card}>
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardIcon, { marginRight: 8 }]}>💡</Text>
              <Text style={styles.cardTitle}>Lighting</Text>
            </View>
            <Text style={styles.cardInfo}>
              Status: <Text style={styles.cardInfoValue}>On</Text>
            </Text>
            <Text style={styles.cardSubInfo}>Next Off: 22:30</Text>
            <TouchableOpacity style={[styles.cardButton, { backgroundColor: '#0d7fff' }]}>
              <Text style={styles.cardButtonText}>Turn Off</Text>
            </TouchableOpacity>
          </View>
          <ImageBackground
            source={{
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKaw-rd5HgUyxlF0YncRtuCyG6U9OtfuA_v_1GO9YRpKQzUtIlAgPZKb4X98QuaQp9IDtBspqOjnRZ1CTEj8l_fOF9eua8EP4q-zm_A2prSSR8kiNkQEK_KzV7SXz_WaajdcRRqmd1OSPGDkx3EWnaep-wp81FnQPGtORo8ASbmMUrHU5gNgkjLeLPJQ-otpdyoW6RxLrhgfcAhDfflDZhaPanqrWinzKKebAA8cIDDdiG4cRrvZ5pdgfpSB-OeLnhwIDiO0s6cK0',
            }}
            style={styles.cardImage}
          />
        </View>

        {/* Irrigation Card */}
        <View style={styles.card}>
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardIcon, { color: '#10b981', marginRight: 8 }]}>💧</Text>
              <Text style={styles.cardTitle}>Irrigation</Text>
            </View>
            <Text style={styles.cardInfo}>
              Next run: <Text style={styles.cardInfoValue}>18:00</Text>
            </Text>
            <Text style={styles.cardSubInfo}>Duration: 15 mins</Text>
            <TouchableOpacity style={[styles.cardButton, { backgroundColor: '#10b981' }]}>
              <Text style={styles.cardButtonText}>Run Now</Text>
            </TouchableOpacity>
          </View>
          <ImageBackground
            source={{
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAkcqRgqeW_JhRyVNYr87JR5qNpZD0VxdJfkcXbvetbBRHB6Xr5nE9qN0eHa4QhLyiaYhHH_f5IGftblL0o5n-qmM0ZCHLS5YT6nKjcfdI_Erf33Ob9TmWstQMRpzd7QtpQZvr_b6qYiksLoN8fLQOsr9-ChbpHsm1Ft0gZlr2y1kOo7uOMbabeJYeG-LTxlzhvlEfKWb-MxL1Ge3ygcaG20y9lpyyh9wQF3jjbY-mxbn2-QI7mVEgabHZsOp-G_GiPOP0rVlZUNHE',
            }}
            style={styles.cardImage}
          />
        </View>

        {/* School Bell Card */}
        <View style={styles.card}>
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardIcon, { color: '#f97316', marginRight: 8 }]}>🔔</Text>
              <Text style={styles.cardTitle}>School Bell</Text>
            </View>
            <Text style={styles.cardInfo}>
              Status: <Text style={styles.cardInfoValue}>Idle</Text>
            </Text>
            <Text style={styles.cardSubInfo}>Last run: 08:00 AM</Text>
            <TouchableOpacity style={[styles.cardButton, { backgroundColor: '#f97316' }]}>
              <Text style={styles.cardButtonText}>Ring Now</Text>
            </TouchableOpacity>
          </View>
          <ImageBackground
            source={{
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAABIdXFYp_H5kAnXdbzYMeTCBA23Qp3v_mF4UHw48dQ17NjvcpwAn8fpHdCOqq2jkT8s5N1oZJzlq4oYGTLgQMJrUx2M6yHSAFIpKcEmqZCMLB9qJ28xYqV3PwErc_wIQADm6wkPIFZdce6iCR-pOlWaLcYFj9kzXoEP_P24UKtXmxOyGxeeYastiTmLeYRTfz3PSj0vfiHIHvkdgwim077CaogZqO8f5kuLNNc_izP7RPHmOflHi9zkit3C3jQrwwQPViwhaH1cY',
            }}
            style={styles.cardImage}
          />
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButtonActive}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navIcon}>📅</Text>
          <Text style={styles.navLabel}>Schedules</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navIcon}>📊</Text>
          <Text style={styles.navLabel}>Logs</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
  },
  topIcon: { width: 24 },
  topTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', flex: 1 },
  topRight: { width: 24, alignItems: 'flex-end' },
  topButton: { padding: 8 },
  materialIcon: { fontSize: 20 },

  // Headline
  headline: { paddingHorizontal: 16, paddingVertical: 12 },
  headlineTitle: { fontSize: 24, fontWeight: 'bold', color: '#111418' },
  headlineStatus: { fontSize: 12, color: '#60758a', marginTop: 4 },
  statusConnected: { color: '#10b981', fontWeight: '600' },

  main: { flex: 1 },

  // Cards
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  cardContent: { flex: 2, justifyContent: 'space-between' },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  cardIcon: { fontSize: 20, color: '#0d7fff' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#111418' },
  cardInfo: { fontSize: 12, color: '#60758a', marginTop: 4 },
  cardInfoValue: { fontWeight: '600' },
  cardSubInfo: { fontSize: 10, color: '#60758a', marginTop: 2 },
  cardButton: { marginTop: 8, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  cardButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  cardImage: { width: 96, height: 96, borderRadius: 12 },

  // Bottom navigation
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#d1d5db',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navButton: { alignItems: 'center' },
  navButtonActive: { alignItems: 'center' },
  navIcon: { fontSize: 20 },
  navLabel: { fontSize: 10, fontWeight: '600' },
});
