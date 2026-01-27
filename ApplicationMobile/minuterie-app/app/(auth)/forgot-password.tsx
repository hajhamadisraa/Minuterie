// app/(auth)/forgot-password.tsx
import { auth } from '@/firebase/config';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { sendPasswordResetEmail } from 'firebase/auth';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Error', 'Invalid email address');
      return;
    }

    try {
      setLoading(true);

      await sendPasswordResetEmail(auth, email.trim());

      Alert.alert(
        'Email Sent ✅',
        'A password reset link has been sent to your email address.\n\nClick the link in the email to reset your password.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );

      setEmail('');

    } catch (error: any) {
      console.error('Reset password error:', error.code, error.message);

      let errorMessage = 'An error occurred. Please try again.';

      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'If this address exists, an email has been sent.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many attempts. Please try again in a few minutes.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Connection error. Check your internet.';
          break;
        case 'auth/unauthorized-continue-uri':
          errorMessage = 'Unauthorized URL. Check Firebase configuration.';
          break;
        case 'auth/invalid-continue-uri':
          errorMessage = 'Invalid URL. Check Firebase configuration.';
          break;
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topCircle} />
      <View style={styles.bottomCircle} />

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        disabled={loading}
      >
        <MaterialIcons name="arrow-back" size={24} color="#111418" />
      </TouchableOpacity>

      <View style={styles.logoContainer}>
        <View style={styles.iconCircle}>
          <MaterialIcons name="lock-reset" size={40} color="#0d7fff" />
        </View>
        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>
          Enter your email to receive{'\n'}a reset link
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <MaterialIcons name="mail" size={20} color="#60758a" />
          <TextInput
            placeholder="admin@example.com"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
            autoCorrect={false}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleResetPassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Send Reset Link</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={loading}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <MaterialIcons name="info-outline" size={16} color="#60758a" />
          <Text style={styles.infoText}>
            You will receive an email. Click the link to reset your password.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  topCircle: { position: 'absolute', top: '-10%', right: '-10%', width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(13,127,255,0.1)' },
  bottomCircle: { position: 'absolute', bottom: '-5%', left: '-5%', width: 250, height: 250, borderRadius: 125, backgroundColor: 'rgba(13,127,255,0.05)' },
  backButton: { position: 'absolute', top: 60, left: 20, padding: 8, zIndex: 10 },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  iconCircle: { width: 80, height: 80, backgroundColor: '#f0f7ff', borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', color: '#111418', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#60758a', textAlign: 'center', lineHeight: 20 },
  form: { width: '100%', maxWidth: 320 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderColor: '#ccc', borderWidth: 1, borderRadius: 14, marginBottom: 20, paddingHorizontal: 12, backgroundColor: '#f9f9f9' },
  input: { flex: 1, height: 50, color: '#111418', marginLeft: 8, fontSize: 15 },
  button: { backgroundColor: '#0d7fff', height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  buttonDisabled: { backgroundColor: '#7db4ff' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cancelButton: { height: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  cancelText: { color: '#60758a', fontSize: 16, fontWeight: '600' },
  infoBox: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#f0f7ff', padding: 12, borderRadius: 10, gap: 8 },
  infoText: { flex: 1, fontSize: 12, color: '#60758a', lineHeight: 16 },
});