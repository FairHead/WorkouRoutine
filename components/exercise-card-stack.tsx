import { Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { SessionExercise } from "@/src/models";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

interface ExerciseCardStackProps {
  exercises: SessionExercise[];
  onPress?: () => void;
  /** Maximale Anzahl sichtbarer Cards im Stack */
  maxVisible?: number;
}

/** Formatiert Sekunden in "XXs" Format */
function formatSeconds(seconds: number): string {
  return `${seconds}s`;
}

/** Mini Exercise Card für den Stack */
function MiniExerciseCard({
  exercise,
  style,
  isDark,
}: {
  exercise: SessionExercise;
  style?: object;
  isDark: boolean;
}) {
  const isTimerMode = exercise.mode === "timer";

  const colors = {
    bgPrimary: isDark ? "#1a1a2e" : "#ffffff",
    bgSecondary: isDark ? "#2d2d44" : "#f0f0f5",
    textPrimary: isDark ? "#ffffff" : "#1a1a2e",
    textSecondary: isDark ? "#e5e7eb" : "#4a4a5a",
    textMuted: isDark ? "#9ca3af" : "#6b7280",
    accentPrimary: "#5c77ba",
    border: isDark ? "rgba(92, 119, 186, 0.3)" : "rgba(92, 119, 186, 0.2)",
  };

  // Kurze Instruktion (erster Schritt, gekürzt)
  const shortInstruction = exercise.exerciseInfo.instructions?.[0]
    ?.slice(0, 40) || "Übung korrekt ausführen";

  return (
    <View
      style={[
        styles.miniCard,
        {
          backgroundColor: colors.bgPrimary,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {/* Exercise Image */}
      <View style={styles.miniImageContainer}>
        <Image
          source={exercise.exerciseInfo.image}
          style={styles.miniImage}
          contentFit="cover"
        />
        {/* Mode Badge */}
        <View
          style={[
            styles.modeBadge,
            { backgroundColor: isTimerMode ? "#F59E0B" : colors.accentPrimary },
          ]}
        >
          <Ionicons
            name={isTimerMode ? "timer" : "repeat"}
            size={8}
            color="#fff"
          />
        </View>
      </View>

      {/* Exercise Name */}
      <Text
        style={[styles.miniName, { color: colors.textPrimary }]}
        numberOfLines={1}
      >
        {exercise.exerciseInfo.name}
      </Text>

      {/* Stats Row: Sets x Reps/Zeit + Gewicht */}
      <View style={styles.miniStats}>
        <Text style={[styles.miniStatText, { color: colors.textSecondary }]}>
          {exercise.sets}x{" "}
          {isTimerMode ? formatSeconds(exercise.duration) : `${exercise.reps} Wdh`}
        </Text>
        <Text style={[styles.miniStatWeight, { color: colors.accentPrimary }]}>
          {exercise.weight > 0 ? `${exercise.weight}kg` : "—"}
        </Text>
      </View>

      {/* Kurze Instruktion */}
      <Text 
        style={[styles.miniInstruction, { color: colors.textMuted }]}
        numberOfLines={1}
      >
        💡 {shortInstruction}...
      </Text>
    </View>
  );
}

export function ExerciseCardStack({
  exercises,
  onPress,
  maxVisible = 3,
}: ExerciseCardStackProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const colors = {
    bgPrimary: isDark ? "#1a1a2e" : "#ffffff",
    textMuted: isDark ? "#9ca3af" : "#6b7280",
    border: isDark ? "rgba(92, 119, 186, 0.2)" : "rgba(92, 119, 186, 0.15)",
  };

  if (exercises.length === 0) {
    return (
      <Pressable
        style={[styles.emptyStack, { borderColor: colors.border }]}
        onPress={onPress}
      >
        <Ionicons
          name="add-circle-outline"
          size={32}
          color={colors.textMuted}
        />
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          Übungen hinzufügen
        </Text>
      </Pressable>
    );
  }

  // Zeige maximal maxVisible Cards im Stack
  const visibleExercises = exercises.slice(0, maxVisible);
  const hiddenCount = Math.max(0, exercises.length - maxVisible);

  // Stack-Layout: Vorderste Card voll sichtbar, dahinter gestapelt
  return (
    <Pressable style={styles.stackContainer} onPress={onPress}>
      {/* Hintergrund-Cards (gestapelt) */}
      {visibleExercises.length > 2 && (
        <View style={styles.backCard}>
          <MiniExerciseCard
            exercise={visibleExercises[2]}
            isDark={isDark}
            style={styles.cardBack}
          />
        </View>
      )}

      {visibleExercises.length > 1 && (
        <View style={styles.middleCard}>
          <MiniExerciseCard
            exercise={visibleExercises[1]}
            isDark={isDark}
            style={styles.cardMiddle}
          />
        </View>
      )}

      {/* Vorderste Card */}
      <View style={styles.frontCard}>
        <MiniExerciseCard
          exercise={visibleExercises[0]}
          isDark={isDark}
          style={styles.cardFront}
        />
      </View>

      {/* Counter Badge */}
      {hiddenCount > 0 && (
        <View style={styles.counterBadge}>
          <Text style={styles.counterText}>+{hiddenCount}</Text>
        </View>
      )}
    </Pressable>
  );
}

const CARD_WIDTH = 110;
const CARD_HEIGHT = 115;
const STACK_OFFSET = 12;

const styles = StyleSheet.create({
  stackContainer: {
    width: CARD_WIDTH + STACK_OFFSET * 2,
    height: CARD_HEIGHT + STACK_OFFSET,
    position: "relative",
  },
  frontCard: {
    position: "absolute",
    left: 0,
    top: STACK_OFFSET,
    zIndex: 3,
  },
  middleCard: {
    position: "absolute",
    left: STACK_OFFSET,
    top: STACK_OFFSET / 2,
    zIndex: 2,
    opacity: 0.85,
    transform: [{ scale: 0.95 }],
  },
  backCard: {
    position: "absolute",
    left: STACK_OFFSET * 2,
    top: 0,
    zIndex: 1,
    opacity: 0.7,
    transform: [{ scale: 0.9 }],
  },
  cardFront: {
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 2, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  cardMiddle: {
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 1, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardBack: {
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  miniCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 12,
    borderWidth: 1,
    padding: 6,
    gap: 2,
  },
  miniImageContainer: {
    position: "relative",
    width: "100%",
    height: 45,
  },
  miniImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
    backgroundColor: "#2d2d44",
  },
  modeBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  miniName: {
    fontSize: 10,
    fontWeight: "600",
    fontFamily: Fonts.semiBold,
  },
  miniStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  miniStatText: {
    fontSize: 9,
    fontWeight: "500",
    fontFamily: Fonts.sans,
  },
  miniStatWeight: {
    fontSize: 9,
    fontWeight: "700",
    fontFamily: Fonts.semiBold,
  },
  miniInstruction: {
    fontSize: 7,
    fontFamily: Fonts.sans,
  },
  counterBadge: {
    position: "absolute",
    bottom: 4,
    right: 0,
    backgroundColor: "#5c77ba",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    zIndex: 10,
  },
  counterText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    fontFamily: Fonts.semiBold,
  },
  emptyStack: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyText: {
    fontSize: 10,
    fontWeight: "500",
    fontFamily: Fonts.sans,
    textAlign: "center",
  },
});
