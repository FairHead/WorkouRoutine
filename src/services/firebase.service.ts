/**
 * Firebase Service - Übungen aus Firestore laden
 *
 * Dieser Service lädt alle Übungsdaten aus der Firebase Firestore Datenbank
 * und bietet Such- und Filterfunktionen.
 */

import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../config/firebase.config";
import type { ExerciseCategory, ExerciseInfo } from "../models";

/**
 * Firebase Exercise Dokument Format
 */
interface FirebaseExercise {
  name: string;
  exerciseDbId?: string;
  bodyPart: string;
  targetMuscle: string;
  secondaryMuscles: string[];
  equipment: string;
  category: string;
  difficulty: string;
  force?: string | null;
  mechanic?: string | null;
  instructions: string[];
  images: string[];
  imageUrl: string | null;
  imageUrl2: string | null;
  source: string;
  createdAt: string;
}

/**
 * Cache für geladene Übungen (verhindert unnötige API-Calls)
 */
let exerciseCache: ExerciseInfo[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 Minuten

/**
 * Konvertiert Firebase-Dokument zu ExerciseInfo
 */
function convertToExerciseInfo(
  id: string,
  data: FirebaseExercise,
): ExerciseInfo {
  return {
    id,
    exerciseDbId: data.exerciseDbId,
    name: data.name,
    // Bild als URI-Objekt für React Native Image
    image: data.imageUrl
      ? { uri: data.imageUrl }
      : require("../../assets/images/icon.png"),
    // Zweites Bild als separate Property
    imageUrl2: data.imageUrl2 || undefined,
    gifUrl: undefined, // Kann später durch Tenor API geladen werden
    bodyPart: data.bodyPart || "unknown",
    targetMuscle: data.targetMuscle || "unknown",
    secondaryMuscles: data.secondaryMuscles || [],
    equipment: data.equipment || "body only",
    instructions: data.instructions || [],
    description: data.instructions?.[0] || undefined,
    caloriesPerMinute: estimateCaloriesPerMinute(
      data.category,
      data.difficulty,
    ),
    difficulty: mapDifficulty(data.difficulty),
    category: mapCategory(data.category),
  };
}

/**
 * Schätzt Kalorien pro Minute basierend auf Kategorie und Schwierigkeit
 */
function estimateCaloriesPerMinute(
  category: string,
  difficulty: string,
): number {
  const baseCalories: Record<string, number> = {
    strength: 5,
    cardio: 10,
    stretching: 3,
    flexibility: 3,
    plyometrics: 12,
    strongman: 8,
    powerlifting: 6,
    "olympic weightlifting": 7,
  };

  const difficultyMultiplier: Record<string, number> = {
    beginner: 0.8,
    intermediate: 1.0,
    expert: 1.2,
    advanced: 1.2,
  };

  const base = baseCalories[category?.toLowerCase()] || 5;
  const multiplier = difficultyMultiplier[difficulty?.toLowerCase()] || 1.0;

  return Math.round(base * multiplier);
}

/**
 * Mappt Schwierigkeitsgrad auf valide Werte
 */
function mapDifficulty(
  level: string,
): "beginner" | "intermediate" | "advanced" {
  switch (level?.toLowerCase()) {
    case "beginner":
      return "beginner";
    case "intermediate":
      return "intermediate";
    case "expert":
    case "advanced":
      return "advanced";
    default:
      return "intermediate";
  }
}

/**
 * Mappt Kategorie auf valide Werte
 */
function mapCategory(category: string): ExerciseCategory {
  switch (category?.toLowerCase()) {
    case "strength":
    case "strongman":
    case "powerlifting":
    case "olympic weightlifting":
      return "strength";
    case "cardio":
    case "plyometrics":
      return "cardio";
    case "stretching":
      return "flexibility";
    default:
      return "strength";
  }
}

/**
 * Lädt alle Übungen aus Firebase
 * Mit Caching für bessere Performance
 */
export async function getAllExercisesFromFirebase(): Promise<ExerciseInfo[]> {
  // Cache prüfen
  const now = Date.now();
  if (exerciseCache && now - cacheTimestamp < CACHE_DURATION) {
    console.log("📦 Returning cached exercises");
    return exerciseCache;
  }

  try {
    console.log("🔥 Loading exercises from Firebase...");
    const exercisesRef = collection(db, "exercises");
    const snapshot = await getDocs(exercisesRef);

    const exercises: ExerciseInfo[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data() as FirebaseExercise;
      exercises.push(convertToExerciseInfo(doc.id, data));
    });

    // Alphabetisch sortieren
    exercises.sort((a, b) => a.name.localeCompare(b.name));

    // Cache aktualisieren
    exerciseCache = exercises;
    cacheTimestamp = now;

    console.log(`✅ Loaded ${exercises.length} exercises from Firebase`);
    return exercises;
  } catch (error) {
    console.error("❌ Error loading exercises from Firebase:", error);
    throw error;
  }
}

/**
 * Lädt eine einzelne Übung nach ID
 */
