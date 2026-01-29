import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { SessionExercise } from "@/src/models";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useEffect, useRef } from "react";
import {
    Animated,
    Easing,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

interface WorkoutExerciseCardProps {
  exercise: SessionExercise;
  index: number;
  isActive: boolean;
  completedSets: number;
  currentSet: number;
  isResting: boolean;
  restTimeRemaining: number;
  exerciseTimeRemaining: number;
  isPaused: boolean;
  onSetComplete: () => void;
  onSkipRest: () => void;
  onSkipExercise: () => void;
}

/** Formatiert Sekunden in "MM:SS" Format */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function WorkoutExerciseCard({
  exercise,
  index,
  isActive,
  completedSets,
  currentSet,
  isResting,
  restTimeRemaining,
  exerciseTimeRemaining,
  isPaused,
  onSetComplete,
  onSkipRest,
  onSkipExercise,
}: WorkoutExerciseCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const isTimerMode = exercise.mode === "timer";

  // Pulse Animation für aktiven Zustand
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Berechne Progress
  const totalSets = exercise.sets;
  const progress = completedSets / totalSets;

  useEffect(() => {
    if (isActive && !isPaused && !isResting) {
      // Subtile Pulse Animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isActive, isPaused, isResting, pulseAnim]);

  // Progress Animation
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [progress, progressAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  // Wenn die Karte nicht aktiv ist, zeige vereinfachte Ansicht
  if (!isActive) {
    return (
      <View
        style={[
          styles.card,
          styles.inactiveCard,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.border,
          },
        ]}
      >
        {/* Exercise Image */}
        <View style={styles.imageContainer}>
          <Image
            source={
              exercise.exerciseInfo.gifUrl
                ? { uri: exercise.exerciseInfo.gifUrl }
                : exercise.exerciseInfo.image
            }
            style={styles.exerciseImage}
            contentFit="cover"
          />
          <View
            style={[styles.numberBadge, { backgroundColor: colors.accent }]}
          >
            <Text style={styles.numberText}>{index + 1}</Text>
          </View>
          {completedSets === totalSets && (
            <View style={styles.completedOverlay}>
              <Ionicons name="checkmark-circle" size={48} color="#22C55E" />
            </View>
          )}
        </View>

        {/* Exercise Info */}
        <View style={styles.infoSection}>
          <Text
            style={[styles.exerciseName, { color: colors.text }]}
            numberOfLines={2}
          >
            {exercise.exerciseInfo.name}
          </Text>

          {/* Progress */}
          <View style={styles.progressInfo}>
            <Text style={[styles.progressText, { color: colors.textSecondary }]}>
              {completedSets}/{totalSets} Sätze
            </Text>
            <View
              style={[
                styles.progressBarBg,
                { backgroundColor: colors.border },
              ]}
            >
              <Animated.View
                style={[
                  styles.progressBarFill,
                  {
                    backgroundColor:
                      completedSets === totalSets ? "#22C55E" : colors.accent,
                    width: progressWidth,
                  },
                ]}
              />
            </View>
          </View>
        </View>
      </View>
    );
  }

  // Aktive Karte - volle Workout-Funktionalität
  return (
    <Animated.View
      style={[
        styles.card,
        styles.activeCard,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.accent,
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      {/* Exercise Image mit aktiver Anzeige */}
      <View style={styles.activeImageContainer}>
        <Image
          source={
            exercise.exerciseInfo.gifUrl
              ? { uri: exercise.exerciseInfo.gifUrl }
              : exercise.exerciseInfo.image
          }
          style={styles.activeExerciseImage}
          contentFit="cover"
        />
        <View style={[styles.numberBadge, { backgroundColor: colors.accent }]}>
          <Text style={styles.numberText}>{index + 1}</Text>
        </View>

        {/* Timer Overlay für Timer-Modus */}
        {isTimerMode && !isResting && (
          <View style={styles.timerOverlay}>
            <Text style={styles.timerText}>
              {formatTime(exerciseTimeRemaining)}
            </Text>
          </View>
        )}

        {/* Rest Overlay */}
        {isResting && (
          <View style={[styles.restOverlay, { backgroundColor: "rgba(0,0,0,0.7)" }]}>
            <Text style={styles.restLabel}>Pause</Text>
            <Text style={styles.restTimer}>{formatTime(restTimeRemaining)}</Text>
            <Pressable
              style={[styles.skipRestButton, { backgroundColor: colors.accent }]}
              onPress={onSkipRest}
            >
              <Ionicons name="play-skip-forward" size={20} color="#fff" />
              <Text style={styles.skipRestText}>Überspringen</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Exercise Info */}
      <View style={styles.activeInfoSection}>
        <Text
          style={[styles.activeExerciseName, { color: colors.text }]}
          numberOfLines={2}
        >
          {exercise.exerciseInfo.name}
        </Text>

        {/* Current Set Info */}
        <View style={styles.setInfo}>
          <Text style={[styles.setLabel, { color: colors.textSecondary }]}>
            Aktueller Satz
          </Text>
          <View style={styles.setDisplay}>
            <Text style={[styles.currentSetNumber, { color: colors.accent }]}>
              {currentSet + 1}
            </Text>
            <Text style={[styles.totalSetsNumber, { color: colors.textSecondary }]}>
              / {totalSets}
            </Text>
          </View>
        </View>

        {/* Reps/Duration Info */}
        <View style={styles.targetInfo}>
          {isTimerMode ? (
            <>
              <Ionicons name="timer" size={24} color="#F59E0B" />
              <Text style={[styles.targetValue, { color: colors.text }]}>
                {formatTime(exercise.duration)}
              </Text>
              <Text style={[styles.targetLabel, { color: colors.textSecondary }]}>
                pro Satz
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="repeat" size={24} color={colors.accent} />
              <Text style={[styles.targetValue, { color: colors.text }]}>
                {exercise.reps}
              </Text>
              <Text style={[styles.targetLabel, { color: colors.textSecondary }]}>
                Wiederholungen
              </Text>
            </>
          )}
          {exercise.weight > 0 && (
            <View style={styles.weightBadge}>
              <Text style={styles.weightText}>{exercise.weight} kg</Text>
            </View>
          )}
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View
            style={[styles.progressBarBg, { backgroundColor: colors.border }]}
          >
            <Animated.View
              style={[
                styles.progressBarFill,
                { backgroundColor: colors.accent, width: progressWidth },
              ]}
            />
          </View>
          <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
            {completedSets}/{totalSets} abgeschlossen
          </Text>
        </View>

        {/* Action Buttons */}
        {!isResting && (
          <View style={styles.actionButtons}>
            <Pressable
              style={[styles.completeButton, { backgroundColor: colors.accent }]}
              onPress={onSetComplete}
            >
              <Ionicons name="checkmark" size={28} color="#fff" />
              <Text style={styles.completeButtonText}>
                {isTimerMode ? "Timer läuft..." : "Satz fertig"}
              </Text>
            </Pressable>

            <Pressable
              style={[styles.skipButton, { borderColor: colors.border }]}
              onPress={onSkipExercise}
            >
              <Ionicons name="play-skip-forward" size={20} color={colors.textSecondary} />
            </Pressable>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 2,
    overflow: "hidden",
  },
  inactiveCard: {
    opacity: 0.7,
  },
  activeCard: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  imageContainer: {
    height: 140,
    position: "relative",
  },
  exerciseImage: {
    width: "100%",
    height: "100%",
  },
  numberBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  numberText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
  completedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(34, 197, 94, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  infoSection: {
    padding: 16,
  },
  exerciseName: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    marginBottom: 12,
  },
  progressInfo: {
    gap: 6,
  },
  progressText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  // Active Card Styles
  activeImageContainer: {
    height: 180,
    position: "relative",
  },
  activeExerciseImage: {
    width: "100%",
    height: "100%",
  },
  timerOverlay: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  timerText: {
    color: "#fff",
    fontSize: 24,
    fontFamily: Fonts.bold,
  },
  restOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  restLabel: {
    color: "#fff",
    fontSize: 18,
    fontFamily: Fonts.medium,
  },
  restTimer: {
    color: "#fff",
    fontSize: 48,
    fontFamily: Fonts.bold,
  },
  skipRestButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 8,
  },
  skipRestText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: Fonts.semiBold,
  },
  activeInfoSection: {
    padding: 16,
    gap: 12,
  },
  activeExerciseName: {
    fontSize: 20,
    fontFamily: Fonts.bold,
  },
  setInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  setLabel: {
    fontSize: 14,
    fontFamily: Fonts.medium,
  },
  setDisplay: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  currentSetNumber: {
    fontSize: 32,
    fontFamily: Fonts.bold,
  },
  totalSetsNumber: {
    fontSize: 20,
    fontFamily: Fonts.medium,
  },
  targetInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(92, 119, 186, 0.1)",
    padding: 12,
    borderRadius: 12,
  },
  targetValue: {
    fontSize: 24,
    fontFamily: Fonts.bold,
  },
  targetLabel: {
    fontSize: 14,
    fontFamily: Fonts.regular,
  },
  weightBadge: {
    marginLeft: "auto",
    backgroundColor: "rgba(92, 119, 186, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  weightText: {
    color: "#5c77ba",
    fontSize: 14,
    fontFamily: Fonts.semiBold,
  },
  progressSection: {
    gap: 6,
  },
  progressLabel: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    textAlign: "center",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  completeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  completeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: Fonts.semiBold,
  },
  skipButton: {
    width: 50,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
