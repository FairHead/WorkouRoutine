/**
 * User Store - Verwaltet Benutzerprofil und Einstellungen
 * 
 * Speichert:
 * - Profilinformationen (Name, E-Mail, etc.)
 * - Körperdaten für Kalorienberechnung
 * - App-Einstellungen
 * - Firebase Auth Integration
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { DEFAULT_PROFILE, type UserProfile } from "@/src/services/calorie-calculator.service";
import type { User as FirebaseUser } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/src/config/firebase.config";

/**
 * Vollständiges Benutzerprofil
 */
export interface User {
  /** Eindeutige ID (Firebase UID) */
  id: string;
  /** Firebase UID */
  firebaseUid?: string;
  /** Vorname */
  firstName?: string;
  /** Nachname */
  lastName?: string;
  /** Benutzername (für die App) */
  username: string;
  /** Anzeigename (generiert aus firstName + lastName oder username) */
  displayName: string;
  /** E-Mail (optional) */
  email?: string;
  /** Profilbild URL (optional) */
  avatarUrl?: string;
  /** Erstellungsdatum */
  createdAt: Date;
  /** Letzte Aktualisierung */
  updatedAt: Date;
  
  // Körperdaten für Kalorienberechnung
  /** Körpergewicht in kg */
  weightKg?: number;
  /** Geschlecht */
  gender?: "male" | "female" | "other";
  /** Alter in Jahren */
  age?: number;
  /** Größe in cm */
  heightCm?: number;
  
  // Fitness-Ziele (optional)
  /** Aktivitätslevel */
  activityLevel?: "sedentary" | "light" | "moderate" | "active" | "very_active";
  /** Fitnessziel */
  fitnessGoal?: "lose_weight" | "maintain" | "build_muscle" | "improve_fitness";
}

/**
 * App-Einstellungen
 */
export interface AppSettings {
  /** Einheiten für Gewicht */
  weightUnit: "kg" | "lbs";
  /** Einheiten für Größe */
  heightUnit: "cm" | "ft";
  /** Sprache */
  language: "de" | "en";
  /** Benachrichtigungen aktiviert */
  notificationsEnabled: boolean;
  /** Haptisches Feedback */
  hapticFeedback: boolean;
}

/**
 * User Store State
 */
interface UserState {
  /** Aktueller Benutzer (null wenn nicht registriert) */
  user: User | null;
  /** Ist der User bei Firebase authentifiziert? */
  isAuthenticated: boolean;
  /** Wurde Onboarding abgeschlossen? */
  hasCompletedOnboarding: boolean;
  /** App-Einstellungen */
  settings: AppSettings;
  /** Ist geladen? */
  isLoaded: boolean;
}

/**
 * User Store Actions
 */
interface UserActions {
  /** Benutzer erstellen/registrieren */
  createUser: (userData: Partial<User>) => void;
  /** Benutzer aktualisieren */
  updateUser: (updates: Partial<User>) => void;
  /** Mit Firebase User synchronisieren */
  syncWithFirebaseUser: (firebaseUser: FirebaseUser, displayName?: string) => void;
  /** Profil von Firestore laden */
  loadProfileFromFirestore: (uid: string) => Promise<void>;
  /** Profil zu Firestore speichern */
  saveProfileToFirestore: () => Promise<void>;
  /** Onboarding als abgeschlossen markieren */
  completeOnboarding: () => void;
  /** Einstellungen aktualisieren */
  updateSettings: (updates: Partial<AppSettings>) => void;
  /** Profil für Kalorienberechnung holen (mit Fallback auf Standardwerte) */
  getCalorieProfile: () => UserProfile;
  /** Benutzer löschen (Logout) */
  clearUser: () => void;
  /** Store als geladen markieren */
  setLoaded: () => void;
  /** Auth-Status setzen */
  setAuthenticated: (isAuth: boolean) => void;
}

/**
 * Standard-Einstellungen
 */
