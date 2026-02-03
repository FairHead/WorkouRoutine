/**
 * Kalorienberechnungs-Service
 * 
 * Wissenschaftlich fundierte Berechnung basierend auf:
 * - MET (Metabolic Equivalent of Task)
 * - Körpergewicht, Geschlecht, Alter
 * - Übungsintensität und -dauer
 * - Gewicht der verwendeten Hanteln/Geräte
 */

import type { SessionExercise } from "@/src/models";

/**
 * Benutzerprofil für die Kalorienberechnung
 */
export interface UserProfile {
  /** Körpergewicht in kg */
  weightKg: number;
  /** Geschlecht */
  gender: "male" | "female" | "other";
  /** Alter in Jahren */
  age: number;
  /** Größe in cm (optional, für BMR) */
  heightCm?: number;
}

/**
 * Standardprofil wenn kein Benutzerprofil angelegt ist
 * Basiert auf Durchschnittswerten
 */
export const DEFAULT_PROFILE: UserProfile = {
  weightKg: 75, // Durchschnitt zwischen männlich (80kg) und weiblich (70kg)
  gender: "other",
  age: 30,
  heightCm: 175,
};

/**
 * MET-Werte für verschiedene Übungstypen
 * Quelle: Compendium of Physical Activities
 */
export const MET_VALUES = {
  // Nach Körperteil/Übungstyp
  chest: 5.0,      // Brustübungen (Bankdrücken, Flys)
  back: 5.5,       // Rückenübungen (Rudern, Klimmzüge)
  shoulders: 4.5,  // Schulterübungen
  "upper arms": 4.0,  // Bizeps/Trizeps
  "lower arms": 3.5,  // Unterarme
  "upper legs": 6.0,  // Beine (Kniebeugen, Beinpresse)
  "lower legs": 4.0,  // Waden
  waist: 4.0,      // Bauch/Core
  cardio: 7.0,     // Cardio-Übungen
  
  // Fallback-Werte nach Intensität
  light: 3.0,      // Leichtes Training
  moderate: 5.0,   // Moderates Training
  intense: 6.0,    // Intensives Training
  
  // Standard-Fallback
  default: 5.0,
};

/**
 * Geschätzte Sekunden pro Wiederholung nach Übungstyp
 */
const SECONDS_PER_REP: Record<string, number> = {
  chest: 3.5,
  back: 3.5,
  shoulders: 3.0,
  "upper arms": 2.5,
  "lower arms": 2.5,
  "upper legs": 4.0,
  "lower legs": 2.5,
  waist: 2.0,
  cardio: 1.0,
  default: 3.0,
};

/**
 * Holt den MET-Wert für eine Übung basierend auf Körperteil
 */
function getMETValue(bodyPart: string): number {
  const normalizedPart = bodyPart.toLowerCase();
  return MET_VALUES[normalizedPart as keyof typeof MET_VALUES] ?? MET_VALUES.default;
}

/**
 * Holt die geschätzte Zeit pro Wiederholung
 */
function getSecondsPerRep(bodyPart: string): number {
  const normalizedPart = bodyPart.toLowerCase();
  return SECONDS_PER_REP[normalizedPart] ?? SECONDS_PER_REP.default;
}

/**
 * Berechnet die Arbeitszeit einer Übung in Sekunden
 */
function calculateWorkDuration(exercise: SessionExercise): number {
  const isTimer = exercise.mode === "timer";
  
  if (isTimer) {
    // Timer-Modus: Dauer × Anzahl Sets
    return exercise.sets * exercise.duration;
  } else {
    // Reps-Modus: Sets × Reps × Zeit pro Rep
    const secondsPerRep = getSecondsPerRep(exercise.exerciseInfo.bodyPart);
    return exercise.sets * exercise.reps * secondsPerRep;
  }
}

/**
 * Berechnet die Gesamtdauer inkl. Pausen in Sekunden
 */
function calculateTotalDuration(exercise: SessionExercise): number {
  const workDuration = calculateWorkDuration(exercise);
  const restBetweenSets = (exercise.sets - 1) * exercise.restBetweenSets;
  return workDuration + restBetweenSets;
}

/**
 * Gewichts-Intensitäts-Multiplikator
 * Schwerere Gewichte erhöhen die Intensität und damit den MET-Wert
 * 
 * Formel: 1 + (equipmentWeight / 100) * 0.5
 * - 0kg = 1.0x
 * - 20kg = 1.1x
 * - 50kg = 1.25x
 * - 100kg = 1.5x
 */
