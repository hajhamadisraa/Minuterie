// app/index.tsx
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';

export default function Welcome() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.topCircle} />
      <View style={styles.bottomCircle} />

      <View style={styles.logoContainer}>
        <View style={styles.logo}>
          <MaterialIcons name="access-time" size={80} color="#0d7fff" />
          <View style={styles.hubIcon}>
            <MaterialIcons name="hub" size={24} color="#0d7fff" />
          </View>
        </View>
        <Text style={styles.title}>Smart Minuterie</Text>
        <View style={styles.underline} />
        <Text style={styles.subtitle}>
          Intelligent control for your lighting, irrigation, and bells.
        </Text>
      </View>

      <View style={styles.features}>
        <View style={styles.featureItem}>
          <View style={styles.featureIcon}>
            <MaterialIcons name="lightbulb" size={24} color="#0d7fff" />
          </View>
          <Text style={styles.featureLabel}>Light</Text>
        </View>
        <View style={styles.featureItem}>
          <View style={styles.featureIcon}>
            <MaterialIcons name="water" size={24} color="#0d7fff" />
          </View>
          <Text style={styles.featureLabel}>Irrigate</Text>
        </View>
        <View style={styles.featureItem}>
          <View style={styles.featureIcon}>
            <MaterialIcons name="notifications-active" size={24} color="#0d7fff" />
          </View>
          <Text style={styles.featureLabel}>Bells</Text>
        </View>
      </View>

      {/* ✅ Bouton qui redirige vers la page login */}
      <Pressable 
        style={styles.button} 
        onPress={() => router.push('/(auth)/login')}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </Pressable>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Powered by ESP32 Technology</Text>
        <Text style={styles.footerMeta}>v1.0.4 • Secure Connection</Text>
      </View>
    </View>
  );
}

const { width, height } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingBottom: 20,
  },
  topCircle: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(13,127,255,0.1)',
  },
  bottomCircle: {
    position: 'absolute',
    bottom: -50,
    left: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(13,127,255,0.05)',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  logo: {
    width: 120,
    height: 120,
    backgroundColor: '#fff',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  hubIcon: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 2,
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#111418',
    textAlign: 'center',
  },
  underline: {
    height: 4,
    width: 48,
    backgroundColor: '#0d7fff',
    borderRadius: 2,
    marginVertical: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#60758a',
    textAlign: 'center',
    maxWidth: 280,
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 40,
  },
  featureItem: {
    alignItems: 'center',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(13,127,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  featureLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#60758a',
  },
  button: {
    backgroundColor: '#0d7fff',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 10,
    color: '#60758a',
  },
  footerMeta: {
    fontSize: 10,
    color: '#60758a',
    marginTop: 2,
  },
});