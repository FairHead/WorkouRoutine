import type { Exercise } from "../models";

/**
 * GitHub Free Exercise DB - Kostenlose Übungsdatenbank
 * Quelle: https://github.com/yuhonas/free-exercise-db
 */
const GITHUB_EXERCISE_BASE =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises";

/**
 * Hilfsfunktion um Bild-URL zu generieren
 */
function getExerciseImageUrl(
  exerciseId: string,
  imageIndex: number = 0,
): string {
  return `${GITHUB_EXERCISE_BASE}/${exerciseId}/${imageIndex}.jpg`;
}

/**
 * Mock-Daten für Übungen mit echten Bildern von GitHub Exercise DB
 */
export const mockExercises: Exercise[] = [
  {
    id: "ex-001",
    exerciseDbId: "Dumbbell_Bicep_Curl",
    name: "Bizeps-Curls",
    image: { uri: getExerciseImageUrl("Dumbbell_Bicep_Curl", 0) },
    gifUrl: getExerciseImageUrl("Dumbbell_Bicep_Curl", 1),
    sets: 3,
    reps: 12,
    weight: 12,
    intensity: 75,
    calories: 75,
    timing: {
      mode: "total",
      totalDuration: 390,
      setDuration: 45,
      pauseDuration: 30,
    },
    category: "strength",
    targetMuscles: ["Bizeps", "Unterarme"],
  },
  {
    id: "ex-002",
    exerciseDbId: "Barbell_Full_Squat",
    name: "Kniebeugen",
    image: { uri: getExerciseImageUrl("Barbell_Full_Squat", 0) },
    gifUrl: getExerciseImageUrl("Barbell_Full_Squat", 1),
    sets: 4,
    reps: 15,
    weight: 40,
    intensity: 85,
    calories: 120,
    timing: {
      mode: "intervals",
      totalDuration: 600,
      setDuration: 60,
      pauseDuration: 45,
    },
    category: "strength",
    targetMuscles: ["Quadrizeps", "Gesäß", "Oberschenkel"],
  },
  {
    id: "ex-003",
    exerciseDbId: "Barbell_Bench_Press_-_Medium_Grip",
    name: "Bankdrücken",
    image: { uri: getExerciseImageUrl("Barbell_Bench_Press_-_Medium_Grip", 0) },
    gifUrl: getExerciseImageUrl("Barbell_Bench_Press_-_Medium_Grip", 1),
    sets: 4,
    reps: 10,
    weight: 60,
    intensity: 90,
    calories: 95,
    timing: {
      mode: "total",
      totalDuration: 480,
      setDuration: 50,
      pauseDuration: 40,
    },
    category: "strength",
    targetMuscles: ["Brust", "Trizeps", "Schultern"],
  },
  {
    id: "ex-004",
    exerciseDbId: "Dumbbell_Shoulder_Press",
    name: "Schulterdrücken",
    image: { uri: getExerciseImageUrl("Dumbbell_Shoulder_Press", 0) },
    gifUrl: getExerciseImageUrl("Dumbbell_Shoulder_Press", 1),
    sets: 3,
    reps: 12,
    weight: 25,
    intensity: 70,
    calories: 65,
    timing: {
      mode: "intervals",
      totalDuration: 360,
      setDuration: 40,
      pauseDuration: 30,
    },
    category: "strength",
    targetMuscles: ["Schultern", "Trizeps"],
  },
  {
    id: "ex-005",
    exerciseDbId: "Barbell_Deadlift",
    name: "Kreuzheben",
    image: { uri: getExerciseImageUrl("Barbell_Deadlift", 0) },
    gifUrl: getExerciseImageUrl("Barbell_Deadlift", 1),
    sets: 5,
    reps: 8,
    weight: 80,
    intensity: 95,
    calories: 150,
    timing: {
      mode: "total",
      totalDuration: 720,
      setDuration: 55,
      pauseDuration: 60,
    },
    category: "strength",
    targetMuscles: ["Rücken", "Gesäß", "Oberschenkel"],
  },
  {
    id: "ex-006",
    exerciseDbId: "Wide-Grip_Lat_Pulldown",
    name: "Lat-Züge",
    image: { uri: getExerciseImageUrl("Wide-Grip_Lat_Pulldown", 0) },
    gifUrl: getExerciseImageUrl("Wide-Grip_Lat_Pulldown", 1),
    sets: 3,
    reps: 12,
    weight: 45,
    intensity: 65,
    calories: 70,
    timing: {
      mode: "intervals",
      totalDuration: 420,
      setDuration: 45,
      pauseDuration: 35,
    },
    category: "strength",
    targetMuscles: ["Latissimus", "Bizeps", "Rücken"],
  },
  {
    id: "ex-007",
    exerciseDbId: "Dips_-_Triceps_Version",
    name: "Trizeps-Dips",
    image: { uri: getExerciseImageUrl("Dips_-_Triceps_Version", 0) },
    gifUrl: getExerciseImageUrl("Dips_-_Triceps_Version", 1),
    sets: 3,
    reps: 15,
    weight: 0,
    intensity: 60,
    calories: 55,
    timing: {
      mode: "total",
      totalDuration: 300,
      setDuration: 40,
      pauseDuration: 25,
    },
    category: "strength",
    targetMuscles: ["Trizeps", "Brust", "Schultern"],
  },
  {
    id: "ex-008",
    exerciseDbId: "Dumbbell_Lunges",
    name: "Ausfallschritte",
    image: { uri: getExerciseImageUrl("Dumbbell_Lunges", 0) },
    gifUrl: getExerciseImageUrl("Dumbbell_Lunges", 1),
    sets: 3,
    reps: 12,
    weight: 20,
    intensity: 70,
    calories: 85,
    timing: {
      mode: "intervals",
      totalDuration: 360,
      setDuration: 50,
      pauseDuration: 30,
    },
    category: "strength",
    targetMuscles: ["Quadrizeps", "Gesäß", "Waden"],
  },
  {
    id: "ex-009",
    exerciseDbId: "Bent_Over_Barbell_Row",
    name: "Rudern vorgebeugt",
    image: { uri: getExerciseImageUrl("Bent_Over_Barbell_Row", 0) },
    gifUrl: getExerciseImageUrl("Bent_Over_Barbell_Row", 1),
    sets: 4,
    reps: 10,
    weight: 50,
    intensity: 80,
    calories: 90,
    timing: {
      mode: "total",
      totalDuration: 420,
      setDuration: 45,
      pauseDuration: 40,
    },
    category: "strength",
    targetMuscles: ["Latissimus", "Rhomboiden", "Bizeps"],
  },
  {
    id: "ex-010",
    exerciseDbId: "Leg_Press",
    name: "Beinpresse",
    image: { uri: getExerciseImageUrl("Leg_Press", 0) },
    gifUrl: getExerciseImageUrl("Leg_Press", 1),
    sets: 4,
    reps: 12,
    weight: 100,
    intensity: 85,
    calories: 110,
    timing: {
      mode: "intervals",
      totalDuration: 480,
      setDuration: 55,
      pauseDuration: 45,
    },
    category: "strength",
    targetMuscles: ["Quadrizeps", "Gesäß", "Oberschenkel"],
  },
  {
    id: "ex-011",
    exerciseDbId: "Plank",
    name: "Plank",
    image: { uri: getExerciseImageUrl("Plank", 0) },
    gifUrl: getExerciseImageUrl("Plank", 1),
    sets: 3,
    reps: 1,
    weight: 0,
    intensity: 50,
    calories: 25,
    timing: {
      mode: "total",
      totalDuration: 180,
      setDuration: 60,
      pauseDuration: 30,
    },
    category: "endurance",
    targetMuscles: ["Core", "Schultern", "Rücken"],
  },
  {
    id: "ex-012",
    exerciseDbId: "Standing_Calf_Raises",
    name: "Wadenheben",
    image: { uri: getExerciseImageUrl("Standing_Calf_Raises", 0) },
    gifUrl: getExerciseImageUrl("Standing_Calf_Raises", 1),
    sets: 4,
    reps: 20,
    weight: 30,
    intensity: 55,
    calories: 40,
    timing: {
      mode: "intervals",
      totalDuration: 300,
      setDuration: 35,
      pauseDuration: 25,
    },
    category: "strength",
    targetMuscles: ["Waden", "Soleus"],
  },
  {
    id: "ex-013",
    exerciseDbId: "Side_Lateral_Raise",
    name: "Seitheben",
    image: { uri: getExerciseImageUrl("Side_Lateral_Raise", 0) },
    gifUrl: getExerciseImageUrl("Side_Lateral_Raise", 1),
    sets: 3,
    reps: 15,
    weight: 10,
    intensity: 60,
    calories: 45,
    timing: {
      mode: "total",
      totalDuration: 270,
      setDuration: 40,
      pauseDuration: 30,
    },
    category: "strength",
    targetMuscles: ["Schultern", "Deltamuskeln"],
  },
  {
    id: "ex-014",
    exerciseDbId: "Hammer_Curls",
    name: "Hammer Curls",
    image: { uri: getExerciseImageUrl("Hammer_Curls", 0) },
    gifUrl: getExerciseImageUrl("Hammer_Curls", 1),
    sets: 3,
    reps: 12,
    weight: 14,
    intensity: 65,
    calories: 50,
    timing: {
      mode: "intervals",
      totalDuration: 300,
      setDuration: 40,
      pauseDuration: 30,
    },
    category: "strength",
    targetMuscles: ["Bizeps", "Brachialis", "Unterarme"],
  },
  {
    id: "ex-015",
    exerciseDbId: "Lying_Leg_Curls",
    name: "Beinbeuger",
    image: { uri: getExerciseImageUrl("Lying_Leg_Curls", 0) },
    gifUrl: getExerciseImageUrl("Lying_Leg_Curls", 1),
    sets: 3,
    reps: 12,
    weight: 35,
    intensity: 70,
    calories: 60,
    timing: {
      mode: "total",
      totalDuration: 330,
      setDuration: 45,
      pauseDuration: 35,
    },
    category: "strength",
    targetMuscles: ["Oberschenkelrückseite", "Gesäß"],
  },
  {
    id: "ex-016",
    exerciseDbId: "Cable_Crossover",
    name: "Cable Flys",
    image: { uri: getExerciseImageUrl("Cable_Crossover", 0) },
    gifUrl: getExerciseImageUrl("Cable_Crossover", 1),
    sets: 3,
    reps: 15,
    weight: 15,
    intensity: 60,
    calories: 55,
    timing: {
      mode: "intervals",
      totalDuration: 300,
      setDuration: 40,
      pauseDuration: 30,
    },
    category: "strength",
    targetMuscles: ["Brust", "Vordere Schultern"],
  },
  {
    id: "ex-017",
    exerciseDbId: "Face_Pull",
    name: "Face Pulls",
    image: { uri: getExerciseImageUrl("Face_Pull", 0) },
    gifUrl: getExerciseImageUrl("Face_Pull", 1),
    sets: 3,
    reps: 15,
    weight: 20,
    intensity: 55,
    calories: 40,
    timing: {
      mode: "total",
      totalDuration: 270,
      setDuration: 35,
      pauseDuration: 30,
    },
    category: "strength",
    targetMuscles: ["Hintere Schultern", "Rhomboiden", "Rotatorenmanschette"],
  },
  {
    id: "ex-018",
    exerciseDbId: "Barbell_Hip_Thrust",
    name: "Hip Thrusts",
    image: { uri: getExerciseImageUrl("Barbell_Hip_Thrust", 0) },
    gifUrl: getExerciseImageUrl("Barbell_Hip_Thrust", 1),
    sets: 4,
    reps: 12,
    weight: 60,
    intensity: 80,
    calories: 100,
    timing: {
      mode: "intervals",
      totalDuration: 420,
      setDuration: 50,
      pauseDuration: 40,
    },
    category: "strength",
    targetMuscles: ["Gesäß", "Oberschenkelrückseite", "Core"],
  },
];

