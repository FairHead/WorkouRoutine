/**
 * Register Screen
 * 
 * Registrierungsbildschirm mit E-Mail, Passwort und Name.
 * Nach erfolgreicher Registrierung wird zum Profil-Onboarding weitergeleitet.
 */

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/theme";
import { registerWithEmail } from "@/src/services/auth.service";
import { useUserStore } from "@/src/stores/user.store";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/src/config/firebase.config";

export default function RegisterScreen() {
  const { syncWithFirebaseUser, updateUser } = useUserStore();
  
  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Username Availability
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
  const usernameCheckTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check username availability with debounce
  useEffect(() => {
    // Clear previous timeout
    if (usernameCheckTimeout.current) {
      clearTimeout(usernameCheckTimeout.current);
    }
    
    // Reset availability status when username changes
    setIsUsernameAvailable(null);
    
    // Validate format first
    const isFormatValid = /^[a-zA-Z0-9_]{3,20}$/.test(username);
    if (!isFormatValid || username.length < 3) {
      return;
    }
    
    // Debounce the check
    setIsCheckingUsername(true);
    usernameCheckTimeout.current = setTimeout(async () => {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", username));
        const querySnapshot = await getDocs(q);
        
        setIsUsernameAvailable(querySnapshot.empty);
      } catch {
        // Bei Permission-Fehler (User noch nicht eingeloggt): 
        // Username-Check überspringen, wird beim Speichern validiert
        // Wir markieren als "format valid" aber zeigen keinen grünen Haken
        setIsUsernameAvailable(null);
      } finally {
        setIsCheckingUsername(false);
      }
    }, 500);
    
    return () => {
      if (usernameCheckTimeout.current) {
        clearTimeout(usernameCheckTimeout.current);
      }
    };
  }, [username]);

  // Validation
  const isFirstNameValid = firstName.trim().length >= 2;
  const isLastNameValid = lastName.trim().length >= 2;
  const isUsernameFormatValid = /^[a-zA-Z0-9_]{3,20}$/.test(username);
  // Username ist gültig wenn Format OK und nicht explizit als vergeben markiert
  const isUsernameValid = isUsernameFormatValid && isUsernameAvailable !== false;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid = password.length >= 6;
  const doPasswordsMatch = password === confirmPassword;
  const canSubmit =
    isFirstNameValid &&
    isLastNameValid &&
    isUsernameValid &&
    isEmailValid &&
    isPasswordValid &&
    doPasswordsMatch &&
    !isLoading &&
    !isCheckingUsername;

  // Password Strength Indicator
  const getPasswordStrength = (): { level: number; text: string; color: string } => {
    if (password.length === 0) return { level: 0, text: "", color: "#666" };
    if (password.length < 6) return { level: 1, text: "Zu kurz", color: "#ff6b6b" };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 1) return { level: 2, text: "Schwach", color: "#ffa500" };
    if (strength === 2) return { level: 3, text: "Mittel", color: "#ffd700" };
    if (strength >= 3) return { level: 4, text: "Stark", color: "#4ade80" };
    
    return { level: 2, text: "Schwach", color: "#ffa500" };
  };

  const passwordStrength = getPasswordStrength();

  const handleRegister = async () => {
    if (!canSubmit) return;

    setIsLoading(true);
    setError(null);

    const displayName = `${firstName.trim()} ${lastName.trim()}`;

    try {
      const result = await registerWithEmail(email, password, displayName);

      if (result.success && result.user) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // User Store mit Firebase User synchronisieren
        syncWithFirebaseUser(result.user, displayName);
        
        // Zusätzliche User-Daten speichern
        updateUser({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          username: username.trim(),
        });
        
        // Weiter zum Onboarding für Profildaten
        router.replace("/onboarding");
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError(result.error || "Registrierung fehlgeschlagen.");
      }
    } catch {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError("Ein unerwarteter Fehler ist aufgetreten.");
    } finally {
      setIsLoading(false);
    }
  };

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
        {/* Header */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(600)}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.dark.text} />
          </TouchableOpacity>
        </Animated.View>

        {/* Title Section */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(600)}
          style={styles.titleSection}
        >
          <Text style={styles.title}>Konto erstellen</Text>
          <Text style={styles.subtitle}>
            Starte deine Fitness-Reise mit WorkoutRoutine.
          </Text>
        </Animated.View>

        {/* Error Message */}
        {error && (
          <Animated.View
            entering={FadeInDown.duration(300)}
            style={styles.errorContainer}
          >
            <Ionicons name="alert-circle" size={20} color="#ff6b6b" />
            <Text style={styles.errorText}>{error}</Text>
          </Animated.View>
        )}

        {/* Form */}
        <Animated.View
          entering={FadeInUp.delay(300).duration(600)}
          style={styles.form}
        >
          {/* Name Row - Vorname und Nachname nebeneinander */}
          <View style={styles.nameRow}>
            {/* Vorname */}
            <View style={[styles.inputGroup, styles.halfInput]}>
              <Text style={styles.inputLabel}>Vorname</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Max"
                  placeholderTextColor="#666"
                  value={firstName}
                  onChangeText={(text) => {
                    setFirstName(text);
                    setError(null);
                  }}
                  autoCapitalize="words"
                  editable={!isLoading}
                />
                {firstName.length > 0 && (
                  <Ionicons
                    name={isFirstNameValid ? "checkmark-circle" : "close-circle"}
                    size={20}
                    color={isFirstNameValid ? "#4ade80" : "#888"}
                  />
                )}
              </View>
            </View>

            {/* Nachname */}
            <View style={[styles.inputGroup, styles.halfInput]}>
              <Text style={styles.inputLabel}>Nachname</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Mustermann"
                  placeholderTextColor="#666"
                  value={lastName}
                  onChangeText={(text) => {
                    setLastName(text);
                    setError(null);
                  }}
                  autoCapitalize="words"
                  editable={!isLoading}
                />
                {lastName.length > 0 && (
                  <Ionicons
                    name={isLastNameValid ? "checkmark-circle" : "close-circle"}
                    size={20}
                    color={isLastNameValid ? "#4ade80" : "#888"}
                  />
                )}
              </View>
            </View>
          </View>

          {/* Username Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Benutzername</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="at-outline"
                size={20}
                color="#888"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="MaxMustermann123"
                placeholderTextColor="#666"
                value={username}
                onChangeText={(text) => {
                  // Nur erlaubte Zeichen: Buchstaben, Zahlen, Unterstrich
                  const filtered = text.replace(/[^a-zA-Z0-9_]/g, '');
                  setUsername(filtered);
                  setError(null);
                }}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
                textContentType="none"
                spellCheck={false}
                editable={!isLoading}
                maxLength={20}
              />
              {username.length > 0 && (
                isCheckingUsername ? (
                  <ActivityIndicator size="small" color="#888" />
                ) : (
                  <Ionicons
                    name={
                      isUsernameAvailable === false 
                        ? "close-circle"
                        : isUsernameFormatValid 
                          ? "checkmark-circle" 
                          : "close-circle"
                    }
                    size={20}
                    color={
                      isUsernameAvailable === false 
                        ? "#ff6b6b"
                        : isUsernameFormatValid 
                          ? "#4ade80" 
                          : "#888"
                    }
                  />
                )
              )}
            </View>
            {username.length > 0 && !isUsernameFormatValid && (
              <Text style={styles.inputHint}>3-20 Zeichen, nur Buchstaben, Zahlen und _</Text>
            )}
            {username.length >= 3 && isUsernameFormatValid && isUsernameAvailable === false && (
              <Text style={[styles.inputHint, styles.errorHint]}>Dieser Benutzername ist bereits vergeben</Text>
            )}
            {username.length >= 3 && isUsernameFormatValid && isUsernameAvailable === true && (
              <Text style={[styles.inputHint, styles.successHint]}>Benutzername ist verfügbar ✓</Text>
            )}
          </View>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>E-Mail</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={20}
                color="#888"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="deine@email.de"
                placeholderTextColor="#666"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError(null);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              {email.length > 0 && (
                <Ionicons
                  name={isEmailValid ? "checkmark-circle" : "close-circle"}
                  size={20}
                  color={isEmailValid ? "#4ade80" : "#888"}
                />
              )}
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Passwort</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#888"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Mindestens 6 Zeichen"
                placeholderTextColor="#666"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setError(null);
                }}
                secureTextEntry={!showPassword}
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#888"
                />
              </TouchableOpacity>
            </View>
            
            {/* Password Strength Indicator */}
            {password.length > 0 && (
              <View style={styles.passwordStrength}>
                <View style={styles.strengthBars}>
                  {[1, 2, 3, 4].map((level) => (
                    <View
                      key={level}
                      style={[
                        styles.strengthBar,
                        {
                          backgroundColor:
                            level <= passwordStrength.level
                              ? passwordStrength.color
                              : "#333",
                        },
                      ]}
                    />
                  ))}
                </View>
                <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
                  {passwordStrength.text}
                </Text>
              </View>
            )}
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Passwort bestätigen</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#888"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Passwort wiederholen"
                placeholderTextColor="#666"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setError(null);
                }}
                secureTextEntry={!showPassword}
                editable={!isLoading}
              />
              {confirmPassword.length > 0 && (
                <Ionicons
                  name={doPasswordsMatch ? "checkmark-circle" : "close-circle"}
                  size={20}
                  color={doPasswordsMatch ? "#4ade80" : "#ff6b6b"}
                />
              )}
            </View>
            {confirmPassword.length > 0 && !doPasswordsMatch && (
              <Text style={styles.mismatchText}>Passwörter stimmen nicht überein</Text>
            )}
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.registerButton, !canSubmit && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={!canSubmit}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.registerButtonText}>Registrieren</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Login Link */}
        <Animated.View
          entering={FadeInUp.delay(500).duration(600)}
          style={styles.loginSection}
        >
          <Text style={styles.loginText}>Bereits ein Konto?</Text>
          <TouchableOpacity onPress={() => router.push("/auth/login")}>
            <Text style={styles.loginLink}>Jetzt anmelden</Text>
          </TouchableOpacity>
        </Animated.View>
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
    paddingBottom: 40,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  titleSection: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.dark.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#888",
    lineHeight: 24,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.2)",
  },
  errorText: {
    flex: 1,
    color: "#ff6b6b",
    fontSize: 14,
  },
  form: {
    gap: 20,
  },
  nameRow: {
    flexDirection: "row",
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    color: "#888",
    fontWeight: "500",
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#333",
  },
  inputIcon: {
    marginRight: 12,
  },
  inputHint: {
    fontSize: 12,
    color: "#888",
    marginLeft: 4,
    marginTop: 4,
  },
  errorHint: {
    color: "#ff6b6b",
  },
  successHint: {
    color: "#4ade80",
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: Colors.dark.text,
  },
  passwordStrength: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  strengthBars: {
    flexDirection: "row",
    gap: 4,
    flex: 1,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: "500",
    minWidth: 60,
    textAlign: "right",
  },
  mismatchText: {
    color: "#ff6b6b",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  registerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.dark.accent,
    paddingVertical: 18,
    borderRadius: 14,
    marginTop: 12,
    shadowColor: Colors.dark.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  registerButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  loginSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: "auto",
    paddingTop: 32,
  },
  loginText: {
    color: "#888",
    fontSize: 15,
  },
  loginLink: {
    color: Colors.dark.accent,
    fontSize: 15,
    fontWeight: "600",
  },
});
