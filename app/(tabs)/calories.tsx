/**
 * Kalorien-Tracking Seite
 * 
 * Zeigt detaillierte Übersicht über:
 * - Täglicher Kalorienverbrauch (TDEE)
 * - Workout-Kalorien
 * - Übungs-Kalorien
 * - Konsumierte Kalorien
 * - Netto-Bilanz
 */

import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, type Href } from "expo-router";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors, Fonts } from "@/constants/theme";
import {
  getCalorieProfile,
  getDailyBurn,
  saveConsumedCalories,
  deleteConsumedCalories,
  deleteExerciseBurn,
  type DailyBurn,
  type ConsumedCalories,
} from "@/src/services/calories";

export default function CaloriesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [dailyBurn, setDailyBurn] = useState<DailyBurn | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Modal State für Kalorien-Eingabe
  const [showAddModal, setShowAddModal] = useState(false);
  const [calorieInput, setCalorieInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");

  // Datum-Navigation
  const [selectedDate, setSelectedDate] = useState(new Date());
  const currentDateString = selectedDate.toISOString().split("T")[0];

  const loadDailyBurn = useCallback(async () => {
    try {
      setLoading(true);
      
      const profile = await getCalorieProfile();
      setHasProfile(profile !== null);
      
      const burn = await getDailyBurn(currentDateString);
      setDailyBurn(burn);
    } catch (error) {
      console.error("Error loading daily burn:", error);
    } finally {
      setLoading(false);
    }
  }, [currentDateString]);

  useEffect(() => {
    loadDailyBurn();
  }, [loadDailyBurn]);

  const handleAddConsumedCalories = useCallback(async () => {
    const calories = parseInt(calorieInput, 10);
    if (isNaN(calories) || calories <= 0) {
      Alert.alert("Fehler", "Bitte gib eine gültige Kalorienzahl ein.");
      return;
    }

    const now = new Date();
    const consumed: ConsumedCalories = {
      id: `consumed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date: currentDateString,
      consumedAt: now.toISOString(),
      description: descriptionInput.trim() || "Mahlzeit",
      calories,
    };

    try {
      await saveConsumedCalories(consumed);
      setShowAddModal(false);
      setCalorieInput("");
      setDescriptionInput("");
      await loadDailyBurn();
    } catch (error) {
      console.error("Error saving consumed calories:", error);
      Alert.alert("Fehler", "Kalorien konnten nicht gespeichert werden.");
    }
  }, [calorieInput, descriptionInput, currentDateString, loadDailyBurn]);

  const handleDeleteConsumed = useCallback(async (consumedId: string) => {
    Alert.alert(
      "Löschen",
      "Möchtest du diesen Eintrag wirklich löschen?",
      [
        { text: "Abbrechen", style: "cancel" },
        {
          text: "Löschen",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteConsumedCalories(consumedId);
              await loadDailyBurn();
            } catch (error) {
              console.error("Error deleting consumed calories:", error);
            }
          },
        },
      ]
    );
  }, [loadDailyBurn]);

  const handleDeleteExerciseBurn = useCallback(async (burnId: string) => {
    Alert.alert(
      "Löschen",
      "Möchtest du diese Übungs-Kalorien wirklich löschen?",
      [
        { text: "Abbrechen", style: "cancel" },
        {
          text: "Löschen",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteExerciseBurn(burnId);
              await loadDailyBurn();
            } catch (error) {
              console.error("Error deleting exercise burn:", error);
            }
          },
        },
      ]
    );
  }, [loadDailyBurn]);

  const navigateDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    // Nicht in die Zukunft navigieren
    if (newDate <= new Date()) {
      setSelectedDate(newDate);
    }
  };

  const isToday = currentDateString === new Date().toISOString().split("T")[0];

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </View>
    );
  }

  // Kein Profil angelegt
  if (!hasProfile) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Kalorien
          </Text>
        </View>
        <View style={styles.setupContainer}>
          <View style={[styles.setupCard, { backgroundColor: colors.cardBackground }]}>
            <Ionicons name="body-outline" size={64} color={colors.accent} />
            <Text style={[styles.setupTitle, { color: colors.text }]}>
              Kalorien-Tracking einrichten
            </Text>
            <Text style={[styles.setupText, { color: colors.textSecondary }]}>
              Füge deine Körperdaten im Profil hinzu, um deinen Kalorienverbrauch zu berechnen und zu tracken.
            </Text>
            <TouchableOpacity
              style={[styles.setupButton, { backgroundColor: colors.accent }]}
              onPress={() => router.push("/profile" as Href)}
            >
              <Ionicons name="person" size={20} color="#fff" />
              <Text style={styles.setupButtonText}>Profil öffnen</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (!dailyBurn) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>
            Fehler beim Laden der Daten
          </Text>
        </View>
      </View>
    );
  }

  const {
    tdeeNoWorkout,
    workoutCalories,
    exerciseCalories,
    consumedCalories: totalConsumed,
    totalBurn,
    netCalories,
    sessions,
    exerciseBurns,
    consumedItems,
  } = dailyBurn;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Kalorien
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Date Navigator */}
        <View style={[styles.dateNav, { backgroundColor: colors.cardBackground }]}>
          <TouchableOpacity
            style={styles.dateNavButton}
            onPress={() => navigateDate(-1)}
          >
            <Ionicons name="chevron-back" size={24} color={colors.accent} />
          </TouchableOpacity>
          <View style={styles.dateNavCenter}>
            <Text style={[styles.dateNavTitle, { color: colors.text }]}>
              {formatDate(currentDateString)}
            </Text>
            {!isToday && (
              <TouchableOpacity onPress={() => setSelectedDate(new Date())}>
                <Text style={[styles.todayLink, { color: colors.accent }]}>
                  Heute
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[styles.dateNavButton, { opacity: isToday ? 0.3 : 1 }]}
            onPress={() => navigateDate(1)}
            disabled={isToday}
          >
            <Ionicons name="chevron-forward" size={24} color={colors.accent} />
          </TouchableOpacity>
        </View>

        {/* Summary Card */}
        <View style={[styles.summaryCard, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.summaryHeader}>
            <Text style={[styles.summaryTitle, { color: colors.text }]}>
              Tagesbilanz
            </Text>
          </View>

          {/* Net Calories - Big Display */}
          <View style={styles.netCaloriesContainer}>
            <Text style={[
              styles.netCaloriesValue,
              { color: netCalories >= 0 ? "#10B981" : "#EF4444" }
            ]}>
              {netCalories >= 0 ? "+" : ""}{formatCalories(netCalories)}
            </Text>
            <Text style={[styles.netCaloriesLabel, { color: colors.textSecondary }]}>
              Netto kcal
            </Text>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={[styles.statBox, { backgroundColor: colors.background }]}>
              <Ionicons name="flame-outline" size={24} color={colors.accent} />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {formatCalories(tdeeNoWorkout)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                TDEE
              </Text>
            </View>

            <View style={[styles.statBox, { backgroundColor: colors.background }]}>
              <Ionicons name="fitness-outline" size={24} color="#10B981" />
              <Text style={[styles.statValue, { color: colors.text }]}>
                +{formatCalories(workoutCalories + exerciseCalories)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Training
              </Text>
            </View>

            <View style={[styles.statBox, { backgroundColor: colors.background }]}>
              <Ionicons name="restaurant-outline" size={24} color="#F59E0B" />
              <Text style={[styles.statValue, { color: colors.text }]}>
                -{formatCalories(totalConsumed)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Gegessen
              </Text>
            </View>
          </View>

          {/* Total Row */}
          <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>
              Gesamtverbrauch
            </Text>
            <Text style={[styles.totalValue, { color: colors.accent }]}>
              {formatCalories(totalBurn)} kcal
            </Text>
          </View>
        </View>

        {/* Detail Sections */}
        {sessions.length > 0 && (
          <View style={[styles.detailSection, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="fitness" size={20} color="#10B981" />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Workouts ({sessions.length})
              </Text>
            </View>
            {sessions.map((session) => (
              <View key={session.id} style={styles.detailItem}>
                <View style={styles.detailItemLeft}>
                  <Text style={[styles.detailTime, { color: colors.textSecondary }]}>
                    {formatTime(session.startTime)}
                  </Text>
                  <Text style={[styles.detailName, { color: colors.text }]}>
                    {session.workoutType || "Workout"} • {session.durationMinutes} min
                  </Text>
                </View>
                <Text style={[styles.detailCalories, { color: "#10B981" }]}>
                  +{formatCalories(session.calories)} kcal
                </Text>
              </View>
            ))}
          </View>
        )}

        {exerciseBurns.length > 0 && (
          <View style={[styles.detailSection, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="barbell" size={20} color="#8B5CF6" />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Übungen ({exerciseBurns.length})
              </Text>
            </View>
            {exerciseBurns.map((burn) => (
              <TouchableOpacity
                key={burn.id}
                style={styles.detailItem}
                onLongPress={() => handleDeleteExerciseBurn(burn.id)}
              >
                <View style={styles.detailItemLeft}>
                  <Text style={[styles.detailTime, { color: colors.textSecondary }]}>
                    {formatTime(burn.completedAt)}
                  </Text>
                  <Text style={[styles.detailName, { color: colors.text }]}>
                    {burn.exerciseName}
                  </Text>
                  <Text style={[styles.detailMeta, { color: colors.textSecondary }]}>
                    {burn.sets} Sets • {burn.weight > 0 ? `${burn.weight}kg` : "Körpergewicht"}
                  </Text>
                </View>
                <Text style={[styles.detailCalories, { color: "#8B5CF6" }]}>
                  +{formatCalories(burn.calories)} kcal
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {consumedItems.length > 0 && (
          <View style={[styles.detailSection, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="restaurant" size={20} color="#F59E0B" />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Mahlzeiten ({consumedItems.length})
              </Text>
            </View>
            {consumedItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.detailItem}
                onLongPress={() => handleDeleteConsumed(item.id)}
              >
                <View style={styles.detailItemLeft}>
                  <Text style={[styles.detailTime, { color: colors.textSecondary }]}>
                    {formatTime(item.consumedAt)}
                  </Text>
                  <Text style={[styles.detailName, { color: colors.text }]}>
                    {item.description}
                  </Text>
                </View>
                <Text style={[styles.detailCalories, { color: "#F59E0B" }]}>
                  -{formatCalories(item.calories)} kcal
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Empty State for no activities */}
        {sessions.length === 0 && exerciseBurns.length === 0 && consumedItems.length === 0 && (
          <View style={[styles.emptyState, { backgroundColor: colors.cardBackground }]}>
            <Ionicons name="calendar-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Keine Aktivitäten für diesen Tag
            </Text>
          </View>
        )}

        {/* Spacer for FAB */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB - Add Calories */}
      <TouchableOpacity
        style={[
          styles.fab,
          { backgroundColor: colors.accent, bottom: 20 },
        ]}
        onPress={() => setShowAddModal(true)}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Add Calories Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Kalorien hinzufügen
            </Text>
            
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              Beschreibung (optional)
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
              placeholder="z.B. Mittagessen, Snack..."
              placeholderTextColor={colors.textSecondary}
              value={descriptionInput}
              onChangeText={setDescriptionInput}
            />
            
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              Kalorien (kcal)
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
              placeholder="z.B. 500"
              placeholderTextColor={colors.textSecondary}
              value={calorieInput}
              onChangeText={setCalorieInput}
              keyboardType="numeric"
              autoFocus
            />
            
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowAddModal(false);
                  setCalorieInput("");
                  setDescriptionInput("");
                }}
              >
                <Text style={styles.cancelButtonText}>Abbrechen</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.confirmButton, { backgroundColor: colors.accent }]}
                onPress={handleAddConsumedCalories}
              >
                <Text style={styles.confirmButtonText}>Hinzufügen</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Helper functions
function formatCalories(calories: number): string {
  return Math.round(calories).toLocaleString("de-DE");
}

function formatDate(dateString: string): string {
  const date = new Date(dateString + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((today.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Heute";
  if (diffDays === 1) return "Gestern";
  if (diffDays === -1) return "Morgen";

  return date.toLocaleDateString("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: Fonts.bold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  setupContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  setupCard: {
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
  },
  setupTitle: {
    fontSize: 22,
    fontFamily: Fonts.semiBold,
    marginTop: 20,
    marginBottom: 12,
    textAlign: "center",
  },
  setupText: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  setupButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  setupButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: Fonts.semiBold,
  },
  errorText: {
    fontSize: 16,
    fontFamily: Fonts.regular,
  },
  dateNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  dateNavButton: {
    padding: 8,
  },
  dateNavCenter: {
    alignItems: "center",
  },
  dateNavTitle: {
    fontSize: 18,
    fontFamily: Fonts.semiBold,
  },
  todayLink: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    marginTop: 4,
  },
  summaryCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  summaryHeader: {
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontFamily: Fonts.semiBold,
  },
  netCaloriesContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  netCaloriesValue: {
    fontSize: 48,
    fontFamily: Fonts.bold,
  },
  netCaloriesLabel: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
  },
  statValue: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    marginTop: 4,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
  },
  totalValue: {
    fontSize: 20,
    fontFamily: Fonts.bold,
  },
  detailSection: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  detailItemLeft: {
    flex: 1,
  },
  detailTime: {
    fontSize: 12,
    fontFamily: Fonts.regular,
  },
  detailName: {
    fontSize: 15,
    fontFamily: Fonts.medium,
    marginTop: 2,
  },
  detailMeta: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    marginTop: 2,
  },
  detailCalories: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    marginLeft: 12,
  },
  emptyState: {
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    marginTop: 12,
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    marginBottom: 20,
    textAlign: "center",
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    fontFamily: Fonts.regular,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: "#666",
  },
  confirmButton: {},
  confirmButtonText: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: "#fff",
  },
});
