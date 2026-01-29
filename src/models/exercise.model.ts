import type { ImageSourcePropType } from "react-native";

/**
 * Timing-Modus für eine Übung
 */
export type TimingMode = "total" | "intervals";

/**
 * Timing-Informationen für eine Übung
 */
export interface ExerciseTiming {
  /** Aktiver Modus: 'total' oder 'intervals' */
  mode: TimingMode;
  /** Gesamtdauer in Sekunden */
  totalDuration: number;
  /** Dauer eines Sets in Sekunden */
  setDuration: number;
  /** Pausendauer in Sekunden */
  pauseDuration: number;
}

/**
 * Bildquellen für eine Übung
 */
export interface ExerciseMedia {
  /** Statisches Bild (lokal oder remote URL) */
  image: ImageSourcePropType;
  /** Animiertes GIF URL (für Long-Press Animation) */
  gifUrl?: string;
}

/**
 * Datenmodell für eine Übung
 */
export interface Exercise {
  /** Eindeutige ID der Übung */
  id: string;
  /** ExerciseDB ID für API-Referenz (optional) */
  exerciseDbId?: string;
  /** Name der Übung */
  name: string;
  /** Bild der Übung (kann URL oder require sein) */
  image: ImageSourcePropType;
  /** GIF URL für Animation (optional) */
  gifUrl?: string;
  /** Anzahl der Sets */
  sets: number;
  /** Anzahl der Wiederholungen pro Set */
  reps: number;
  /** Gewicht in kg */
  weight: number;
  /** Intensität in Prozent (0-100) */
  intensity: number;
  /** Geschätzte Kalorien */
  calories: number;
  /** Timing-Informationen */
  timing: ExerciseTiming;
  /** Kategorie der Übung (optional) */
  category?: ExerciseCategory;
  /** Beschreibung der Übung (optional) */
  description?: string;
  /** Ziel-Muskelgruppen (optional) */
  targetMuscles?: string[];
}

/**
 * Kategorien für Übungen
 */
export type ExerciseCategory =
  | "strength"
  | "cardio"
  | "flexibility"
  | "balance"
  | "endurance";

/**
 * Datenmodell für ein Workout
 */
export interface Workout {
  /** Eindeutige ID des Workouts */
  id: string;
  /** Name des Workouts */
  name: string;
  /** Beschreibung des Workouts */
  description?: string;
  /** Liste der Übungen im Workout */
  exercises: Exercise[];
  /** Erstellungsdatum */
  createdAt: Date;
  /** Letztes Änderungsdatum */
  updatedAt: Date;
  /** Geschätzte Gesamtdauer in Sekunden */
  estimatedDuration?: number;
  /** Geschätzte Gesamtkalorien */
  estimatedCalories?: number;
}
