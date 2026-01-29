import type { ExerciseInfo } from "../models";

/**
 * GitHub Free Exercise DB - Basis URL für Bilder
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
 * Mock-Daten für Übungs-Suche (ExerciseInfo - ohne Sets/Reps)
 * Diese werden später durch API-Daten ersetzt
 */
export const exerciseDatabase: ExerciseInfo[] = [
  {
    id: "ex-001",
    exerciseDbId: "0031",
    name: "Bizeps-Curls",
    image: { uri: getExerciseImageUrl("Dumbbell_Bicep_Curl", 0) },
    gifUrl: undefined, // Wird durch Tenor API geladen
    bodyPart: "Oberarme",
    targetMuscle: "Bizeps",
    secondaryMuscles: ["Unterarme", "Brachialis"],
    equipment: "Kurzhanteln",
    instructions: [
      "Stelle dich aufrecht hin, halte in jeder Hand eine Kurzhantel mit den Handflächen nach vorne.",
      "Halte die Oberarme stabil an den Seiten.",
      "Beuge die Ellbogen und hebe die Hanteln zur Schulter.",
      "Spanne den Bizeps am obersten Punkt an.",
      "Senke die Hanteln kontrolliert wieder ab.",
      "Wiederhole die Bewegung für die gewünschte Anzahl.",
    ],
    description:
      "Klassische Isolationsübung für den Bizeps. Hervorragend geeignet für Muskelaufbau und Definition der Oberarme.",
    caloriesPerMinute: 5,
    difficulty: "beginner",
    category: "strength",
  },
  {
    id: "ex-002",
    exerciseDbId: "0032",
    name: "Kniebeugen",
    image: { uri: getExerciseImageUrl("Barbell_Full_Squat", 0) },
    gifUrl: undefined,
    bodyPart: "Beine",
    targetMuscle: "Quadrizeps",
    secondaryMuscles: ["Gesäß", "Oberschenkelrückseite", "Waden", "Core"],
    equipment: "Langhantel",
    instructions: [
      "Positioniere die Langhantel auf deinem oberen Rücken (Trapezmuskel).",
      "Stelle die Füße schulterbreit auseinander, Zehen leicht nach außen.",
      "Halte den Rücken gerade und die Brust angehoben.",
      "Beuge die Knie und senke die Hüfte, als würdest du dich hinsetzen.",
      "Gehe so tief wie möglich, mindestens bis die Oberschenkel parallel zum Boden sind.",
      "Drücke dich durch die Fersen wieder nach oben.",
    ],
    description:
      "Die Königin aller Beinübungen. Trainiert fast den gesamten Unterkörper und ist eine der effektivsten Übungen für Kraft und Muskelmasse.",
    caloriesPerMinute: 8,
    difficulty: "intermediate",
    category: "strength",
  },
  {
    id: "ex-003",
    exerciseDbId: "0025",
    name: "Bankdrücken",
    image: { uri: getExerciseImageUrl("Barbell_Bench_Press_-_Medium_Grip", 0) },
    gifUrl: undefined,
    bodyPart: "Brust",
    targetMuscle: "Brustmuskel",
    secondaryMuscles: ["Trizeps", "Vordere Schultern"],
    equipment: "Langhantel & Bank",
    instructions: [
      "Lege dich flach auf eine Hantelbank, Füße fest auf dem Boden.",
      "Greife die Stange etwas weiter als schulterbreit.",
      "Hebe die Stange aus der Ablage und halte sie über der Brust.",
      "Senke die Stange kontrolliert zur Mitte der Brust.",
      "Drücke die Stange explosiv nach oben bis die Arme fast gestreckt sind.",
      "Wiederhole die Bewegung ohne die Stange auf der Brust abzulegen.",
    ],
    description:
      "Die wichtigste Übung für die Brustentwicklung. Stärkt auch Trizeps und Schultern.",
    caloriesPerMinute: 6,
    difficulty: "intermediate",
    category: "strength",
  },
  {
    id: "ex-004",
    exerciseDbId: "0033",
    name: "Schulterdrücken",
    image: { uri: getExerciseImageUrl("Dumbbell_Shoulder_Press", 0) },
    gifUrl: undefined,
    bodyPart: "Schultern",
    targetMuscle: "Deltamuskeln",
    secondaryMuscles: ["Trizeps", "Oberer Trapezmuskel"],
    equipment: "Kurzhanteln",
    instructions: [
      "Setze dich auf eine Bank mit Rückenlehne oder stehe aufrecht.",
      "Halte die Kurzhanteln auf Schulterhöhe, Handflächen nach vorne.",
      "Drücke die Hanteln nach oben bis die Arme fast gestreckt sind.",
      "Halte kurz am obersten Punkt.",
      "Senke die Hanteln kontrolliert zurück zur Schulter.",
      "Achte darauf, den Rücken gerade zu halten.",
    ],
    description:
      "Grundübung für starke, breite Schultern. Kann sitzend oder stehend ausgeführt werden.",
    caloriesPerMinute: 5,
    difficulty: "beginner",
    category: "strength",
  },
  {
    id: "ex-005",
    exerciseDbId: "0032",
    name: "Kreuzheben",
    image: { uri: getExerciseImageUrl("Barbell_Deadlift", 0) },
    gifUrl: undefined,
    bodyPart: "Rücken",
    targetMuscle: "Unterer Rücken",
    secondaryMuscles: [
      "Gesäß",
      "Oberschenkelrückseite",
      "Trapezmuskel",
      "Unterarme",
    ],
    equipment: "Langhantel",
    instructions: [
      "Stelle dich mit den Füßen hüftbreit vor die Langhantel.",
      "Beuge dich mit geradem Rücken nach unten und greife die Stange.",
      "Greifweite: Schulterbreit oder etwas weiter (gemischter Griff möglich).",
      "Spanne Core und Rücken an, Brust raus.",
      "Hebe die Stange durch Strecken der Beine und Hüfte.",
      "Stehe aufrecht, schiebe die Hüfte leicht nach vorne.",
      "Senke die Stange kontrolliert durch Beugen der Hüfte und Knie.",
    ],
    description:
      "Die effektivste Ganzkörperübung. Baut massive Kraft im gesamten hinteren Kettenglied auf.",
    caloriesPerMinute: 10,
    difficulty: "advanced",
    category: "strength",
  },
  {
    id: "ex-006",
    exerciseDbId: "0150",
    name: "Lat-Züge",
    image: { uri: getExerciseImageUrl("Wide-Grip_Lat_Pulldown", 0) },
    gifUrl: undefined,
    bodyPart: "Rücken",
    targetMuscle: "Latissimus",
    secondaryMuscles: ["Bizeps", "Rhomboiden", "Hintere Schultern"],
    equipment: "Kabelzug mit Latzugstange",
    instructions: [
      "Setze dich an das Latzug-Gerät, Oberschenkel unter den Polstern fixiert.",
      "Greife die Stange breiter als schulterbreit.",
      "Lehne dich leicht zurück, Brust raus.",
      "Ziehe die Stange zur oberen Brust, Ellbogen nach unten und hinten.",
      "Spanne den Latissimus am tiefsten Punkt bewusst an.",
      "Lasse die Stange kontrolliert wieder nach oben.",
    ],
    description:
      "Beste Übung für einen breiten Rücken. Perfekt für den V-Shape Look.",
    caloriesPerMinute: 5,
    difficulty: "beginner",
    category: "strength",
  },
  {
    id: "ex-007",
    exerciseDbId: "0334",
    name: "Dips",
    image: { uri: getExerciseImageUrl("Dips_-_Triceps_Version", 0) },
    gifUrl: undefined,
    bodyPart: "Brust & Arme",
    targetMuscle: "Trizeps",
    secondaryMuscles: ["Brust", "Vordere Schultern"],
    equipment: "Dip-Station / Barren",
    instructions: [
      "Greife die Holme der Dip-Station und hebe dich hoch.",
      "Arme gestreckt, Schultern nach unten, Brust raus.",
      "Beuge die Ellbogen und senke den Körper kontrolliert ab.",
      "Für Trizeps: Körper aufrecht halten, Ellbogen eng am Körper.",
      "Für Brust: Oberkörper leicht nach vorne neigen.",
      "Drücke dich wieder hoch bis die Arme fast gestreckt sind.",
    ],
    description:
      "Hervorragende Eigengewichtsübung für Trizeps und Brust. Je nach Körperneigung wird Brust oder Trizeps stärker beansprucht.",
    caloriesPerMinute: 7,
    difficulty: "intermediate",
    category: "strength",
  },
  {
    id: "ex-008",
    exerciseDbId: "0291",
    name: "Ausfallschritte",
    image: { uri: getExerciseImageUrl("Dumbbell_Lunges", 0) },
    gifUrl: undefined,
    bodyPart: "Beine",
    targetMuscle: "Quadrizeps",
    secondaryMuscles: ["Gesäß", "Oberschenkelrückseite", "Waden"],
    equipment: "Kurzhanteln (optional)",
    instructions: [
      "Stehe aufrecht, optional mit Kurzhanteln in den Händen.",
      "Mache einen großen Schritt nach vorne.",
      "Senke das hintere Knie Richtung Boden.",
      "Vorderes Knie bleibt über dem Knöchel, nicht über die Zehen.",
      "Drücke dich durch die Ferse des vorderen Fußes zurück.",
      "Wiederhole mit dem anderen Bein oder wechsle ab.",
    ],
    description:
      "Exzellente Übung für Beine und Gesäß. Verbessert auch Balance und Koordination.",
    caloriesPerMinute: 6,
    difficulty: "beginner",
    category: "strength",
  },
  {
    id: "ex-009",
    exerciseDbId: "0027",
    name: "Rudern vorgebeugt",
    image: { uri: getExerciseImageUrl("Bent_Over_Barbell_Row", 0) },
    gifUrl: undefined,
    bodyPart: "Rücken",
    targetMuscle: "Latissimus",
    secondaryMuscles: ["Rhomboiden", "Bizeps", "Hintere Schultern", "Trapez"],
    equipment: "Langhantel",
    instructions: [
      "Stehe mit schulterbreiten Füßen, Langhantel vor dir.",
      "Beuge dich mit geradem Rücken nach vorne, ca. 45 Grad.",
      "Greife die Stange etwas weiter als schulterbreit.",
      "Ziehe die Stange zum unteren Brustkorb / oberen Bauch.",
      "Drücke die Schulterblätter zusammen am obersten Punkt.",
      "Senke die Stange kontrolliert wieder ab.",
    ],
    description:
      "Grundübung für einen dicken, starken Rücken. Trainiert die gesamte Rückenmuskulatur.",
    caloriesPerMinute: 7,
    difficulty: "intermediate",
    category: "strength",
  },
  {
    id: "ex-010",
    exerciseDbId: "0738",
    name: "Beinpresse",
    image: { uri: getExerciseImageUrl("Leg_Press", 0) },
    gifUrl: undefined,
    bodyPart: "Beine",
    targetMuscle: "Quadrizeps",
    secondaryMuscles: ["Gesäß", "Oberschenkelrückseite"],
    equipment: "Beinpresse-Maschine",
    instructions: [
      "Setze dich in die Beinpresse, Rücken flach an der Lehne.",
      "Platziere die Füße schulterbreit auf der Plattform.",
      "Löse die Sicherung und halte die Plattform.",
      "Beuge die Knie und senke die Plattform kontrolliert.",
      "Stoppe bevor der untere Rücken sich von der Lehne löst.",
      "Drücke die Plattform durch Strecken der Beine zurück.",
    ],
    description:
      "Sichere Alternative zu Kniebeugen. Erlaubt schwere Gewichte bei geringerer Belastung des unteren Rückens.",
    caloriesPerMinute: 7,
    difficulty: "beginner",
    category: "strength",
  },
  {
    id: "ex-011",
    exerciseDbId: "0262",
    name: "Plank",
    image: { uri: getExerciseImageUrl("Plank", 0) },
    gifUrl: undefined,
    bodyPart: "Core",
    targetMuscle: "Bauchmuskulatur",
    secondaryMuscles: ["Unterer Rücken", "Schultern", "Gesäß"],
    equipment: "Keine (Bodyweight)",
    instructions: [
      "Beginne in der Liegestütz-Position.",
      "Senke dich auf die Unterarme ab, Ellbogen unter den Schultern.",
      "Körper bildet eine gerade Linie von Kopf bis Fersen.",
      "Spanne Bauch und Gesäß an, Hüfte nicht durchhängen lassen.",
      "Halte die Position für die gewünschte Zeit.",
      "Atme gleichmäßig weiter.",
    ],
    description:
      "Fundamentale Core-Übung. Stärkt die gesamte Rumpfmuskulatur und verbessert die Körperhaltung.",
    caloriesPerMinute: 4,
    difficulty: "beginner",
    category: "endurance",
  },
  {
    id: "ex-012",
    exerciseDbId: "0761",
    name: "Wadenheben",
    image: { uri: getExerciseImageUrl("Standing_Calf_Raises", 0) },
    gifUrl: undefined,
    bodyPart: "Beine",
    targetMuscle: "Waden",
    secondaryMuscles: ["Soleus"],
    equipment: "Wadenhebe-Maschine oder Stufe",
    instructions: [
      "Stelle dich auf eine Erhöhung, nur die Fußballen aufgestützt.",
      "Fersen hängen frei herunter.",
      "Hebe dich langsam auf die Zehenspitzen.",
      "Halte die Spannung am obersten Punkt kurz.",
      "Senke die Fersen langsam unter das Niveau der Plattform.",
      "Wiederhole mit kontrollierter Bewegung.",
    ],
    description:
      "Isolationsübung für definierte Waden. Kann stehend oder sitzend ausgeführt werden.",
    caloriesPerMinute: 3,
    difficulty: "beginner",
    category: "strength",
  },
  {
    id: "ex-013",
    exerciseDbId: "0334",
    name: "Seitheben",
    image: { uri: getExerciseImageUrl("Side_Lateral_Raise", 0) },
    gifUrl: undefined,
    bodyPart: "Schultern",
    targetMuscle: "Seitliche Deltamuskeln",
    secondaryMuscles: ["Trapezmuskel"],
    equipment: "Kurzhanteln",
    instructions: [
      "Stehe aufrecht, Kurzhanteln an den Seiten.",
      "Ellbogen leicht gebeugt, Handflächen zueinander.",
      "Hebe die Arme seitlich bis auf Schulterhöhe.",
      "Halte die Ellbogen während der gesamten Bewegung leicht gebeugt.",
      "Kurz halten, dann kontrolliert senken.",
      "Schwinge nicht, verwende kontrollierte Bewegungen.",
    ],
    description:
      "Beste Übung für breite Schultern. Isoliert die seitlichen Deltamuskeln effektiv.",
    caloriesPerMinute: 4,
    difficulty: "beginner",
    category: "strength",
  },
  {
    id: "ex-014",
    exerciseDbId: "0373",
    name: "Hammer Curls",
    image: { uri: getExerciseImageUrl("Hammer_Curls", 0) },
    gifUrl: undefined,
    bodyPart: "Oberarme",
    targetMuscle: "Brachialis",
    secondaryMuscles: ["Bizeps", "Unterarme"],
    equipment: "Kurzhanteln",
    instructions: [
      "Stehe aufrecht, Kurzhanteln an den Seiten.",
      "Handflächen zeigen zueinander (neutraler Griff).",
      "Halte die Oberarme stabil am Körper.",
      "Beuge die Ellbogen und hebe die Hanteln zur Schulter.",
      "Halte den neutralen Griff während der gesamten Bewegung.",
      "Senke kontrolliert ab.",
    ],
    description:
      "Variante der Bizeps-Curls mit neutralem Griff. Trainiert besonders den Brachialis für dickere Oberarme.",
    caloriesPerMinute: 4,
    difficulty: "beginner",
    category: "strength",
  },
  {
    id: "ex-015",
    exerciseDbId: "0586",
    name: "Beinbeuger",
    image: { uri: getExerciseImageUrl("Lying_Leg_Curls", 0) },
    gifUrl: undefined,
    bodyPart: "Beine",
    targetMuscle: "Oberschenkelrückseite",
    secondaryMuscles: ["Waden"],
    equipment: "Beinbeuger-Maschine",
    instructions: [
      "Lege dich bäuchlings auf die Beinbeuger-Maschine.",
      "Positioniere die Polster-Rolle über den Fersen.",
      "Halte die Hüfte auf dem Polster, Hände an den Griffen.",
      "Beuge die Knie und ziehe die Fersen Richtung Gesäß.",
      "Spanne die Oberschenkelrückseite am obersten Punkt an.",
      "Senke das Gewicht kontrolliert zurück.",
    ],
    description:
      "Isolationsübung für die hintere Oberschenkelmuskulatur. Wichtig für muskuläre Balance.",
    caloriesPerMinute: 4,
    difficulty: "beginner",
    category: "strength",
  },
  {
    id: "ex-016",
    exerciseDbId: "0226",
    name: "Cable Flys",
    image: { uri: getExerciseImageUrl("Cable_Crossover", 0) },
    gifUrl: undefined,
    bodyPart: "Brust",
    targetMuscle: "Brustmuskel",
    secondaryMuscles: ["Vordere Schultern"],
    equipment: "Kabelzug-Station",
    instructions: [
      "Stelle dich zwischen die Kabelzüge, Griffe in den Händen.",
      "Mache einen kleinen Schritt nach vorne für Stabilität.",
      "Arme leicht gebeugt, Brust raus.",
      "Führe die Hände vor dem Körper zusammen.",
      "Spanne die Brust am Endpunkt bewusst an.",
      "Öffne die Arme kontrolliert wieder zur Seite.",
    ],
    description:
      "Hervorragende Isolationsübung für die Brust. Konstante Spannung durch das Kabelzug-System.",
    caloriesPerMinute: 4,
    difficulty: "beginner",
    category: "strength",
  },
  {
    id: "ex-017",
    exerciseDbId: "1356",
    name: "Face Pulls",
    image: { uri: getExerciseImageUrl("Face_Pull", 0) },
    gifUrl: undefined,
    bodyPart: "Schultern",
    targetMuscle: "Hintere Deltamuskeln",
    secondaryMuscles: ["Rhomboiden", "Trapezmuskel", "Rotatorenmanschette"],
    equipment: "Kabelzug mit Seil",
    instructions: [
      "Stelle den Kabelzug auf Gesichtshöhe ein.",
      "Greife das Seil mit beiden Händen, Daumen nach hinten.",
      "Trete einen Schritt zurück für Spannung.",
      "Ziehe das Seil zum Gesicht, Ellbogen nach außen und oben.",
      "Trenne die Seilenden am Endpunkt neben den Ohren.",
      "Kehre kontrolliert in die Ausgangsposition zurück.",
    ],
    description:
      "Wichtige Übung für Schultergesundheit und Haltung. Trainiert oft vernachlässigte hintere Schultern.",
    caloriesPerMinute: 3,
    difficulty: "beginner",
    category: "strength",
  },
  {
    id: "ex-018",
    exerciseDbId: "0418",
    name: "Hip Thrusts",
    image: { uri: getExerciseImageUrl("Barbell_Hip_Thrust", 0) },
    gifUrl: undefined,
    bodyPart: "Gesäß",
    targetMuscle: "Gesäßmuskel",
    secondaryMuscles: ["Oberschenkelrückseite", "Core"],
    equipment: "Langhantel & Bank",
    instructions: [
      "Lehne dich mit dem oberen Rücken gegen eine Bank.",
      "Platziere die Langhantel über der Hüfte (Polster empfohlen).",
      "Füße schulterbreit, Knie gebeugt.",
      "Drücke die Hüfte nach oben durch Anspannen des Gesäßes.",
      "Körper bildet eine gerade Linie von Schultern bis Knie.",
      "Halte kurz, senke die Hüfte kontrolliert wieder ab.",
    ],
    description:
      "Die effektivste Übung für einen starken, geformten Po. Aktiviert die Gesäßmuskulatur maximal.",
    caloriesPerMinute: 6,
    difficulty: "intermediate",
    category: "strength",
  },
];

