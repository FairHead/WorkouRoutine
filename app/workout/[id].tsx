import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useSessionStore } from "@/hooks/use-session-store";
import type { SessionExercise } from "@/src/models";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    Vibration,
    View,
} from "react-native";

type WorkoutState = "exercise" | "rest" | "exerciseRest" | "completed";

interface SetProgress {
  exerciseId: string;
  completedSets: number;
}

export default function WorkoutPlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();

  const { getSession, completeWorkout, cancelWorkout } = useSessionStore();
  const session = getSession(id ?? "");

  // Workout state
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [workoutState, setWorkoutState] = useState<WorkoutState>("exercise");
  const [setProgress, setSetProgress] = useState<SetProgress[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  // Timer state
  const [restTimeRemaining, setRestTimeRemaining] = useState(0);
  const [exerciseTimeRemaining, setExerciseTimeRemaining] = useState(0);
  const [workoutDuration, setWorkoutDuration] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const exerciseTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const workoutTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Flag to trigger set completion from timer
  const [timerCompleted, setTimerCompleted] = useState(false);

  // Get current exercise early for use in effects
  const currentExercise: SessionExercise | undefined =
    session?.exercises[currentExerciseIndex];

  // Initialize progress
  useEffect(() => {
    if (session) {
      setSetProgress(
        session.exercises.map((ex) => ({
          exerciseId: ex.id,
          completedSets: 0,
        })),
      );
      // Initialize timer for timer-based exercise
      const firstExercise = session.exercises[0];
      if (firstExercise?.mode === "timer" && firstExercise.duration) {
        setExerciseTimeRemaining(firstExercise.duration);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id]);

  // Workout duration timer
  useEffect(() => {
    if (!isPaused && workoutState !== "completed") {
      workoutTimerRef.current = setInterval(() => {
        setWorkoutDuration((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (workoutTimerRef.current) {
        clearInterval(workoutTimerRef.current);
      }
    };
  }, [isPaused, workoutState]);

  // Rest timer
  useEffect(() => {
    if (
      (workoutState === "rest" || workoutState === "exerciseRest") &&
      !isPaused &&
      restTimeRemaining > 0
    ) {
      timerRef.current = setInterval(() => {
        setRestTimeRemaining((prev) => {
          if (prev <= 1) {
            // Timer finished
            Vibration.vibrate([0, 200, 100, 200]);
            if (workoutState === "exerciseRest") {
              // Move to next exercise
              const nextExercise = session?.exercises[currentExerciseIndex + 1];
              if (nextExercise?.mode === "timer" && nextExercise.duration) {
                setExerciseTimeRemaining(nextExercise.duration);
              }
              setCurrentExerciseIndex((prev) => prev + 1);
              setCurrentSetIndex(0);
            }
            setWorkoutState("exercise");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [
    workoutState,
    isPaused,
    restTimeRemaining,
    currentExerciseIndex,
    session?.exercises,
  ]);

  // Exercise timer for timer-based exercises
  useEffect(() => {
    if (
      workoutState === "exercise" &&
      !isPaused &&
      currentExercise?.mode === "timer" &&
      exerciseTimeRemaining > 0
    ) {
      exerciseTimerRef.current = setInterval(() => {
        setExerciseTimeRemaining((prev) => {
          if (prev <= 1) {
            // Timer finished - trigger set completion via flag
            Vibration.vibrate([0, 300, 100, 300]);
            setTimerCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (exerciseTimerRef.current) {
        clearInterval(exerciseTimerRef.current);
      }
    };
  }, [workoutState, isPaused, currentExercise?.mode, exerciseTimeRemaining]);

  const handleSetComplete = useCallback(() => {
    if (!session || !currentExercise) return;

    // Update set progress
    setSetProgress((prev) =>
      prev.map((p) =>
        p.exerciseId === currentExercise.id
          ? { ...p, completedSets: p.completedSets + 1 }
          : p,
      ),
    );

    const newSetIndex = currentSetIndex + 1;

    if (newSetIndex >= currentExercise.sets) {
      // All sets for this exercise complete
      const nextExerciseIndex = currentExerciseIndex + 1;

      if (nextExerciseIndex >= session.exercises.length) {
        // Workout complete!
        setWorkoutState("completed");
        Vibration.vibrate([0, 500, 200, 500]);
      } else {
        // Check if there's rest time between exercises
        const restAfterExercise = currentExercise.restAfterExercise ?? 0;

        if (restAfterExercise > 0) {
          // Start rest timer between exercises - auto transition
          setRestTimeRemaining(restAfterExercise);
          setWorkoutState("exerciseRest");
        } else {
          // No rest time - move directly to next exercise
          const nextExercise = session.exercises[nextExerciseIndex];
          if (nextExercise?.mode === "timer" && nextExercise.duration) {
            setExerciseTimeRemaining(nextExercise.duration);
          }
          setCurrentExerciseIndex(nextExerciseIndex);
          setCurrentSetIndex(0);
        }
      }
    } else {
      // More sets remaining - reset timer for timer-based exercises
      if (currentExercise.mode === "timer" && currentExercise.duration) {
        setExerciseTimeRemaining(currentExercise.duration);
      }
      setCurrentSetIndex(newSetIndex);
      // Start rest between sets
      const restTime = currentExercise.restBetweenSets || 60;
      setRestTimeRemaining(restTime);
      setWorkoutState("rest");
    }
  }, [session, currentExercise, currentSetIndex, currentExerciseIndex]);

  // Effect to handle timer completion
  useEffect(() => {
    if (timerCompleted) {
      handleSetComplete();
      setTimerCompleted(false);
    }
  }, [timerCompleted, handleSetComplete]);

  const handleRestComplete = useCallback(() => {
    setWorkoutState("exercise");
    setRestTimeRemaining(0);
  }, []);

  const handleSkipRest = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // If we were in exerciseRest, move to next exercise
    if (workoutState === "exerciseRest" && session) {
      const nextExercise = session.exercises[currentExerciseIndex + 1];
      if (nextExercise?.mode === "timer" && nextExercise.duration) {
        setExerciseTimeRemaining(nextExercise.duration);
      }
      setCurrentExerciseIndex((prev) => prev + 1);
      setCurrentSetIndex(0);
    }

    handleRestComplete();
  };

  const handleSkipExercise = () => {
    if (!session) return;

    const nextExerciseIndex = currentExerciseIndex + 1;

    if (nextExerciseIndex >= session.exercises.length) {
      setWorkoutState("completed");
    } else {
      const nextExercise = session.exercises[nextExerciseIndex];
      if (nextExercise?.mode === "timer" && nextExercise.duration) {
        setExerciseTimeRemaining(nextExercise.duration);
      }
      setCurrentExerciseIndex(nextExerciseIndex);
      setCurrentSetIndex(0);
      setWorkoutState("exercise");
    }
  };

  const handleFinishWorkout = () => {
    if (session) {
      completeWorkout(session.id);
    }
    router.replace("/(tabs)");
  };

  const handleCancelWorkout = () => {
    Alert.alert(
      "Workout abbrechen",
      "Möchtest du das Workout wirklich abbrechen? Dein Fortschritt geht verloren.",
      [
        { text: "Weiter trainieren", style: "cancel" },
        {
          text: "Abbrechen",
          style: "destructive",
          onPress: () => {
            if (session) {
              cancelWorkout(session.id);
            }
            router.back();
          },
        },
      ],
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!session) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: "Workout", headerShown: false }} />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>
            Session nicht gefunden
          </Text>
          <Pressable
            style={[styles.backButton, { backgroundColor: colors.accent }]}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Zurück</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Workout completed screen
  if (workoutState === "completed") {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />

        <View style={styles.completedContainer}>
          <View
            style={[
              styles.celebrationIcon,
              { backgroundColor: "#10B981" + "20" },
            ]}
          >
            <Ionicons name="trophy" size={64} color="#10B981" />
          </View>

          <Text style={[styles.completedTitle, { color: colors.text }]}>
            Workout abgeschlossen! 🎉
          </Text>

          <Text
            style={[styles.completedSubtitle, { color: colors.textSecondary }]}
          >
            {session.name}
          </Text>

          <View
            style={[
              styles.summaryCard,
              { backgroundColor: colors.cardBackground },
            ]}
          >
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Ionicons name="time" size={24} color={colors.accent} />
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  {formatTime(workoutDuration)}
                </Text>
                <Text
                  style={[styles.summaryLabel, { color: colors.textSecondary }]}
                >
                  Dauer
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Ionicons name="fitness" size={24} color={colors.accent} />
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  {session.exercises.length}
                </Text>
                <Text
                  style={[styles.summaryLabel, { color: colors.textSecondary }]}
                >
                  Übungen
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Ionicons
                  name="checkmark-done"
                  size={24}
                  color={colors.accent}
                />
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  {setProgress.reduce((sum, p) => sum + p.completedSets, 0)}
                </Text>
                <Text
                  style={[styles.summaryLabel, { color: colors.textSecondary }]}
                >
                  Sätze
                </Text>
              </View>
            </View>
          </View>

          <Pressable
            style={[styles.finishButton, { backgroundColor: colors.accent }]}
            onPress={handleFinishWorkout}
          >
            <Text style={styles.finishButtonText}>Fertig</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const currentProgress = setProgress.find(
    (p) => p.exerciseId === currentExercise?.id,
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable style={styles.headerButton} onPress={handleCancelWorkout}>
          <Ionicons name="close" size={28} color={colors.text} />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={[styles.workoutTime, { color: colors.accent }]}>
            {formatTime(workoutDuration)}
          </Text>
        </View>

        <Pressable
          style={styles.headerButton}
          onPress={() => setIsPaused(!isPaused)}
        >
          <Ionicons
            name={isPaused ? "play" : "pause"}
            size={24}
            color={colors.text}
          />
        </Pressable>
      </View>

      {/* Pause Overlay */}
      {isPaused && (
        <Pressable
          style={styles.pauseOverlay}
          onPress={() => setIsPaused(false)}
        >
          <Ionicons name="play-circle" size={80} color="#fff" />
          <Text style={styles.pauseText}>Pausiert</Text>
          <Text style={styles.pauseHint}>Tippen zum Fortsetzen</Text>
        </Pressable>
      )}

      {/* Rest State */}
      {(workoutState === "rest" || workoutState === "exerciseRest") && (
        <View style={styles.restContainer}>
          <Text style={[styles.restLabel, { color: colors.textSecondary }]}>
            {workoutState === "exerciseRest"
              ? "PAUSE ZWISCHEN ÜBUNGEN"
              : "PAUSE"}
          </Text>

          <Text style={[styles.restTimer, { color: colors.accent }]}>
            {formatTime(restTimeRemaining)}
          </Text>

          <View style={styles.nextExercisePreview}>
            <Text style={[styles.nextLabel, { color: colors.textSecondary }]}>
              {workoutState === "rest" &&
              currentSetIndex < (currentExercise?.sets ?? 0) - 1
                ? `Nächster Satz (${currentSetIndex + 2}/${currentExercise?.sets})`
                : "Nächste Übung"}
            </Text>

            {(workoutState === "exerciseRest" ||
              currentSetIndex >= (currentExercise?.sets ?? 0) - 1) &&
              session.exercises[currentExerciseIndex + 1] && (
                <View style={styles.nextExerciseInfo}>
                  <Image
                    source={
                      session.exercises[currentExerciseIndex + 1].exerciseInfo
                        .image
                    }
                    style={styles.nextExerciseImage}
                    contentFit="cover"
                  />
                  <Text
                    style={[styles.nextExerciseName, { color: colors.text }]}
                  >
                    {
                      session.exercises[currentExerciseIndex + 1].exerciseInfo
                        .name
                    }
                  </Text>
                </View>
              )}
          </View>

          <Pressable
            style={[styles.skipRestButton, { backgroundColor: colors.accent }]}
            onPress={handleSkipRest}
          >
            <Ionicons name="play-forward" size={20} color="#fff" />
            <Text style={styles.skipRestText}>Pause überspringen</Text>
          </Pressable>

          {/* Rest time adjustment */}
          <View style={styles.restAdjust}>
            <Pressable
              style={[
                styles.adjustButton,
                { backgroundColor: colors.cardBackground },
              ]}
              onPress={() =>
                setRestTimeRemaining((prev) => Math.max(0, prev - 15))
              }
            >
              <Text style={[styles.adjustText, { color: colors.text }]}>
                -15s
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.adjustButton,
                { backgroundColor: colors.cardBackground },
              ]}
              onPress={() => setRestTimeRemaining((prev) => prev + 15)}
            >
              <Text style={[styles.adjustText, { color: colors.text }]}>
                +15s
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Exercise State */}
      {workoutState === "exercise" && currentExercise && (
        <ScrollView
          style={styles.exerciseContent}
          contentContainerStyle={styles.exerciseScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Progress Indicator */}
          <View style={styles.progressRow}>
            {session.exercises.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  {
                    backgroundColor:
                      index < currentExerciseIndex
                        ? "#10B981"
                        : index === currentExerciseIndex
                          ? colors.accent
                          : colors.border,
                  },
                ]}
              />
            ))}
          </View>

          <Text style={[styles.exerciseLabel, { color: colors.textSecondary }]}>
            Übung {currentExerciseIndex + 1} von {session.exercises.length}
          </Text>

          {/* Exercise Image */}
          <Image
            source={
              currentExercise.exerciseInfo.gifUrl
                ? { uri: currentExercise.exerciseInfo.gifUrl }
                : currentExercise.exerciseInfo.image
            }
            style={styles.exerciseImage}
            contentFit="contain"
          />

          {/* Exercise Name */}
          <Text style={[styles.exerciseName, { color: colors.text }]}>
            {currentExercise.exerciseInfo.name}
          </Text>

          {/* Timer for timer-based exercises */}
          {currentExercise.mode === "timer" && (
            <View style={styles.timerContainer}>
              <Text
                style={[styles.timerLabel, { color: colors.textSecondary }]}
              >
                VERBLEIBENDE ZEIT
              </Text>
              <Text style={[styles.timerValue, { color: colors.accent }]}>
                {formatTime(exerciseTimeRemaining)}
              </Text>
            </View>
          )}

          {/* Set Progress */}
          <View style={styles.setProgressContainer}>
            <Text style={[styles.setLabel, { color: colors.textSecondary }]}>
              SATZ
            </Text>
            <Text style={[styles.setProgress, { color: colors.accent }]}>
              {currentSetIndex + 1} / {currentExercise.sets}
            </Text>
          </View>

          {/* Set Dots */}
          <View style={styles.setDots}>
            {Array.from({ length: currentExercise.sets }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.setDot,
                  {
                    backgroundColor:
                      index < (currentProgress?.completedSets ?? 0)
                        ? "#10B981"
                        : index === currentSetIndex
                          ? colors.accent
                          : colors.border,
                  },
                ]}
              >
                {index < (currentProgress?.completedSets ?? 0) && (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
              </View>
            ))}
          </View>

          {/* Exercise Details */}
          <View
            style={[
              styles.detailsCard,
              { backgroundColor: colors.cardBackground },
            ]}
          >
            {currentExercise.mode === "timer" ? (
              <View style={styles.detailItem}>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {currentExercise.duration || 30}s
                </Text>
                <Text
                  style={[styles.detailLabel, { color: colors.textSecondary }]}
                >
                  Dauer
                </Text>
              </View>
            ) : (
              <View style={styles.detailItem}>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {currentExercise.reps}
                </Text>
                <Text
                  style={[styles.detailLabel, { color: colors.textSecondary }]}
                >
                  Wiederholungen
                </Text>
              </View>
            )}
            {currentExercise.weight > 0 && (
              <View style={styles.detailItem}>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {currentExercise.weight}kg
                </Text>
                <Text
                  style={[styles.detailLabel, { color: colors.textSecondary }]}
                >
                  Gewicht
                </Text>
              </View>
            )}
            <View style={styles.detailItem}>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {currentExercise.restBetweenSets || 60}s
              </Text>
              <Text
                style={[styles.detailLabel, { color: colors.textSecondary }]}
              >
                Pause
              </Text>
            </View>
          </View>

          {currentExercise.notes && (
            <View
              style={[
                styles.notesCard,
                { backgroundColor: colors.cardBackground },
              ]}
            >
              <Ionicons
                name="document-text"
                size={16}
                color={colors.textSecondary}
              />
              <Text style={[styles.notesText, { color: colors.textSecondary }]}>
                {currentExercise.notes}
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Bottom Action Bar */}
      {workoutState === "exercise" && (
        <View
          style={[styles.bottomBar, { backgroundColor: colors.background }]}
        >
          <Pressable
            style={[styles.skipButton, { borderColor: colors.border }]}
            onPress={handleSkipExercise}
          >
            <Ionicons
              name="play-skip-forward"
              size={20}
              color={colors.textSecondary}
            />
            <Text
              style={[styles.skipButtonText, { color: colors.textSecondary }]}
            >
              Überspringen
            </Text>
          </Pressable>

          {currentExercise?.mode === "timer" ? (
            <View
              style={[
                styles.timerRunningButton,
                { backgroundColor: colors.accent + "30" },
              ]}
            >
              <Ionicons name="timer" size={24} color={colors.accent} />
              <Text style={[styles.timerRunningText, { color: colors.accent }]}>
                Timer läuft...
              </Text>
            </View>
          ) : (
            <Pressable
              style={[
                styles.completeButton,
                { backgroundColor: colors.accent },
              ]}
              onPress={handleSetComplete}
            >
              <Ionicons name="checkmark" size={28} color="#fff" />
              <Text style={styles.completeButtonText}>Satz fertig</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    fontFamily: Fonts.semiBold,
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: Fonts.semiBold,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    alignItems: "center",
  },
  workoutTime: {
    fontSize: 24,
    fontFamily: Fonts.bold,
  },
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  pauseText: {
    color: "#fff",
    fontSize: 32,
    fontFamily: Fonts.bold,
    marginTop: 16,
  },
  pauseHint: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 16,
    fontFamily: Fonts.regular,
    marginTop: 8,
  },
  restContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  restLabel: {
    fontSize: 18,
    fontFamily: Fonts.semiBold,
    letterSpacing: 2,
    marginBottom: 16,
  },
  restTimer: {
    fontSize: 80,
    fontFamily: Fonts.bold,
    marginBottom: 32,
  },
  nextExercisePreview: {
    alignItems: "center",
    marginBottom: 32,
  },
  nextLabel: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    marginBottom: 12,
  },
  nextExerciseInfo: {
    alignItems: "center",
  },
  nextExerciseImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginBottom: 8,
  },
  nextExerciseName: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    textAlign: "center",
  },
  skipRestButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 24,
  },
  skipRestText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: Fonts.semiBold,
  },
  restAdjust: {
    flexDirection: "row",
    gap: 16,
  },
  adjustButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  adjustText: {
    fontSize: 15,
    fontFamily: Fonts.medium,
  },
  exerciseContent: {
    flex: 1,
  },
  exerciseScrollContent: {
    padding: 20,
    alignItems: "center",
  },
  progressRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 16,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  exerciseLabel: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    marginBottom: 16,
  },
  exerciseImage: {
    width: "100%",
    height: 250,
    borderRadius: 16,
    marginBottom: 20,
  },
  exerciseName: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    textAlign: "center",
    marginBottom: 16,
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    borderRadius: 16,
  },
  timerLabel: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    letterSpacing: 1,
    marginBottom: 4,
  },
  timerValue: {
    fontSize: 48,
    fontFamily: Fonts.bold,
  },
  setProgressContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  setLabel: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    letterSpacing: 1,
    marginBottom: 4,
  },
  setProgress: {
    fontSize: 40,
    fontFamily: Fonts.bold,
  },
  setDots: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  setDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  detailsCard: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginBottom: 16,
  },
  detailItem: {
    alignItems: "center",
  },
  detailValue: {
    fontSize: 22,
    fontFamily: Fonts.bold,
  },
  detailLabel: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    marginTop: 4,
  },
  notesCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    width: "100%",
    padding: 16,
    borderRadius: 12,
  },
  notesText: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.regular,
    fontStyle: "italic",
  },
  bottomBar: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    paddingBottom: 32,
  },
  skipButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  skipButtonText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
  },
  completeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
    borderRadius: 16,
  },
  completeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: Fonts.semiBold,
  },
  timerRunningButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
    borderRadius: 16,
  },
  timerRunningText: {
    fontSize: 18,
    fontFamily: Fonts.semiBold,
  },
  completedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  celebrationIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  completedTitle: {
    fontSize: 28,
    fontFamily: Fonts.bold,
    textAlign: "center",
    marginBottom: 8,
  },
  completedSubtitle: {
    fontSize: 17,
    fontFamily: Fonts.regular,
    marginBottom: 32,
  },
  summaryCard: {
    width: "100%",
    padding: 24,
    borderRadius: 16,
    marginBottom: 32,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  summaryItem: {
    alignItems: "center",
    gap: 8,
  },
  summaryValue: {
    fontSize: 28,
    fontFamily: Fonts.bold,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: Fonts.regular,
  },
  finishButton: {
    width: "100%",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
  },
  finishButtonText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: Fonts.semiBold,
  },
});
