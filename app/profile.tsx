/**
 * Profil-Seite
 * 
 * Zeigt Benutzerprofil und ermöglicht Bearbeitung.
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
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useUserStore } from "@/hooks/use-user-store";
import { Colors } from "@/constants/theme";
import { 
  createCalorieProfile, 
  saveCalorieProfile,
  getCalorieProfile,
  type CalorieUserProfile,
  ACTIVITY_LEVEL_DESCRIPTIONS,
  type ActivityLevel,
} from "@/src/services/calories";

export default function ProfileScreen() {
  const { user, updateUser, clearUser, settings, updateSettings } = useUserStore();
  
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
  const [calorieProfile, setCalorieProfile] = useState<CalorieUserProfile | null>(null);
  const [loadingCalories, setLoadingCalories] = useState(false);

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

  // Load calorie profile
  useEffect(() => {
    loadCalorieProfile();
  }, [user]);

  const loadCalorieProfile = async () => {
    try {
      const profile = await getCalorieProfile();
      setCalorieProfile(profile);
    } catch (error) {
      console.error("Error loading calorie profile:", error);
    }
  };

  const syncCalorieProfile = async () => {
    if (!user?.weightKg || !user?.heightCm || !user?.age || !user?.gender) {
      Alert.alert(
        "Fehlende Daten",
        "Bitte fülle alle Körperdaten aus (Gewicht, Größe, Alter, Geschlecht) um dein Kalorienprofil zu erstellen."
      );
      return;
    }

    // Map activity level - handle "active" by mapping to "very_active"
    let mappedActivityLevel: ActivityLevel = "sedentary";
    if (user.activityLevel === "active") {
      mappedActivityLevel = "very_active";
    } else if (user.activityLevel && ["sedentary", "light", "moderate", "very_active", "extra_active"].includes(user.activityLevel)) {
      mappedActivityLevel = user.activityLevel as ActivityLevel;
    }

    setLoadingCalories(true);
    try {
      const profile = createCalorieProfile({
        sex: user.gender === "male" ? "male" : "female",
        ageYears: user.age,
        heightCm: user.heightCm,
        weightKg: user.weightKg,
        activityLevel: mappedActivityLevel,
      });

      await saveCalorieProfile(profile);
      setCalorieProfile(profile);
      
      Alert.alert(
        "Erfolg! ✅",
        `Dein Kalorienprofil wurde aktualisiert.\n\nGrundumsatz (BMR): ${Math.round(profile.bmrKcalDay)} kcal/Tag\nGesamtverbrauch (TDEE): ${Math.round(profile.tdeeNoWorkoutKcalDay)} kcal/Tag`
      );
    } catch (error) {
      console.error("Error syncing calorie profile:", error);
      Alert.alert("Fehler", "Kalorienprofil konnte nicht gespeichert werden.");
    } finally {
      setLoadingCalories(false);
    }
  };

  const handleSave = () => {
    updateUser({
      displayName: editData.displayName.trim() || "Benutzer",
      email: editData.email.trim() || undefined,
      weightKg: editData.weight ? parseFloat(editData.weight) : undefined,
      heightCm: editData.height ? parseFloat(editData.height) : undefined,
      age: editData.age ? parseInt(editData.age, 10) : undefined,
      gender: editData.gender,
      activityLevel: editData.activityLevel,
      fitnessGoal: editData.fitnessGoal,
    });
    setIsEditing(false);
    
    // Auto-sync calorie profile if all required fields are filled
    setTimeout(() => {
      if (editData.weight && editData.height && editData.age && editData.gender) {
        syncCalorieProfile();
      }
    }, 100);
  };

  const handleLogout = () => {
    clearUser();
    router.replace("/onboarding");
  };

  const renderProfileHeader = () => (
    <View style={styles.profileHeader}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user?.displayName || "B")[0].toUpperCase()}
          </Text>
        </View>
        {isEditing && (
          <TouchableOpacity style={styles.avatarEditButton}>
            <Ionicons name="camera" size={16} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
      
      {isEditing ? (
        <TextInput
          style={styles.nameInput}
          value={editData.displayName}
          onChangeText={(text) => setEditData({ ...editData, displayName: text })}
          placeholder="Dein Name"
          placeholderTextColor="#888"
        />
      ) : (
        <Text style={styles.profileName}>{user?.displayName}</Text>
      )}
      
      {!isEditing && user?.email && (
        <Text style={styles.profileEmail}>{user.email}</Text>
      )}
    </View>
  );

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );

  const renderInfoRow = (
    icon: string,
    label: string,
    value: string | undefined,
    editKey?: keyof typeof editData,
    keyboardType: "default" | "decimal-pad" | "number-pad" | "email-address" = "default"
  ) => (
    <View style={styles.infoRow}>
      <View style={styles.infoRowLeft}>
        <Ionicons name={icon as any} size={20} color="#888" />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      {isEditing && editKey ? (
        <TextInput
          style={styles.infoInput}
          value={editData[editKey]?.toString() || ""}
          onChangeText={(text) => setEditData({ ...editData, [editKey]: text })}
          placeholder="-"
          placeholderTextColor="#666"
          keyboardType={keyboardType}
        />
      ) : (
        <Text style={styles.infoValue}>{value || "-"}</Text>
      )}
    </View>
  );

  const renderGenderSelector = () => (
    <View style={styles.infoRow}>
      <View style={styles.infoRowLeft}>
        <Ionicons name="person-outline" size={20} color="#888" />
        <Text style={styles.infoLabel}>Geschlecht</Text>
      </View>
      {isEditing ? (
        <View style={styles.genderPills}>
          {[
            { value: "male" as const, label: "M" },
            { value: "female" as const, label: "W" },
            { value: "other" as const, label: "X" },
          ].map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.genderPill,
                editData.gender === option.value && styles.genderPillActive,
              ]}
              onPress={() => setEditData({ ...editData, gender: option.value })}
            >
              <Text
                style={[
                  styles.genderPillText,
                  editData.gender === option.value && styles.genderPillTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <Text style={styles.infoValue}>
          {editData.gender === "male" ? "Männlich" : 
           editData.gender === "female" ? "Weiblich" : 
           editData.gender === "other" ? "Andere" : "-"}
        </Text>
      )}
    </View>
  );

  const renderActivitySelector = () => (
    <View style={[styles.infoRow, { flexDirection: "column", alignItems: "flex-start" }]}>
      <View style={[styles.infoRowLeft, { marginBottom: isEditing ? 12 : 0 }]}>
        <Ionicons name="fitness-outline" size={20} color="#888" />
        <Text style={styles.infoLabel}>Aktivitätslevel</Text>
      </View>
      {isEditing ? (
        <View style={styles.activityOptions}>
          {[
            { value: "sedentary" as const, label: "Kaum aktiv" },
            { value: "light" as const, label: "Leicht" },
            { value: "moderate" as const, label: "Moderat" },
            { value: "active" as const, label: "Aktiv" },
            { value: "very_active" as const, label: "Sehr aktiv" },
          ].map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.activityPill,
                editData.activityLevel === option.value && styles.activityPillActive,
              ]}
              onPress={() => setEditData({ ...editData, activityLevel: option.value })}
            >
              <Text
                style={[
                  styles.activityPillText,
                  editData.activityLevel === option.value && styles.activityPillTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <Text style={[styles.infoValue, { marginLeft: 32 }]}>
          {editData.activityLevel === "sedentary" ? "Kaum aktiv" :
           editData.activityLevel === "light" ? "Leicht aktiv" :
           editData.activityLevel === "moderate" ? "Moderat aktiv" :
           editData.activityLevel === "active" ? "Sehr aktiv" :
           editData.activityLevel === "very_active" ? "Extrem aktiv" : "-"}
        </Text>
      )}
    </View>
  );

  const renderFitnessGoalSelector = () => (
    <View style={[styles.infoRow, { flexDirection: "column", alignItems: "flex-start" }]}>
      <View style={[styles.infoRowLeft, { marginBottom: isEditing ? 12 : 0 }]}>
        <Ionicons name="trophy-outline" size={20} color="#888" />
        <Text style={styles.infoLabel}>Fitnessziel</Text>
      </View>
      {isEditing ? (
        <View style={styles.activityOptions}>
          {[
            { value: "lose_weight" as const, label: "Abnehmen" },
            { value: "maintain" as const, label: "Halten" },
            { value: "build_muscle" as const, label: "Aufbauen" },
            { value: "improve_fitness" as const, label: "Fitter" },
          ].map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.activityPill,
                editData.fitnessGoal === option.value && styles.activityPillActive,
              ]}
              onPress={() => setEditData({ ...editData, fitnessGoal: option.value })}
            >
              <Text
                style={[
                  styles.activityPillText,
                  editData.fitnessGoal === option.value && styles.activityPillTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <Text style={[styles.infoValue, { marginLeft: 32 }]}>
          {editData.fitnessGoal === "lose_weight" ? "Abnehmen" :
           editData.fitnessGoal === "maintain" ? "Gewicht halten" :
           editData.fitnessGoal === "build_muscle" ? "Muskeln aufbauen" :
           editData.fitnessGoal === "improve_fitness" ? "Fitter werden" : "-"}
        </Text>
      )}
    </View>
  );

  const renderSettings = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Einstellungen</Text>
      <View style={styles.sectionContent}>
        <TouchableOpacity
          style={styles.settingsRow}
          onPress={() => updateSettings({ hapticFeedback: !settings.hapticFeedback })}
        >
          <View style={styles.infoRowLeft}>
            <Ionicons name="phone-portrait-outline" size={20} color="#888" />
            <Text style={styles.infoLabel}>Haptisches Feedback</Text>
          </View>
          <Ionicons
            name={settings.hapticFeedback ? "checkmark-circle" : "ellipse-outline"}
            size={24}
            color={settings.hapticFeedback ? Colors.dark.accent : "#666"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingsRow}
          onPress={() => updateSettings({ notificationsEnabled: !settings.notificationsEnabled })}
        >
          <View style={styles.infoRowLeft}>
            <Ionicons name="notifications-outline" size={20} color="#888" />
            <Text style={styles.infoLabel}>Benachrichtigungen</Text>
          </View>
          <Ionicons
            name={settings.notificationsEnabled ? "checkmark-circle" : "ellipse-outline"}
            size={24}
            color={settings.notificationsEnabled ? Colors.dark.accent : "#666"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderLogoutModal = () => (
    <Modal
      visible={showLogoutModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowLogoutModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Ionicons name="warning-outline" size={48} color="#ff6b6b" />
          <Text style={styles.modalTitle}>Abmelden?</Text>
          <Text style={styles.modalText}>
            Alle lokalen Daten werden gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.
          </Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowLogoutModal(false)}
            >
              <Text style={styles.modalCancelText}>Abbrechen</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalConfirmButton}
              onPress={handleLogout}
            >
              <Text style={styles.modalConfirmText}>Abmelden</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.dark.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil</Text>
        <TouchableOpacity
          onPress={() => isEditing ? handleSave() : setIsEditing(true)}
          style={styles.editButton}
        >
          <Text style={styles.editButtonText}>
            {isEditing ? "Speichern" : "Bearbeiten"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderProfileHeader()}

        {renderSection("Körperdaten", (
          <>
            {renderInfoRow("scale-outline", "Gewicht", user?.weightKg ? `${user.weightKg} kg` : undefined, "weight", "decimal-pad")}
            {renderInfoRow("resize-outline", "Größe", user?.heightCm ? `${user.heightCm} cm` : undefined, "height", "number-pad")}
            {renderInfoRow("calendar-outline", "Alter", user?.age?.toString(), "age", "number-pad")}
            {renderGenderSelector()}
          </>
        ))}

        {renderSection("Fitness", (
          <>
            {renderActivitySelector()}
            {renderFitnessGoalSelector()}
          </>
        ))}

        {/* Calorie Profile Section */}
        {calorieProfile && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Kalorienverbrauch</Text>
              <TouchableOpacity
                onPress={syncCalorieProfile}
                disabled={loadingCalories}
                style={styles.syncButton}
              >
                <Ionicons 
                  name={loadingCalories ? "hourglass-outline" : "sync-outline"} 
                  size={16} 
                  color={Colors.dark.accent} 
                />
                <Text style={[styles.syncText, { color: Colors.dark.accent }]}>
                  {loadingCalories ? "Aktualisiere..." : "Neu berechnen"}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.sectionContent}>
              <View style={styles.calorieCard}>
                <View style={styles.calorieRow}>
                  <View style={styles.calorieItem}>
                    <Ionicons name="flame-outline" size={24} color="#ff6b6b" />
                    <Text style={styles.calorieValue}>
                      {Math.round(calorieProfile.bmrKcalDay)}
                    </Text>
                    <Text style={styles.calorieLabel}>BMR (kcal/Tag)</Text>
                    <Text style={styles.calorieDescription}>Grundumsatz</Text>
                  </View>
                  <View style={styles.calorieItem}>
                    <Ionicons name="trending-up-outline" size={24} color={Colors.dark.accent} />
                    <Text style={styles.calorieValue}>
                      {Math.round(calorieProfile.tdeeNoWorkoutKcalDay)}
                    </Text>
                    <Text style={styles.calorieLabel}>TDEE (kcal/Tag)</Text>
                    <Text style={styles.calorieDescription}>Tagesverbrauch</Text>
                  </View>
                </View>
                <View style={styles.calorieInfo}>
                  <Ionicons name="information-circle-outline" size={16} color="#888" />
                  <Text style={styles.calorieInfoText}>
                    TDEE = Täglicher Kalorienverbrauch ohne Workouts. 
                    Workout-Kalorien werden separat getrackt.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {!calorieProfile && user?.weightKg && user?.heightCm && user?.age && user?.gender && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Kalorienverbrauch</Text>
            <View style={styles.sectionContent}>
              <TouchableOpacity
                style={styles.setupCalorieButton}
                onPress={syncCalorieProfile}
                disabled={loadingCalories}
              >
                <Ionicons name="calculator-outline" size={24} color={Colors.dark.accent} />
                <Text style={[styles.setupCalorieText, { color: Colors.dark.text }]}>
                  {loadingCalories ? "Berechne..." : "Kalorienprofil erstellen"}
                </Text>
                <Text style={styles.setupCalorieHint}>
                  Berechne deinen täglichen Kalorienverbrauch
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {renderSettings()}

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => setShowLogoutModal(true)}
        >
          <Ionicons name="log-out-outline" size={20} color="#ff6b6b" />
          <Text style={styles.logoutButtonText}>Abmelden</Text>
        </TouchableOpacity>

        {user?.createdAt && (
          <Text style={styles.memberSince}>
            Mitglied seit {new Date(user.createdAt).toLocaleDateString("de-DE", {
              month: "long",
              year: "numeric",
            })}
          </Text>
        )}
      </ScrollView>

      {renderLogoutModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.dark.text,
  },
  editButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  editButtonText: {
    color: Colors.dark.accent,
    fontSize: 16,
    fontWeight: "500",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 32,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.dark.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#fff",
  },
  avatarEditButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#333",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: Colors.dark.background,
  },
  nameInput: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.dark.text,
    textAlign: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 200,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.dark.text,
  },
  profileEmail: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#888",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    overflow: "hidden",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  infoRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoLabel: {
    fontSize: 16,
    color: Colors.dark.text,
  },
  infoValue: {
    fontSize: 16,
    color: "#888",
  },
  infoInput: {
    fontSize: 16,
    color: Colors.dark.text,
    backgroundColor: "#222",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 80,
    textAlign: "right",
  },
  genderPills: {
    flexDirection: "row",
    gap: 8,
  },
  genderPill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#222",
    alignItems: "center",
    justifyContent: "center",
  },
  genderPillActive: {
    backgroundColor: Colors.dark.accent,
  },
  genderPillText: {
    color: "#888",
    fontWeight: "600",
  },
  genderPillTextActive: {
    color: "#fff",
  },
  activityOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    width: "100%",
  },
  activityPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "#222",
  },
  activityPillActive: {
    backgroundColor: Colors.dark.accent,
  },
  activityPillText: {
    color: "#888",
    fontSize: 13,
  },
  activityPillTextActive: {
    color: "#fff",
    fontWeight: "500",
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    marginTop: 16,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
  },
  logoutButtonText: {
    color: "#ff6b6b",
    fontSize: 16,
    fontWeight: "500",
  },
  memberSince: {
    textAlign: "center",
    color: "#666",
    fontSize: 12,
    marginTop: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    width: "100%",
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.dark.text,
    marginTop: 16,
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#333",
    alignItems: "center",
  },
  modalCancelText: {
    color: Colors.dark.text,
    fontWeight: "500",
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#ff6b6b",
    alignItems: "center",
  },
  modalConfirmText: {
    color: "#fff",
    fontWeight: "600",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  syncButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#1a1a1a",
  },
  syncText: {
    fontSize: 13,
    fontWeight: "500",
  },
  calorieCard: {
    padding: 20,
  },
  calorieRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  calorieItem: {
    alignItems: "center",
    gap: 8,
  },
  calorieValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.dark.text,
  },
  calorieLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  calorieDescription: {
    fontSize: 11,
    color: "#666",
  },
  calorieInfo: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#222",
  },
  calorieInfoText: {
    flex: 1,
    fontSize: 12,
    color: "#888",
    lineHeight: 18,
  },
  setupCalorieButton: {
    padding: 20,
    alignItems: "center",
    gap: 8,
  },
  setupCalorieText: {
    fontSize: 16,
    fontWeight: "600",
  },
  setupCalorieHint: {
    fontSize: 13,
    color: "#888",
  },
});