/**
 * Sucht Übungen nach Name
 */
export function searchExercises(query: string): ExerciseInfo[] {
  const lowerQuery = query.toLowerCase();
  return exerciseDatabase.filter(
    (ex) =>
      ex.name.toLowerCase().includes(lowerQuery) ||
      ex.bodyPart.toLowerCase().includes(lowerQuery) ||
      ex.targetMuscle.toLowerCase().includes(lowerQuery) ||
      ex.equipment.toLowerCase().includes(lowerQuery),
  );
}

/**
 * Holt eine Übung nach ID
 */
export function getExerciseInfoById(id: string): ExerciseInfo | undefined {
  return exerciseDatabase.find((ex) => ex.id === id);
}

/**
 * Filtert Übungen nach Körperteil
 */
export function getExercisesByBodyPart(bodyPart: string): ExerciseInfo[] {
  return exerciseDatabase.filter(
    (ex) => ex.bodyPart.toLowerCase() === bodyPart.toLowerCase(),
  );
}

/**
 * Filtert Übungen nach Schwierigkeitsgrad
 */
export function getExercisesByDifficulty(
  difficulty: ExerciseInfo["difficulty"],
): ExerciseInfo[] {
  return exerciseDatabase.filter((ex) => ex.difficulty === difficulty);
}

/**
 * Holt alle einzigartigen Körperteile
 */
export function getAllBodyParts(): string[] {
  return [...new Set(exerciseDatabase.map((ex) => ex.bodyPart))];
}