function getWeightIntensityMultiplier(equipmentWeightKg: number): number {
  return 1 + (equipmentWeightKg / 100) * 0.5;
}

/**
 * Geschlechts-basierter Kalorien-Multiplikator
 * Männer verbrennen im Durchschnitt ~5-10% mehr Kalorien
 */
function getGenderMultiplier(gender: "male" | "female" | "other"): number {
  switch (gender) {
    case "male":
      return 1.05;
    case "female":
      return 0.95;
    default:
      return 1.0;
  }
}

/**
 * Alters-basierter Multiplikator
 * Der Stoffwechsel verlangsamt sich mit dem Alter
 * Basis: 30 Jahre = 1.0
 */
function getAgeMultiplier(age: number): number {
  if (age < 20) return 1.1;
  if (age < 30) return 1.05;
  if (age < 40) return 1.0;
  if (age < 50) return 0.95;
  if (age < 60) return 0.90;
  return 0.85;
}

/**
 * Hauptfunktion: Berechnet Kalorien für eine Übung
 * 
 * Formel (MET-basiert):
 * Calories = (Duration_min × MET × 3.5 × BodyWeight_kg) / 200
 * 
 * Mit zusätzlichen Multiplikatoren für:
 * - Gewicht der Ausrüstung (Intensität)
 * - Geschlecht
 * - Alter
 */
export function calculateCalories(
  exercise: SessionExercise,
  profile: UserProfile = DEFAULT_PROFILE
): number {
  // 1. Gesamtdauer in Minuten berechnen
  const totalDurationMin = calculateTotalDuration(exercise) / 60;
  
  // 2. Basis-MET-Wert für die Übung
  const baseMET = getMETValue(exercise.exerciseInfo.bodyPart);
  
  // 3. Gewichts-Intensitäts-Multiplikator
  const weightIntensity = getWeightIntensityMultiplier(exercise.weight);
  
  // 4. Effektiver MET-Wert
  const effectiveMET = baseMET * weightIntensity;
  
  // 5. MET-Formel anwenden
  // Calories = (Duration × MET × 3.5 × BodyWeight) / 200
  const baseCalories = (totalDurationMin * effectiveMET * 3.5 * profile.weightKg) / 200;
  
  // 6. Geschlechts- und Alters-Multiplikatoren
  const genderMult = getGenderMultiplier(profile.gender);
  const ageMult = getAgeMultiplier(profile.age);
  
  // 7. Finale Kalorien
  const totalCalories = baseCalories * genderMult * ageMult;
  
  return Math.round(totalCalories);
}

/**
 * Berechnet Kalorien für eine komplette Session
 */
export function calculateSessionCalories(
  exercises: SessionExercise[],
  profile: UserProfile = DEFAULT_PROFILE
): number {
  return exercises.reduce((total, exercise) => {
    return total + calculateCalories(exercise, profile);
  }, 0);
}

/**
 * Schätzt den Nachbrenneffekt (EPOC - Excess Post-Exercise Oxygen Consumption)
 * Ca. 6-15% der während des Trainings verbrannten Kalorien
 */
export function estimateEPOC(workoutCalories: number, intensity: "light" | "moderate" | "intense" = "moderate"): number {
  const epocPercentage = {
    light: 0.06,      // 6%
    moderate: 0.10,   // 10%
    intense: 0.15,    // 15%
  };
  
  return Math.round(workoutCalories * epocPercentage[intensity]);
}

/**
 * Formatiert Kalorien für die Anzeige
 */
export function formatCalories(calories: number): string {
  if (calories < 1000) {
    return `${calories} kcal`;
  }
  return `${(calories / 1000).toFixed(1)}k kcal`;
}

/**
 * Berechnet den geschätzten Kalorienverbrauch pro Minute
 * Basierend auf Geschlecht und Körpergewicht
 */
export function getCaloriesPerMinute(profile: UserProfile = DEFAULT_PROFILE): number {
  // Formel aus Forschung:
  // Männer: 0.0713 × Weight (kg)
  // Frauen: 0.0637 × Weight (kg)
  const coefficient = profile.gender === "male" ? 0.0713 : 
                      profile.gender === "female" ? 0.0637 : 0.0675;
  
  return coefficient * profile.weightKg;
}
