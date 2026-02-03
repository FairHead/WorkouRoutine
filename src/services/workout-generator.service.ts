/**
 * Workout Generator Service
 *
 * Nimmt KI-Vorschläge und sucht passende Übungen aus Firebase
 */

import type { ExerciseInfo } from "../models";
import { getAllExercisesFromFirebase } from "./firebase.service";

/**
 * Mapping von deutschen Begriffen zu bodyPart-Werten in der DB
 */
const BODY_PART_MAPPING: Record<string, string[]> = {
  // Arme
  arme: ["upper arms", "lower arms"],
  arm: ["upper arms", "lower arms"],
  bizeps: ["upper arms"],
  trizeps: ["upper arms"],
  unterarme: ["lower arms"],
  oberarme: ["upper arms"],
  "upper arms": ["upper arms"],
  "lower arms": ["lower arms"],
  // Brust
  brust: ["chest"],
  chest: ["chest"],
  // Rücken
  rücken: ["back"],
  back: ["back"],
  latissimus: ["back"],
  lat: ["back"],
  // Schultern
  schultern: ["shoulders"],
  schulter: ["shoulders"],
  shoulders: ["shoulders"],
  // Beine
  beine: ["upper legs", "lower legs"],
  bein: ["upper legs", "lower legs"],
  oberschenkel: ["upper legs"],
  "upper legs": ["upper legs"],
  unterschenkel: ["lower legs"],
  waden: ["lower legs"],
  "lower legs": ["lower legs"],
  // Bauch/Core
  bauch: ["waist"],
  core: ["waist"],
  waist: ["waist"],
  // Cardio
  cardio: ["cardio"],
  ausdauer: ["cardio"],
};

/**
 * Normalisiert bodyPart zu DB-Werten
 */
function normalizeBodyPart(bodyPart: string): string[] {
  const key = bodyPart.toLowerCase().trim();
  return BODY_PART_MAPPING[key] || [bodyPart.toLowerCase()];
}

/**
 * KI-Vorschlag für eine Übung (nur Suchkriterien, keine echten IDs)
 */
export interface AIExerciseRequest {
  exerciseName: string;
  bodyPart: string;
  sets: number;
  reps: number;
  restBetweenSets: number;
  restAfterExercise: number;
  mode: "reps" | "timer";
  duration?: number;
  notes?: string;
}

/**
 * KI-Workout-Plan (Suchkriterien)
 */
export interface AIWorkoutPlan {
  sessionName: string;
  description: string;
  estimatedDuration: number;
  exercises: AIExerciseRequest[];
}

/**
 * Fertige Übung mit echten Daten aus Firebase
 */
export interface ResolvedExercise {
  exercise: ExerciseInfo;
  sets: number;
  reps: number;
  duration: number;
  restBetweenSets: number;
  restAfterExercise: number;
  mode: "reps" | "timer";
  notes?: string;
}

/**
 * Fertiges Workout mit echten Übungen
 */
export interface ResolvedWorkout {
  sessionName: string;
  description: string;
  estimatedDuration: number;
  exercises: ResolvedExercise[];
  notFoundExercises: string[]; // Namen von Übungen die nicht gefunden wurden
}

// Cache für Übungen
let exerciseCache: ExerciseInfo[] | null = null;

/**
 * Lädt alle Übungen (mit Cache)
 */
async function getExercises(): Promise<ExerciseInfo[]> {
  if (!exerciseCache) {
    exerciseCache = await getAllExercisesFromFirebase();
  }
  return exerciseCache;
}

/**
 * Berechnet Ähnlichkeit zwischen zwei Strings (0-1)
 */
function similarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1;
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;

  // Wörter vergleichen
  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);

  let matchCount = 0;
  for (const word of words1) {
    if (
      word.length > 2 &&
      words2.some((w) => w.includes(word) || word.includes(w))
    ) {
      matchCount++;
    }
  }

  return matchCount / Math.max(words1.length, words2.length);
}

/**
 * Sucht die beste passende Übung aus der Datenbank
 */
