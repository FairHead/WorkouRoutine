/**
 * Workout-Kalorienberechnung
 * 
 * MET-basierte Berechnung von:
 * - Brutto-Workout-Kalorien (Gesamtverbrauch)
 * - Netto-Workout-Kalorien (Mehrverbrauch über Ruheumsatz)
 */

import { calcBmr } from "./bmr";
import type { CalorieUserProfile, WorkoutType, WorkoutSession } from "./types";

/**
 * Berechnet Workout-Kalorien (Brutto) basierend auf MET-Wert
 * 
 * Formel: Calories = durationMinutes * (MET * 3.5 * weightKg) / 200
 * 
 * @param weightKg Körpergewicht in kg
 * @param durationMinutes Workout-Dauer in Minuten
 * @param met MET-Wert der Aktivität
 * @returns Brutto-Kalorien (Gesamtverbrauch während Workout)
 */
export function calcWorkoutCalories(
  weightKg: number,
  durationMinutes: number,
  met: number
): number {
  const calories = (durationMinutes * (met * 3.5 * weightKg)) / 200;
  return calories;
}

/**
 * Berechnet Netto-Workout-Kalorien (echter Mehrverbrauch)
 * 
 * Netto-Kalorien = Workout-Kalorien - Ruheumsatz während derselben Zeit
 * 
 * Formel:
 *   RestCaloriesPerMin = BMR / 1440 (Minuten pro Tag)
 *   NetCalories = WorkoutCalories - (RestCaloriesPerMin * durationMinutes)
 * 
 * Clamp: Wenn NetCalories < 0, dann 0
 * 
 * @param profile Benutzerprofil (für BMR-Berechnung)
 * @param durationMinutes Workout-Dauer in Minuten
 * @param workoutCalories Brutto-Workout-Kalorien
 * @returns Netto-Kalorien (Mehrverbrauch)
 */
export function calcNetWorkoutCalories(
  profile: {
    sex: "male" | "female";
    ageYears: number;
    heightCm: number;
    weightKg: number;
  },
  durationMinutes: number,
  workoutCalories: number
): number {
  // 1. BMR berechnen
  const bmr = calcBmr(profile);
  
  // 2. Ruheumsatz pro Minute
  const restCaloriesPerMin = bmr / 1440; // 1440 Minuten = 24 Stunden
  
  // 3. Ruheumsatz während der Workout-Zeit
  const restCaloriesDuringWorkout = restCaloriesPerMin * durationMinutes;
  
  // 4. Netto-Kalorien (Mehrverbrauch)
  const netCalories = workoutCalories - restCaloriesDuringWorkout;
  
  // 5. Clamp auf 0 (keine negativen Werte)
  return Math.max(0, netCalories);
}

/**
 * Erstellt eine Workout-Session mit Kalorienberechnung
 * 
 * @param input Session-Daten
 * @param profile Benutzerprofil
 * @param met MET-Wert für dieses Workout
 * @param calculateNet Soll NetCalories berechnet werden?
 * @returns Workout-Session Objekt
 */
export function createWorkoutSession(
  input: {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    durationMinutes: number;
    source: "manual" | "timer";
    workoutType?: WorkoutType;
    intensity?: string;
  },
  profile: CalorieUserProfile,
  met: number,
  calculateNet: boolean = false
): WorkoutSession {
  // Brutto-Kalorien berechnen
  const calories = calcWorkoutCalories(
    profile.weightKg,
    input.durationMinutes,
    met
  );
  
  // Netto-Kalorien berechnen (optional)
  const netCalories = calculateNet
    ? calcNetWorkoutCalories(profile, input.durationMinutes, calories)
    : undefined;
  
  return {
    id: input.id,
    date: input.date,
    startTime: input.startTime,
    endTime: input.endTime,
    durationMinutes: input.durationMinutes,
    met,
    calories: Math.round(calories * 10) / 10, // 1 Dezimalstelle
    netCalories: netCalories !== undefined 
      ? Math.round(netCalories * 10) / 10 
      : undefined,
    source: input.source,
    workoutType: input.workoutType,
    intensity: input.intensity,
  };
}

/**
 * Rundet Kalorien für die Anzeige (ganze Zahlen)
 */
export function formatCaloriesForDisplay(calories: number): number {
  return Math.round(calories);
}