export async function getExerciseByIdFromFirebase(
  id: string,
): Promise<ExerciseInfo | null> {
  // Erst im Cache suchen
  if (exerciseCache) {
    const cached = exerciseCache.find((ex) => ex.id === id);
    if (cached) return cached;
  }

  try {
    const docRef = doc(db, "exercises", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return convertToExerciseInfo(
        docSnap.id,
        docSnap.data() as FirebaseExercise,
      );
    }
    return null;
  } catch (error) {
    console.error(`❌ Error loading exercise ${id}:`, error);
    throw error;
  }
}

/**
 * Sucht Übungen nach Name
 */
export async function searchExercisesInFirebase(
  searchTerm: string,
): Promise<ExerciseInfo[]> {
  // Alle Übungen laden und lokal filtern (Firestore hat keine LIKE-Suche)
  const allExercises = await getAllExercisesFromFirebase();
  const lowerSearch = searchTerm.toLowerCase().trim();

  if (!lowerSearch) return allExercises;

  return allExercises.filter(
    (ex) =>
      ex.name.toLowerCase().includes(lowerSearch) ||
      ex.targetMuscle.toLowerCase().includes(lowerSearch) ||
      ex.bodyPart.toLowerCase().includes(lowerSearch) ||
      ex.equipment.toLowerCase().includes(lowerSearch),
  );
}

/**
 * Filtert Übungen nach Körperteil
 */
export async function getExercisesByBodyPart(
  bodyPart: string,
): Promise<ExerciseInfo[]> {
  const allExercises = await getAllExercisesFromFirebase();

  if (!bodyPart) return allExercises;

  return allExercises.filter(
    (ex) => ex.bodyPart.toLowerCase() === bodyPart.toLowerCase(),
  );
}

/**
 * Filtert Übungen nach Equipment
 */
export async function getExercisesByEquipment(
  equipment: string,
): Promise<ExerciseInfo[]> {
  const allExercises = await getAllExercisesFromFirebase();

  return allExercises.filter(
    (ex) => ex.equipment.toLowerCase() === equipment.toLowerCase(),
  );
}

/**
 * Filtert Übungen nach Schwierigkeit
 */
export async function getExercisesByDifficulty(
  difficulty: "beginner" | "intermediate" | "advanced",
): Promise<ExerciseInfo[]> {
  const allExercises = await getAllExercisesFromFirebase();

  return allExercises.filter((ex) => ex.difficulty === difficulty);
}

/**
 * Holt alle einzigartigen Körperteile
 */
export async function getAllBodyPartsFromFirebase(): Promise<string[]> {
  const allExercises = await getAllExercisesFromFirebase();
  const bodyParts = new Set<string>();

  allExercises.forEach((ex) => {
    if (ex.bodyPart) {
      bodyParts.add(ex.bodyPart);
    }
  });

  return Array.from(bodyParts).sort();
}

/**
 * Holt alle einzigartigen Equipment-Typen
 */
export async function getAllEquipmentFromFirebase(): Promise<string[]> {
  const allExercises = await getAllExercisesFromFirebase();
  const equipment = new Set<string>();

  allExercises.forEach((ex) => {
    if (ex.equipment) {
      equipment.add(ex.equipment);
    }
  });

  return Array.from(equipment).sort();
}

/**
 * Cache leeren (z.B. nach Datenänderungen)
 */
export function clearExerciseCache(): void {
  exerciseCache = null;
  cacheTimestamp = 0;
  console.log("🗑️ Exercise cache cleared");
}

/**
 * Kombinierte Such- und Filterfunktion
 */
export async function searchAndFilterExercises(options: {
  searchTerm?: string;
  bodyPart?: string;
  equipment?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  category?: ExerciseCategory;
  limit?: number;
}): Promise<ExerciseInfo[]> {
  let results = await getAllExercisesFromFirebase();
  const { searchTerm, bodyPart, equipment, difficulty, category } = options;

  // Textsuche
  if (searchTerm?.trim()) {
    const lower = searchTerm.toLowerCase();
    results = results.filter(
      (ex) =>
        ex.name.toLowerCase().includes(lower) ||
        ex.targetMuscle.toLowerCase().includes(lower) ||
        ex.bodyPart.toLowerCase().includes(lower) ||
        ex.equipment.toLowerCase().includes(lower),
    );
  }

  // Körperteil Filter
  if (bodyPart) {
    results = results.filter(
      (ex) => ex.bodyPart.toLowerCase() === bodyPart.toLowerCase(),
    );
  }

  // Equipment Filter
  if (equipment) {
    results = results.filter(
      (ex) => ex.equipment.toLowerCase() === equipment.toLowerCase(),
    );
  }

  // Schwierigkeit Filter
  if (difficulty) {
    results = results.filter((ex) => ex.difficulty === difficulty);
  }

  // Kategorie Filter
  if (category) {
    results = results.filter((ex) => ex.category === category);
  }

  // Limit anwenden
  if (options.limit && options.limit > 0) {
    results = results.slice(0, options.limit);
  }

  return results;
}
