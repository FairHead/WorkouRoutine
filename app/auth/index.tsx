/**
 * Auth Welcome Screen
 * 
 * Willkommensbildschirm mit Optionen für Login und Registrierung.
 * Modernes Design passend zur App-Ästhetik.
 */

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import { Colors } from "@/constants/theme";

const { height } = Dimensions.get("window");

export default function AuthWelcomeScreen() {
  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <View style={styles.backgroundGradient}>
        <View style={styles.gradientCircle1} />
        <View style={styles.gradientCircle2} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Logo / Icon Section */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(800)}
          style={styles.logoSection}
        >
          <View style={styles.logoContainer}>
            <Ionicons name="fitness" size={64} color="#fff" />
          </View>
          <Text style={styles.appName}>WorkoutRoutine</Text>
          <Text style={styles.tagline}>Dein persönlicher Fitness-Begleiter</Text>
        </Animated.View>

        {/* Features Preview */}
        <Animated.View
          entering={FadeIn.delay(600).duration(800)}
          style={styles.featuresSection}
        >
          {[
            { icon: "barbell-outline", text: "Personalisierte Workouts" },
            { icon: "flame-outline", text: "Kalorientracking" },
            { icon: "sparkles-outline", text: "KI-gestützte Empfehlungen" },
          ].map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Ionicons
                  name={feature.icon as any}
                  size={20}
                  color={Colors.dark.accent}
                />
              </View>
              <Text style={styles.featureText}>{feature.text}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View
          entering={FadeInUp.delay(800).duration(800)}
          style={styles.buttonSection}
        >
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push("/auth/register")}
            activeOpacity={0.8}
          >
            <Ionicons name="person-add-outline" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Registrieren</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push("/auth/login")}
            activeOpacity={0.8}
          >
            <Ionicons name="log-in-outline" size={20} color={Colors.dark.text} />
            <Text style={styles.secondaryButtonText}>Anmelden</Text>
          </TouchableOpacity>

          <Text style={styles.termsText}>
            Mit der Registrierung stimmst du unseren{" "}
            <Text style={styles.termsLink}>Nutzungsbedingungen</Text> und{" "}
            <Text style={styles.termsLink}>Datenschutzrichtlinien</Text> zu.
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradientCircle1: {
    position: "absolute",
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Colors.dark.accent,
    opacity: 0.15,
  },
  gradientCircle2: {
    position: "absolute",
    bottom: 100,
    left: -150,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: Colors.dark.accent,
    opacity: 0.08,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: height * 0.12,
    paddingBottom: 40,
    justifyContent: "space-between",
  },
  logoSection: {
    alignItems: "center",
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: Colors.dark.accent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: Colors.dark.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  appName: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.dark.text,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
  },
  featuresSection: {
    gap: 16,
    paddingVertical: 32,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(92, 119, 186, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    fontSize: 16,
    color: Colors.dark.text,
    fontWeight: "500",
  },
  buttonSection: {
    gap: 12,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: Colors.dark.accent,
    paddingVertical: 18,
    borderRadius: 14,
    shadowColor: Colors.dark.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingVertical: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  secondaryButtonText: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: "600",
  },
  termsText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    lineHeight: 18,
    marginTop: 16,
  },
  termsLink: {
    color: Colors.dark.accent,
  },
});
