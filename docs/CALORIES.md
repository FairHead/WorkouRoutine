# 📊 Smart Calorie Tracker - Dokumentation

## Übersicht

Der Smart Calorie Tracker ist ein wissenschaftlich fundiertes System zur Berechnung des täglichen Kalorienverbrauchs und des Workout-spezifischen Energieumsatzes in der WorkoutRoutine App.

**Hauptziele:**
- Berechnung des täglichen Kalorienverbrauchs ohne Workouts (TDEE)
- MET-basierte Berechnung der Workout-Kalorien
- Tracking von Brutto- und Netto-Kalorienverbrauch
- Persistente Speicherung und Historisierung

---

## 🔬 Wissenschaftliche Grundlagen

### 1. BMR (Basal Metabolic Rate)

**Definition:** Der Grundumsatz ist die Energiemenge, die der Körper in Ruhe benötigt.

**Formel: Mifflin-St Jeor (2005)**

Für Männer:
```
BMR = 10 × Gewicht(kg) + 6.25 × Größe(cm) - 5 × Alter(Jahre) + 5
```

Für Frauen:
```
BMR = 10 × Gewicht(kg) + 6.25 × Größe(cm) - 5 × Alter(Jahre) - 161
```

**Beispiel:**
```typescript
// Mann, 32 Jahre, 171cm, 84kg
BMR = 10 × 84 + 6.25 × 171 - 5 × 32 + 5
BMR = 840 + 1068.75 - 160 + 5
BMR = 1753.75 kcal/Tag
```

**Warum Mifflin-St Jeor?**
- Genauer als Harris-Benedict (1919/1984)
- Validiert für moderne Populationen
- Berücksichtigt Körperzusammensetzung besser

---

### 2. TDEE (Total Daily Energy Expenditure)

**Definition:** Der gesamte tägliche Energieverbrauch OHNE zusätzliche Workouts.

**Formel:**
```
TDEE = BMR × Activity Factor
```

**Activity Factors:**

| Level | Faktor | Beschreibung |
|-------|--------|--------------|
| Sedentary | 1.2 | Wenig/keine Bewegung, Bürojob |
| Light | 1.375 | Leichte Aktivität 1-3x/Woche |
| Moderate | 1.55 | Moderate Aktivität 3-5x/Woche |
| Very Active | 1.725 | Intensive Aktivität 6-7x/Woche |
| Extra Active | 1.9 | Sehr intensiv + körperlicher Job |

**Beispiel:**
```typescript
// BMR = 1753.75, Sedentary (1.2)
TDEE = 1753.75 × 1.2 = 2104.5 kcal/Tag
```

---

### 3. MET (Metabolic Equivalent of Task)

**Definition:** MET beschreibt die Intensität einer Aktivität relativ zum Ruheumsatz.

**1 MET = Ruheumsatz** (ca. 3.5 ml O₂/kg/min)

**MET-Werte für Workouts:**

| Aktivität | MET | Beschreibung |
|-----------|-----|--------------|
| Strength Light | 3.5 | Leichtes Krafttraining |
| Strength Moderate | 5.0 | Moderates Krafttraining |
| Strength Hard | 6.0 | Intensives Krafttraining |
| Cardio Moderate | 6.0 | Crosstrainer, Ergometer |
| Running | 9.8 | Laufen (mittleres Tempo) |
| HIIT | 10.0 | High Intensity Interval Training |
| Cycling Moderate | 7.0 | Radfahren (moderat) |
| Walking Brisk | 4.3 | Zügiges Gehen |

**Quelle:** Compendium of Physical Activities (Ainsworth et al.)

---

### 4. Workout-Kalorien (Brutto)

**Definition:** Gesamter Energieverbrauch während des Workouts.

**Formel:**
```
Calories = Duration(min) × (MET × 3.5 × Gewicht(kg)) / 200
```

**Beispiel:**
```typescript
// 30 Minuten, MET 6.0, 84kg
Calories = 30 × (6.0 × 3.5 × 84) / 200
Calories = 30 × 1764 / 200
Calories = 264.6 kcal
```

