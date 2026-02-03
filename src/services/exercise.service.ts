import type { Exercise } from "../models";

/**
 * Exercise Service
 * Hilfsfunktionen für Workout-Berechnungen
 *
 * Hinweis: Übungsdaten werden jetzt aus Firebase geladen.
 * Siehe: firebase.service.ts
 */

/**
 * Berechnet die geschätzte Gesamtdauer eines Workouts
 * @param exercises - Liste der Übungen
 * @returns Gesamtdauer in Sekunden
 */
export function calculateTotalDuration(exercises: Exercise[]): number {
  return exercises.reduce((total, ex) => total + ex.timing.totalDuration, 0);
}

/**
 * Berechnet die geschätzten Gesamtkalorien eines Workouts
 * @param exercises - Liste der Übungen
 * @returns Gesamtkalorien
 */
export function calculateTotalCalories(exercises: Exercise[]): number {
  return exercises.reduce((total, ex) => total + ex.calories, 0);
}

/**
 * Formatiert Sekunden in lesbares Format (MM:SS)
 * @param seconds - Sekunden
 * @returns Formatierter String
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Formatiert Sekunden in lesbares Format mit Einheit
 * @param seconds - Sekunden
 * @returns Formatierter String mit Einheit
 */
export function formatDurationWithUnit(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) {
    return `${secs}s`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")} min`;
}
