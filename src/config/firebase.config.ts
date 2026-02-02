import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase Konfiguration
// In Produktion sollten diese Werte über expo-constants geladen werden
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyCfYJiwvS91UMccGbRShA8I8b7bocT9UR8",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "workoutroutine-b8d1e.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "workoutroutine-b8d1e",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "workoutroutine-b8d1e.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "9890856187",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:9890856187:web:ae96f666bb3bc77d7a445e",
};

// Debug: Log config (nur in Development)
if (__DEV__) {
  console.log("🔥 Firebase Config loaded, projectId:", firebaseConfig.projectId);
}

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;