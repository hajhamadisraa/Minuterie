// app/(auth)/login.tsx
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { auth } from "../../firebase/config"; // chemin correct

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  

  const handleLogin = async () => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // Login réussi
    console.log('User logged in:', userCredential.user);
    router.replace('/(tabs)/dashboard');
  } catch (error: any) {
    console.log(error);
    Alert.alert('Login failed', error.message);
  }
};

  return (
    <View style={styles.container}>
      {/* Background Circles */}
      <View style={styles.topCircle} />
      <View style={styles.bottomCircle} />

      {/* Logo */}
      <View style={styles.logoContainer}>
        <View style={styles.logo}>
          <MaterialIcons name="access-time" size={60} color="#0d7fff" />
          <View style={styles.hubIcon}>
            <MaterialIcons name="hub" size={20} color="#0d7fff" />
          </View>
        </View>
        <Text style={styles.title}>Admin Login</Text>
        <Text style={styles.subtitle}>
          Secure Access to Smart Minuterie
        </Text>
      </View>

      {/* Input Form */}
      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <MaterialIcons
            name="mail"
            size={20}
            color="#60758a"
            style={styles.inputIcon}
          />
          <TextInput
            placeholder="admin@example.com"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialIcons
            name="lock"
            size={20}
            color="#60758a"
            style={styles.inputIcon}
          />
          <TextInput
            placeholder="••••••••"
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.eyeButton}>
            <MaterialIcons name="visibility" size={20} color="#60758a" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => Alert.alert('Forgot Password', 'Feature not implemented')}
        >
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.securityText}>Authorized Personnel Only</Text>
          <View style={styles.footerVersion}>
            <MaterialIcons name="verified-user" size={14} color="#60758a" />
            <Text style={styles.versionText}>v1.0.4</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  topCircle: {
    position: 'absolute',
    top: '-10%',
    right: '-10%',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(13,127,255,0.1)',
  },
  bottomCircle: {
    position: 'absolute',
    bottom: '-5%',
    left: '-5%',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(13,127,255,0.05)',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  hubIcon: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111418',
  },
  subtitle: {
    fontSize: 14,
    color: '#60758a',
    marginTop: 4,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 320,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 14,
    marginBottom: 16,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#111418',
  },
  eyeButton: {
    padding: 4,
  },
  forgotText: {
    alignSelf: 'flex-end',
    color: '#0d7fff',
    marginBottom: 20,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#0d7fff',
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  loginText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
  },
  securityText: {
    fontSize: 10,
    color: '#60758a',
    marginBottom: 4,
  },
  footerVersion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  versionText: {
    fontSize: 10,
    color: '#60758a',
  },
});
