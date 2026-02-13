/**
 * Calories Service - Smart Calorie Tracker
 * 
 * Hauptmodul für TDEE-Berechnung, MET-basierte Workout-Kalorien
 * und Deficit-Tracking.
 * 
 * Features:
 * - BMR-Berechnung (Mifflin-St Jeor)
 * - TDEE ohne Workouts
 * - MET-basierte Workout-Kalorien
 * - Netto-Kalorien (echter Mehrverbrauch)
 * - Persistent Storage
 */

// Types
export type {
  ActivityLevel,
  WorkoutType,
  CalorieUserProfile,
  WorkoutSession,
  DailyBurn,
  ExerciseCalorieBurn,
  ConsumedCalories,
} from "./types";

export { VALIDATION_LIMITS } from "./types";

// Activity Factors
export { 
  ACTIVITY_FACTORS,
  getActivityFactor,
  ACTIVITY_LEVEL_DESCRIPTIONS,
} from "./activityFactors";

// MET Table
export {
  MET_TABLE,
  getMet,
  WORKOUT_TYPE_DESCRIPTIONS,
} from "./metTable";

// BMR Calculations
export {
  calcBmr,
  validateBmrInputs,
} from "./bmr";

// TDEE Calculations
export {
  calcTdeeNoWorkout,
  createCalorieProfile,
} from "./tdee";

// Workout Calculations
export {
  calcWorkoutCalories,
  calcNetWorkoutCalories,
  createWorkoutSession,
  formatCaloriesForDisplay,
} from "./workout";

// Storage
export {
  saveCalorieProfile,
  getCalorieProfile,
  deleteCalorieProfile,
  saveWorkoutSession,
  getWorkoutSessions,
  deleteWorkoutSession,
  getDailyBurn,
  clearAllWorkoutSessions,
  // Exercise Burns
  saveExerciseBurn,
  getExerciseBurns,
  deleteExerciseBurn,
  clearAllExerciseBurns,
  // Consumed Calories
  saveConsumedCalories,
  getConsumedCalories,
  deleteConsumedCalories,
  clearAllConsumedCalories,
} from "./storage";
