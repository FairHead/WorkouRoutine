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
 * Basis-Informationen einer Übung (für Suche/Übersicht)
 * Ohne Session-spezifische Daten wie Sets/Reps
 */
export interface ExerciseInfo {
  /** Eindeutige ID der Übung */
  id: string;
  /** ExerciseDB ID für API-Referenz */
  exerciseDbId?: string;
  /** Name der Übung */
  name: string;
  /** Bild der Übung (Startposition) */
  image: ImageSourcePropType;
  /** Zweites Bild der Übung (Endposition) - von Firebase */
  imageUrl2?: string;
  /** GIF URL für Animation */
  gifUrl?: string;
  /** Körperteil (z.B. "chest", "back") */
  bodyPart: string;
  /** Zielmuskel */
  targetMuscle: string;
  /** Sekundäre Muskeln */
  secondaryMuscles: string[];
  /** Benötigtes Equipment */
  equipment: string;
  /** Ausführungsanleitung (Schritte) */
  instructions: string[];
  /** Kurzbeschreibung */
  description?: string;
  /** Geschätzte Kalorien pro Minute */
  caloriesPerMinute: number;
  /** Schwierigkeitsgrad */
  difficulty: "beginner" | "intermediate" | "advanced";
  /** Kategorie der Übung */
  category: ExerciseCategory;
}

/**
 * Datenmodell für eine Übung in einer Session
 * Erweitert ExerciseInfo um Session-spezifische Daten
 */
export interface Exercise extends Omit<ExerciseInfo, "caloriesPerMinute"> {
  /** Anzahl der Sets */
  sets: number;
  /** Anzahl der Wiederholungen pro Set */
  reps: number;
  /** Gewicht in kg */
  weight: number;
  /** Intensität in Prozent (0-100) */
  intensity: number;
  /** Geschätzte Kalorien für diese Session */
  calories: number;
  /** Timing-Informationen */
  timing: ExerciseTiming;
  /** Ziel-Muskelgruppen (deprecated, use targetMuscle) */
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
 * Modus für eine Session-Übung
 * - reps: Wiederholungsbasiert (z.B. 3x12 Reps)
 * - timer: Zeitbasiert (z.B. 3x30 Sekunden)
 */
export type SessionExerciseMode = "reps" | "timer";

/**
 * Session-Übung - Eine Übung innerhalb einer Session
 * Kombiniert ExerciseInfo mit Session-spezifischen Einstellungen
 */
export interface SessionExercise {
  /** Eindeutige ID dieser Session-Übung */
  id: string;
  /** Referenz zur Original-Übung */
  exerciseInfoId: string;
  /** Kopierte Übungsdaten für Offline-Zugriff */
  exerciseInfo: ExerciseInfo;
  /** Modus: Wiederholungen oder Timer */
  mode: SessionExerciseMode;
  /** Anzahl der Sets */
  sets: number;
  /** Anzahl der Wiederholungen pro Set (wenn mode = 'reps') */
  reps: number;
  /** Dauer pro Set in Sekunden (wenn mode = 'timer') */
  duration: number;
  /** Gewicht in kg */
  weight: number;
  /** Pausendauer zwischen Sets in Sekunden */
  restBetweenSets: number;
  /** Pausendauer nach dieser Übung zur nächsten in Sekunden */
  restAfterExercise: number;
  /** Notizen zur Übung */
  notes?: string;
  /** Reihenfolge in der Session */
  order: number;
}

/**
 * Session Status
 */
export type SessionStatus =
  | "planned"
  | "in-progress"
  | "completed"
  | "cancelled";

/**
 * Datenmodell für eine Workout-Session
 */
export interface Session {
  /** Eindeutige ID der Session */
  id: string;
  /** Name der Session */
  name: string;
  /** Beschreibung */
  description?: string;
  /** Liste der Übungen */
  exercises: SessionExercise[];
  /** Status der Session */
  status: SessionStatus;
  /** Erstellungsdatum */
  createdAt: Date;
  /** Letztes Änderungsdatum */
  updatedAt: Date;
  /** Geplantes Datum (optional) */
  scheduledFor?: Date;
  /** Startzeit (wenn gestartet) */
  startedAt?: Date;
  /** Endzeit (wenn beendet) */
  completedAt?: Date;
  /** Geschätzte Gesamtdauer in Minuten */
  estimatedDuration?: number;
}

/**
 * Datenmodell für ein Workout (Legacy - wird durch Session ersetzt)
 * @deprecated Use Session instead
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
