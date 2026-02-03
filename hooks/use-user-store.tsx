/**
 * User Store - Verwaltet Benutzerprofil und Einstellungen
 * 
 * Speichert:
 * - Profilinformationen (Name, E-Mail, etc.)
 * - Körperdaten für Kalorienberechnung
 * - App-Einstellungen
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { DEFAULT_PROFILE, type UserProfile } from "@/src/services/calorie-calculator.service";

/**
 * Vollständiges Benutzerprofil
 */
export interface User {
  /** Eindeutige ID */
  id: string;
  /** Anzeigename */
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
      hasCompletedOnboarding: false,
      settings: DEFAULT_SETTINGS,
      isLoaded: false,

      // Actions
      createUser: (userData) => {
        const now = new Date();
        const newUser: User = {
          id: `user_${Date.now()}`,
          displayName: userData.displayName || "Benutzer",
          email: userData.email,
          avatarUrl: userData.avatarUrl,
          createdAt: now,
          updatedAt: now,
          weightKg: userData.weightKg,
          gender: userData.gender,
          age: userData.age,
          heightCm: userData.heightCm,
          activityLevel: userData.activityLevel,
          fitnessGoal: userData.fitnessGoal,
        };

        set({ user: newUser, hasCompletedOnboarding: true });
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
      },

      completeOnboarding: () => {
        set({ hasCompletedOnboarding: true });
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
          hasCompletedOnboarding: false,
          settings: DEFAULT_SETTINGS,
        });
      },

      setLoaded: () => {
        set({ isLoaded: true });
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
