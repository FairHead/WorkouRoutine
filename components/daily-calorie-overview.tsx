/**
 * Daily Calorie Overview Component
 * 
 * Zeigt täglichen Kalorienverbrauch:
 * - TDEE (ohne Workouts)
 * - Workout-Kalorien
 * - Übungs-Kalorien (einzelne Übungen)
 * - Konsumierte Kalorien (Essen)
 * - Netto-Kalorien
 * - Gesamtverbrauch
 */

import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
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

interface DailyCalorieOverviewProps {
  date?: string; // YYYY-MM-DD, default: heute
  onPress?: () => void;
}

export function DailyCalorieOverview({ date, onPress }: DailyCalorieOverviewProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  
  const [dailyBurn, setDailyBurn] = useState<DailyBurn | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Modal State für Kalorien-Eingabe
  const [showAddModal, setShowAddModal] = useState(false);
  const [calorieInput, setCalorieInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  // Aktuelles Datum im Format YYYY-MM-DD
  const currentDate = date || new Date().toISOString().split("T")[0];

  const loadDailyBurn = useCallback(async () => {
    try {
      setLoading(true);
      
      // Prüfe ob Profil existiert
      const profile = await getCalorieProfile();
      setHasProfile(profile !== null);
      
      // Lade Tagesübersicht
      const burn = await getDailyBurn(currentDate);
      setDailyBurn(burn);
    } catch (error) {
      console.error("Error loading daily burn:", error);
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

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
      date: currentDate,
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
  }, [calorieInput, descriptionInput, currentDate, loadDailyBurn]);

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

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.cardBackground }]}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  // Kein Profil angelegt
  if (!hasProfile) {
    return (
      <TouchableOpacity
        style={[styles.container, { backgroundColor: colors.cardBackground }]}
        onPress={onPress}
      >
        <View style={styles.setupPrompt}>
          <Ionicons name="body-outline" size={32} color={colors.accent} />
          <Text style={[styles.setupTitle, { color: colors.text }]}>
            Kalorien-Tracking einrichten
          </Text>
          <Text style={[styles.setupText, { color: colors.textSecondary }]}>
            Füge Körperdaten hinzu um deinen Kalorienverbrauch zu tracken
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  if (!dailyBurn) {
    return null;
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
    <>
      <TouchableOpacity
        style={[styles.container, { backgroundColor: colors.cardBackground }]}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              📊 Tagesübersicht
            </Text>
            <Text style={[styles.headerDate, { color: colors.textSecondary }]}>
              {formatDate(currentDate)}
            </Text>
          </View>
          <Ionicons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={24} 
            color={colors.textSecondary} 
          />
        </View>

        {/* Calorie Stats */}
        <View style={styles.stats}>
          <View style={styles.statRow}>
            <View style={styles.statLeft}>
              <Ionicons name="flame-outline" size={20} color={colors.accent} />
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Grundumsatz (TDEE)
              </Text>
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {formatCalories(tdeeNoWorkout)} kcal
            </Text>
          </View>

          {workoutCalories > 0 && (
            <View style={styles.statRow}>
              <View style={styles.statLeft}>
                <Ionicons name="fitness-outline" size={20} color="#10B981" />
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Workout-Kalorien
                </Text>
              </View>
              <Text style={[styles.statValue, { color: "#10B981" }]}>
                +{formatCalories(workoutCalories)} kcal
              </Text>
            </View>
          )}

          {exerciseCalories > 0 && (
            <View style={styles.statRow}>
              <View style={styles.statLeft}>
                <Ionicons name="barbell-outline" size={20} color="#8B5CF6" />
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Übungs-Kalorien
                </Text>
              </View>
              <Text style={[styles.statValue, { color: "#8B5CF6" }]}>
                +{formatCalories(exerciseCalories)} kcal
              </Text>
            </View>
          )}

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.statRow}>
            <View style={styles.statLeft}>
              <Ionicons name="trending-up-outline" size={20} color={colors.accent} />
              <Text style={[styles.statLabel, { color: colors.text, fontFamily: Fonts.semiBold }]}>
                Gesamtverbrauch
              </Text>
            </View>
            <Text style={[styles.totalValue, { color: colors.accent }]}>
              {formatCalories(totalBurn)} kcal
            </Text>
          </View>

          {totalConsumed > 0 && (
            <View style={styles.statRow}>
              <View style={styles.statLeft}>
                <Ionicons name="restaurant-outline" size={20} color="#F59E0B" />
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Gegessen
                </Text>
              </View>
              <Text style={[styles.statValue, { color: "#F59E0B" }]}>
                -{formatCalories(totalConsumed)} kcal
              </Text>
            </View>
          )}

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Netto-Kalorien */}
          <View style={styles.statRow}>
            <View style={styles.statLeft}>
              <Ionicons 
                name={netCalories >= 0 ? "trending-up" : "trending-down"} 
                size={20} 
                color={netCalories >= 0 ? "#10B981" : "#EF4444"} 
              />
              <Text style={[styles.statLabel, { color: colors.text, fontFamily: Fonts.semiBold }]}>
                Netto-Kalorien
              </Text>
            </View>
            <Text style={[
              styles.totalValue, 
              { color: netCalories >= 0 ? "#10B981" : "#EF4444" }
            ]}>
              {netCalories >= 0 ? "+" : ""}{formatCalories(netCalories)} kcal
            </Text>
          </View>
        </View>

        {/* Expanded Details */}
        {isExpanded && (
          <View style={styles.expandedSection}>
            {/* Sessions heute */}
            {sessions.length > 0 && (
              <View style={styles.sessionsInfo}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  🏋️ Sessions ({sessions.length})
                </Text>
                {sessions.map((session) => (
                  <View key={session.id} style={styles.sessionItem}>
                    <Text style={[styles.sessionTime, { color: colors.textSecondary }]}>
                      • {formatTime(session.startTime)} - {session.workoutType || "Workout"} ({session.durationMinutes} min)
                    </Text>
                    <Text style={[styles.sessionCalories, { color: "#10B981" }]}>
                      {formatCalories(session.calories)} kcal
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Einzelne Übungen */}
            {exerciseBurns.length > 0 && (
              <View style={styles.sessionsInfo}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  💪 Übungen ({exerciseBurns.length})
                </Text>
                {exerciseBurns.map((burn) => (
                  <TouchableOpacity 
                    key={burn.id} 
                    style={styles.sessionItem}
                    onLongPress={() => handleDeleteExerciseBurn(burn.id)}
                  >
                    <Text style={[styles.sessionTime, { color: colors.textSecondary }]}>
                      • {formatTime(burn.completedAt)} - {burn.exerciseName}
                    </Text>
                    <Text style={[styles.sessionCalories, { color: "#8B5CF6" }]}>
                      {formatCalories(burn.calories)} kcal
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Konsumierte Kalorien */}
            {consumedItems.length > 0 && (
              <View style={styles.sessionsInfo}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  🍽️ Mahlzeiten ({consumedItems.length})
                </Text>
                {consumedItems.map((item) => (
                  <TouchableOpacity 
                    key={item.id} 
                    style={styles.sessionItem}
                    onLongPress={() => handleDeleteConsumed(item.id)}
                  >
                    <Text style={[styles.sessionTime, { color: colors.textSecondary }]}>
                      • {formatTime(item.consumedAt)} - {item.description}
                    </Text>
                    <Text style={[styles.sessionCalories, { color: "#F59E0B" }]}>
                      {formatCalories(item.calories)} kcal
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Add Calories Button */}
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.accent }]}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Kalorien hinzufügen</Text>
        </TouchableOpacity>
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
    </>
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
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
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
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  setupPrompt: {
    alignItems: "center",
    paddingVertical: 16,
  },
  setupTitle: {
    fontSize: 18,
    fontFamily: Fonts.semiBold,
    marginTop: 12,
    marginBottom: 8,
  },
  setupText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    marginBottom: 4,
  },
  headerDate: {
    fontSize: 14,
    fontFamily: Fonts.regular,
  },
  stats: {
    gap: 12,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  statLabel: {
    fontSize: 15,
    fontFamily: Fonts.regular,
  },
  statValue: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
  },
  totalValue: {
    fontSize: 20,
    fontFamily: Fonts.bold,
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  expandedSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    marginBottom: 8,
  },
  sessionsInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  sessionsText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    marginBottom: 8,
  },
  sessionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    paddingVertical: 4,
  },
  sessionTime: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    flex: 1,
  },
  sessionCalories: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: Fonts.semiBold,
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
