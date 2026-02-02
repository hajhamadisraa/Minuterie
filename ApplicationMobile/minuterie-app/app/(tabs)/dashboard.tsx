import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useBell } from '../../hooks/useBell';
import { useIrrigation } from '../../hooks/useIrrigation';
import { useLighting } from '../../hooks/useLighting';


export default function HomeDashboard() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // ✅ Récupérer les données réelles de Firebase
  const { 
    state: lightingState, 
    mode: lightingMode,
    manualStart: lightingStart,
    manualEnd: lightingEnd,
    devices: lightingDevices 
  } = useLighting();

  const { 
    state: irrigationState, 
    mode: irrigationMode,
    manualStart: irrigationStart,
    manualEnd: irrigationEnd,
    devices: irrigationDevices 
  } = useIrrigation();

  // ✅ Récupérer les données réelles du Bell
  const {
    normalBells,
    specialBells,
    nextBell,
    lastTriggered
  } = useBell();

  // ✅ Mettre à jour l'heure toutes les minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Toutes les 60 secondes

    return () => clearInterval(interval);
  }, []);

  // ✅ Rafraîchir les données
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setCurrentTime(new Date());
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  // ✅ Calculer le nombre d'appareils actifs
  const activeLightingDevices = lightingDevices?.filter(d => d.isActive).length || 0;
  const activeIrrigationDevices = irrigationDevices?.filter(d => d.isActive).length || 0;

  // ✅ Calculer le nombre de cloches actives
  const activeNormalBells = normalBells?.filter(b => b.enabled).length || 0;
  const activeSpecialBells = specialBells?.filter(b => b.enabled).length || 0;
  const totalActiveBells = activeNormalBells + activeSpecialBells;

  // ✅ Vérifier si une cloche est récemment déclenchée (dans les 2 dernières minutes)
  const isBellRecentlyTriggered = () => {
    if (!lastTriggered) return false;
    const triggeredTime = new Date(lastTriggered.triggeredAt);
    const now = new Date();
    const diffMinutes = (now.getTime() - triggeredTime.getTime()) / 1000 / 60;
    return diffMinutes < 2; // Moins de 2 minutes
  };

  // ✅ Formater l'heure actuelle
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>Smart Minuterie</Text>
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          <Text style={styles.dateText}>
            {currentTime.toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric' 
            })}
          </Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.main}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* ✅ LIGHTING CARD - Données réelles */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/lighting')}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardIconContainer}>
              <Text style={styles.cardIcon}>💡</Text>
            </View>
            <View style={[
              styles.statusBadge,
              { backgroundColor: lightingState ? '#DCFCE7' : '#FEE2E2' }
            ]}>
              <View style={[
                styles.statusDot,
                { backgroundColor: lightingState ? '#16A34A' : '#DC2626' }
              ]} />
              <Text style={[
                styles.statusText,
                { color: lightingState ? '#16A34A' : '#DC2626' }
              ]}>
                {lightingState ? 'ON' : 'OFF'}
              </Text>
            </View>
          </View>

          <Text style={styles.cardTitle}>Smart Lighting</Text>
          
          <View style={styles.cardContent}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Mode:</Text>
              <Text style={styles.infoValue}>
                {lightingMode === 'MANUAL' ? '⏰ Manual' : '☀️ Solar'}
              </Text>
            </View>
            
            {lightingMode === 'MANUAL' && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Schedule:</Text>
                <Text style={styles.infoValue}>{lightingStart} → {lightingEnd}</Text>
              </View>
            )}

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Devices:</Text>
              <Text style={styles.infoValue}>
                {activeLightingDevices} active
              </Text>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.cardFooterText}>Tap to configure →</Text>
          </View>
        </TouchableOpacity>

        {/* ✅ IRRIGATION CARD - Données réelles */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/irrigation')}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconContainer, { backgroundColor: '#DBEAFE' }]}>
              <Text style={styles.cardIcon}>💧</Text>
            </View>
            <View style={[
              styles.statusBadge,
              { backgroundColor: irrigationState ? '#CFFAFE' : '#FEE2E2' }
            ]}>
              <View style={[
                styles.statusDot,
                { backgroundColor: irrigationState ? '#0EA5E9' : '#DC2626' }
              ]} />
              <Text style={[
                styles.statusText,
                { color: irrigationState ? '#0EA5E9' : '#DC2626' }
              ]}>
                {irrigationState ? 'RUNNING' : 'STOPPED'}
              </Text>
            </View>
          </View>

          <Text style={styles.cardTitle}>Smart Irrigation</Text>
          
          <View style={styles.cardContent}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Mode:</Text>
              <Text style={styles.infoValue}>
                {irrigationMode === 'MANUAL' ? '⏰ Manual' : '☀️ Solar'}
              </Text>
            </View>
            
            {irrigationMode === 'MANUAL' && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Schedule:</Text>
                <Text style={styles.infoValue}>{irrigationStart} → {irrigationEnd}</Text>
              </View>
            )}

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Devices:</Text>
              <Text style={styles.infoValue}>
                {activeIrrigationDevices} active
              </Text>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.cardFooterText}>Tap to configure →</Text>
          </View>
        </TouchableOpacity>

        {/* ✅ BELL CARD - Données réelles */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/bell')}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconContainer, { backgroundColor: '#FEF3C7' }]}>
              <Text style={styles.cardIcon}>🔔</Text>
            </View>
            <View style={[
              styles.statusBadge,
              { backgroundColor: isBellRecentlyTriggered() ? '#DCFCE7' : '#F3F4F6' }
            ]}>
              <View style={[
                styles.statusDot,
                { backgroundColor: isBellRecentlyTriggered() ? '#16A34A' : '#6B7280' }
              ]} />
              <Text style={[
                styles.statusText,
                { color: isBellRecentlyTriggered() ? '#16A34A' : '#6B7280' }
              ]}>
                {isBellRecentlyTriggered() ? 'RINGING' : 'READY'}
              </Text>
            </View>
          </View>

          <Text style={styles.cardTitle}>Bell Schedule</Text>
          
          <View style={styles.cardContent}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Active bells:</Text>
              <Text style={styles.infoValue}>
                {totalActiveBells} scheduled
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Next bell:</Text>
              <Text style={styles.infoValue}>
                {nextBell ? `${nextBell.time} (${nextBell.label})` : 'None scheduled'}
              </Text>
            </View>

            {lastTriggered && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Last rung:</Text>
                <Text style={styles.infoValue}>
                  {new Date(lastTriggered.triggeredAt).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                  })}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.cardFooterText}>Tap to configure →</Text>
          </View>
        </TouchableOpacity>

        {/* ✅ SYSTEM INFO CARD */}
        <View style={styles.systemInfoCard}>
          <Text style={styles.systemInfoTitle}>System Information</Text>
          
          <View style={styles.systemInfoRow}>
            <View style={styles.systemInfoItem}>
              <Text style={styles.systemInfoLabel}>Total Devices</Text>
              <Text style={styles.systemInfoValue}>
                {(lightingDevices?.length || 0) + (irrigationDevices?.length || 0)}
              </Text>
            </View>
            
            <View style={styles.systemInfoDivider} />
            
            <View style={styles.systemInfoItem}>
              <Text style={styles.systemInfoLabel}>Active Now</Text>
              <Text style={styles.systemInfoValue}>
                {activeLightingDevices + activeIrrigationDevices}
              </Text>
            </View>

            <View style={styles.systemInfoDivider} />
            
            <View style={styles.systemInfoItem}>
              <Text style={styles.systemInfoLabel}>Bells Active</Text>
              <Text style={styles.systemInfoValue}>
                {totalActiveBells}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.footerText}>
          Pull down to refresh • Last updated: {formatTime(currentTime)}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F9FAFB' 
  },

  header: {
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },

  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },

  timeContainer: {
    alignItems: 'flex-end',
  },

  timeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  dateText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },

  main: {
    padding: 16,
    paddingBottom: 40,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  cardIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  cardIcon: {
    fontSize: 24,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },

  statusText: {
    fontSize: 12,
    fontWeight: '800',
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },

  cardContent: {
    gap: 8,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },

  infoValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '700',
  },

  cardFooter: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },

  cardFooterText: {
    fontSize: 13,
    color: '#0EA5E9',
    fontWeight: '600',
    textAlign: 'center',
  },

  systemInfoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  systemInfoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },

  systemInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  systemInfoItem: {
    alignItems: 'center',
    flex: 1,
  },

  systemInfoDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },

  systemInfoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },

  systemInfoValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },

  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },
});