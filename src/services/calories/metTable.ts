/**
 * MET (Metabolic Equivalent of Task) Tabelle
 * 
 * MET-Werte für verschiedene Workout-Typen.
 * Quelle: Compendium of Physical Activities
 * 
 * 1 MET = Ruheumsatz (ca. 3.5 ml O2/kg/min)
 */

import type { WorkoutType } from "./types";

/**
 * MET-Werte für verschiedene Trainingsarten
 * 
 * Diese Werte werden zur Berechnung der Workout-Kalorien verwendet.
 * Formel: Calories = durationMinutes * (MET * 3.5 * weightKg) / 200
 */
export const MET_TABLE: Record<WorkoutType, number> = {
  strength_light: 3.5,      // Leichtes Krafttraining
  strength_moderate: 5.0,   // Moderates Krafttraining
  strength_hard: 6.0,       // Intensives Krafttraining
  cardio_moderate: 6.0,     // Moderates Cardio (z.B. Crosstrainer)
  running: 9.8,             // Laufen (Default, kann später pace-basiert sein)
  hiit: 10.0,               // High Intensity Interval Training
  cycling_moderate: 7.0,    // Moderates Radfahren
  walking_brisk: 4.3,       // Zügiges Gehen
};

/**
 * Holt den MET-Wert für einen bestimmten Workout-Typ
 */
export function getMet(workoutType: WorkoutType): number {
  return MET_TABLE[workoutType];
}

/**
 * Beschreibungen für Workout-Typen (für UI)
 */
export const WORKOUT_TYPE_DESCRIPTIONS: Record<WorkoutType, string> = {
  strength_light: "Leichtes Krafttraining",
  strength_moderate: "Moderates Krafttraining",
  strength_hard: "Intensives Krafttraining",
  cardio_moderate: "Moderates Cardio",
  running: "Laufen",
  hiit: "HIIT (High Intensity)",
  cycling_moderate: "Moderates Radfahren",
  walking_brisk: "Zügiges Gehen",
};
