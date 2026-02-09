/**
 * Daily Calorie Overview Component
 * 
 * Zeigt täglichen Kalorienverbrauch:
 * - TDEE (ohne Workouts)
 * - Workout-Kalorien
 * - Gesamtverbrauch
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors, Fonts } from "@/constants/theme";
import { 
  getCalorieProfile, 
  getDailyBurn,
  type DailyBurn,
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

  // Aktuelles Datum im Format YYYY-MM-DD
  const currentDate = date || new Date().toISOString().split("T")[0];

  useEffect(() => {
    loadDailyBurn();
  }, [currentDate]);

  const loadDailyBurn = async () => {
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
  };

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

  const { tdeeNoWorkout, workoutCalories, totalBurn, sessions } = dailyBurn;

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.cardBackground }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          📊 Tagesübersicht
        </Text>
        <Text style={[styles.headerDate, { color: colors.textSecondary }]}>
          {formatDate(currentDate)}
        </Text>
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
      </View>

      {/* Sessions heute */}
      {sessions.length > 0 && (
        <View style={styles.sessionsInfo}>
          <Text style={[styles.sessionsText, { color: colors.textSecondary }]}>
            {sessions.length} {sessions.length === 1 ? "Session" : "Sessions"} heute
          </Text>
          {sessions.map((session, index) => (
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
    </TouchableOpacity>
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
    marginBottom: 16,
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
  sessionsInfo: {
    marginTop: 16,
    paddingTop: 16,
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
});