function findBestMatch(
  request: AIExerciseRequest,
  exercises: ExerciseInfo[],
  usedIds: string[] = [],
): ExerciseInfo | null {
  // Normalisiere bodyPart zu allen möglichen Werten
  const bodyParts = normalizeBodyPart(request.bodyPart);

  // Filtere nach Körperteil (mehrere möglich)
  const bodyPartMatches = exercises.filter(
    (ex) =>
      bodyParts.some((bp) => ex.bodyPart?.toLowerCase() === bp) &&
      !usedIds.includes(ex.id),
  );

  // Wenn keine Körperteil-Matches, suche in allen nicht-verwendeten
  const searchPool =
    bodyPartMatches.length > 0
      ? bodyPartMatches
      : exercises.filter((ex) => !usedIds.includes(ex.id));

  // Suche nach Namen
  let bestMatch: ExerciseInfo | null = null;
  let bestScore = 0;

  for (const exercise of searchPool) {
    const nameScore = similarity(request.exerciseName, exercise.name);
    const targetScore = exercise.targetMuscle
      ? similarity(request.exerciseName, exercise.targetMuscle) * 0.5
      : 0;

    const score = Math.max(nameScore, targetScore);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = exercise;
    }
  }

  // Nur zurückgeben wenn Score > 0.2 (niedriger für mehr Matches)
  return bestScore > 0.2 ? bestMatch : null;
}

/**
 * Sucht eine zufällige Übung für den Körperteil
 */
function findRandomForBodyPart(
  bodyPart: string,
  exercises: ExerciseInfo[],
  exclude: string[] = [],
): ExerciseInfo | null {
  const bodyParts = normalizeBodyPart(bodyPart);

  const matches = exercises.filter(
    (ex) =>
      bodyParts.some((bp) => ex.bodyPart?.toLowerCase() === bp) &&
      !exclude.includes(ex.id),
  );

  if (matches.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * matches.length);
  return matches[randomIndex];
}

/**
 * Löst einen KI-Workout-Plan auf zu echten Übungen
 */
export async function resolveWorkoutPlan(
  plan: AIWorkoutPlan,
): Promise<ResolvedWorkout> {
  const exercises = await getExercises();
  const resolvedExercises: ResolvedExercise[] = [];
  const notFoundExercises: string[] = [];
  const usedExerciseIds: string[] = [];

  for (const request of plan.exercises) {
    // Versuche erst nach Namen zu suchen (mit bereits verwendeten IDs)
    let exercise = findBestMatch(request, exercises, usedExerciseIds);

    // Falls nicht gefunden, nimm eine zufällige für den Körperteil
    if (!exercise) {
      exercise = findRandomForBodyPart(
        request.bodyPart,
        exercises,
        usedExerciseIds,
      );
    }

    if (exercise) {
      usedExerciseIds.push(exercise.id);
      resolvedExercises.push({
        exercise,
        sets: request.sets || 3,
        reps: request.reps || 12,
        duration: request.duration || 30,
        restBetweenSets: request.restBetweenSets || 60,
        restAfterExercise: request.restAfterExercise || 90,
        mode: request.mode || "reps",
        notes: request.notes,
      });
    } else {
      notFoundExercises.push(request.exerciseName);
    }
  }

  return {
    sessionName: plan.sessionName || "KI-Workout",
    description: plan.description || "Von der KI generiert",
    estimatedDuration: plan.estimatedDuration || 30,
    exercises: resolvedExercises,
    notFoundExercises,
  };
}

/**
 * Extrahiert den Workout-Plan aus der KI-Antwort
 */
export function parseAIWorkoutPlan(text: string): AIWorkoutPlan | null {
  try {
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[1]);

    if (
      parsed.sessionName &&
      Array.isArray(parsed.exercises) &&
      parsed.exercises.length > 0
    ) {
      return parsed as AIWorkoutPlan;
    }

    return null;
  } catch (error) {
    console.warn("Konnte Workout-Plan nicht parsen:", error);
    return null;
  }
}