/**
 * Holt alle Übungen (Mock-Implementation)
 * @returns Promise mit allen Übungen
 */
export async function getExercises(): Promise<Exercise[]> {
  // Simuliere API-Latenz
  await new Promise((resolve) => setTimeout(resolve, 100));
  return mockExercises;
}

/**
 * Holt eine Übung nach ID (Mock-Implementation)
 * @param id - Die ID der Übung
 * @returns Promise mit der Übung oder undefined
 */
export async function getExerciseById(
  id: string,
): Promise<Exercise | undefined> {
  await new Promise((resolve) => setTimeout(resolve, 50));
  return mockExercises.find((ex) => ex.id === id);
}

/**
 * Holt Übungen nach Kategorie (Mock-Implementation)
 * @param category - Die Kategorie der Übungen
 * @returns Promise mit gefilterten Übungen
 */
export async function getExercisesByCategory(
  category: Exercise["category"],
): Promise<Exercise[]> {
  await new Promise((resolve) => setTimeout(resolve, 50));
  return mockExercises.filter((ex) => ex.category === category);
}

/**
 * Lädt GIF URL für eine Übung - nicht mehr benötigt da direkt in den Daten
 * @deprecated Benutze exercise.gifUrl direkt
 */
export async function loadExerciseGif(
  exerciseName: string,
): Promise<string | undefined> {
  const exercise = mockExercises.find((ex) => ex.name === exerciseName);
  return exercise?.gifUrl;
}
