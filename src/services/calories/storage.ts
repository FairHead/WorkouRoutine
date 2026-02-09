/**
 * Storage Layer für Kalorien-Tracking
 * 
 * AsyncStorage Wrapper für:
 * - Calorie User Profiles
 * - Workout Sessions
 * - Daily Aggregations
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import type { CalorieUserProfile, WorkoutSession, DailyBurn } from "./types";

// Storage Keys
const STORAGE_KEYS = {
  CALORIE_PROFILE: "calorie-profile",
  WORKOUT_SESSIONS: "workout-sessions",
} as const;

/**
 * Speichert ein Calorie User Profile
 */
export async function saveCalorieProfile(
  profile: CalorieUserProfile
): Promise<void> {
  try {
    const json = JSON.stringify(profile);
    await AsyncStorage.setItem(STORAGE_KEYS.CALORIE_PROFILE, json);
  } catch (error) {
    console.error("Error saving calorie profile:", error);
    throw new Error("Fehler beim Speichern des Kalorienprofils");
  }
}

/**
 * Lädt das Calorie User Profile
 */
export async function getCalorieProfile(): Promise<CalorieUserProfile | null> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.CALORIE_PROFILE);
    if (!json) return null;
    
    return JSON.parse(json) as CalorieUserProfile;
  } catch (error) {
    console.error("Error loading calorie profile:", error);
    return null;
  }
}

/**
 * Löscht das Calorie User Profile
 */
export async function deleteCalorieProfile(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.CALORIE_PROFILE);
  } catch (error) {
    console.error("Error deleting calorie profile:", error);
    throw new Error("Fehler beim Löschen des Kalorienprofils");
  }
}

/**
 * Speichert eine Workout-Session
 * 
 * Fügt die Session zur Liste hinzu (sortiert nach Datum)
 */
export async function saveWorkoutSession(
  session: WorkoutSession
): Promise<void> {
  try {
    // Lade bestehende Sessions
    const sessions = await getWorkoutSessions();
    
    // Füge neue Session hinzu
    sessions.push(session);
    
    // Sortiere nach Datum (neueste zuerst)
    sessions.sort((a, b) => b.startTime.localeCompare(a.startTime));
    
    // Speichere
    const json = JSON.stringify(sessions);
    await AsyncStorage.setItem(STORAGE_KEYS.WORKOUT_SESSIONS, json);
  } catch (error) {
    console.error("Error saving workout session:", error);
    throw new Error("Fehler beim Speichern der Workout-Session");
  }
}

/**
 * Lädt alle Workout-Sessions
 * 
 * Optional gefiltert nach Datum
 */
export async function getWorkoutSessions(
  date?: string
): Promise<WorkoutSession[]> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.WORKOUT_SESSIONS);
    if (!json) return [];
    
    const sessions = JSON.parse(json) as WorkoutSession[];
    
    // Filtern nach Datum wenn angegeben
    if (date) {
      return sessions.filter((s) => s.date === date);
    }
    
    return sessions;
  } catch (error) {
    console.error("Error loading workout sessions:", error);
    return [];
  }
}

/**
 * Löscht eine Workout-Session
 */
export async function deleteWorkoutSession(sessionId: string): Promise<void> {
  try {
    const sessions = await getWorkoutSessions();
    const filtered = sessions.filter((s) => s.id !== sessionId);
    
    const json = JSON.stringify(filtered);
    await AsyncStorage.setItem(STORAGE_KEYS.WORKOUT_SESSIONS, json);
  } catch (error) {
    console.error("Error deleting workout session:", error);
    throw new Error("Fehler beim Löschen der Workout-Session");
  }
}

/**
 * Berechnet die tägliche Kalorienübersicht
 * 
 * @param date Datum im Format YYYY-MM-DD
 * @returns DailyBurn Objekt mit TDEE, Workout-Kalorien und Gesamtverbrauch
 */
export async function getDailyBurn(date: string): Promise<DailyBurn> {
  try {
    // Lade Profil
    const profile = await getCalorieProfile();
    const tdeeNoWorkout = profile?.tdeeNoWorkoutKcalDay ?? 0;
    
    // Lade Sessions für diesen Tag
    const sessions = await getWorkoutSessions(date);
    
    // Summiere Workout-Kalorien
    const workoutCalories = sessions.reduce(
      (sum, session) => sum + session.calories,
      0
    );
    
    // Berechne Gesamtverbrauch
    const totalBurn = tdeeNoWorkout + workoutCalories;
    
    return {
      date,
      tdeeNoWorkout,
      workoutCalories,
      totalBurn,
      sessions,
    };
  } catch (error) {
    console.error("Error calculating daily burn:", error);
    throw new Error("Fehler beim Berechnen des Tagesverbrauchs");
  }
}

/**
 * Löscht alle Workout-Sessions
 * (für Testing oder Reset)
 */
export async function clearAllWorkoutSessions(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.WORKOUT_SESSIONS);
  } catch (error) {
    console.error("Error clearing workout sessions:", error);
    throw new Error("Fehler beim Löschen aller Workout-Sessions");
  }
}
