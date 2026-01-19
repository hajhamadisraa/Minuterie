// config.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBRMnoeSS22y7YfnjZ5I7spdae_tWon9TI",
  authDomain: "smart-timer-iot.firebaseapp.com",
  databaseURL: "https://smart-timer-iot-default-rtdb.firebaseio.com",
  projectId: "smart-timer-iot",
  storageBucket: "smart-timer-iot.firebasestorage.app",
  messagingSenderId: "214603849564",
  appId: "1:214603849564:web:6f4d6911a9aa8e6bd5eb99"
};

const app = initializeApp(firebaseConfig);

// Important pour React Native
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const database = getDatabase(app);
