import { AddToSessionModal } from "@/components/add-to-session-modal";
import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { ExerciseInfo } from "@/src/models";
import { getExerciseByIdFromFirebase } from "@/src/services/firebase.service";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Exercise data
  const [exercise, setExercise] = useState<ExerciseInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGif, setShowGif] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load exercise from Firebase
  useEffect(() => {
    if (id) {
      setIsLoading(true);
      setError(null);

      getExerciseByIdFromFirebase(id)
        .then((ex) => {
          setExercise(ex);
          if (!ex) {
            setError("Übung nicht gefunden");
          }
        })
        .catch((err) => {
          console.error("Error loading exercise:", err);
          setError("Fehler beim Laden der Übung");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [id]);

  // Long-press handlers for GIF
  const handlePressIn = useCallback(() => {
    pressTimer.current = setTimeout(() => {
      if (exercise?.gifUrl) {
        setShowGif(true);
      }
    }, 300);
  }, [exercise?.gifUrl]);

  const handlePressOut = useCallback(() => {
    setShowGif(false);
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  }, []);

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

  // Loading State
  if (isLoading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <Stack.Screen options={{ title: "Laden..." }} />
        <ActivityIndicator size="large" color={colors.tint} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Übung wird geladen...
        </Text>
      </View>
    );
  }

  // Error State
  if (error || !exercise) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <Stack.Screen options={{ title: "Fehler" }} />
        <Ionicons name="alert-circle" size={48} color={colors.textSecondary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          {error || "Übung nicht gefunden"}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: exercise.name,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Images - Start & End Position nebeneinander */}
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.imageContainer}
        >
          <View style={styles.imagesRow}>
            {/* Erstes Bild (Startposition) */}
            <View style={styles.imageWrapper}>
              <Image
                source={
                  showGif && exercise.gifUrl
                    ? { uri: exercise.gifUrl }
                    : exercise.image
                }
                style={styles.heroImage}
                contentFit="cover"
                transition={200}
              />
              <View style={styles.imageLabel}>
                <Text style={styles.imageLabelText}>Start</Text>
              </View>
            </View>

            {/* Zweites Bild (Endposition) */}
            <View style={styles.imageWrapper}>
              <Image
                source={
                  exercise.imageUrl2
                    ? { uri: exercise.imageUrl2 }
                    : exercise.image
                }
                style={styles.heroImage}
                contentFit="cover"
                transition={200}
              />
              <View style={styles.imageLabel}>
                <Text style={styles.imageLabelText}>Ende</Text>
              </View>
            </View>
          </View>

          {/* GIF Hint */}
          {exercise.gifUrl && (
            <View style={styles.gifHint}>
              <Ionicons name="play-circle" size={20} color="#fff" />
              <Text style={styles.gifHintText}>
                {showGif
                  ? "Animation läuft..."
                  : "Gedrückt halten für Animation"}
              </Text>
            </View>
          )}

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
        </Pressable>

        {/* Exercise Info */}
        <View style={styles.content}>
          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>
            {exercise.name}
          </Text>

          {/* Quick Info Row */}
          <View style={styles.quickInfoRow}>
            <View
              style={[
                styles.infoChip,
                { backgroundColor: colors.cardBackground },
              ]}
            >
              <Text style={styles.infoChipIcon}>💪</Text>
              <Text style={[styles.infoChipText, { color: colors.text }]}>
                {exercise.targetMuscle}
              </Text>
            </View>

            <View
              style={[
                styles.infoChip,
                { backgroundColor: colors.cardBackground },
              ]}
            >
              <Text style={styles.infoChipIcon}>🏋️</Text>
              <Text style={[styles.infoChipText, { color: colors.text }]}>
                {exercise.equipment}
              </Text>
            </View>

            <View
              style={[
                styles.infoChip,
                { backgroundColor: colors.cardBackground },
              ]}
            >
              <Text style={styles.infoChipIcon}>🔥</Text>
              <Text style={[styles.infoChipText, { color: colors.tint }]}>
                ~{exercise.caloriesPerMinute} kcal/min
              </Text>
            </View>
          </View>

          {/* Description */}
          {exercise.description && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Beschreibung
              </Text>
              <Text
                style={[styles.description, { color: colors.textSecondary }]}
              >
                {exercise.description}
              </Text>
            </View>
          )}

          {/* Target Muscles */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Beanspruchte Muskeln
            </Text>
            <View style={styles.muscleContainer}>
              {/* Primary */}
              <View style={styles.muscleRow}>
                <View
                  style={[
                    styles.muscleBadge,
                    { backgroundColor: colors.accent },
                  ]}
                >
                  <Text style={styles.muscleBadgeText}>Hauptmuskel</Text>
                </View>
                <Text style={[styles.muscleText, { color: colors.text }]}>
                  {exercise.targetMuscle}
                </Text>
              </View>

              {/* Secondary */}
              {exercise.secondaryMuscles.length > 0 && (
                <View style={styles.muscleRow}>
                  <View
                    style={[
                      styles.muscleBadge,
                      { backgroundColor: colors.textSecondary },
                    ]}
                  >
                    <Text style={styles.muscleBadgeText}>Nebenmuskeln</Text>
                  </View>
                  <Text style={[styles.muscleText, { color: colors.text }]}>
                    {exercise.secondaryMuscles.join(", ")}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Equipment */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Benötigtes Equipment
            </Text>
            <View
              style={[
                styles.equipmentBox,
                { backgroundColor: colors.cardBackground },
              ]}
            >
              <Ionicons name="barbell-outline" size={24} color={colors.tint} />
              <Text style={[styles.equipmentText, { color: colors.text }]}>
                {exercise.equipment}
              </Text>
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Ausführung
            </Text>
            <View style={styles.instructionsList}>
              {exercise.instructions.map((instruction, index) => (
                <View key={index} style={styles.instructionItem}>
                  <View
                    style={[
                      styles.instructionNumber,
                      { backgroundColor: colors.accent },
                    ]}
                  >
                    <Text style={styles.instructionNumberText}>
                      {index + 1}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.instructionText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {instruction}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Body Part & Category */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Weitere Details
            </Text>
            <View style={styles.detailsGrid}>
              <View
                style={[
                  styles.detailBox,
                  { backgroundColor: colors.cardBackground },
                ]}
              >
                <Text
                  style={[styles.detailLabel, { color: colors.textSecondary }]}
                >
                  Körperteil
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {exercise.bodyPart}
                </Text>
              </View>

              <View
                style={[
                  styles.detailBox,
                  { backgroundColor: colors.cardBackground },
                ]}
              >
                <Text
                  style={[styles.detailLabel, { color: colors.textSecondary }]}
                >
                  Kategorie
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {exercise.category === "strength"
                    ? "Kraft"
                    : exercise.category === "cardio"
                      ? "Cardio"
                      : exercise.category === "endurance"
                        ? "Ausdauer"
                        : exercise.category}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Add to Session Button */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
          },
        ]}
      >
        <Pressable
          style={[styles.addButton, { backgroundColor: colors.accent }]}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Zur Session hinzufügen</Text>
        </Pressable>
      </View>

      {/* Add to Session Modal */}
      <AddToSessionModal
        visible={showAddModal}
        exercise={exercise}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          // Optional: Show success feedback
        }}
      />
    </View>
  );
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
  loadingText: {
    fontSize: 16,
    fontFamily: Fonts.rounded,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 2,
    position: "relative",
  },
  imagesRow: {
    flex: 1,
    flexDirection: "row",
  },
  imageWrapper: {
    flex: 1,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  imageLabel: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  imageLabelText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
    fontFamily: Fonts.rounded,
  },
  gifHint: {
    position: "absolute",
    bottom: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  gifHintText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: Fonts.rounded,
  },
  difficultyBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  difficultyText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    fontFamily: Fonts.rounded,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    fontFamily: Fonts.rounded,
    marginBottom: 12,
  },
  quickInfoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  infoChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  infoChipIcon: {
    fontSize: 14,
  },
  infoChipText: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: Fonts.rounded,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: Fonts.rounded,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: Fonts.rounded,
  },
  muscleContainer: {
    gap: 12,
  },
  muscleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  muscleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  muscleBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
    fontFamily: Fonts.rounded,
  },
  muscleText: {
    fontSize: 15,
    fontFamily: Fonts.rounded,
    flex: 1,
  },
  equipmentBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  equipmentText: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: Fonts.rounded,
  },
  instructionsList: {
    gap: 16,
  },
  instructionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  instructionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  instructionNumberText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    fontFamily: Fonts.rounded,
  },
  instructionText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: Fonts.rounded,
  },
  detailsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  detailBox: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 12,
    fontFamily: Fonts.rounded,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: Fonts.rounded,
    textTransform: "capitalize",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    fontFamily: Fonts.rounded,
  },
});
