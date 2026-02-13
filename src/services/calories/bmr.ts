/**
 * BMR (Basal Metabolic Rate) Berechnung
 * 
 * Verwendet die Mifflin-St Jeor Formel (2005), die als genauer gilt als Harris-Benedict.
 * BMR = Grundumsatz = Kalorienverbrauch im Ruhezustand (liegend, nüchtern, thermoneutral)
 */

import type { CalorieUserProfile } from "./types";

/**
 * Berechnet den BMR (Basal Metabolic Rate) nach Mifflin-St Jeor Formel
 * 
 * Formel für Männer:
 *   BMR = 10 * weightKg + 6.25 * heightCm - 5 * ageYears + 5
 * 
 * Formel für Frauen:
 *   BMR = 10 * weightKg + 6.25 * heightCm - 5 * ageYears - 161
 * 
 * @param profile Benutzerprofil mit Gewicht, Größe, Alter und Geschlecht
 * @returns BMR in kcal/Tag
 */
export function calcBmr(profile: {
  sex: "male" | "female";
  ageYears: number;
  heightCm: number;
  weightKg: number;
}): number {
  const { sex, ageYears, heightCm, weightKg } = profile;
  
  // Basis-Berechnung (für beide Geschlechter gleich)
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  
  // Geschlechtsspezifischer Offset
  const sexOffset = sex === "male" ? 5 : -161;
  
  return base + sexOffset;
}

/**
 * Validiert Eingabewerte für BMR-Berechnung
 * 
 * @throws Error wenn Werte außerhalb sinnvoller Bereiche liegen
 */
export function validateBmrInputs(profile: {
  ageYears: number;
  heightCm: number;
  weightKg: number;
}): void {
  const { ageYears, heightCm, weightKg } = profile;
  
  if (ageYears < 10 || ageYears > 100) {
    throw new Error(`Ungültiges Alter: ${ageYears}. Muss zwischen 10 und 100 Jahren liegen.`);
  }
  
  if (heightCm < 120 || heightCm > 230) {
    throw new Error(`Ungültige Größe: ${heightCm}cm. Muss zwischen 120 und 230 cm liegen.`);
  }
  
  if (weightKg < 30 || weightKg > 250) {
    throw new Error(`Ungültiges Gewicht: ${weightKg}kg. Muss zwischen 30 und 250 kg liegen.`);
  }
}
