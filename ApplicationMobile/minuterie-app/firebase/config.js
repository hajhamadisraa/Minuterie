// config.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

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

// Initialisation Firebase
const app = initializeApp(firebaseConfig);

// Export Database pour l’utiliser partout
export const database = getDatabase(app);
