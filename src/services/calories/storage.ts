/**
 * Storage Layer für Kalorien-Tracking
 * 
 * AsyncStorage Wrapper für:
 * - Calorie User Profiles
 * - Workout Sessions
 * - Daily Aggregations
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import type { CalorieUserProfile, WorkoutSession, DailyBurn, ExerciseCalorieBurn, ConsumedCalories } from "./types";

// Storage Keys
const STORAGE_KEYS = {
  CALORIE_PROFILE: "calorie-profile",
  WORKOUT_SESSIONS: "workout-sessions",
  EXERCISE_BURNS: "exercise-burns",
  CONSUMED_CALORIES: "consumed-calories",
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
    
    // Lade Übungs-Kalorien für diesen Tag
    const exerciseBurns = await getExerciseBurns(date);
    const exerciseCalories = exerciseBurns.reduce(
      (sum, burn) => sum + burn.calories,
      0
    );
    
    // Lade konsumierte Kalorien für diesen Tag
    const consumedItems = await getConsumedCalories(date);
    const consumedCalories = consumedItems.reduce(
      (sum, item) => sum + item.calories,
      0
    );
    
    // Berechne Gesamtverbrauch
    const totalBurn = tdeeNoWorkout + workoutCalories + exerciseCalories;
    
    // Berechne Netto-Kalorien (Verbrauch - Konsum)
    const netCalories = totalBurn - consumedCalories;
    
    return {
      date,
      tdeeNoWorkout,
      workoutCalories,
      exerciseCalories,
      consumedCalories,
      totalBurn,
      netCalories,
      sessions,
      exerciseBurns,
      consumedItems,
    };
  } catch (error) {
    console.error("Error calculating daily burn:", error);
    throw new Error("Fehler beim Berechnen des Tagesverbrauchs");
  }
}

// ============================================
// Exercise Burns (Einzelne Übungs-Kalorien)
// ============================================

/**
 * Speichert eine Übungs-Kalorienverbrennung
 */
export async function saveExerciseBurn(
  burn: ExerciseCalorieBurn
): Promise<void> {
  try {
    const burns = await getAllExerciseBurns();
    burns.push(burn);
    burns.sort((a, b) => b.completedAt.localeCompare(a.completedAt));
    
    const json = JSON.stringify(burns);
    await AsyncStorage.setItem(STORAGE_KEYS.EXERCISE_BURNS, json);
  } catch (error) {
    console.error("Error saving exercise burn:", error);
    throw new Error("Fehler beim Speichern der Übungs-Kalorien");
  }
}

/**
 * Lädt alle Übungs-Verbrennungen
 */
async function getAllExerciseBurns(): Promise<ExerciseCalorieBurn[]> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.EXERCISE_BURNS);
    if (!json) return [];
    return JSON.parse(json) as ExerciseCalorieBurn[];
  } catch (error) {
    console.error("Error loading exercise burns:", error);
    return [];
  }
}

/**
 * Lädt Übungs-Verbrennungen für ein Datum
 */
export async function getExerciseBurns(
  date: string
): Promise<ExerciseCalorieBurn[]> {
  try {
    const burns = await getAllExerciseBurns();
    return burns.filter((b) => b.date === date);
  } catch (error) {
    console.error("Error loading exercise burns:", error);
    return [];
  }
}

/**
 * Löscht eine Übungs-Verbrennung
 */
export async function deleteExerciseBurn(burnId: string): Promise<void> {
  try {
    const burns = await getAllExerciseBurns();
    const filtered = burns.filter((b) => b.id !== burnId);
    
    const json = JSON.stringify(filtered);
    await AsyncStorage.setItem(STORAGE_KEYS.EXERCISE_BURNS, json);
  } catch (error) {
    console.error("Error deleting exercise burn:", error);
    throw new Error("Fehler beim Löschen der Übungs-Kalorien");
  }
}

/**
 * Löscht alle Übungs-Verbrennungen
 */
export async function clearAllExerciseBurns(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.EXERCISE_BURNS);
  } catch (error) {
    console.error("Error clearing exercise burns:", error);
    throw new Error("Fehler beim Löschen aller Übungs-Kalorien");
  }
}

// ============================================
// Consumed Calories (Konsumierte Kalorien)
// ============================================

/**
 * Speichert konsumierte Kalorien (Mahlzeit)
 */
export async function saveConsumedCalories(
  consumed: ConsumedCalories
): Promise<void> {
  try {
    const items = await getAllConsumedCalories();
    items.push(consumed);
    items.sort((a, b) => b.consumedAt.localeCompare(a.consumedAt));
    
    const json = JSON.stringify(items);
    await AsyncStorage.setItem(STORAGE_KEYS.CONSUMED_CALORIES, json);
  } catch (error) {
    console.error("Error saving consumed calories:", error);
    throw new Error("Fehler beim Speichern der konsumierten Kalorien");
  }
}

/**
 * Lädt alle konsumierten Kalorien
 */
async function getAllConsumedCalories(): Promise<ConsumedCalories[]> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.CONSUMED_CALORIES);
    if (!json) return [];
    return JSON.parse(json) as ConsumedCalories[];
  } catch (error) {
    console.error("Error loading consumed calories:", error);
    return [];
  }
}

/**
 * Lädt konsumierte Kalorien für ein Datum
 */
export async function getConsumedCalories(
  date: string
): Promise<ConsumedCalories[]> {
  try {
    const items = await getAllConsumedCalories();
    return items.filter((c) => c.date === date);
  } catch (error) {
    console.error("Error loading consumed calories:", error);
    return [];
  }
}

/**
 * Löscht konsumierte Kalorien
 */
export async function deleteConsumedCalories(consumedId: string): Promise<void> {
  try {
    const items = await getAllConsumedCalories();
    const filtered = items.filter((c) => c.id !== consumedId);
    
    const json = JSON.stringify(filtered);
    await AsyncStorage.setItem(STORAGE_KEYS.CONSUMED_CALORIES, json);
  } catch (error) {
    console.error("Error deleting consumed calories:", error);
    throw new Error("Fehler beim Löschen der konsumierten Kalorien");
  }
}

/**
 * Löscht alle konsumierten Kalorien
 */
export async function clearAllConsumedCalories(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.CONSUMED_CALORIES);
  } catch (error) {
    console.error("Error clearing consumed calories:", error);
    throw new Error("Fehler beim Löschen aller konsumierten Kalorien");
  }
}
