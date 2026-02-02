/**
 * Script zum Importieren von Übungen aus free-exercise-db nach Firebase
 *
 * Ausführung:
 * npx ts-node --esm scripts/import-exercises-to-firebase.ts
 *
 * ODER mit tsx (empfohlen):
 * npx tsx scripts/import-exercises-to-firebase.ts
 */

import { initializeApp } from "firebase/app";
import { collection, doc, getFirestore, setDoc } from "firebase/firestore";

// Firebase Config direkt einbinden (da .env in Scripts nicht automatisch geladen wird)
const firebaseConfig = {
  apiKey: "AIzaSyCfYJiwvS91UMccGbRShA8I8b7bocT9UR8",
  authDomain: "workoutroutine-b8d1e.firebaseapp.com",
  projectId: "workoutroutine-b8d1e",
  storageBucket: "workoutroutine-b8d1e.firebasestorage.app",
  messagingSenderId: "9890856187",
  appId: "1:9890856187:web:ae96f666bb3bc77d7a445e",
};

// Firebase initialisieren
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// URL zur exercises.json von free-exercise-db
const EXERCISE_DB_URL =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json";

// Basis-URL für Bilder
const IMAGE_BASE_URL =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises";

/**
 * Rohdaten-Format von free-exercise-db
 */
interface RawExercise {
  id: string;
  name: string;
  force: string | null;
  level: string;
  mechanic: string | null;
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  category: string;
  images: string[];
}

/**
 * Mapping für Schwierigkeitsgrad
 */
function mapDifficulty(
  level: string,
): "beginner" | "intermediate" | "advanced" {
  switch (level.toLowerCase()) {
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
 * Mapping für Kategorie
 */
function mapCategory(
  category: string,
): "strength" | "cardio" | "flexibility" | "balance" | "endurance" {
  switch (category.toLowerCase()) {
    case "strength":
      return "strength";
    case "stretching":
      return "flexibility";
    case "plyometrics":
      return "cardio";
    case "strongman":
      return "strength";
    case "powerlifting":
      return "strength";
    case "cardio":
      return "cardio";
    case "olympic weightlifting":
      return "strength";
    default:
      return "strength";
  }
}

/**
 * Mapping für Körperteil basierend auf primärem Muskel
 */
function mapBodyPart(primaryMuscle: string): string {
  const muscleToBodyPart: Record<string, string> = {
    chest: "chest",
    biceps: "upper arms",
    triceps: "upper arms",
    forearms: "lower arms",
    lats: "back",
    middle_back: "back",
    lower_back: "back",
    traps: "back",
    shoulders: "shoulders",
    quadriceps: "upper legs",
    hamstrings: "upper legs",
    glutes: "upper legs",
    calves: "lower legs",
    abdominals: "waist",
    obliques: "waist",
    neck: "neck",
    adductors: "upper legs",
    abductors: "upper legs",
  };

  return muscleToBodyPart[primaryMuscle.toLowerCase()] || "full body";
}

/**
 * Hauptfunktion zum Importieren
 */
async function importExercisesToFirebase() {
  console.log("🔄 Lade Übungen von GitHub (free-exercise-db)...\n");

  try {
    // Übungen von GitHub laden
    const response = await fetch(EXERCISE_DB_URL);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const exercises: RawExercise[] = await response.json();

    console.log(`✅ ${exercises.length} Übungen geladen!\n`);
    console.log("📤 Starte Import nach Firebase Firestore...\n");

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < exercises.length; i++) {
      const exercise = exercises[i];

      try {
        // Bilder-URLs erstellen (2 Bilder pro Übung)
        const images = exercise.images.map((img) => `${IMAGE_BASE_URL}/${img}`);

        // Daten für Firebase formatieren
        const firestoreExercise = {
          // Basis-Infos
          name: exercise.name,
          exerciseDbId: exercise.id,

          // Körper & Muskeln
          bodyPart: mapBodyPart(exercise.primaryMuscles[0] || ""),
          targetMuscle: exercise.primaryMuscles[0] || "unknown",
          secondaryMuscles: exercise.secondaryMuscles || [],

          // Equipment & Kategorie
          equipment: exercise.equipment || "body only",
          category: mapCategory(exercise.category),
          difficulty: mapDifficulty(exercise.level),

          // Bewegungsinfos
          force: exercise.force,
          mechanic: exercise.mechanic,

          // Anleitung
          instructions: exercise.instructions || [],

          // Bilder (2 pro Übung - Start- und Endposition)
          images: images,
          imageUrl: images[0] || null, // Erstes Bild als Hauptbild
          imageUrl2: images[1] || null, // Zweites Bild

          // Metadaten
          source: "free-exercise-db",
          createdAt: new Date().toISOString(),
        };

        // In Firebase speichern
        const docRef = doc(collection(db, "exercises"), exercise.id);
        await setDoc(docRef, firestoreExercise);

        successCount++;

        // Fortschritt anzeigen
        if (successCount % 50 === 0 || successCount === exercises.length) {
          const percent = Math.round((successCount / exercises.length) * 100);
          console.log(
            `📊 Fortschritt: ${successCount}/${exercises.length} (${percent}%)`,
          );
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ Fehler bei "${exercise.name}":`, error);
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("🎉 IMPORT ABGESCHLOSSEN!");
    console.log("=".repeat(50));
    console.log(`✅ Erfolgreich: ${successCount} Übungen`);
    console.log(`❌ Fehler: ${errorCount} Übungen`);
    console.log("\n📱 Du kannst jetzt die Übungen in deiner App laden!");
    console.log(
      "💡 Tipp: Prüfe die Daten in der Firebase Console unter Firestore Database\n",
    );

    process.exit(0);
  } catch (error) {
    console.error("\n❌ KRITISCHER FEHLER:", error);
    process.exit(1);
  }
}

// Script ausführen
importExercisesToFirebase();
