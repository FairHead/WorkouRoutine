/**
 * Onboarding/Profil-Setup Seite
 * 
 * Wird nach erfolgreicher Registrierung angezeigt.
 * Erfasst Körperdaten und Fitness-Ziele für personalisierte Erfahrung.
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useUserStore } from "@/src/stores/user.store";
import { Colors } from "@/constants/theme";
import {
  createCalorieProfile,
  saveCalorieProfile,
  type ActivityLevel,
} from "@/src/services/calories";

const { width } = Dimensions.get("window");

/**
 * Onboarding Screen - Profil-Setup nach Registrierung
 */
export default function OnboardingScreen() {
  const { user, createUser } = useUserStore();
  
  // Form State
  const [step, setStep] = useState(1);
  
  // Körperdaten
  const [gender, setGender] = useState<"male" | "female" | "other" | undefined>();
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  
  // Fitness-Ziele
  const [activityLevel, setActivityLevel] = useState<"sedentary" | "light" | "moderate" | "active" | "very_active" | undefined>();
  const [fitnessGoal, setFitnessGoal] = useState<"lose_weight" | "maintain" | "build_muscle" | "improve_fitness" | undefined>();

  const totalSteps = 2;

  const handleNext = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step > 1) {
      setStep(step - 1);
    }
  };

  /**
   * Mappt UserStore ActivityLevel auf CalorieService ActivityLevel
   */
  const mapActivityLevel = (
    level: "sedentary" | "light" | "moderate" | "active" | "very_active" | undefined
  ): ActivityLevel => {
    switch (level) {
      case "sedentary": return "sedentary";
      case "light": return "light";
      case "moderate": return "moderate";
      case "active": return "very_active";
      case "very_active": return "extra_active";
      default: return "light"; // Default fallback
    }
  };

  const handleComplete = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // 1. UserStore aktualisieren
    createUser({
      displayName: user?.displayName || "Benutzer",
      email: user?.email,
      gender,
      weightKg: weight ? parseFloat(weight) : undefined,
      heightCm: height ? parseFloat(height) : undefined,
      age: age ? parseInt(age, 10) : undefined,
      activityLevel,
      fitnessGoal,
    });

    // 2. CalorieProfile erstellen wenn alle Daten vorhanden
    const weightNum = weight ? parseFloat(weight) : null;
    const heightNum = height ? parseFloat(height) : null;
    const ageNum = age ? parseInt(age, 10) : null;
    
    if (weightNum && heightNum && ageNum && gender && gender !== "other" && activityLevel) {
      try {
        const calorieProfile = createCalorieProfile({
          sex: gender as "male" | "female",
          ageYears: ageNum,
          heightCm: heightNum,
          weightKg: weightNum,
          activityLevel: mapActivityLevel(activityLevel),
        });
        await saveCalorieProfile(calorieProfile);
        console.log("✅ CalorieProfile erstellt:", {
          bmr: Math.round(calorieProfile.bmrKcalDay),
          tdee: Math.round(calorieProfile.tdeeNoWorkoutKcalDay),
        });
      } catch (error) {
        console.error("Fehler beim Erstellen des CalorieProfile:", error);
      }
    }

    router.replace("/(tabs)");
  };

  const handleSkip = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    createUser({
      displayName: user?.displayName || "Benutzer",
      email: user?.email,
    });
    router.replace("/(tabs)");
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      {Array.from({ length: totalSteps }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.progressDot,
            i + 1 <= step && styles.progressDotActive,
          ]}
        />
      ))}
    </View>
  );

  const renderStep1 = () => (
    <Animated.View 
      entering={FadeInDown.delay(100).duration(500)}
      style={styles.stepContent}
    >
      <View style={styles.welcomeIcon}>
        <Ionicons name="body-outline" size={48} color={Colors.dark.accent} />
      </View>
      <Text style={styles.stepTitle}>Körperdaten 📊</Text>
      <Text style={styles.stepSubtitle}>
        Diese Daten helfen uns, deine Kalorienverbrennung genau zu berechnen. Du kannst sie später jederzeit anpassen.
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Geschlecht</Text>
        <View style={styles.genderButtons}>
          <TouchableOpacity
            style={[
              styles.genderButton,
              gender === "male" && styles.genderButtonActive,
            ]}
            onPress={() => setGender("male")}
          >
            <Ionicons
              name="male"
              size={24}
              color={gender === "male" ? "#fff" : Colors.dark.text}
            />
            <Text
              style={[
                styles.genderButtonText,
                gender === "male" && styles.genderButtonTextActive,
              ]}
            >
              Männlich
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.genderButton,
              gender === "female" && styles.genderButtonActive,
            ]}
            onPress={() => setGender("female")}
          >
            <Ionicons
              name="female"
              size={24}
              color={gender === "female" ? "#fff" : Colors.dark.text}
            />
            <Text
              style={[
                styles.genderButtonText,
                gender === "female" && styles.genderButtonTextActive,
              ]}
            >
              Weiblich
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.genderButton,
              gender === "other" && styles.genderButtonActive,
            ]}
            onPress={() => setGender("other")}
          >
            <Ionicons
              name="person"
              size={24}
              color={gender === "other" ? "#fff" : Colors.dark.text}
            />
            <Text
              style={[
                styles.genderButtonText,
                gender === "other" && styles.genderButtonTextActive,
              ]}
            >
              Andere
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.rowInputs}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.inputLabel}>Gewicht (kg)</Text>
          <TextInput
            style={styles.input}
            placeholder="z.B. 75"
            placeholderTextColor="#666"
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.inputLabel}>Größe (cm)</Text>
          <TextInput
            style={styles.input}
            placeholder="z.B. 175"
            placeholderTextColor="#666"
            value={height}
            onChangeText={setHeight}
            keyboardType="number-pad"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Alter</Text>
        <TextInput
          style={styles.input}
          placeholder="z.B. 28"
          placeholderTextColor="#666"
          value={age}
          onChangeText={setAge}
          keyboardType="number-pad"
        />
      </View>
    </Animated.View>
  );

  const renderStep2 = () => (
    <Animated.View 
      entering={FadeInDown.delay(100).duration(500)}
      style={styles.stepContent}
    >
      <View style={styles.welcomeIcon}>
        <Ionicons name="trophy-outline" size={48} color={Colors.dark.accent} />
      </View>
      <Text style={styles.stepTitle}>Deine Ziele 🎯</Text>
      <Text style={styles.stepSubtitle}>
        Hilft uns, dein Training zu personalisieren und passende Empfehlungen zu geben.
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Aktivitätslevel</Text>
        <View style={styles.optionList}>
          {[
            { value: "sedentary", label: "Kaum aktiv", icon: "bed-outline", desc: "Bürojob, wenig Bewegung" },
            { value: "light", label: "Leicht aktiv", icon: "walk-outline", desc: "Gelegentliche Spaziergänge" },
            { value: "moderate", label: "Moderat aktiv", icon: "bicycle-outline", desc: "Regelmäßige Bewegung" },
            { value: "active", label: "Sehr aktiv", icon: "fitness-outline", desc: "Tägliches Training" },
            { value: "very_active", label: "Extrem aktiv", icon: "flame-outline", desc: "Intensives Training, körperliche Arbeit" },
          ].map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                activityLevel === option.value && styles.optionButtonActive,
              ]}
              onPress={() => setActivityLevel(option.value as any)}
            >
              <Ionicons
                name={option.icon as any}
                size={22}
                color={activityLevel === option.value ? "#fff" : Colors.dark.text}
              />
              <View style={styles.optionTextContainer}>
                <Text
                  style={[
                    styles.optionButtonText,
                    activityLevel === option.value && styles.optionButtonTextActive,
                  ]}
                >
                  {option.label}
                </Text>
                <Text
                  style={[
                    styles.optionDesc,
                    activityLevel === option.value && styles.optionDescActive,
                  ]}
                >
                  {option.desc}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Fitnessziel</Text>
        <View style={styles.goalGrid}>
          {[
            { value: "lose_weight", label: "Abnehmen", icon: "trending-down-outline" },
            { value: "maintain", label: "Gewicht halten", icon: "swap-horizontal-outline" },
            { value: "build_muscle", label: "Muskeln aufbauen", icon: "barbell-outline" },
            { value: "improve_fitness", label: "Fitter werden", icon: "heart-outline" },
          ].map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.goalButton,
                fitnessGoal === option.value && styles.goalButtonActive,
              ]}
              onPress={() => setFitnessGoal(option.value as any)}
            >
              <Ionicons
                name={option.icon as any}
                size={28}
                color={fitnessGoal === option.value ? "#fff" : Colors.dark.text}
              />
              <Text
                style={[
                  styles.goalButtonText,
                  fitnessGoal === option.value && styles.goalButtonTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Animated.View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Header */}
        <Animated.View 
          entering={FadeInUp.duration(600)}
          style={styles.welcomeHeader}
        >
          <Text style={styles.welcomeTitle}>
            Hallo{user?.displayName ? `, ${user.displayName}` : ""}! 👋
          </Text>
          <Text style={styles.welcomeSubtitle}>
            Lass uns dein Profil vervollständigen.
          </Text>
        </Animated.View>

        {renderProgressBar()}

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}

        <View style={styles.buttonContainer}>
          {step > 1 && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
            >
              <Ionicons name="arrow-back" size={20} color={Colors.dark.text} />
              <Text style={styles.backButtonText}>Zurück</Text>
            </TouchableOpacity>
          )}

          {step === 1 && (
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
            >
              <Text style={styles.skipButtonText}>Überspringen</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>
              {step === totalSteps ? "Fertig" : "Weiter"}
            </Text>
            <Ionicons
              name={step === totalSteps ? "checkmark" : "arrow-forward"}
              size={20}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  welcomeHeader: {
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.dark.text,
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#888",
  },
  welcomeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(92, 119, 186, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 24,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 32,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#333",
  },
  progressDotActive: {
    backgroundColor: Colors.dark.accent,
    width: 24,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.dark.text,
    marginBottom: 8,
    textAlign: "center",
  },
  stepSubtitle: {
    fontSize: 15,
    color: "#888",
    marginBottom: 28,
    textAlign: "center",
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: "#888",
    marginBottom: 10,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.dark.text,
    borderWidth: 1,
    borderColor: "#333",
  },
  rowInputs: {
    flexDirection: "row",
  },
  genderButtons: {
    flexDirection: "row",
    gap: 12,
  },
  genderButton: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#333",
  },
  genderButtonActive: {
    backgroundColor: Colors.dark.accent,
    borderColor: Colors.dark.accent,
  },
  genderButtonText: {
    color: Colors.dark.text,
    fontSize: 12,
    fontWeight: "500",
  },
  genderButtonTextActive: {
    color: "#fff",
  },
  optionList: {
    gap: 10,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#333",
  },
  optionButtonActive: {
    backgroundColor: Colors.dark.accent,
    borderColor: Colors.dark.accent,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionButtonText: {
    color: Colors.dark.text,
    fontSize: 15,
    fontWeight: "500",
  },
  optionButtonTextActive: {
    color: "#fff",
  },
  optionDesc: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  optionDescActive: {
    color: "rgba(255,255,255,0.7)",
  },
  goalGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  goalButton: {
    width: (width - 60) / 2,
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#333",
  },
  goalButtonActive: {
    backgroundColor: Colors.dark.accent,
    borderColor: Colors.dark.accent,
  },
  goalButtonText: {
    color: Colors.dark.text,
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
  },
  goalButtonTextActive: {
    color: "#fff",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 32,
    gap: 12,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  backButtonText: {
    color: Colors.dark.text,
    fontSize: 16,
  },
  skipButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  skipButtonText: {
    color: "#888",
    fontSize: 16,
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.dark.accent,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginLeft: "auto",
    shadowColor: Colors.dark.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