**Herleitung der Formel:**

Die Basis-MET-Formel ist:
```
VO₂ (ml/min) = MET × 3.5 × Gewicht(kg)
```

Umrechnung von O₂-Verbrauch zu Kalorien:
```
1 Liter O₂ ≈ 5 kcal
```

Kombiniert:
```
Calories/min = (MET × 3.5 × Gewicht) / 1000 × 5
Calories/min = (MET × 3.5 × Gewicht) / 200
```

---

### 5. Netto-Kalorien (Mehrverbrauch)

**Definition:** Echter Mehrverbrauch über den Ruheumsatz hinaus.

**Formel:**
```
RestCaloriesPerMin = BMR / 1440
NetCalories = WorkoutCalories - (RestCaloriesPerMin × Duration)
NetCalories = max(0, NetCalories)  // Clamp auf 0
```

**Beispiel:**
```typescript
// BMR = 1753.75, 30 min Workout, 264.6 kcal brutto
RestCaloriesPerMin = 1753.75 / 1440 = 1.218 kcal/min
RestCalories = 1.218 × 30 = 36.54 kcal
NetCalories = 264.6 - 36.54 = 228.06 kcal
```

**Warum Netto-Kalorien?**
- Zeigt den ECHTEN Mehrverbrauch
- Verhindert Überschätzung des Trainingseffekts
- Wichtig für präzises Deficit-Tracking

---

## 📊 Datenmodelle

### CalorieUserProfile

```typescript
interface CalorieUserProfile {
  // Eingabedaten
  sex: "male" | "female";
  ageYears: number;         // 10-100
  heightCm: number;         // 120-230 cm
  weightKg: number;         // 30-250 kg
  activityLevel: ActivityLevel;
  
  // Berechnete Werte
  activityFactor: number;
  bmrKcalDay: number;
  tdeeNoWorkoutKcalDay: number;
  
  // Optional
  bodyFatPct?: number;
  preferences?: {
    showNetWorkoutCalories: boolean;
  };
}
```

### WorkoutSession

```typescript
interface WorkoutSession {
  id: string;
  date: string;              // YYYY-MM-DD (local)
  startTime: string;         // ISO timestamp
  endTime: string;           // ISO timestamp
  durationMinutes: number;
  met: number;               // Gespeicherter MET (unveränderlich)
  calories: number;          // Brutto-Kalorien
  netCalories?: number;      // Netto-Kalorien (optional)
  source: "manual" | "timer";
  workoutType?: string;
  intensity?: string;
}
```

### DailyBurn

```typescript
interface DailyBurn {
  date: string;
  tdeeNoWorkout: number;
  workoutCalories: number;
  totalBurn: number;         // tdeeNoWorkout + workoutCalories
  sessions: WorkoutSession[];
}
```

---

## 🏗️ Code-Architektur

### Service-Struktur

```
/src/services/calories/
├── types.ts              # TypeScript Interfaces
├── activityFactors.ts    # Activity Level → Factor Mapping
├── metTable.ts           # Workout Type → MET Mapping
├── bmr.ts                # BMR-Berechnung + Validierung
├── tdee.ts               # TDEE-Berechnung + Profil-Erstellung
├── workout.ts            # Workout-Kalorien (brutto & netto)
├── storage.ts            # AsyncStorage Wrapper
├── index.ts              # Re-exports
└── __tests__/
    ├── bmr.test.ts
    ├── tdee.test.ts
    └── workout.test.ts
```

### Wichtige Prinzipien

1. **Pure Functions:** Alle Berechnungen sind reine Funktionen ohne Side Effects
2. **Testbarkeit:** Jede Funktion ist einzeln testbar
3. **Persistenz:** AsyncStorage für lokale Datenspeicherung
4. **Unveränderlichkeit:** MET-Werte werden pro Session gespeichert (keine rückwirkenden Änderungen)

---

## 🔧 API-Referenz

### Profil-Verwaltung

