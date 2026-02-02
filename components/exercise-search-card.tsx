import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { ExerciseInfo } from "@/src/models";
import { Image } from "expo-image";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
    Animated,
    Pressable,
    StyleSheet,
    Text,
    View,
    type ViewStyle,
} from "react-native";

interface ExerciseSearchCardProps {
  /** Die Übungs-Informationen */
  exercise: ExerciseInfo;
  /** Zusätzliche Styles für den Container */
  style?: ViewStyle;
}

/**
 * Vereinfachte Exercise Card für die Such-Seite
 * Zeigt: Bild, Name, Körperteil, Equipment, Kalorien
 * Beim Klick: Navigation zur Detail-Seite
 */
export function ExerciseSearchCard({
  exercise,
  style,
}: ExerciseSearchCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();

  // Animation State
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [showGif, setShowGif] = useState(false);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Long-Press für GIF Animation
  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();

    // Nach 300ms GIF anzeigen
    pressTimer.current = setTimeout(() => {
      if (exercise.gifUrl) {
        setShowGif(true);
      }
    }, 300);
  }, [exercise.gifUrl, scaleAnim]);

  const handlePressOut = useCallback(() => {
    setShowGif(false);

    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }

    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  // Navigation zur Detail-Seite
  const handlePress = useCallback(() => {
    router.push(`/exercise/${exercise.id}` as Href);
  }, [router, exercise.id]);

  // Schwierigkeitsgrad-Farbe
  const getDifficultyColor = (difficulty: ExerciseInfo["difficulty"]) => {
    switch (difficulty) {
      case "beginner":
        return "#4CAF50";
      case "intermediate":
        return "#FF9800";
      case "advanced":
        return "#F44336";
      default:
        return colors.text;
    }
  };

  // Schwierigkeitsgrad-Label
  const getDifficultyLabel = (difficulty: ExerciseInfo["difficulty"]) => {
    switch (difficulty) {
      case "beginner":
        return "Anfänger";
      case "intermediate":
        return "Fortgeschritten";
      case "advanced":
        return "Profi";
      default:
        return difficulty;
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.cardBackground,
          transform: [{ scale: scaleAnim }],
        },
        style,
      ]}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.pressable}
      >
        {/* Bilder - Start & End Position nebeneinander */}
        <View style={styles.imageContainer}>
          {/* Erstes Bild (Startposition) */}
          <View style={styles.imageWrapper}>
            <Image
              source={
                showGif && exercise.gifUrl
                  ? { uri: exercise.gifUrl }
                  : exercise.image
              }
              style={styles.image}
              contentFit="cover"
              transition={200}
            />
          </View>

          {/* Zweites Bild (Endposition) - falls vorhanden */}
          <View style={styles.imageWrapper}>
            <Image
              source={
                exercise.imageUrl2
                  ? { uri: exercise.imageUrl2 }
                  : exercise.image
              }
              style={styles.image}
              contentFit="cover"
              transition={200}
            />
          </View>

          {/* Difficulty Badge */}
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor(exercise.difficulty) },
            ]}
          >
            <Text style={styles.difficultyText}>
              {getDifficultyLabel(exercise.difficulty)}
            </Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoContainer}>
          {/* Name */}
          <Text
            style={[styles.name, { color: colors.text }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {exercise.name}
          </Text>

          {/* Körperteil & Zielmuskel */}
          <Text
            style={[styles.muscleInfo, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {exercise.bodyPart} • {exercise.targetMuscle}
          </Text>

          {/* Equipment */}
          <View style={styles.equipmentRow}>
            <Text style={[styles.equipmentIcon]}>🏋️</Text>
            <Text
              style={[styles.equipment, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {exercise.equipment}
            </Text>
          </View>

          {/* Kalorien */}
          <View style={styles.caloriesRow}>
            <Text style={styles.caloriesIcon}>🔥</Text>
            <Text style={[styles.calories, { color: colors.tint }]}>
              ~{exercise.caloriesPerMinute} kcal/min
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  pressable: {
    flex: 1,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 2,
    flexDirection: "row",
    position: "relative",
  },
  imageWrapper: {
    flex: 1,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  difficultyBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  difficultyText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    fontFamily: Fonts.rounded,
  },
  infoContainer: {
    padding: 12,
    gap: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: Fonts.rounded,
  },
  muscleInfo: {
    fontSize: 13,
    fontFamily: Fonts.rounded,
    textTransform: "capitalize",
  },
  equipmentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  equipmentIcon: {
    fontSize: 12,
  },
  equipment: {
    fontSize: 12,
    fontFamily: Fonts.rounded,
    textTransform: "capitalize",
    flex: 1,
  },
  caloriesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  caloriesIcon: {
    fontSize: 12,
  },
  calories: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: Fonts.rounded,
  },
});
