/**
 * Tenor GIF API Service
 * Kostenlose GIF-Suche für Übungs-Animationen
 * https://developers.google.com/tenor/guides/quickstart
 */

// Öffentlicher API-Key (für Produktion eigenen Key von Google Cloud Console holen)
const TENOR_API_KEY = "AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ";
const TENOR_API_URL = "https://tenor.googleapis.com/v2";

interface TenorMediaFormat {
  url: string;
  duration: number;
  dims: [number, number];
  size: number;
}

interface TenorResult {
  id: string;
  title: string;
  media_formats: {
    gif: TenorMediaFormat;
    mediumgif: TenorMediaFormat;
    tinygif: TenorMediaFormat;
    nanogif: TenorMediaFormat;
    mp4: TenorMediaFormat;
    tinymp4: TenorMediaFormat;
  };
  content_description: string;
  itemurl: string;
  tags: string[];
}

interface TenorSearchResponse {
  results: TenorResult[];
  next: string;
}

/**
 * Cache für GIF-URLs um wiederholte API-Calls zu vermeiden
 */
const gifCache: Map<string, string> = new Map();

/**
 * Sucht ein passendes Übungs-GIF auf Tenor
 * @param exerciseName - Name der Übung (englisch für bessere Ergebnisse)
 * @returns URL zum GIF oder undefined
 */
export async function searchExerciseGif(
  exerciseName: string,
): Promise<string | undefined> {
  // Cache prüfen
  const cacheKey = exerciseName.toLowerCase();
  if (gifCache.has(cacheKey)) {
    return gifCache.get(cacheKey);
  }

  try {
    const query = encodeURIComponent(`${exerciseName} exercise workout`);
    const url = `${TENOR_API_URL}/search?q=${query}&key=${TENOR_API_KEY}&limit=1&media_filter=gif`;

    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`Tenor API error: ${response.status}`);
      return undefined;
    }

    const data: TenorSearchResponse = await response.json();

    if (data.results && data.results.length > 0) {
      // Verwende mediumgif für gute Qualität bei vernünftiger Größe
      const gifUrl =
        data.results[0].media_formats.mediumgif?.url ||
        data.results[0].media_formats.gif?.url;

      if (gifUrl) {
        gifCache.set(cacheKey, gifUrl);
        return gifUrl;
      }
    }

    return undefined;
  } catch (error) {
    console.warn("Error fetching exercise GIF:", error);
    return undefined;
  }
}

/**
 * Lädt GIFs für mehrere Übungen gleichzeitig
 * @param exerciseNames - Array von Übungsnamen (englisch)
 * @returns Map von Übungsname zu GIF-URL
 */
export async function searchMultipleExerciseGifs(
  exerciseNames: string[],
): Promise<Map<string, string>> {
  const results = new Map<string, string>();

  // Parallel laden mit Promise.allSettled
  const promises = exerciseNames.map(async (name) => {
    const gifUrl = await searchExerciseGif(name);
    if (gifUrl) {
      results.set(name, gifUrl);
    }
  });

  await Promise.allSettled(promises);
  return results;
}

/**
 * Vordefinierte Übungs-Suchbegriffe für bessere GIF-Ergebnisse
 */
export const exerciseSearchTerms: Record<string, string> = {
  "Bizeps-Curls": "bicep curl dumbbell",
  Kniebeugen: "barbell squat",
  Bankdrücken: "bench press barbell",
  Schulterdrücken: "shoulder press dumbbell",
  Kreuzheben: "deadlift barbell",
  "Lat-Züge": "lat pulldown",
  "Trizeps-Dips": "tricep dips",
  Ausfallschritte: "walking lunges",
  "Rudern vorgebeugt": "bent over row",
  Beinpresse: "leg press machine",
  Plank: "plank hold",
  Wadenheben: "calf raise standing",
  Seitheben: "lateral raise dumbbell",
  "Hammer Curls": "hammer curl",
  Beinbeuger: "leg curl machine",
  "Cable Flys": "cable fly chest",
  "Face Pulls": "face pull cable",
  "Hip Thrusts": "hip thrust barbell",
};

/**
 * Holt GIF für eine Übung mit deutschem Namen
 * @param germanName - Deutscher Übungsname
 * @returns GIF URL oder undefined
 */
export async function getGifForExercise(
  germanName: string,
): Promise<string | undefined> {
  const searchTerm = exerciseSearchTerms[germanName] || germanName;
  return searchExerciseGif(searchTerm);
}
