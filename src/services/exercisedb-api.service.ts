/**
 * ExerciseDB API Service
 * Dokumentation: https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb
 */

const RAPIDAPI_KEY = "45d4f3816dmsh74228d8ad7a9bdbp15b7fbjsn3387f7eaab06";
const RAPIDAPI_HOST = "exercisedb.p.rapidapi.com";
const BASE_URL = "https://exercisedb.p.rapidapi.com";

/**
 * ExerciseDB API Response Typ
 */
export interface ExerciseDBExercise {
  bodyPart: string;
  equipment: string;
  gifUrl: string;
  id: string;
  name: string;
  target: string;
  secondaryMuscles: string[];
  instructions: string[];
}

/**
 * Headers für RapidAPI Requests
 */
const apiHeaders = {
  "x-rapidapi-key": RAPIDAPI_KEY,
  "x-rapidapi-host": RAPIDAPI_HOST,
};

/**
 * Cache für API Responses um Rate Limits zu vermeiden
 */
const exerciseCache = new Map<string, ExerciseDBExercise>();

/**
 * Holt eine Übung nach ID von ExerciseDB
 * @param id - ExerciseDB Exercise ID (z.B. "0031")
 */
export async function fetchExerciseById(
  id: string,
): Promise<ExerciseDBExercise | null> {
  // Check Cache first
  if (exerciseCache.has(id)) {
    return exerciseCache.get(id)!;
  }

  try {
    const response = await fetch(`${BASE_URL}/exercises/exercise/${id}`, {
      method: "GET",
      headers: apiHeaders,
    });

    if (!response.ok) {
      console.warn(`ExerciseDB API Error: ${response.status}`);
      return null;
    }

    const data: ExerciseDBExercise = await response.json();
    exerciseCache.set(id, data);
    return data;
  } catch (error) {
    console.error("ExerciseDB API Fetch Error:", error);
    return null;
  }
}

/**
 * Holt alle Übungen von ExerciseDB (mit Limit)
 * @param limit - Maximale Anzahl (default: 50)
 */
export async function fetchAllExercises(
  limit: number = 50,
): Promise<ExerciseDBExercise[]> {
  try {
    const response = await fetch(`${BASE_URL}/exercises?limit=${limit}`, {
      method: "GET",
      headers: apiHeaders,
    });

    if (!response.ok) {
      console.warn(`ExerciseDB API Error: ${response.status}`);
      return [];
    }

    const data: ExerciseDBExercise[] = await response.json();

    // Cache all exercises
    data.forEach((ex) => exerciseCache.set(ex.id, ex));

    return data;
  } catch (error) {
    console.error("ExerciseDB API Fetch Error:", error);
    return [];
  }
}

/**
 * Sucht Übungen nach Name
 * @param name - Suchbegriff (englisch)
 */
export async function searchExercisesByName(
  name: string,
): Promise<ExerciseDBExercise[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/exercises/name/${encodeURIComponent(name.toLowerCase())}`,
      {
        method: "GET",
        headers: apiHeaders,
      },
    );

    if (!response.ok) {
      console.warn(`ExerciseDB API Error: ${response.status}`);
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error("ExerciseDB API Fetch Error:", error);
    return [];
  }
}

/**
 * Holt Übungen nach Körperteil
 * @param bodyPart - z.B. "back", "chest", "shoulders"
 */
export async function fetchExercisesByBodyPart(
  bodyPart: string,
): Promise<ExerciseDBExercise[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/exercises/bodyPart/${encodeURIComponent(bodyPart.toLowerCase())}`,
      {
        method: "GET",
        headers: apiHeaders,
      },
    );

    if (!response.ok) {
      console.warn(`ExerciseDB API Error: ${response.status}`);
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error("ExerciseDB API Fetch Error:", error);
    return [];
  }
}

/**
 * Holt die GIF URL für eine Übung
 * @param exerciseDbId - ExerciseDB ID
 */
export async function getExerciseGifUrl(
  exerciseDbId: string,
): Promise<string | null> {
  const exercise = await fetchExerciseById(exerciseDbId);
  return exercise?.gifUrl ?? null;
}

/**
 * Mapping von deutschen Übungsnamen zu englischen ExerciseDB Namen
 */
export const germanToEnglishExerciseMap: Record<string, string> = {
  "Bizeps-Curls": "dumbbell bicep curl",
  Kniebeugen: "barbell full squat",
  Bankdrücken: "barbell bench press",
  Schulterdrücken: "dumbbell shoulder press",
  Kreuzheben: "barbell deadlift",
  "Lat-Züge": "cable lat pulldown",
  "Trizeps-Dips": "triceps dip",
  Ausfallschritte: "dumbbell lunge",
  "Rudern vorgebeugt": "barbell bent over row",
  Beinpresse: "sled leg press",
  Plank: "front plank",
  Wadenheben: "standing calf raise",
  Seitheben: "dumbbell lateral raise",
  "Hammer Curls": "dumbbell hammer curl",
  Beinbeuger: "lever lying leg curl",
  "Cable Flys": "cable standing fly",
  "Face Pulls": "cable face pull",
  "Hip Thrusts": "barbell hip thrust",
};
