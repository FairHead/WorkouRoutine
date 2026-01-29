import { Carousel3D } from "@/components/carousel-3d";
import { DraggableList } from "@/components/draggable-list";
import { SessionExerciseCard } from "@/components/session-exercise-card";
import { WorkoutExerciseCard } from "@/components/workout-exercise-card";
import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useSessionStore } from "@/hooks/use-session-store";
import type { SessionExercise } from "@/src/models";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Alert,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    Vibration,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    getSession,
    updateSession,
    deleteSession,
    removeExerciseFromSession,
    updateExerciseInSession,
    reorderExercises,
    startWorkout,
    completeWorkout,
    cancelWorkout,
  } = useSessionStore();

  const session = getSession(id ?? "");

  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(session?.name ?? "");
  const [editingExercise, setEditingExercise] =
    useState<SessionExercise | null>(null);
  const [isReordering, setIsReordering] = useState(false);

  // Workout State
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [completedSets, setCompletedSets] = useState<Record<string, number>>({});
  const [isResting, setIsResting] = useState(false);
  const [restTimeRemaining, setRestTimeRemaining] = useState(0);
  const [exerciseTimeRemaining, setExerciseTimeRemaining] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [workoutDuration, setWorkoutDuration] = useState(0);
  const restTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const exerciseTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const workoutTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleFinishWorkout = useCallback(() => {
    setIsWorkoutActive(false);
    // Timers aufräumen
    if (restTimerRef.current) clearInterval(restTimerRef.current);
    if (exerciseTimerRef.current) clearInterval(exerciseTimerRef.current);
    if (workoutTimerRef.current) clearInterval(workoutTimerRef.current);
    
    // Workout als abgeschlossen markieren im Store
    if (session) {
      completeWorkout(session.id);
    }
    
    Vibration.vibrate([0, 500, 200, 500]);
    Alert.alert(
      "Workout beendet! 🎉",
      `Dauer: ${formatTime(workoutDuration)}`,
      [{ text: "Super!", style: "default" }],
    );
  }, [workoutDuration, session, completeWorkout]);

  const handleSetComplete = useCallback(() => {
    if (!session) return;
    const currentExercise = session.exercises[currentExerciseIndex];
    if (!currentExercise) return;

    // Update completed sets
    const newCompletedSets = {
      ...completedSets,
      [currentExercise.id]: (completedSets[currentExercise.id] || 0) + 1,
    };
    setCompletedSets(newCompletedSets);

    const newSetIndex = currentSetIndex + 1;

    if (newSetIndex >= currentExercise.sets) {
      // Alle Sätze für diese Übung fertig
      const nextExerciseIndex = currentExerciseIndex + 1;

      if (nextExerciseIndex >= session.exercises.length) {
        // Workout komplett!
        handleFinishWorkout();
      } else {
        // Pause zwischen Übungen
        const restAfterExercise = currentExercise.restAfterExercise ?? 60;
        if (restAfterExercise > 0) {
          setRestTimeRemaining(restAfterExercise);
          setIsResting(true);
        }
        // Nach Rest: zur nächsten Übung
        const nextExercise = session.exercises[nextExerciseIndex];
        if (nextExercise?.mode === "timer" && nextExercise.duration) {
          setExerciseTimeRemaining(nextExercise.duration);
        }
        setCurrentExerciseIndex(nextExerciseIndex);
        setCurrentSetIndex(0);
      }
    } else {
      // Mehr Sätze übrig - Timer zurücksetzen
      if (currentExercise.mode === "timer" && currentExercise.duration) {
        setExerciseTimeRemaining(currentExercise.duration);
      }
      setCurrentSetIndex(newSetIndex);
      // Rest zwischen Sätzen
      const restTime = currentExercise.restBetweenSets || 60;
      setRestTimeRemaining(restTime);
      setIsResting(true);
    }
  }, [session, currentExerciseIndex, currentSetIndex, completedSets, handleFinishWorkout]);

  const handleSkipRest = useCallback(() => {
    if (restTimerRef.current) clearInterval(restTimerRef.current);
    setRestTimeRemaining(0);
    setIsResting(false);
  }, []);

  const handleSkipExercise = useCallback(() => {
    if (!session) return;
    const nextExerciseIndex = currentExerciseIndex + 1;

    if (nextExerciseIndex >= session.exercises.length) {
      handleFinishWorkout();
    } else {
      const nextExercise = session.exercises[nextExerciseIndex];
      if (nextExercise?.mode === "timer" && nextExercise.duration) {
        setExerciseTimeRemaining(nextExercise.duration);
      }
      setCurrentExerciseIndex(nextExerciseIndex);
      setCurrentSetIndex(0);
      setIsResting(false);
    }
  }, [session, currentExerciseIndex, handleFinishWorkout]);

  // Wähle eine bestimmte Übung im Workout aus (durch Karussell-Navigation)
  const handleSelectExercise = useCallback((index: number) => {
    if (!session || index === currentExerciseIndex) return;
    
    // Timer stoppen
    if (restTimerRef.current) clearInterval(restTimerRef.current);
    if (exerciseTimerRef.current) clearInterval(exerciseTimerRef.current);
    
    const selectedExercise = session.exercises[index];
    if (selectedExercise?.mode === "timer" && selectedExercise.duration) {
      setExerciseTimeRemaining(selectedExercise.duration);
    }
    
    // Aktuellen Set-Index basierend auf bereits abgeschlossenen Sets setzen
    const alreadyCompleted = completedSets[selectedExercise.id] || 0;
    const remainingSets = selectedExercise.sets - alreadyCompleted;
    
    setCurrentExerciseIndex(index);
    setCurrentSetIndex(remainingSets > 0 ? alreadyCompleted : 0);
    setIsResting(false);
  }, [session, currentExerciseIndex, completedSets]);

  const handleCancelWorkout = useCallback(() => {
    Alert.alert(
      "Workout abbrechen",
      "Möchtest du das Workout wirklich abbrechen?",
      [
        { text: "Weiter", style: "cancel" },
        {
          text: "Abbrechen",
          style: "destructive",
          onPress: () => {
            setIsWorkoutActive(false);
            if (restTimerRef.current) clearInterval(restTimerRef.current);
            if (exerciseTimerRef.current) clearInterval(exerciseTimerRef.current);
            if (workoutTimerRef.current) clearInterval(workoutTimerRef.current);
            // Workout als abgebrochen markieren - Status zurück auf "planned"
            if (session) {
              cancelWorkout(session.id);
            }
          },
        },
      ],
    );
  }, [session, cancelWorkout]);

  // Workout Timer Effects
  useEffect(() => {
    if (isWorkoutActive && !isPaused) {
      workoutTimerRef.current = setInterval(() => {
        setWorkoutDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (workoutTimerRef.current) clearInterval(workoutTimerRef.current);
    };
  }, [isWorkoutActive, isPaused]);

  // Rest Timer
  useEffect(() => {
    if (isResting && !isPaused && restTimeRemaining > 0) {
      restTimerRef.current = setInterval(() => {
        setRestTimeRemaining((prev) => {
          if (prev <= 1) {
            Vibration.vibrate([0, 200, 100, 200]);
            setIsResting(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (restTimerRef.current) clearInterval(restTimerRef.current);
    };
  }, [isResting, isPaused, restTimeRemaining]);

  // Exercise Timer für Timer-basierte Übungen
  useEffect(() => {
    const currentExercise = session?.exercises[currentExerciseIndex];
    if (
      isWorkoutActive &&
      !isPaused &&
      !isResting &&
      currentExercise?.mode === "timer" &&
      exerciseTimeRemaining > 0
    ) {
      exerciseTimerRef.current = setInterval(() => {
        setExerciseTimeRemaining((prev) => {
          if (prev <= 1) {
            Vibration.vibrate([0, 300, 100, 300]);
            handleSetComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (exerciseTimerRef.current) clearInterval(exerciseTimerRef.current);
    };
  }, [isWorkoutActive, isPaused, isResting, currentExerciseIndex, exerciseTimeRemaining, session?.exercises, handleSetComplete]);

  if (!session) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: "Session nicht gefunden" }} />
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle"
            size={64}
            color={colors.textSecondary}
          />
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

  const handleSaveName = () => {
    if (newName.trim()) {
      updateSession(session.id, { name: newName.trim() });
      setEditingName(false);
    }
  };

  const handleDeleteSession = () => {
    Alert.alert(
      "Session löschen",
      `Möchtest du "${session.name}" wirklich löschen?`,
      [
        { text: "Abbrechen", style: "cancel" },
        {
          text: "Löschen",
          style: "destructive",
          onPress: () => {
            deleteSession(session.id);
            router.back();
          },
        },
      ],
    );
  };

  const handleRemoveExercise = (exerciseId: string, exerciseName: string) => {
    Alert.alert(
      "Übung entfernen",
      `Möchtest du "${exerciseName}" aus dieser Session entfernen?`,
      [
        { text: "Abbrechen", style: "cancel" },
        {
          text: "Entfernen",
          style: "destructive",
          onPress: () => {
            removeExerciseFromSession(session.id, exerciseId);
          },
        },
      ],
    );
  };

  const handleStartWorkout = () => {
    if (session.exercises.length === 0) {
      Alert.alert(
        "Keine Übungen",
        "Füge zuerst Übungen zu dieser Session hinzu.",
      );
      return;
    }
    // Starte Workout im Karussell-Modus
    startWorkout(session.id);
    setIsWorkoutActive(true);
    setCurrentExerciseIndex(0);
    setCurrentSetIndex(0);
    setCompletedSets({});
    setIsResting(false);
    setIsPaused(false);
    setWorkoutDuration(0);
    
    // Timer für erste Übung initialisieren
    const firstExercise = session.exercises[0];
    if (firstExercise?.mode === "timer" && firstExercise.duration) {
      setExerciseTimeRemaining(firstExercise.duration);
    }
  };

  const handleUpdateExercise = (
    exerciseId: string,
    updates: Partial<SessionExercise>,
  ) => {
    updateExerciseInSession(session.id, exerciseId, updates);
    setEditingExercise(null);
  };

  const totalSets = session.exercises.reduce((sum, ex) => sum + ex.sets, 0);
  const totalReps = session.exercises.reduce(
    (sum, ex) => sum + ex.sets * ex.reps,
    0,
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: "",
          headerRight: () => (
            <Pressable onPress={handleDeleteSession}>
              <Ionicons name="trash-outline" size={24} color="#EF4444" />
            </Pressable>
          ),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Session Name */}
        <View style={styles.nameSection}>
          {editingName ? (
            <View style={styles.nameEditRow}>
              <TextInput
                style={[
                  styles.nameInput,
                  {
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                value={newName}
                onChangeText={setNewName}
                autoFocus
                onSubmitEditing={handleSaveName}
                onBlur={handleSaveName}
              />
              <Pressable
                style={[styles.saveButton, { backgroundColor: colors.accent }]}
                onPress={handleSaveName}
              >
                <Ionicons name="checkmark" size={20} color="#fff" />
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={styles.nameRow}
              onPress={() => {
                setNewName(session.name);
                setEditingName(true);
              }}
            >
              <Text style={[styles.sessionName, { color: colors.text }]}>
                {session.name}
              </Text>
              <Ionicons name="pencil" size={18} color={colors.textSecondary} />
            </Pressable>
          )}
        </View>

        {/* Stats */}
        <View
          style={[styles.statsRow, { backgroundColor: colors.cardBackground }]}
        >
          <View style={styles.stat}>
            <Ionicons name="fitness" size={20} color={colors.accent} />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {session.exercises.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Übungen
            </Text>
          </View>
          <View
            style={[styles.statDivider, { backgroundColor: colors.border }]}
          />
          <View style={styles.stat}>
            <Ionicons name="layers" size={20} color={colors.accent} />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {totalSets}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Sätze
            </Text>
          </View>
          <View
            style={[styles.statDivider, { backgroundColor: colors.border }]}
          />
          <View style={styles.stat}>
            <Ionicons name="repeat" size={20} color={colors.accent} />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {totalReps}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Wdh.
            </Text>
          </View>
        </View>

        {/* Exercises Carousel */}
        <View style={styles.exercisesSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {isWorkoutActive ? `Workout - ${formatTime(workoutDuration)}` : "Übungen"}
            </Text>
            {!isWorkoutActive && session.exercises.length > 1 && (
              <Pressable
                style={[
                  styles.reorderButton,
                  {
                    backgroundColor: isReordering
                      ? colors.accent
                      : colors.cardBackground,
                  },
                ]}
                onPress={() => setIsReordering(!isReordering)}
              >
                <Ionicons
                  name={isReordering ? "checkmark" : "reorder-three"}
                  size={18}
                  color={isReordering ? "#fff" : colors.text}
                />
                <Text
                  style={[
                    styles.reorderButtonText,
                    { color: isReordering ? "#fff" : colors.text },
                  ]}
                >
                  {isReordering ? "Fertig" : "Sortieren"}
                </Text>
              </Pressable>
            )}
            {isWorkoutActive && (
              <Pressable
                style={[styles.pauseButton, { backgroundColor: isPaused ? colors.accent : colors.cardBackground }]}
                onPress={() => setIsPaused(!isPaused)}
              >
                <Ionicons
                  name={isPaused ? "play" : "pause"}
                  size={18}
                  color={isPaused ? "#fff" : colors.text}
                />
              </Pressable>
            )}
          </View>

          {session.exercises.length === 0 ? (
            <View
              style={[styles.emptyExercises, { borderColor: colors.border }]}
            >
              <Ionicons
                name="add-circle-outline"
                size={48}
                color={colors.textSecondary}
              />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Noch keine Übungen
              </Text>
              <Pressable
                style={[
                  styles.addExerciseButton,
                  { backgroundColor: colors.accent },
                ]}
                onPress={() => router.push("/(tabs)/explore")}
              >
                <Ionicons name="search" size={18} color="#fff" />
                <Text style={styles.addExerciseText}>Übungen suchen</Text>
              </Pressable>
            </View>
          ) : isReordering ? (
            /* Reorder Mode - Drag and Drop Liste */
            <DraggableList
              items={session.exercises.map((ex) => ({
                id: ex.id,
                name: ex.exerciseInfo.name,
              }))}
              onReorder={(newOrder) => reorderExercises(session.id, newOrder)}
            />
          ) : isWorkoutActive ? (
            /* Workout Mode - mit Workout Cards */
            <Carousel3D 
              initialIndex={currentExerciseIndex}
              activeIndex={currentExerciseIndex}
              onIndexChange={handleSelectExercise}
            >
              {session.exercises.map((sessionExercise, index) => (
                <WorkoutExerciseCard
                  key={sessionExercise.id}
                  exercise={sessionExercise}
                  index={index}
                  isActive={index === currentExerciseIndex}
                  completedSets={completedSets[sessionExercise.id] || 0}
                  currentSet={index === currentExerciseIndex ? currentSetIndex : 0}
                  isResting={index === currentExerciseIndex && isResting}
                  restTimeRemaining={restTimeRemaining}
                  exerciseTimeRemaining={exerciseTimeRemaining}
                  isPaused={isPaused}
                  onSetComplete={handleSetComplete}
                  onSkipRest={handleSkipRest}
                  onSkipExercise={handleSkipExercise}
                />
              ))}
            </Carousel3D>
          ) : (
            <Carousel3D>
              {session.exercises.map((sessionExercise, index) => (
                <SessionExerciseCard
                  key={sessionExercise.id}
                  exercise={sessionExercise}
                  index={index}
                  onPress={() => setEditingExercise(sessionExercise)}
                  onRemove={() =>
                    handleRemoveExercise(
                      sessionExercise.id,
                      sessionExercise.exerciseInfo.name,
                    )
                  }
                  variant="detail"
                />
              ))}
            </Carousel3D>
          )}
        </View>

        {/* Add More Button */}
        {session.exercises.length > 0 && !isWorkoutActive && (
          <Pressable
            style={[styles.addMoreButton, { borderColor: colors.accent }]}
            onPress={() => router.push("/(tabs)/explore")}
          >
            <Ionicons name="add" size={20} color={colors.accent} />
            <Text style={[styles.addMoreText, { color: colors.accent }]}>
              Weitere Übungen hinzufügen
            </Text>
          </Pressable>
        )}
      </ScrollView>

      {/* Start/Stop Workout Button */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: Math.max(insets.bottom, 16),
          },
        ]}
      >
        {isWorkoutActive ? (
          <View style={styles.workoutButtons}>
            <Pressable
              style={[styles.cancelWorkoutButton, { borderColor: "#EF4444" }]}
              onPress={handleCancelWorkout}
            >
              <Ionicons name="close" size={24} color="#EF4444" />
            </Pressable>
            <Pressable
              style={[styles.finishButton, { backgroundColor: "#22C55E" }]}
              onPress={handleFinishWorkout}
            >
              <Ionicons name="checkmark" size={24} color="#fff" />
              <Text style={styles.startButtonText}>Workout beenden</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={[
              styles.startButton,
              {
                backgroundColor:
                  session.exercises.length > 0 ? colors.accent : colors.border,
              },
            ]}
            onPress={handleStartWorkout}
            disabled={session.exercises.length === 0}
          >
            <Ionicons name="play" size={24} color="#fff" />
            <Text style={styles.startButtonText}>Workout starten</Text>
          </Pressable>
        )}
      </View>

      {/* Edit Exercise Modal */}
      <Modal
        visible={!!editingExercise}
        animationType="fade"
        transparent
        onRequestClose={() => setEditingExercise(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setEditingExercise(null)}
        >
          <Pressable
            style={[
              styles.modalContent,
              { backgroundColor: colors.cardBackground },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            {editingExercise && (
              <>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {editingExercise.exerciseInfo.name}
                </Text>

                {/* Sets */}
                <View style={styles.configRow}>
                  <Text
                    style={[
                      styles.configLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Sätze
                  </Text>
                  <View style={styles.configControls}>
                    <Pressable
                      style={[
                        styles.configButton,
                        { backgroundColor: colors.background },
                      ]}
                      onPress={() =>
                        handleUpdateExercise(editingExercise.id, {
                          sets: Math.max(1, editingExercise.sets - 1),
                        })
                      }
                    >
                      <Ionicons name="remove" size={20} color={colors.text} />
                    </Pressable>
                    <Text style={[styles.configValue, { color: colors.text }]}>
                      {editingExercise.sets}
                    </Text>
                    <Pressable
                      style={[
                        styles.configButton,
                        { backgroundColor: colors.background },
                      ]}
                      onPress={() =>
                        handleUpdateExercise(editingExercise.id, {
                          sets: editingExercise.sets + 1,
                        })
                      }
                    >
                      <Ionicons name="add" size={20} color={colors.text} />
                    </Pressable>
                  </View>
                </View>

                {/* Reps */}
                <View style={styles.configRow}>
                  <Text
                    style={[
                      styles.configLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Wiederholungen
                  </Text>
                  <View style={styles.configControls}>
                    <Pressable
                      style={[
                        styles.configButton,
                        { backgroundColor: colors.background },
                      ]}
                      onPress={() =>
                        handleUpdateExercise(editingExercise.id, {
                          reps: Math.max(1, editingExercise.reps - 1),
                        })
                      }
                    >
                      <Ionicons name="remove" size={20} color={colors.text} />
                    </Pressable>
                    <Text style={[styles.configValue, { color: colors.text }]}>
                      {editingExercise.reps}
                    </Text>
                    <Pressable
                      style={[
                        styles.configButton,
                        { backgroundColor: colors.background },
                      ]}
                      onPress={() =>
                        handleUpdateExercise(editingExercise.id, {
                          reps: editingExercise.reps + 1,
                        })
                      }
                    >
                      <Ionicons name="add" size={20} color={colors.text} />
                    </Pressable>
                  </View>
                </View>

                {/* Weight */}
                <View style={styles.configRow}>
                  <Text
                    style={[
                      styles.configLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Gewicht (kg)
                  </Text>
                  <View style={styles.configControls}>
                    <Pressable
                      style={[
                        styles.configButton,
                        { backgroundColor: colors.background },
                      ]}
                      onPress={() =>
                        handleUpdateExercise(editingExercise.id, {
                          weight: Math.max(0, editingExercise.weight - 2.5),
                        })
                      }
                    >
                      <Ionicons name="remove" size={20} color={colors.text} />
                    </Pressable>
                    <Text style={[styles.configValue, { color: colors.text }]}>
                      {editingExercise.weight}
                    </Text>
                    <Pressable
                      style={[
                        styles.configButton,
                        { backgroundColor: colors.background },
                      ]}
                      onPress={() =>
                        handleUpdateExercise(editingExercise.id, {
                          weight: editingExercise.weight + 2.5,
                        })
                      }
                    >
                      <Ionicons name="add" size={20} color={colors.text} />
                    </Pressable>
                  </View>
                </View>

                <Pressable
                  style={[
                    styles.doneButton,
                    { backgroundColor: colors.accent },
                  ]}
                  onPress={() => setEditingExercise(null)}
                >
                  <Text style={styles.doneButtonText}>Fertig</Text>
                </Pressable>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
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
    marginTop: 16,
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
  nameSection: {
    marginBottom: 16,
    alignItems: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  sessionName: {
    fontSize: 26,
    fontFamily: Fonts.bold,
    textAlign: "center",
  },
  nameEditRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  nameInput: {
    flex: 1,
    fontSize: 24,
    fontFamily: Fonts.bold,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 12,
  },
  saveButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  stat: {
    alignItems: "center",
    gap: 2,
  },
  statValue: {
    fontSize: 18,
    fontFamily: Fonts.bold,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: Fonts.regular,
  },
  statDivider: {
    width: 1,
    height: 28,
  },
  exercisesSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Fonts.semiBold,
  },
  reorderButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  reorderButtonText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
  },
  carouselContent: {
    paddingRight: 16,
  },
  carouselCard: {
    marginRight: 16,
  },
  carouselIndicators: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
  },
  carouselDot: {
    height: 8,
    borderRadius: 4,
  },
  emptyExercises: {
    alignItems: "center",
    paddingVertical: 40,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  emptyText: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    marginTop: 12,
    marginBottom: 20,
  },
  addExerciseButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addExerciseText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: Fonts.semiBold,
  },
  exerciseCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  exerciseNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(92, 119, 186, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  exerciseNumberText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
  },
  exerciseImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    marginBottom: 2,
  },
  exerciseDetails: {
    fontSize: 14,
    fontFamily: Fonts.medium,
  },
  exerciseNotes: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    fontStyle: "italic",
    marginTop: 2,
  },
  removeButton: {
    padding: 4,
  },
  addMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  addMoreText: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 16,
  },
  startButtonText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: Fonts.semiBold,
  },
  workoutButtons: {
    flexDirection: "row",
    gap: 12,
  },
  cancelWorkoutButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  finishButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 16,
  },
  pauseButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: Fonts.semiBold,
    marginBottom: 20,
    textAlign: "center",
  },
  configRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  configLabel: {
    fontSize: 15,
    fontFamily: Fonts.medium,
  },
  configControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  configButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  configValue: {
    fontSize: 18,
    fontFamily: Fonts.semiBold,
    minWidth: 40,
    textAlign: "center",
  },
  doneButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  doneButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: Fonts.semiBold,
  },
});
