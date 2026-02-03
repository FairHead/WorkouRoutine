/**
 * Onboarding/Registrierungsseite
 * 
 * Wird beim ersten App-Start angezeigt.
 * Erfasst Benutzerdaten und optionale Körperdaten.
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
import { useUserStore } from "@/hooks/use-user-store";
import { Colors } from "@/constants/theme";

const { width } = Dimensions.get("window");

/**
 * Onboarding Screen mit Schritt-für-Schritt Registrierung
 */
export default function OnboardingScreen() {
  const { createUser } = useUserStore();
  
  // Form State
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  
  // Körperdaten (optional)
  const [gender, setGender] = useState<"male" | "female" | "other" | undefined>();
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  
  // Fitness-Ziele (optional)
  const [activityLevel, setActivityLevel] = useState<"sedentary" | "light" | "moderate" | "active" | "very_active" | undefined>();
  const [fitnessGoal, setFitnessGoal] = useState<"lose_weight" | "maintain" | "build_muscle" | "improve_fitness" | undefined>();

  const totalSteps = 3;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = () => {
    createUser({
      displayName: displayName.trim() || "Benutzer",
      email: email.trim() || undefined,
      gender,
      weightKg: weight ? parseFloat(weight) : undefined,
      heightCm: height ? parseFloat(height) : undefined,
      age: age ? parseInt(age, 10) : undefined,
      activityLevel,
      fitnessGoal,
    });

    router.replace("/(tabs)");
  };

  const handleSkip = () => {
    createUser({
      displayName: "Benutzer",
    });
    router.replace("/(tabs)");
  };

  const canProceed = () => {
    if (step === 1) {
      return displayName.trim().length > 0;
    }
    return true; // Andere Schritte sind optional
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
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Willkommen! 👋</Text>
      <Text style={styles.stepSubtitle}>
        Erstelle dein Profil, um loszulegen.
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Dein Name"
          placeholderTextColor="#888"
          value={displayName}
          onChangeText={setDisplayName}
          autoCapitalize="words"
          autoFocus
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>E-Mail (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="deine@email.de"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Körperdaten 📊</Text>
      <Text style={styles.stepSubtitle}>
        Für genauere Kalorienberechnungen. Du kannst alles überspringen.
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
            placeholderTextColor="#888"
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
            placeholderTextColor="#888"
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
          placeholderTextColor="#888"
          value={age}
          onChangeText={setAge}
          keyboardType="number-pad"
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Deine Ziele 🎯</Text>
      <Text style={styles.stepSubtitle}>
        Hilft uns, dein Training zu personalisieren.
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Aktivitätslevel</Text>
        <View style={styles.optionList}>
          {[
            { value: "sedentary", label: "Kaum aktiv", icon: "bed-outline" },
            { value: "light", label: "Leicht aktiv", icon: "walk-outline" },
            { value: "moderate", label: "Moderat aktiv", icon: "bicycle-outline" },
            { value: "active", label: "Sehr aktiv", icon: "fitness-outline" },
            { value: "very_active", label: "Extrem aktiv", icon: "flame-outline" },
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
                size={20}
                color={activityLevel === option.value ? "#fff" : Colors.dark.text}
              />
              <Text
                style={[
                  styles.optionButtonText,
                  activityLevel === option.value && styles.optionButtonTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Fitnessziel</Text>
        <View style={styles.optionList}>
          {[
            { value: "lose_weight", label: "Abnehmen", icon: "trending-down-outline" },
            { value: "maintain", label: "Gewicht halten", icon: "swap-horizontal-outline" },
            { value: "build_muscle", label: "Muskeln aufbauen", icon: "barbell-outline" },
            { value: "improve_fitness", label: "Fitter werden", icon: "heart-outline" },
          ].map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                fitnessGoal === option.value && styles.optionButtonActive,
              ]}
              onPress={() => setFitnessGoal(option.value as any)}
            >
              <Ionicons
                name={option.icon as any}
                size={20}
                color={fitnessGoal === option.value ? "#fff" : Colors.dark.text}
              />
              <Text
                style={[
                  styles.optionButtonText,
                  fitnessGoal === option.value && styles.optionButtonTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
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
        {renderProgressBar()}

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

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
            style={[
              styles.nextButton,
              !canProceed() && styles.nextButtonDisabled,
            ]}
            onPress={handleNext}
            disabled={!canProceed()}
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
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 40,
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
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.dark.text,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: "#888",
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: "#888",
    marginBottom: 8,
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
    gap: 8,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
  optionButtonText: {
    color: Colors.dark.text,
    fontSize: 15,
  },
  optionButtonTextActive: {
    color: "#fff",
    fontWeight: "500",
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
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
