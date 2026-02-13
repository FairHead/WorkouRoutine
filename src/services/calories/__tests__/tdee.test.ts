/**
 * Unit Tests für TDEE-Berechnung
 * 
 * Testet TDEE (Total Daily Energy Expenditure) ohne Workouts
 */

import { calcTdeeNoWorkout, createCalorieProfile } from "../tdee";
import { ACTIVITY_FACTORS } from "../activityFactors";

describe("TDEE Calculations", () => {
  // Test-Profil aus der Spezifikation
  const testProfile = {
    sex: "male" as const,
    ageYears: 32,
    heightCm: 171,
    weightKg: 84,
    activityLevel: "sedentary" as const,
  };

  describe("calcTdeeNoWorkout", () => {
    it("should calculate TDEE correctly for sedentary activity level", () => {
      // BMR = 1753.75 (aus bmr.test.ts)
      // TDEE = 1753.75 * 1.2 = 2104.5
      const tdee = calcTdeeNoWorkout(testProfile);
      expect(tdee).toBeCloseTo(2104.5, 1);
    });

    it("should calculate TDEE correctly for light activity level", () => {
      const lightProfile = {
        ...testProfile,
        activityLevel: "light" as const,
      };
      
      // TDEE = 1753.75 * 1.375 = 2411.40625
      const tdee = calcTdeeNoWorkout(lightProfile);
      expect(tdee).toBeCloseTo(2411.41, 1);
    });

    it("should calculate TDEE correctly for moderate activity level", () => {
      const moderateProfile = {
        ...testProfile,
        activityLevel: "moderate" as const,
      };
      
      // TDEE = 1753.75 * 1.55 = 2718.3125
      const tdee = calcTdeeNoWorkout(moderateProfile);
      expect(tdee).toBeCloseTo(2718.31, 1);
    });

    it("should calculate TDEE correctly for very_active level", () => {
      const veryActiveProfile = {
        ...testProfile,
        activityLevel: "very_active" as const,
      };
      
      // TDEE = 1753.75 * 1.725 = 3025.21875
      const tdee = calcTdeeNoWorkout(veryActiveProfile);
      expect(tdee).toBeCloseTo(3025.22, 1);
    });

    it("should calculate TDEE correctly for extra_active level", () => {
      const extraActiveProfile = {
        ...testProfile,
        activityLevel: "extra_active" as const,
      };
      
      // TDEE = 1753.75 * 1.9 = 3332.125
      const tdee = calcTdeeNoWorkout(extraActiveProfile);
      expect(tdee).toBeCloseTo(3332.13, 1);
    });

    it("should handle female profiles correctly", () => {
      const femaleProfile = {
        ...testProfile,
        sex: "female" as const,
      };
      
      // BMR (female) = 1587.75
      // TDEE = 1587.75 * 1.2 = 1905.3
      const tdee = calcTdeeNoWorkout(femaleProfile);
      expect(tdee).toBeCloseTo(1905.3, 1);
    });
  });

  describe("createCalorieProfile", () => {
    it("should create complete profile with all calculated values", () => {
      const profile = createCalorieProfile(testProfile);
      
      expect(profile.sex).toBe("male");
      expect(profile.ageYears).toBe(32);
      expect(profile.heightCm).toBe(171);
      expect(profile.weightKg).toBe(84);
      expect(profile.activityLevel).toBe("sedentary");
      
      // Berechnete Werte
      expect(profile.activityFactor).toBe(ACTIVITY_FACTORS.sedentary);
      expect(profile.bmrKcalDay).toBeCloseTo(1753.75, 2);
      expect(profile.tdeeNoWorkoutKcalDay).toBeCloseTo(2104.5, 1);
    });

    it("should include optional body fat percentage", () => {
      const profileWithBodyFat = createCalorieProfile({
        ...testProfile,
        bodyFatPct: 15.5,
      });
      
      expect(profileWithBodyFat.bodyFatPct).toBe(15.5);
    });

    it("should include preferences", () => {
      const profileWithPrefs = createCalorieProfile({
        ...testProfile,
        showNetWorkoutCalories: true,
      });
      
      expect(profileWithPrefs.preferences?.showNetWorkoutCalories).toBe(true);
    });

    it("should default showNetWorkoutCalories to false", () => {
      const profile = createCalorieProfile(testProfile);
      
      expect(profile.preferences?.showNetWorkoutCalories).toBe(false);
    });

    it("should create profiles for all activity levels", () => {
      const activityLevels = ["sedentary", "light", "moderate", "very_active", "extra_active"] as const;
      
      activityLevels.forEach((level) => {
        const profile = createCalorieProfile({
          ...testProfile,
          activityLevel: level,
        });
        
        expect(profile.activityLevel).toBe(level);
        expect(profile.activityFactor).toBe(ACTIVITY_FACTORS[level]);
        expect(profile.tdeeNoWorkoutKcalDay).toBeGreaterThan(0);
      });
    });
  });
});
