/**
 * Typen für das Kalorien-Tracking-System
 * 
 * Definiert alle Datenstrukturen für TDEE-Berechnung,
 * Workout-Tracking und MET-basierte Kalorienberechnung.
 */

/**
 * Activity Level - Beschreibt das tägliche Aktivitätsniveau ohne Workouts
 */
export type ActivityLevel = 
  | "sedentary"      // Wenig/keine Bewegung, Bürojob
  | "light"          // Leichte Aktivität 1-3x/Woche
  | "moderate"       // Moderate Aktivität 3-5x/Woche
  | "very_active"    // Intensive Aktivität 6-7x/Woche
  | "extra_active";  // Sehr intensiv + körperlicher Job

/**
 * Workout Type - Verschiedene Trainingsarten mit unterschiedlichen MET-Werten
 */
export type WorkoutType = 
  | "strength_light"      // Leichtes Krafttraining
  | "strength_moderate"   // Moderates Krafttraining
  | "strength_hard"       // Intensives Krafttraining
  | "cardio_moderate"     // Moderates Cardio
  | "running"             // Laufen
  | "hiit"                // High Intensity Interval Training
  | "cycling_moderate"    // Moderates Radfahren
  | "walking_brisk";      // Zügiges Gehen

/**
 * Benutzerprofil für Kalorienberechnungen
 */
export interface CalorieUserProfile {
  /** Geschlecht (für BMR-Berechnung) */
  sex: "male" | "female";
  
  /** Alter in Jahren */
  ageYears: number;
  
  /** Körpergröße in Zentimetern */
  heightCm: number;
  
  /** Körpergewicht in Kilogramm */
  weightKg: number;
  
  /** Aktivitätsniveau (ohne Workouts) */
  activityLevel: ActivityLevel;
  
  // Abgeleitete Werte (berechnet, nicht vom Nutzer eingegeben)
  
  /** Activity Factor für TDEE-Berechnung */
  activityFactor: number;
  
  /** Basal Metabolic Rate in kcal/Tag */
  bmrKcalDay: number;
  
  /** Total Daily Energy Expenditure ohne Workouts in kcal/Tag */
  tdeeNoWorkoutKcalDay: number;
  
  // Optional (für zukünftige Erweiterungen)
  
  /** Körperfettanteil in Prozent (optional) */
  bodyFatPct?: number;
  
  /** Präferenzen */
  preferences?: {
    /** Netto-Kalorien anzeigen? */
    showNetWorkoutCalories: boolean;
  };
}

/**
 * Workout-Session mit Kalorienberechnung
 */
export interface WorkoutSession {
  /** Eindeutige ID */
  id: string;
  
  /** Datum (YYYY-MM-DD, local date) */
  date: string;
  
  /** Startzeitpunkt (ISO timestamp) */
  startTime: string;
  
  /** Endzeitpunkt (ISO timestamp) */
  endTime: string;
  
  /** Dauer in Minuten */
  durationMinutes: number;
  
  /** MET-Wert (gespeichert, nicht rückwirkend änderbar) */
  met: number;
  
  /** Brutto-Kalorien (Gesamtverbrauch während Workout) */
  calories: number;
  
  /** Netto-Kalorien (echter Mehrverbrauch über Ruheumsatz) */
  netCalories?: number;
  
  /** Quelle der Daten */
  source: "manual" | "timer";
  
  /** Workout-Typ (optional) */
  workoutType?: WorkoutType;
  
  /** Intensität (optional, für UI) */
  intensity?: string;
}

/**
 * Tägliche Kalorienübersicht
 */
export interface DailyBurn {
  /** Datum (YYYY-MM-DD) */
  date: string;
  
  /** TDEE ohne Workouts */
  tdeeNoWorkout: number;
  
  /** Kalorien aus Workouts */
  workoutCalories: number;
  
  /** Gesamtverbrauch (TDEE + Workouts) */
  totalBurn: number;
  
  /** Sessions an diesem Tag */
  sessions: WorkoutSession[];
}

/**
 * Validierungsgrenzen für Eingaben
 */
export const VALIDATION_LIMITS = {
  age: { min: 10, max: 100 },
  height: { min: 120, max: 230 },
  weight: { min: 30, max: 250 },
} as const;
