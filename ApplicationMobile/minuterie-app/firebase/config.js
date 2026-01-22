// config.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";

import { getDatabase } from 'firebase/database';
import { getFunctions, httpsCallable } from 'firebase/functions';

// Config Firebase du projet
const firebaseConfig = {
  apiKey: "AIzaSyBRMnoeSS22y7YfnjZ5I7spdae_tWon9TI",
  authDomain: "smart-timer-iot.firebaseapp.com",
  databaseURL: "https://smart-timer-iot-default-rtdb.firebaseio.com",
  projectId: "smart-timer-iot",
  storageBucket: "smart-timer-iot.firebasestorage.app",
  messagingSenderId: "214603849564",
  appId: "1:214603849564:web:6f4d6911a9aa8e6bd5eb99"
};

// Initialisation de l'app Firebase
export const app = initializeApp(firebaseConfig);

// Initialisation de l'authentification pour React Native
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Base de données Realtime
export const database = getDatabase(app);

// Functions
export const functions = getFunctions(app);

// 🔹 Lier Functions à l'émulateur local si besoin
// Décommenter si tu veux tester en local
// connectFunctionsEmulator(functions, 'localhost', 5001);
export const db = getFirestore(app);
// Exemple pour utiliser une fonction callable
export const createUserByAdminFn = httpsCallable(functions, 'createUserByAdmin');
