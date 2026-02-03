import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  defaultExerciseConfig,
  useSessionStore,
  type ExerciseConfig,
} from "@/hooks/use-session-store";
import type { ExerciseInfo, SessionExerciseMode } from "@/src/models";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

/**
 * Numpad Input Modal für direkte Zahleneingabe
 */
interface NumpadModalProps {
  visible: boolean;
  title: string;
  value: number;
  unit?: string;
  isTime?: boolean; // Für Zeitwerte (MM:SS)
  min?: number;
  max?: number;
  step?: number;
  decimals?: number; // Für Dezimalzahlen (z.B. Gewicht)
  onConfirm: (value: number) => void;
  onClose: () => void;
}

function NumpadModal({
  visible,
  title,
  value,
  unit,
  isTime = false,
  min = 0,
  max = 9999,
  decimals = 0,
  onConfirm,
  onClose,
}: NumpadModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Für Zeitwerte speichern wir Minuten und Sekunden separat
  const [inputValue, setInputValue] = useState(() => {
    if (isTime) {
      const mins = Math.floor(value / 60);
      const secs = value % 60;
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    }
    return decimals > 0 ? value.toFixed(decimals) : value.toString();
  });

  // Reset bei Öffnen
  React.useEffect(() => {
    if (visible) {
      if (isTime) {
        const mins = Math.floor(value / 60);
        const secs = value % 60;
        setInputValue(`${mins}:${secs.toString().padStart(2, "0")}`);
      } else {
        setInputValue(
          decimals > 0 ? value.toFixed(decimals) : value.toString(),
        );
      }
    }
  }, [visible, value, isTime, decimals]);

  const handleNumberPress = (num: string) => {
    if (isTime) {
      // Für Zeitwerte: Format MM:SS
      const clean = inputValue.replace(":", "");
      if (clean.length >= 4 && num !== "backspace") return;

      let newClean: string;
      if (num === "backspace") {
        newClean = clean.slice(0, -1) || "0";
      } else {
        newClean = clean === "0" ? num : clean + num;
      }

      // Formatieren als MM:SS
      const padded = newClean.padStart(2, "0");
      if (padded.length <= 2) {
        setInputValue(`0:${padded}`);
      } else {
        const mins = padded.slice(0, -2);
        const secs = padded.slice(-2);
        setInputValue(`${parseInt(mins)}:${secs}`);
      }
    } else if (decimals > 0) {
      // Für Dezimalzahlen
      if (num === "backspace") {
        setInputValue((prev) => prev.slice(0, -1) || "0");
      } else if (num === ".") {
        if (!inputValue.includes(".")) {
          setInputValue((prev) => prev + ".");
        }
      } else {
        setInputValue((prev) => (prev === "0" ? num : prev + num));
      }
    } else {
      // Für ganze Zahlen
      if (num === "backspace") {
        setInputValue((prev) => prev.slice(0, -1) || "0");
      } else if (num === ".") {
        // Ignorieren für ganze Zahlen
      } else {
        setInputValue((prev) => (prev === "0" ? num : prev + num));
      }
    }
  };

  const handleConfirm = () => {
    let finalValue: number;

    if (isTime) {
      const parts = inputValue.split(":");
      const mins = parseInt(parts[0]) || 0;
      const secs = parseInt(parts[1]) || 0;
      finalValue = mins * 60 + secs;
    } else {
      finalValue = parseFloat(inputValue) || 0;
    }

    // Limits anwenden
    finalValue = Math.max(min, Math.min(max, finalValue));

    onConfirm(finalValue);
    onClose();
  };

  const handleClear = () => {
    setInputValue(isTime ? "0:00" : "0");
  };

  const displayValue = isTime
    ? inputValue
    : inputValue + (unit ? ` ${unit}` : "");

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.numpadOverlay} onPress={onClose}>
        <Pressable
          style={[
            styles.numpadContainer,
            { backgroundColor: colors.background },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <Text style={[styles.numpadTitle, { color: colors.text }]}>
            {title}
          </Text>

          {/* Display */}
          <View
            style={[
              styles.numpadDisplay,
              { backgroundColor: colors.cardBackground },
            ]}
          >
            <Text style={[styles.numpadDisplayText, { color: colors.accent }]}>
              {displayValue}
            </Text>
          </View>

          {/* Numpad Grid */}
          <View style={styles.numpadGrid}>
            {[
              "1",
              "2",
              "3",
              "4",
              "5",
              "6",
              "7",
              "8",
              "9",
              decimals > 0 ? "." : "C",
              "0",
              "⌫",
            ].map((key) => (
              <Pressable
                key={key}
                style={[
                  styles.numpadKey,
                  { backgroundColor: colors.cardBackground },
                  key === "C" && { backgroundColor: "#F4433630" },
                  key === "⌫" && { backgroundColor: colors.cardBackground },
                ]}
                onPress={() => {
                  if (key === "C") {
                    handleClear();
                  } else if (key === "⌫") {
                    handleNumberPress("backspace");
                  } else {
                    handleNumberPress(key);
                  }
                }}
              >
                <Text
                  style={[
                    styles.numpadKeyText,
                    { color: colors.text },
                    key === "C" && { color: "#F44336" },
                  ]}
                >
                  {key}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Buttons */}
          <View style={styles.numpadButtons}>
            <Pressable
              style={[
                styles.numpadButton,
                { backgroundColor: colors.cardBackground },
              ]}
              onPress={onClose}
            >
              <Text style={[styles.numpadButtonText, { color: colors.text }]}>
                Abbrechen
              </Text>
            </Pressable>
            <Pressable
              style={[styles.numpadButton, { backgroundColor: colors.accent }]}
              onPress={handleConfirm}
            >
              <Text style={[styles.numpadButtonText, { color: "#fff" }]}>
                Bestätigen
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

interface AddToSessionModalProps {
  visible: boolean;
  exercise: ExerciseInfo | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddToSessionModal({
  visible,
  exercise,
  onClose,
  onSuccess,
}: AddToSessionModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const {
    sessions,
    createSession,
    addExerciseToSession,
    setActiveSession,
    activeSessionId,
  } = useSessionStore();

  // State
  const [config, setConfig] = useState<ExerciseConfig>(defaultExerciseConfig);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  );
  const [showNewSession, setShowNewSession] = useState(false);
  const [newSessionName, setNewSessionName] = useState("");

  // Numpad State
  const [numpadVisible, setNumpadVisible] = useState(false);
  const [numpadConfig, setNumpadConfig] = useState<{
    field: keyof ExerciseConfig;
    title: string;
    value: number;
    unit?: string;
    isTime?: boolean;
    min?: number;
    max?: number;
    decimals?: number;
  } | null>(null);

  // Öffnet das Numpad für ein bestimmtes Feld
  const openNumpad = useCallback(
    (
      field: keyof ExerciseConfig,
      title: string,
      options?: {
        unit?: string;
        isTime?: boolean;
        min?: number;
        max?: number;
        decimals?: number;
      },
    ) => {
      setNumpadConfig({
        field,
        title,
        value: config[field] as number,
        ...options,
      });
      setNumpadVisible(true);
    },
    [config],
  );

  // Numpad Bestätigung
  const handleNumpadConfirm = useCallback(
    (value: number) => {
      if (numpadConfig) {
        setConfig((prev) => ({ ...prev, [numpadConfig.field]: value }));
      }
    },
    [numpadConfig],
  );

  // Filter nur geplante Sessions
  const plannedSessions = sessions.filter((s) => s.status === "planned");

  // Automatisch aktive Session vorauswählen wenn Modal öffnet
  React.useEffect(() => {
    if (visible && activeSessionId) {
      // Prüfe ob die aktive Session noch in den geplanten Sessions ist
      const activeSessionExists = plannedSessions.some(
        (s) => s.id === activeSessionId,
      );
      if (activeSessionExists) {
        setSelectedSessionId(activeSessionId);
      }
    }
  }, [visible, activeSessionId, plannedSessions]);

  // Reset State
  const resetState = useCallback(() => {
    setConfig(defaultExerciseConfig);
    setSelectedSessionId(null);
    setShowNewSession(false);
    setNewSessionName("");
  }, []);

  // Handle Close
  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [resetState, onClose]);

  // Create new Session
  const handleCreateSession = useCallback(() => {
    if (!newSessionName.trim()) return;

    const newSession = createSession(newSessionName.trim());
    setSelectedSessionId(newSession.id);
    setActiveSession(newSession.id);
    setShowNewSession(false);
    setNewSessionName("");
  }, [newSessionName, createSession, setActiveSession]);

  // Add Exercise
  const handleAddExercise = useCallback(() => {
    if (!exercise || !selectedSessionId) return;

    addExerciseToSession(selectedSessionId, exercise, config);
    handleClose();
    onSuccess?.();
  }, [
    exercise,
    selectedSessionId,
    config,
    addExerciseToSession,
    handleClose,
    onSuccess,
  ]);

  // Update config helper
  const updateConfig = useCallback(
    <K extends keyof ExerciseConfig>(key: K, value: ExerciseConfig[K]) => {
      setConfig((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  // Toggle Mode
  const toggleMode = useCallback((mode: SessionExerciseMode) => {
    setConfig((prev) => ({ ...prev, mode }));
  }, []);

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!exercise) return null;

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleClose}
      >
        <View
          style={[styles.container, { backgroundColor: colors.background }]}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Zur Session hinzufügen
            </Text>
            <View style={styles.closeButton} />
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
          >
            {/* Exercise Preview */}
            <View
              style={[
                styles.exercisePreview,
                { backgroundColor: colors.cardBackground },
              ]}
            >
              <Text style={[styles.exerciseName, { color: colors.text }]}>
                {exercise.name}
              </Text>
              <Text
                style={[styles.exerciseInfo, { color: colors.textSecondary }]}
              >
                {exercise.targetMuscle} • {exercise.equipment}
              </Text>
            </View>

            {/* Session Selection */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Session auswählen
            </Text>

            {/* Existing Sessions */}
            {plannedSessions.length > 0 && (
              <View style={styles.sessionList}>
                {plannedSessions.map((session) => (
                  <Pressable
                    key={session.id}
                    style={[
                      styles.sessionItem,
                      {
                        backgroundColor:
                          selectedSessionId === session.id
                            ? colors.accent
                            : colors.cardBackground,
                        borderColor:
                          selectedSessionId === session.id
                            ? colors.accent
                            : colors.border,
                      },
                    ]}
                    onPress={() => setSelectedSessionId(session.id)}
                  >
                    <Text
                      style={[
                        styles.sessionName,
                        {
                          color:
                            selectedSessionId === session.id
                              ? "#fff"
                              : colors.text,
                        },
                      ]}
                    >
                      {session.name}
                    </Text>
                    <Text
                      style={[
                        styles.sessionExerciseCount,
                        {
                          color:
                            selectedSessionId === session.id
                              ? "rgba(255,255,255,0.8)"
                              : colors.textSecondary,
                        },
                      ]}
                    >
                      {session.exercises.length} Übungen
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}

            {/* New Session Button/Form */}
            {showNewSession ? (
              <View style={styles.newSessionForm}>
                <TextInput
                  style={[
                    styles.newSessionInput,
                    {
                      backgroundColor: colors.cardBackground,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  placeholder="Session Name..."
                  placeholderTextColor={colors.textSecondary}
                  value={newSessionName}
                  onChangeText={setNewSessionName}
                  autoFocus
                />
                <View style={styles.newSessionButtons}>
                  <Pressable
                    style={[
                      styles.newSessionButton,
                      { backgroundColor: colors.cardBackground },
                    ]}
                    onPress={() => setShowNewSession(false)}
                  >
                    <Text style={{ color: colors.text }}>Abbrechen</Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.newSessionButton,
                      {
                        backgroundColor: newSessionName.trim()
                          ? colors.accent
                          : colors.cardBackground,
                      },
                    ]}
                    onPress={handleCreateSession}
                    disabled={!newSessionName.trim()}
                  >
                    <Text
                      style={{
                        color: newSessionName.trim()
                          ? "#fff"
                          : colors.textSecondary,
                      }}
                    >
                      Erstellen
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                style={[
                  styles.createSessionButton,
                  { borderColor: colors.accent },
                ]}
                onPress={() => setShowNewSession(true)}
              >
                <Ionicons name="add" size={20} color={colors.accent} />
                <Text
                  style={[styles.createSessionText, { color: colors.accent }]}
                >
                  Neue Session erstellen
                </Text>
              </Pressable>
            )}

            {/* Exercise Config */}
            <Text
              style={[
                styles.sectionTitle,
                { color: colors.text, marginTop: 24 },
              ]}
            >
              Übungseinstellungen
            </Text>

            {/* Mode Toggle: Reps vs Timer */}
            <View style={styles.modeToggleContainer}>
              <Pressable
                style={[
                  styles.modeToggle,
                  config.mode === "reps" && styles.modeToggleActive,
                  {
                    backgroundColor:
                      config.mode === "reps"
                        ? colors.accent
                        : colors.cardBackground,
                  },
                ]}
                onPress={() => toggleMode("reps")}
              >
                <Ionicons
                  name="repeat"
                  size={20}
                  color={config.mode === "reps" ? "#fff" : colors.text}
                />
                <Text
                  style={[
                    styles.modeToggleText,
                    { color: config.mode === "reps" ? "#fff" : colors.text },
                  ]}
                >
                  Wiederholungen
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.modeToggle,
                  config.mode === "timer" && styles.modeToggleActive,
                  {
                    backgroundColor:
                      config.mode === "timer"
                        ? colors.accent
                        : colors.cardBackground,
                  },
                ]}
                onPress={() => toggleMode("timer")}
              >
                <Ionicons
                  name="timer"
                  size={20}
                  color={config.mode === "timer" ? "#fff" : colors.text}
                />
                <Text
                  style={[
                    styles.modeToggleText,
                    { color: config.mode === "timer" ? "#fff" : colors.text },
                  ]}
                >
                  Timer
                </Text>
              </Pressable>
            </View>

            {/* Sets */}
            <View style={styles.configRow}>
              <Text style={[styles.configLabel, { color: colors.text }]}>
                Sets
              </Text>
              <View style={styles.configControl}>
                <Pressable
                  style={[
                    styles.configButton,
                    { backgroundColor: colors.cardBackground },
                  ]}
                  onPress={() =>
                    updateConfig("sets", Math.max(1, config.sets - 1))
                  }
                >
                  <Ionicons name="remove" size={20} color={colors.text} />
                </Pressable>
                <Pressable
                  onPress={() =>
                    openNumpad("sets", "Sets", { min: 1, max: 20 })
                  }
                  style={styles.configValueButton}
                >
                  <Text style={[styles.configValue, { color: colors.text }]}>
                    {config.sets}
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.configButton,
                    { backgroundColor: colors.cardBackground },
                  ]}
                  onPress={() => updateConfig("sets", config.sets + 1)}
                >
                  <Ionicons name="add" size={20} color={colors.text} />
                </Pressable>
              </View>
            </View>

            {/* Reps or Duration based on mode */}
            {config.mode === "reps" ? (
              <View style={styles.configRow}>
                <Text style={[styles.configLabel, { color: colors.text }]}>
                  Wiederholungen
                </Text>
                <View style={styles.configControl}>
                  <Pressable
                    style={[
                      styles.configButton,
                      { backgroundColor: colors.cardBackground },
                    ]}
                    onPress={() =>
                      updateConfig("reps", Math.max(1, config.reps - 1))
                    }
                  >
                    <Ionicons name="remove" size={20} color={colors.text} />
                  </Pressable>
                  <Pressable
                    onPress={() =>
                      openNumpad("reps", "Wiederholungen", { min: 1, max: 100 })
                    }
                    style={styles.configValueButton}
                  >
                    <Text style={[styles.configValue, { color: colors.text }]}>
                      {config.reps}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.configButton,
                      { backgroundColor: colors.cardBackground },
                    ]}
                    onPress={() => updateConfig("reps", config.reps + 1)}
                  >
                    <Ionicons name="add" size={20} color={colors.text} />
                  </Pressable>
                </View>
              </View>
            ) : (
              <View style={styles.configRow}>
                <Text style={[styles.configLabel, { color: colors.text }]}>
                  Dauer pro Set
                </Text>
                <View style={styles.configControl}>
                  <Pressable
                    style={[
                      styles.configButton,
                      { backgroundColor: colors.cardBackground },
                    ]}
                    onPress={() =>
                      updateConfig("duration", Math.max(5, config.duration - 5))
                    }
                  >
                    <Ionicons name="remove" size={20} color={colors.text} />
                  </Pressable>
                  <Pressable
                    onPress={() =>
                      openNumpad("duration", "Dauer pro Set", {
                        isTime: true,
                        min: 5,
                        max: 3600,
                      })
                    }
                    style={styles.configValueButton}
                  >
                    <Text
                      style={[styles.configValue, { color: colors.accent }]}
                    >
                      {formatTime(config.duration)}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.configButton,
                      { backgroundColor: colors.cardBackground },
                    ]}
                    onPress={() =>
                      updateConfig("duration", config.duration + 5)
                    }
                  >
                    <Ionicons name="add" size={20} color={colors.text} />
                  </Pressable>
                </View>
              </View>
            )}

            {/* Weight */}
            <View style={styles.configRow}>
              <Text style={[styles.configLabel, { color: colors.text }]}>
                Gewicht (kg)
              </Text>
              <View style={styles.configControl}>
                <Pressable
                  style={[
                    styles.configButton,
                    { backgroundColor: colors.cardBackground },
                  ]}
                  onPress={() =>
                    updateConfig("weight", Math.max(0, config.weight - 2.5))
                  }
                >
                  <Ionicons name="remove" size={20} color={colors.text} />
                </Pressable>
                <Pressable
                  onPress={() =>
                    openNumpad("weight", "Gewicht", {
                      unit: "kg",
                      min: 0,
                      max: 500,
                      decimals: 1,
                    })
                  }
                  style={styles.configValueButton}
                >
                  <Text style={[styles.configValue, { color: colors.text }]}>
                    {config.weight}
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.configButton,
                    { backgroundColor: colors.cardBackground },
                  ]}
                  onPress={() => updateConfig("weight", config.weight + 2.5)}
                >
                  <Ionicons name="add" size={20} color={colors.text} />
                </Pressable>
              </View>
            </View>

            {/* Rest Between Sets */}
            <View style={styles.configRow}>
              <Text style={[styles.configLabel, { color: colors.text }]}>
                Pause zwischen Sets
              </Text>
              <View style={styles.configControl}>
                <Pressable
                  style={[
                    styles.configButton,
                    { backgroundColor: colors.cardBackground },
                  ]}
                  onPress={() =>
                    updateConfig(
                      "restBetweenSets",
                      Math.max(0, config.restBetweenSets - 15),
                    )
                  }
                >
                  <Ionicons name="remove" size={20} color={colors.text} />
                </Pressable>
                <Pressable
                  onPress={() =>
                    openNumpad("restBetweenSets", "Pause zwischen Sets", {
                      isTime: true,
                      min: 0,
                      max: 600,
                    })
                  }
                  style={styles.configValueButton}
                >
                  <Text style={[styles.configValue, { color: colors.text }]}>
                    {formatTime(config.restBetweenSets)}
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.configButton,
                    { backgroundColor: colors.cardBackground },
                  ]}
                  onPress={() =>
                    updateConfig("restBetweenSets", config.restBetweenSets + 15)
                  }
                >
                  <Ionicons name="add" size={20} color={colors.text} />
                </Pressable>
              </View>
            </View>

            {/* Rest After Exercise */}
            <View style={styles.configRow}>
              <Text style={[styles.configLabel, { color: colors.text }]}>
                Pause nach Übung
              </Text>
              <View style={styles.configControl}>
                <Pressable
                  style={[
                    styles.configButton,
                    { backgroundColor: colors.cardBackground },
                  ]}
                  onPress={() =>
                    updateConfig(
                      "restAfterExercise",
                      Math.max(0, config.restAfterExercise - 15),
                    )
                  }
                >
                  <Ionicons name="remove" size={20} color={colors.text} />
                </Pressable>
                <Pressable
                  onPress={() =>
                    openNumpad("restAfterExercise", "Pause nach Übung", {
                      isTime: true,
                      min: 0,
                      max: 600,
                    })
                  }
                  style={styles.configValueButton}
                >
                  <Text style={[styles.configValue, { color: colors.text }]}>
                    {formatTime(config.restAfterExercise)}
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.configButton,
                    { backgroundColor: colors.cardBackground },
                  ]}
                  onPress={() =>
                    updateConfig(
                      "restAfterExercise",
                      config.restAfterExercise + 15,
                    )
                  }
                >
                  <Ionicons name="add" size={20} color={colors.text} />
                </Pressable>
              </View>
            </View>

            {/* Notes */}
            <View style={styles.configRow}>
              <Text style={[styles.configLabel, { color: colors.text }]}>
                Notizen
              </Text>
            </View>
            <TextInput
              style={[
                styles.notesInput,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="Optional: Notizen zur Übung..."
              placeholderTextColor={colors.textSecondary}
              value={config.notes || ""}
              onChangeText={(text) => updateConfig("notes", text)}
              multiline
            />
          </ScrollView>

          {/* Add Button */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <Pressable
              style={[
                styles.addButton,
                {
                  backgroundColor: selectedSessionId
                    ? colors.accent
                    : colors.cardBackground,
                },
              ]}
              onPress={handleAddExercise}
              disabled={!selectedSessionId}
            >
              <Ionicons
                name="add"
                size={24}
                color={selectedSessionId ? "#fff" : colors.textSecondary}
              />
              <Text
                style={[
                  styles.addButtonText,
                  { color: selectedSessionId ? "#fff" : colors.textSecondary },
                ]}
              >
                Hinzufügen
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Numpad Modal */}
      {numpadConfig && (
        <NumpadModal
          visible={numpadVisible}
          title={numpadConfig.title}
          value={numpadConfig.value}
          unit={numpadConfig.unit}
          isTime={numpadConfig.isTime}
          min={numpadConfig.min}
          max={numpadConfig.max}
          decimals={numpadConfig.decimals}
          onConfirm={handleNumpadConfirm}
          onClose={() => setNumpadVisible(false)}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: Fonts.rounded,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  exercisePreview: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: Fonts.rounded,
  },
  exerciseInfo: {
    fontSize: 14,
    marginTop: 4,
    fontFamily: Fonts.sans,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    fontFamily: Fonts.rounded,
  },
  sessionList: {
    gap: 8,
    marginBottom: 12,
  },
  sessionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  sessionName: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: Fonts.rounded,
  },
  sessionExerciseCount: {
    fontSize: 13,
    fontFamily: Fonts.sans,
  },
  createSessionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  createSessionText: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: Fonts.rounded,
  },
  newSessionForm: {
    gap: 12,
  },
  newSessionInput: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
    fontFamily: Fonts.sans,
  },
  newSessionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  newSessionButton: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
  },
  modeToggleContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  modeToggle: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 14,
    borderRadius: 12,
  },
  modeToggleActive: {},
  modeToggleText: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: Fonts.rounded,
  },
  configRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  configLabel: {
    fontSize: 15,
    fontWeight: "500",
    fontFamily: Fonts.sans,
  },
  configControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  configButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  configValue: {
    fontSize: 18,
    fontWeight: "700",
    minWidth: 50,
    textAlign: "center",
    fontFamily: Fonts.rounded,
  },
  configValueButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  notesInput: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: "top",
    fontFamily: Fonts.sans,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 14,
  },
  addButtonText: {
    fontSize: 17,
    fontWeight: "600",
    fontFamily: Fonts.rounded,
  },
  // Numpad Styles
  numpadOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  numpadContainer: {
    width: "100%",
    maxWidth: 320,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  numpadTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
    fontFamily: Fonts.rounded,
  },
  numpadDisplay: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: "center",
  },
  numpadDisplayText: {
    fontSize: 32,
    fontWeight: "700",
    fontFamily: Fonts.rounded,
  },
  numpadGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  numpadKey: {
    width: "30%",
    aspectRatio: 1.5,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  numpadKeyText: {
    fontSize: 24,
    fontWeight: "600",
    fontFamily: Fonts.rounded,
  },
  numpadButtons: {
    flexDirection: "row",
    gap: 12,
  },
  numpadButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  numpadButtonText: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: Fonts.rounded,
  },
});
