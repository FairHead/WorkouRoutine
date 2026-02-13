/**
 * Profil Tab - Hauptseite für Profil und Einstellungen
 * 
 * Enthält:
 * - Benutzerprofil
 * - Körperdaten für Kalorienberechnung
 * - App-Einstellungen
 * - Logout
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useUserStore } from "@/src/stores/user.store";
import { logout } from "@/src/services/auth.service";
import { ProfileImagePicker } from "@/components/profile-image-picker";
import { Colors, Fonts } from "@/constants/theme";
import {
  createCalorieProfile,
  saveCalorieProfile,
  type ActivityLevel,
} from "@/src/services/calories";

export default function ProfileTabScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const { user, updateUser, clearUser, settings, updateSettings, isAuthenticated } = useUserStore();
  
  // Editing states
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    displayName: user?.displayName || "",
    email: user?.email || "",
    weight: user?.weightKg?.toString() || "",
    height: user?.heightCm?.toString() || "",
    age: user?.age?.toString() || "",
    gender: user?.gender,
    activityLevel: user?.activityLevel,
    fitnessGoal: user?.fitnessGoal,
  });
  
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Sync editData when user changes
  useEffect(() => {
    if (user) {
      setEditData({
        displayName: user.displayName || "",
        email: user.email || "",
        weight: user.weightKg?.toString() || "",
        height: user.heightCm?.toString() || "",
        age: user.age?.toString() || "",
        gender: user.gender,
        activityLevel: user.activityLevel,
        fitnessGoal: user.fitnessGoal,
      });
    }
  }, [user]);

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
      default: return "light";
    }
  };

  const handleSave = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    const weightNum = editData.weight ? parseFloat(editData.weight) : undefined;
    const heightNum = editData.height ? parseFloat(editData.height) : undefined;
    const ageNum = editData.age ? parseInt(editData.age, 10) : undefined;
    
    // 1. UserStore aktualisieren
    updateUser({
      displayName: editData.displayName.trim() || "Benutzer",
      email: editData.email.trim() || undefined,
      weightKg: weightNum,
      heightCm: heightNum,
      age: ageNum,
      gender: editData.gender,
      activityLevel: editData.activityLevel,
      fitnessGoal: editData.fitnessGoal,
    });

    // 2. CalorieProfile erstellen wenn Körperdaten vorhanden
    if (weightNum && heightNum && ageNum && editData.gender && editData.activityLevel) {
      try {
        const sex = editData.gender === "male" ? "male" : "female";
        const activityLevel = mapActivityLevel(editData.activityLevel);
        
        const calorieProfile = createCalorieProfile({
          sex,
          ageYears: ageNum,
          heightCm: heightNum,
          weightKg: weightNum,
          activityLevel,
        });
        
        await saveCalorieProfile(calorieProfile);
      } catch (error) {
        console.error("Error creating calorie profile:", error);
      }
    }
    
    setIsEditing(false);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      clearUser();
      setShowLogoutModal(false);
      router.replace("/auth" as Href);
    } catch (error: any) {
      Alert.alert("Logout fehlgeschlagen", error.message);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const genderOptions = [
    { value: "male", label: "Männlich", icon: "male" },
    { value: "female", label: "Weiblich", icon: "female" },
    { value: "other", label: "Divers", icon: "person" },
  ];

  const activityLevelOptions = [
    { value: "sedentary", label: "Wenig aktiv", desc: "Bürojob, wenig Bewegung" },
    { value: "light", label: "Leicht aktiv", desc: "1-2 Workouts/Woche" },
    { value: "moderate", label: "Moderat aktiv", desc: "3-4 Workouts/Woche" },
    { value: "active", label: "Sehr aktiv", desc: "5-6 Workouts/Woche" },
    { value: "very_active", label: "Extrem aktiv", desc: "Täglich intensiv" },
  ];

  const fitnessGoalOptions = [
    { value: "lose_weight", label: "Abnehmen", icon: "trending-down" },
    { value: "maintain", label: "Halten", icon: "swap-horizontal" },
    { value: "build_muscle", label: "Muskelaufbau", icon: "trending-up" },
    { value: "improve_fitness", label: "Fitness", icon: "fitness" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Profil
        </Text>
        <TouchableOpacity
          onPress={() => {
            if (isEditing) {
              handleSave();
            } else {
              setIsEditing(true);
            }
          }}
        >
          <Text style={[styles.headerAction, { color: colors.accent }]}>
            {isEditing ? "Speichern" : "Bearbeiten"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.profileHeader}>
            <ProfileImagePicker
              imageUrl={user?.avatarUrl}
              displayName={user?.displayName}
              onImageSelected={(url: string) => updateUser({ avatarUrl: url })}
              size={80}
              isEditing={isEditing}
            />
            <View style={styles.profileInfo}>
              {isEditing ? (
                <TextInput
                  style={[styles.nameInput, { color: colors.text, borderColor: colors.border }]}
                  value={editData.displayName}
                  onChangeText={(text) => setEditData({ ...editData, displayName: text })}
                  placeholder="Dein Name"
                  placeholderTextColor={colors.textSecondary}
                />
              ) : (
                <Text style={[styles.profileName, { color: colors.text }]}>
                  {user?.displayName || "Benutzer"}
                </Text>
              )}
              <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
                {user?.email || "Keine E-Mail"}
              </Text>
            </View>
          </View>
        </View>

        {/* Body Data Card */}
        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Körperdaten
          </Text>
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
            Für präzise Kalorienberechnung
          </Text>

          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                Gewicht (kg)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border,
                  }
                ]}
                value={editData.weight}
                onChangeText={(text) => setEditData({ ...editData, weight: text })}
                placeholder="75"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                editable={isEditing}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                Größe (cm)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border,
                  }
                ]}
                value={editData.height}
                onChangeText={(text) => setEditData({ ...editData, height: text })}
                placeholder="175"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                editable={isEditing}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                Alter
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border,
                  }
                ]}
                value={editData.age}
                onChangeText={(text) => setEditData({ ...editData, age: text })}
                placeholder="30"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                editable={isEditing}
              />
            </View>
          </View>

          {/* Gender Selection */}
          <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 16 }]}>
            Geschlecht
          </Text>
          <View style={styles.optionRow}>
            {genderOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  { 
                    backgroundColor: editData.gender === option.value 
                      ? colors.accent 
                      : colors.background,
                    borderColor: colors.border,
                  }
                ]}
                onPress={() => isEditing && setEditData({ ...editData, gender: option.value as any })}
                disabled={!isEditing}
              >
                <Ionicons
                  name={option.icon as any}
                  size={20}
                  color={editData.gender === option.value ? "#fff" : colors.textSecondary}
                />
                <Text style={[
                  styles.optionText,
                  { color: editData.gender === option.value ? "#fff" : colors.text }
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Activity Level Card */}
        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Aktivitätslevel
          </Text>
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
            Dein durchschnittliches Aktivitätsniveau
          </Text>

          {activityLevelOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.listOption,
                { 
                  backgroundColor: editData.activityLevel === option.value 
                    ? colors.accent + "15" 
                    : "transparent",
                  borderColor: editData.activityLevel === option.value 
                    ? colors.accent 
                    : colors.border,
                }
              ]}
              onPress={() => isEditing && setEditData({ ...editData, activityLevel: option.value as any })}
              disabled={!isEditing}
            >
              <View style={styles.listOptionContent}>
                <Text style={[
                  styles.listOptionLabel,
                  { color: editData.activityLevel === option.value ? colors.accent : colors.text }
                ]}>
                  {option.label}
                </Text>
                <Text style={[styles.listOptionDesc, { color: colors.textSecondary }]}>
                  {option.desc}
                </Text>
              </View>
              {editData.activityLevel === option.value && (
                <Ionicons name="checkmark-circle" size={24} color={colors.accent} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Fitness Goal Card */}
        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Fitnessziel
          </Text>

          <View style={styles.goalGrid}>
            {fitnessGoalOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.goalButton,
                  { 
                    backgroundColor: editData.fitnessGoal === option.value 
                      ? colors.accent 
                      : colors.background,
                    borderColor: colors.border,
                  }
                ]}
                onPress={() => isEditing && setEditData({ ...editData, fitnessGoal: option.value as any })}
                disabled={!isEditing}
              >
                <Ionicons
                  name={option.icon as any}
                  size={24}
                  color={editData.fitnessGoal === option.value ? "#fff" : colors.textSecondary}
                />
                <Text style={[
                  styles.goalText,
                  { color: editData.fitnessGoal === option.value ? "#fff" : colors.text }
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Settings Card */}
        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Einstellungen
          </Text>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => updateSettings({ hapticFeedback: !settings.hapticFeedback })}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="hand-left-outline" size={22} color={colors.accent} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Haptisches Feedback
              </Text>
            </View>
            <View style={[
              styles.toggle,
              { backgroundColor: settings.hapticFeedback ? colors.accent : colors.border }
            ]}>
              <View style={[
                styles.toggleKnob,
                { transform: [{ translateX: settings.hapticFeedback ? 20 : 0 }] }
              ]} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => updateSettings({ notificationsEnabled: !settings.notificationsEnabled })}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={22} color={colors.accent} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Benachrichtigungen
              </Text>
            </View>
            <View style={[
              styles.toggle,
              { backgroundColor: settings.notificationsEnabled ? colors.accent : colors.border }
            ]}>
              <View style={[
                styles.toggleKnob,
                { transform: [{ translateX: settings.notificationsEnabled ? 20 : 0 }] }
              ]} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        {isAuthenticated && (
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: "#EF444420" }]}
            onPress={() => setShowLogoutModal(true)}
          >
            <Ionicons name="log-out-outline" size={22} color="#EF4444" />
            <Text style={styles.logoutText}>Abmelden</Text>
          </TouchableOpacity>
        )}

        {/* Version Info */}
        <Text style={[styles.versionText, { color: colors.textSecondary }]}>
          WorkoutRoutine v1.0.0
        </Text>

        {/* Spacer */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            <Ionicons name="log-out-outline" size={48} color="#EF4444" />
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Abmelden?
            </Text>
            <Text style={[styles.modalText, { color: colors.textSecondary }]}>
              Möchtest du dich wirklich abmelden?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.background }]}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                  Abbrechen
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#EF4444" }]}
                onPress={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={[styles.modalButtonText, { color: "#fff" }]}>
                    Abmelden
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: Fonts.bold,
  },
  headerAction: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontFamily: Fonts.semiBold,
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    marginTop: 4,
  },
  nameInput: {
    fontSize: 22,
    fontFamily: Fonts.semiBold,
    borderBottomWidth: 1,
    paddingBottom: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: Fonts.semiBold,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    fontFamily: Fonts.regular,
  },
  optionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  optionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
  },
  listOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 8,
  },
  listOptionContent: {
    flex: 1,
  },
  listOptionLabel: {
    fontSize: 15,
    fontFamily: Fonts.medium,
  },
  listOptionDesc: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    marginTop: 2,
  },
  goalGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
  },
  goalButton: {
    width: "48%",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  goalText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontFamily: Fonts.regular,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 2,
  },
  toggleKnob: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#fff",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  logoutText: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: "#EF4444",
  },
  versionText: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    textAlign: "center",
    marginTop: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 320,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    marginTop: 16,
  },
  modalText: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
  },
});
