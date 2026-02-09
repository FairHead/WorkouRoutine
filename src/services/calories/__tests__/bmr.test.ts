/**
 * Unit Tests für BMR-Berechnung
 * 
 * Testet die Mifflin-St Jeor Formel mit den exakten Werten aus der Spezifikation
 */

import { calcBmr, validateBmrInputs } from "../bmr";

describe("BMR Calculations", () => {
  // Test-Profil aus der Spezifikation
  const testProfile = {
    sex: "male" as const,
    ageYears: 32,
    heightCm: 171,
    weightKg: 84,
  };

  describe("calcBmr", () => {
    it("should calculate BMR correctly for male (Mifflin-St Jeor)", () => {
      // BMR = 10*84 + 6.25*171 - 5*32 + 5
      // BMR = 840 + 1068.75 - 160 + 5 = 1753.75
      const bmr = calcBmr(testProfile);
      expect(bmr).toBeCloseTo(1753.75, 2);
    });

    it("should calculate BMR correctly for female", () => {
      const femaleProfile = {
        ...testProfile,
        sex: "female" as const,
      };
      
      // BMR = 10*84 + 6.25*171 - 5*32 - 161
      // BMR = 840 + 1068.75 - 160 - 161 = 1587.75
      const bmr = calcBmr(femaleProfile);
      expect(bmr).toBeCloseTo(1587.75, 2);
    });

    it("should handle different weights correctly", () => {
      const heavierProfile = {
        ...testProfile,
        weightKg: 100,
      };
      
      // BMR = 10*100 + 6.25*171 - 5*32 + 5
      // BMR = 1000 + 1068.75 - 160 + 5 = 1913.75
      const bmr = calcBmr(heavierProfile);
      expect(bmr).toBeCloseTo(1913.75, 2);
    });

    it("should handle different heights correctly", () => {
      const tallerProfile = {
        ...testProfile,
        heightCm: 190,
      };
      
      // BMR = 10*84 + 6.25*190 - 5*32 + 5
      // BMR = 840 + 1187.5 - 160 + 5 = 1872.5
      const bmr = calcBmr(tallerProfile);
      expect(bmr).toBeCloseTo(1872.5, 2);
    });

    it("should handle different ages correctly", () => {
      const youngerProfile = {
        ...testProfile,
        ageYears: 25,
      };
      
      // BMR = 10*84 + 6.25*171 - 5*25 + 5
      // BMR = 840 + 1068.75 - 125 + 5 = 1788.75
      const bmr = calcBmr(youngerProfile);
      expect(bmr).toBeCloseTo(1788.75, 2);
    });
  });

  describe("validateBmrInputs", () => {
    it("should accept valid inputs", () => {
      expect(() => validateBmrInputs(testProfile)).not.toThrow();
    });

    it("should reject age below minimum", () => {
      const invalidProfile = { ...testProfile, ageYears: 5 };
      expect(() => validateBmrInputs(invalidProfile)).toThrow("Ungültiges Alter");
    });

    it("should reject age above maximum", () => {
      const invalidProfile = { ...testProfile, ageYears: 150 };
      expect(() => validateBmrInputs(invalidProfile)).toThrow("Ungültiges Alter");
    });

    it("should reject height below minimum", () => {
      const invalidProfile = { ...testProfile, heightCm: 100 };
      expect(() => validateBmrInputs(invalidProfile)).toThrow("Ungültige Größe");
    });

    it("should reject height above maximum", () => {
      const invalidProfile = { ...testProfile, heightCm: 250 };
      expect(() => validateBmrInputs(invalidProfile)).toThrow("Ungültige Größe");
    });

    it("should reject weight below minimum", () => {
      const invalidProfile = { ...testProfile, weightKg: 20 };
      expect(() => validateBmrInputs(invalidProfile)).toThrow("Ungültiges Gewicht");
    });

    it("should reject weight above maximum", () => {
      const invalidProfile = { ...testProfile, weightKg: 300 };
      expect(() => validateBmrInputs(invalidProfile)).toThrow("Ungültiges Gewicht");
    });

    it("should accept edge case values", () => {
      const edgeProfile = {
        ageYears: 10,
        heightCm: 120,
        weightKg: 30,
      };
      expect(() => validateBmrInputs(edgeProfile)).not.toThrow();
    });
  });
});