```typescript
// Profil erstellen
const profile = createCalorieProfile({
  sex: "male",
  ageYears: 32,
  heightCm: 171,
  weightKg: 84,
  activityLevel: "sedentary",
});

// Profil speichern
await saveCalorieProfile(profile);

// Profil laden
const profile = await getCalorieProfile();

// Profil löschen
await deleteCalorieProfile();
```

### Session-Verwaltung

```typescript
// Session erstellen
const session = createWorkoutSession(
  {
    id: "workout_123",
    date: "2026-02-09",
    startTime: "2026-02-09T10:00:00Z",
    endTime: "2026-02-09T10:45:00Z",
    durationMinutes: 45,
    source: "timer",
  },
  profile,
  5.0,  // MET
  true  // Netto-Kalorien berechnen
);

// Session speichern
await saveWorkoutSession(session);

// Sessions laden
const allSessions = await getWorkoutSessions();
const todaySessions = await getWorkoutSessions("2026-02-09");

// Session löschen
await deleteWorkoutSession("workout_123");
```

### Tagesübersicht

```typescript
// Tagesverbrauch abrufen
const dailyBurn = await getDailyBurn("2026-02-09");
console.log(dailyBurn.tdeeNoWorkout);    // 2104.5
console.log(dailyBurn.workoutCalories);  // 387
console.log(dailyBurn.totalBurn);        // 2491.5
```

### Berechnungen

```typescript
// BMR berechnen
const bmr = calcBmr({
  sex: "male",
  ageYears: 32,
  heightCm: 171,
  weightKg: 84,
});
// → 1753.75 kcal/Tag

// TDEE berechnen
const tdee = calcTdeeNoWorkout({
  sex: "male",
  ageYears: 32,
  heightCm: 171,
  weightKg: 84,
  activityLevel: "sedentary",
});
// → 2104.5 kcal/Tag

// Workout-Kalorien (brutto)
const calories = calcWorkoutCalories(84, 30, 6.0);
// → 264.6 kcal

// Workout-Kalorien (netto)
const netCalories = calcNetWorkoutCalories(
  { sex: "male", ageYears: 32, heightCm: 171, weightKg: 84 },
  30,
  264.6
);
// → 228.06 kcal
```

---

## ⚠️ Genauigkeit & Limitierungen

### Genauigkeit MET-basierter Berechnungen

**Standardabweichung: ±15-20%**

**Einflussfaktoren:**
- Individuelle Fitness (VO₂max)
- Körperzusammensetzung (Muskelmasse vs. Fett)
- Trainingseffizienz
- Genetik
- Tagesform

### Verbesserungsmöglichkeiten (Future)

1. **Herzfrequenz-Integration**
   - Apple Watch / Garmin
   - Genauigkeit: ±5-10%
   - Formel: Karvonen / ACSM

2. **VO₂max-basiert**
   - Präzisere individuelle Kalibrierung
   - Requires: Fitness-Test oder Wearable

3. **Machine Learning**
   - Personalisierung durch Tracking-Daten
   - Anpassung der MET-Werte an User

4. **Body Composition**
   - Kailiper / DEXA / Bioimpedanz
   - Katch-McArdle Formel (berücksichtigt Lean Body Mass)

---

## 📱 UI-Integration

### 1. Profile Screen

**Features:**
- Eingabe: Alter, Größe, Gewicht, Geschlecht, Activity Level
- Live-Preview: BMR und TDEE während Eingabe
- Button: "Kalorienprofil erstellen"
- Anzeige: BMR, TDEE mit Erklärungen

### 2. Workout Summary

**Features:**
- Anzeige nach Workout-Completion
- Dauer, Übungen, Sätze
- **NEU:** Kalorien (brutto)
- **NEU:** Netto-Kalorien (optional)
- Icon: Flamme 🔥

### 3. Daily Overview (Home)

**Features:**
- Card mit Tagesübersicht
- TDEE (ohne Workouts)
- Workout-Kalorien (Summe)
- Gesamtverbrauch
- Liste der heutigen Sessions