const DEFAULT_SETTINGS: AppSettings = {
  weightUnit: "kg",
  heightUnit: "cm",
  language: "de",
  notificationsEnabled: true,
  hapticFeedback: true,
};

/**
 * User Store mit Persistenz
 */
export const useUserStore = create<UserState & UserActions>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      isAuthenticated: false,
      hasCompletedOnboarding: false,
      settings: DEFAULT_SETTINGS,
      isLoaded: false,

      // Actions
      createUser: (userData) => {
        const now = new Date();
        const { user: existingUser } = get();
        
        // displayName aus firstName + lastName generieren, falls vorhanden
        const firstName = userData.firstName || existingUser?.firstName;
        const lastName = userData.lastName || existingUser?.lastName;
        const generatedDisplayName = firstName && lastName 
          ? `${firstName} ${lastName}` 
          : userData.displayName || existingUser?.displayName || "Benutzer";
        
        const newUser: User = {
          id: existingUser?.firebaseUid || `user_${Date.now()}`,
          firebaseUid: existingUser?.firebaseUid,
          firstName: firstName,
          lastName: lastName,
          username: userData.username || existingUser?.username || "user",
          displayName: generatedDisplayName,
          email: userData.email || existingUser?.email,
          avatarUrl: userData.avatarUrl,
          createdAt: existingUser?.createdAt || now,
          updatedAt: now,
          weightKg: userData.weightKg,
          gender: userData.gender,
          age: userData.age,
          heightCm: userData.heightCm,
          activityLevel: userData.activityLevel,
          fitnessGoal: userData.fitnessGoal,
        };

        set({ user: newUser, hasCompletedOnboarding: true });
        
        // Profil zu Firestore speichern
        get().saveProfileToFirestore();
      },

      updateUser: (updates) => {
        const { user } = get();
        if (!user) return;

        set({
          user: {
            ...user,
            ...updates,
            updatedAt: new Date(),
          },
        });
        
        // Profil zu Firestore speichern
        get().saveProfileToFirestore();
      },
      
      syncWithFirebaseUser: (firebaseUser: FirebaseUser, displayName?: string) => {
        const { user: existingUser } = get();
        const now = new Date();
        
        const newUser: User = {
          id: firebaseUser.uid,
          firebaseUid: firebaseUser.uid,
          firstName: existingUser?.firstName,
          lastName: existingUser?.lastName,
          username: existingUser?.username || "user",
          displayName: displayName || firebaseUser.displayName || existingUser?.displayName || "Benutzer",
          email: firebaseUser.email || undefined,
          avatarUrl: firebaseUser.photoURL || existingUser?.avatarUrl || undefined,
          createdAt: existingUser?.createdAt || now,
          updatedAt: now,
          // Bestehende Profildaten beibehalten
          weightKg: existingUser?.weightKg,
          gender: existingUser?.gender,
          age: existingUser?.age,
          heightCm: existingUser?.heightCm,
          activityLevel: existingUser?.activityLevel,
          fitnessGoal: existingUser?.fitnessGoal,
        };
        
        set({ 
          user: newUser, 
          isAuthenticated: true,
        });
        
        // Profil von Firestore laden (falls vorhanden)
        get().loadProfileFromFirestore(firebaseUser.uid);
        
        if (__DEV__) {
          console.log("🔄 User synced with Firebase:", newUser.email);
        }
      },
      
      loadProfileFromFirestore: async (uid: string) => {
        try {
          const docRef = doc(db, "users", uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            const { user } = get();
            
            if (user) {
              set({
                user: {
                  ...user,
                  firstName: data.firstName ?? user.firstName,
                  lastName: data.lastName ?? user.lastName,
                  username: data.username ?? user.username,
                  weightKg: data.weightKg ?? user.weightKg,
                  gender: data.gender ?? user.gender,
                  age: data.age ?? user.age,
                  heightCm: data.heightCm ?? user.heightCm,
                  activityLevel: data.activityLevel ?? user.activityLevel,
                  fitnessGoal: data.fitnessGoal ?? user.fitnessGoal,
                  displayName: data.displayName ?? user.displayName,
                  avatarUrl: data.avatarUrl ?? user.avatarUrl,
                },
                hasCompletedOnboarding: data.hasCompletedOnboarding ?? false,
              });
              
              if (__DEV__) {
                console.log("📥 Profil von Firestore geladen");
              }
            }
          }
        } catch (error) {
          if (__DEV__) {
            console.error("❌ Fehler beim Laden des Profils:", error);
          }
        }
      },
      
      saveProfileToFirestore: async () => {
        const { user, hasCompletedOnboarding } = get();
        
        if (!user?.firebaseUid) {
          if (__DEV__) {
            console.log("⚠️ Kein Firebase User - Profil nicht gespeichert");
          }
          return;
        }
        
        try {
          const docRef = doc(db, "users", user.firebaseUid);
          
          // Nur definierte Werte speichern (Firestore akzeptiert kein undefined)
          const profileData: Record<string, unknown> = {
            updatedAt: new Date().toISOString(),
            hasCompletedOnboarding,
          };
          
          // Optional Felder nur hinzufügen wenn definiert
          if (user.firstName !== undefined) profileData.firstName = user.firstName;
          if (user.lastName !== undefined) profileData.lastName = user.lastName;
          if (user.username !== undefined) profileData.username = user.username;
          if (user.displayName !== undefined) profileData.displayName = user.displayName;
          if (user.email !== undefined) profileData.email = user.email;
          if (user.avatarUrl !== undefined) profileData.avatarUrl = user.avatarUrl;
          if (user.weightKg !== undefined) profileData.weightKg = user.weightKg;
          if (user.gender !== undefined) profileData.gender = user.gender;
          if (user.age !== undefined) profileData.age = user.age;
          if (user.heightCm !== undefined) profileData.heightCm = user.heightCm;
          if (user.activityLevel !== undefined) profileData.activityLevel = user.activityLevel;
          if (user.fitnessGoal !== undefined) profileData.fitnessGoal = user.fitnessGoal;
          
          await setDoc(docRef, profileData, { merge: true });
          
          if (__DEV__) {
            console.log("📤 Profil zu Firestore gespeichert");
          }
        } catch (error) {
          if (__DEV__) {
            console.error("❌ Fehler beim Speichern des Profils:", error);
          }
        }
      },

      completeOnboarding: () => {
        set({ hasCompletedOnboarding: true });
        get().saveProfileToFirestore();
      },

      updateSettings: (updates) => {
        const { settings } = get();
        set({
          settings: {
            ...settings,
            ...updates,
          },
        });
      },

      getCalorieProfile: (): UserProfile => {
        const { user } = get();

        // Wenn kein User, nutze Standardprofil
        if (!user) {
          return DEFAULT_PROFILE;
        }

        // Merge User-Daten mit Standardwerten
        return {
          weightKg: user.weightKg ?? DEFAULT_PROFILE.weightKg,
          gender: user.gender ?? DEFAULT_PROFILE.gender,
          age: user.age ?? DEFAULT_PROFILE.age,
          heightCm: user.heightCm ?? DEFAULT_PROFILE.heightCm,
        };
      },

      clearUser: () => {
        set({
          user: null,
          isAuthenticated: false,
          hasCompletedOnboarding: false,
          settings: DEFAULT_SETTINGS,
        });
      },

      setLoaded: () => {
        set({ isLoaded: true });
      },
      
      setAuthenticated: (isAuth: boolean) => {
        set({ isAuthenticated: isAuth });
        if (!isAuth) {
          set({ user: null, hasCompletedOnboarding: false });
        }
      },
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        // Nach dem Laden aus dem Speicher
        state?.setLoaded();
      },
    },
  ),
);
