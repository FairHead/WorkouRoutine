/**
 * Unit Tests für Workout-Kalorienberechnung
 * 
 * Testet MET-basierte Brutto- und Netto-Kalorien
 */

import { 
  calcWorkoutCalories, 
  calcNetWorkoutCalories,
  createWorkoutSession,
  formatCaloriesForDisplay,
} from "../workout";

describe("Workout Calorie Calculations", () => {
  // Test-Profil aus der Spezifikation
  const testProfile = {
    sex: "male" as const,
    ageYears: 32,
    heightCm: 171,
    weightKg: 84,
  };

  describe("calcWorkoutCalories", () => {
    it("should calculate workout calories correctly (example from spec)", () => {
      // 30 min, MET 6.0, weight 84kg
      // Calories = 30 * (6.0 * 3.5 * 84) / 200
      // Calories = 30 * 1764 / 200 = 264.6
      const calories = calcWorkoutCalories(84, 30, 6.0);
      expect(calories).toBeCloseTo(264.6, 1);
    });

    it("should calculate with different durations", () => {
      // 45 min, MET 6.0, weight 84kg
      // Calories = 45 * (6.0 * 3.5 * 84) / 200
      // Calories = 45 * 1764 / 200 = 396.9
      const calories = calcWorkoutCalories(84, 45, 6.0);
      expect(calories).toBeCloseTo(396.9, 1);
    });

    it("should calculate with different MET values", () => {
      // 30 min, MET 10.0 (HIIT), weight 84kg
      // Calories = 30 * (10.0 * 3.5 * 84) / 200
      // Calories = 30 * 2940 / 200 = 441
      const calories = calcWorkoutCalories(84, 30, 10.0);
      expect(calories).toBeCloseTo(441, 1);
    });

    it("should calculate with different weights", () => {
      // 30 min, MET 6.0, weight 70kg
      // Calories = 30 * (6.0 * 3.5 * 70) / 200
      // Calories = 30 * 1470 / 200 = 220.5
      const calories = calcWorkoutCalories(70, 30, 6.0);
      expect(calories).toBeCloseTo(220.5, 1);
    });

    it("should handle light intensity workouts", () => {
      // 30 min, MET 3.5 (light strength), weight 84kg
      // Calories = 30 * (3.5 * 3.5 * 84) / 200
      // Calories = 30 * 1029 / 200 = 154.35
      const calories = calcWorkoutCalories(84, 30, 3.5);
      expect(calories).toBeCloseTo(154.35, 1);
    });

    it("should handle running workouts", () => {
      // 30 min, MET 9.8 (running), weight 84kg
      // Calories = 30 * (9.8 * 3.5 * 84) / 200
      // Calories = 30 * 2881.2 / 200 = 432.18
      const calories = calcWorkoutCalories(84, 30, 9.8);
      expect(calories).toBeCloseTo(432.18, 1);
    });
  });

  describe("calcNetWorkoutCalories", () => {
    it("should calculate net workout calories correctly (example from spec)", () => {
      // BMR = 1753.75 (aus bmr.test.ts)
      // RestCaloriesPerMin = 1753.75 / 1440 = 1.218...
      // NetCalories = 264.6 - (1.218... * 30) = 264.6 - 36.54... = 228.05...
      const netCalories = calcNetWorkoutCalories(testProfile, 30, 264.6);
      expect(netCalories).toBeCloseTo(228.06, 1);
    });

    it("should calculate for longer workouts", () => {
      // 60 min workout, 500 kcal brutto
      // RestCaloriesPerMin = 1753.75 / 1440 = 1.218...
      // NetCalories = 500 - (1.218... * 60) = 500 - 73.09 = 426.91
      const netCalories = calcNetWorkoutCalories(testProfile, 60, 500);
      expect(netCalories).toBeCloseTo(426.91, 1);
    });

    it("should clamp negative values to 0", () => {
      // Very low calorie workout that's less than resting
      // RestCaloriesPerMin = 1753.75 / 1440 = 1.218...
      // 30 minutes rest = 36.54 kcal
      // If workout only burns 20 kcal, net should be 0
      const netCalories = calcNetWorkoutCalories(testProfile, 30, 20);
      expect(netCalories).toBe(0);
    });

    it("should handle female profiles correctly", () => {
      const femaleProfile = {
        ...testProfile,
        sex: "female" as const,
      };
      
      // BMR (female) = 1587.75
      // RestCaloriesPerMin = 1587.75 / 1440 = 1.1026...
      // NetCalories = 264.6 - (1.1026... * 30) = 264.6 - 33.08 = 231.52
      const netCalories = calcNetWorkoutCalories(femaleProfile, 30, 264.6);
      expect(netCalories).toBeCloseTo(231.52, 1);
    });
  });

  describe("createWorkoutSession", () => {
    const fullProfile = {
      ...testProfile,
      activityLevel: "sedentary" as const,
      activityFactor: 1.2,
      bmrKcalDay: 1753.75,
      tdeeNoWorkoutKcalDay: 2104.5,
    };

    it("should create workout session with gross calories", () => {
      const session = createWorkoutSession(
        {
          id: "test-session-1",
          date: "2026-02-09",
          startTime: "2026-02-09T10:00:00Z",
          endTime: "2026-02-09T10:30:00Z",
          durationMinutes: 30,
          source: "timer",
          workoutType: "strength_moderate",
          intensity: "moderate",
        },
        fullProfile,
        6.0,
        false
      );

      expect(session.id).toBe("test-session-1");
      expect(session.durationMinutes).toBe(30);
      expect(session.met).toBe(6.0);
      expect(session.calories).toBeCloseTo(264.6, 1);
      expect(session.netCalories).toBeUndefined();
    });

    it("should create workout session with net calories", () => {
      const session = createWorkoutSession(
        {
          id: "test-session-2",
          date: "2026-02-09",
          startTime: "2026-02-09T10:00:00Z",
          endTime: "2026-02-09T10:30:00Z",
          durationMinutes: 30,
          source: "timer",
        },
        fullProfile,
        6.0,
        true
      );

      expect(session.calories).toBeCloseTo(264.6, 1);
      expect(session.netCalories).toBeCloseTo(228.1, 1);
    });

    it("should round calories to 1 decimal place", () => {
      const session = createWorkoutSession(
        {
          id: "test-session-3",
          date: "2026-02-09",
          startTime: "2026-02-09T10:00:00Z",
          endTime: "2026-02-09T10:30:00Z",
          durationMinutes: 30,
          source: "manual",
        },
        fullProfile,
        6.0,
        true
      );

      // Check that values are rounded to 1 decimal
      expect(session.calories.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(1);
      if (session.netCalories) {
        expect(session.netCalories.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(1);
      }
    });
  });

  describe("formatCaloriesForDisplay", () => {
    it("should round to whole numbers for display", () => {
      expect(formatCaloriesForDisplay(264.6)).toBe(265);
      expect(formatCaloriesForDisplay(264.4)).toBe(264);
      expect(formatCaloriesForDisplay(264.5)).toBe(265);
    });

    it("should handle zero", () => {
      expect(formatCaloriesForDisplay(0)).toBe(0);
    });

    it("should handle large numbers", () => {
      expect(formatCaloriesForDisplay(1234.56)).toBe(1235);
    });
  });
});
