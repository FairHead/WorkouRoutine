/**
 * Activity Factor Mapping
 * 
 * Multipliziert mit BMR um TDEE (Total Daily Energy Expenditure) zu berechnen.
 * Basiert auf wissenschaftlichen Studien zur Energieausgabe bei verschiedenen Aktivitätsniveaus.
 */

import type { ActivityLevel } from "./types";

/**
 * Activity Factors für TDEE-Berechnung
 * 
 * Diese Faktoren multipliziert mit dem BMR ergeben den täglichen Kalorienverbrauch
 * OHNE zusätzliche Workouts.
 */
export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,      // Wenig/keine Bewegung, hauptsächlich sitzende Tätigkeiten (Bürojob)
  light: 1.375,        // Leichte Aktivität 1-3x pro Woche (z.B. leichte Spaziergänge)
  moderate: 1.55,      // Moderate Aktivität 3-5x pro Woche (z.B. regelmäßige leichte Workouts)
  very_active: 1.725,  // Intensive Aktivität 6-7x pro Woche (z.B. tägliche intensive Workouts)
  extra_active: 1.9,   // Sehr intensiv + körperlich anstrengender Job (z.B. Bauarbeiter + Training)
};

/**
 * Holt den Activity Factor für ein bestimmtes Activity Level
 */
export function getActivityFactor(activityLevel: ActivityLevel): number {
  return ACTIVITY_FACTORS[activityLevel];
}

/**
 * Beschreibungen für Activity Levels (für UI)
 */
export const ACTIVITY_LEVEL_DESCRIPTIONS: Record<ActivityLevel, string> = {
  sedentary: "Wenig/keine Bewegung, hauptsächlich sitzend",
  light: "Leichte Aktivität 1-3x/Woche",
  moderate: "Moderate Aktivität 3-5x/Woche",
  very_active: "Intensive Aktivität 6-7x/Woche",
  extra_active: "Sehr intensiv + körperlicher Job",
};
