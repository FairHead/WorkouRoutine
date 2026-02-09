/**
 * TDEE (Total Daily Energy Expenditure) Berechnung
 * 
 * TDEE = BMR * Activity Factor
 * Beschreibt den täglichen Kalorienverbrauch OHNE zusätzliche Workouts
 */

import { calcBmr } from "./bmr";
import { getActivityFactor } from "./activityFactors";
import type { CalorieUserProfile, ActivityLevel } from "./types";

/**
 * Berechnet TDEE (Total Daily Energy Expenditure) ohne Workouts
 * 
 * Formel: TDEE = BMR * activityFactor
 * 
 * @param profile Benutzerprofil mit allen benötigten Daten
 * @returns TDEE in kcal/Tag
 */
export function calcTdeeNoWorkout(profile: {
  sex: "male" | "female";
  ageYears: number;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
}): number {
  // 1. BMR berechnen
  const bmr = calcBmr(profile);
  
  // 2. Activity Factor holen
  const activityFactor = getActivityFactor(profile.activityLevel);
  
  // 3. TDEE berechnen
  const tdee = bmr * activityFactor;
  
  return tdee;
}

/**
 * Erstellt ein vollständiges CalorieUserProfile mit allen berechneten Werten
 * 
 * @param input Basis-Eingabedaten vom Nutzer
 * @returns Vollständiges Profil mit berechneten BMR, TDEE, etc.
 */
export function createCalorieProfile(input: {
  sex: "male" | "female";
  ageYears: number;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  bodyFatPct?: number;
  showNetWorkoutCalories?: boolean;
}): CalorieUserProfile {
  const bmr = calcBmr(input);
  const activityFactor = getActivityFactor(input.activityLevel);
  const tdee = bmr * activityFactor;
  
  return {
    sex: input.sex,
    ageYears: input.ageYears,
    heightCm: input.heightCm,
    weightKg: input.weightKg,
    activityLevel: input.activityLevel,
    activityFactor,
    bmrKcalDay: bmr,
    tdeeNoWorkoutKcalDay: tdee,
    bodyFatPct: input.bodyFatPct,
    preferences: {
      showNetWorkoutCalories: input.showNetWorkoutCalories ?? false,
    },
  };
}