---

## 🧪 Testing

### Unit Tests

Alle Berechnungen sind durch Unit Tests abgedeckt:

```bash
# Test-Files
src/services/calories/__tests__/bmr.test.ts
src/services/calories/__tests__/tdee.test.ts
src/services/calories/__tests__/workout.test.ts
```

**Test-Szenarien:**
- BMR für männlich/weiblich
- TDEE für alle Activity Levels
- Workout-Kalorien (verschiedene MET, Dauer, Gewichte)
- Netto-Kalorien mit Clamp
- Validierung (Grenzen für Alter, Größe, Gewicht)

**Beispiel:**
```typescript
test("calcBmr male", () => {
  const bmr = calcBmr({
    sex: "male",
    ageYears: 32,
    heightCm: 171,
    weightKg: 84,
  });
  expect(bmr).toBeCloseTo(1753.75, 2);
});
```

---

## 🔄 Versioning & Änderungen

### V1.0.0 (MVP)

**Implementiert:**
- ✅ Mifflin-St Jeor BMR
- ✅ TDEE mit 5 Activity Levels
- ✅ MET-basierte Workout-Kalorien
- ✅ Netto-Kalorien
- ✅ AsyncStorage Persistenz
- ✅ UI: Profile, Workout Summary, Daily Overview
- ✅ Unit Tests

**Limitierungen:**
- Fixer MET pro Workout (5.0)
- Keine individuelle Kalibrierung
- Keine Herzfrequenz-Integration
- Keine historischen Trends

### Zukünftige Versionen

**V1.1.0:**
- Exercise-spezifische MET-Werte
- Gewichtsverlauf-Grafik
- Wöchentlicher Report

**V1.2.0:**
- Apple Health / Google Fit Integration
- Herzfrequenz-basierte Kalorien
- VO₂max Schätzung

**V2.0.0:**
- Food Logging
- Barcode Scanner
- Macro Tracking
- ML-basierte Personalisierung

---

## 📚 Quellen

1. **Mifflin-St Jeor Formula**  
   Mifflin MD, St Jeor ST, et al. (2005). "A new predictive equation for resting energy expenditure in healthy individuals."

2. **MET Compendium**  
   Ainsworth BE, et al. (2011). "Compendium of Physical Activities: a second update of codes and MET values."

3. **Activity Factors**  
   Institute of Medicine (2005). "Dietary Reference Intakes for Energy."

4. **Exercise Physiology**  
   ACSM's Guidelines for Exercise Testing and Prescription (11th Edition)

---

## 🤝 Maintenance & Support

**Code Owner:** WorkoutRoutine Team  
**Last Updated:** 2026-02-09  
**Maintainability Score:** A+

**Bei Fragen oder Bugs:**
- Issue auf GitHub erstellen
- Dokumentation prüfen
- Unit Tests durchlaufen lassen

---

## 🎯 Quick Start

```typescript
// 1. Profil erstellen
import { createCalorieProfile, saveCalorieProfile } from "@/src/services/calories";

const profile = createCalorieProfile({
  sex: "male",
  ageYears: 32,
  heightCm: 171,
  weightKg: 84,
  activityLevel: "sedentary",
});

await saveCalorieProfile(profile);

// 2. Workout tracken
import { createWorkoutSession, saveWorkoutSession } from "@/src/services/calories";

const session = createWorkoutSession(
  {
    id: "workout_" + Date.now(),
    date: new Date().toISOString().split("T")[0],
    startTime: startTime,
    endTime: endTime,
    durationMinutes: 45,
    source: "timer",
  },
  profile,
  5.0,  // MET
  true  // Mit Netto-Kalorien
);

await saveWorkoutSession(session);

// 3. Tagesübersicht abrufen
import { getDailyBurn } from "@/src/services/calories";

const dailyBurn = await getDailyBurn("2026-02-09");
console.log(`Total Burn: ${dailyBurn.totalBurn} kcal`);
```

---

**Made with ❤️ for WorkoutRoutine**
