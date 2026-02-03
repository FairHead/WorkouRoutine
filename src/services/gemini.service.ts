/**
 * AI Workout Service
 *
 * Nutzt Groq API (kostenlos, hohe Limits: 30 req/min, 14.400/Tag)
 * Vorher: Gemini (sehr niedrige Limits)
 */

// Groq API - viel bessere kostenlose Limits als Gemini!
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

/**
 * Workout-Vorschlag von der KI
 */
export interface AIWorkoutSuggestion {
  sessionName: string;
  description: string;
  exercises: AIExerciseSuggestion[];
  estimatedDuration: number; // in Minuten
}

/**
 * Einzelne Übung in der KI-Antwort
 */
export interface AIExerciseSuggestion {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  reps: number;
  duration: number; // Sekunden (für Timer-Übungen)
  weight: number;
  restBetweenSets: number; // Sekunden
  restAfterExercise: number; // Sekunden
  mode: "reps" | "timer";
  notes?: string;
}

/**
 * Chat-Nachricht
 */
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  workoutSuggestion?: AIWorkoutSuggestion;
}

/**
 * Holt den Groq API Key
 */
function getApiKey(): string {
  const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      "EXPO_PUBLIC_GROQ_API_KEY fehlt! Hol dir einen kostenlosen Key auf https://console.groq.com/keys",
    );
  }
  return apiKey;
}

/**
 * Kompakter System-Prompt
 */
function buildSystemPrompt(): string {
  return `Du bist ein Fitness-Trainer. Antworte auf Deutsch.

WICHTIG: Wenn der User X Übungen will, liefere EXAKT X Übungen - nicht mehr, nicht weniger!

KÖRPERTEILE für bodyPart:
- Arme = "upper arms" oder "lower arms"  
- Brust = "chest"
- Rücken = "back"
- Schultern = "shoulders"
- Beine = "upper legs" oder "lower legs"
- Bauch = "waist"

Bei JEDER Workout-Anfrage antworte NUR mit einem kurzen Satz und dann dem JSON-Block:

\`\`\`json
{"sessionName":"Name","description":"Kurz","estimatedDuration":30,"exercises":[{"exerciseName":"englischer Name","bodyPart":"chest","sets":3,"reps":12,"restBetweenSets":60,"restAfterExercise":90,"mode":"reps"}]}
\`\`\`

REGELN:
1. Immer \`\`\`json Block verwenden
2. exerciseName auf ENGLISCH (z.B. "bench press", "bicep curl")
3. EXAKT die angefragte Anzahl Übungen
4. Keine Erklärungen nach dem JSON`;
}

/**
 * Sendet eine Nachricht an Groq und bekommt eine Antwort
 * Groq hat viel bessere Limits als Gemini!
 */
export async function sendMessageToGemini(
  userMessage: string,
  conversationHistory: ChatMessage[] = [],
): Promise<{ text: string; workoutSuggestion?: AIWorkoutSuggestion }> {
  const apiKey = getApiKey();
  const systemPrompt = buildSystemPrompt();

  // Nur letzte 3 Nachrichten
  const recentHistory = conversationHistory.slice(-3);

  // OpenAI-kompatibles Format (Groq nutzt das)
  const messages = [
    { role: "system", content: systemPrompt },
    ...recentHistory.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content.slice(0, 300),
    })),
    { role: "user", content: userMessage },
  ];

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant", // Schnell und gut
        messages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Groq API Error:", errorData);

      if (response.status === 429) {
        throw new Error(
          "⏳ Kurze Pause! Versuche es in ein paar Sekunden erneut.",
        );
      }

      if (response.status === 401) {
        throw new Error(
          "Ungültiger API Key. Hol dir einen kostenlosen auf https://console.groq.com/keys",
        );
      }

      throw new Error(`API Fehler: ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.choices?.[0]?.message?.content || "";

    // Versuche JSON aus der Antwort zu extrahieren
    const workoutSuggestion = extractWorkoutSuggestion(responseText);

    // Entferne JSON aus dem sichtbaren Text (mit und ohne Code-Block)
    let cleanText = responseText
      .replace(/```json[\s\S]*?```/g, "") // Code-Blöcke
      .replace(/\{[\s\S]*"sessionName"[\s\S]*"exercises"[\s\S]*\}/g, "") // Rohes JSON
      .trim();

    // Falls nur JSON war, zeige Standardtext
    if (!cleanText || cleanText.length < 5) {
      cleanText = workoutSuggestion 
        ? "Hier ist dein Workout!" 
        : "Ich habe deine Anfrage erhalten!";
    }

    return {
      text: cleanText,
      workoutSuggestion,
    };
  } catch (error) {
    console.error("Fehler bei Groq API:", error);
    throw error;
  }
}

/**
 * Extrahiert Workout-Vorschlag aus der KI-Antwort
 */
function extractWorkoutSuggestion(
  text: string,
): AIWorkoutSuggestion | undefined {
  try {
    // Versuche zuerst JSON-Code-Block zu finden
    let jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    let jsonStr = jsonMatch ? jsonMatch[1] : null;

    // Falls kein Code-Block, suche nach rohem JSON mit sessionName
    if (!jsonStr) {
      const rawJsonMatch = text.match(/\{[\s\S]*"sessionName"[\s\S]*"exercises"[\s\S]*\}/);
      if (rawJsonMatch) {
        jsonStr = rawJsonMatch[0];
      }
    }

    if (!jsonStr) return undefined;

    const parsed = JSON.parse(jsonStr);

    // Validiere die Struktur
    if (
      parsed.sessionName &&
      Array.isArray(parsed.exercises) &&
      parsed.exercises.length > 0
    ) {
      return parsed as AIWorkoutSuggestion;
    }

    return undefined;
  } catch (error) {
    console.warn("Konnte Workout-Vorschlag nicht parsen:", error);
    return undefined;
  }
}

/**
 * Testet die Groq-Verbindung
 */
export async function testGeminiConnection(): Promise<boolean> {
  try {
    const result = await sendMessageToGemini("Hallo!");
    return !!result.text;
  } catch (error) {
    console.error("Groq Verbindungstest fehlgeschlagen:", error);
    return false;
  }
}
