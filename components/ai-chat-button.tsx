/**
 * AI Chat Component - Floating Button + Chat Modal
 *
 * Ein schwebendes Chat-Icon, das ein Modal mit dem KI-Assistenten öffnet
 */

import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
    useSessionStore,
    type ExerciseConfig,
} from "@/hooks/use-session-store";
import {
    sendMessageToGemini,
    type ChatMessage,
} from "@/src/services/gemini.service";
import {
    parseAIWorkoutPlan,
    resolveWorkoutPlan,
    type ResolvedWorkout,
} from "@/src/services/workout-generator.service";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Erweiterte ChatMessage mit resolved workout
interface ExtendedChatMessage extends ChatMessage {
  resolvedWorkout?: ResolvedWorkout;
}

/**
 * Floating AI Chat Button + Modal
 */
export function AIChatButton() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ExtendedChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const flatListRef = useRef<FlatList>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const { createSession, addExerciseToSession, setActiveSession } =
    useSessionStore();

  // Pulsing Animation für den Button
  const pulseAnimation = useCallback(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim]);

  // Nachricht senden
  const handleSend = useCallback(async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: ExtendedChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await sendMessageToGemini(inputText.trim(), messages);

      // Prüfe ob ein Workout-Plan in der Antwort ist
      const workoutPlan = parseAIWorkoutPlan(
        response.text +
          (response.workoutSuggestion
            ? `\`\`\`json\n${JSON.stringify(response.workoutSuggestion)}\n\`\`\``
            : ""),
      );

      let resolvedWorkout: ResolvedWorkout | undefined;

      if (workoutPlan) {
        // Suche passende Übungen aus Firebase
        resolvedWorkout = await resolveWorkoutPlan(workoutPlan);
      }

      const assistantMessage: ExtendedChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.text,
        timestamp: new Date(),
        resolvedWorkout,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Scroll nach unten
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (err) {
      console.error("Chat error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Fehler bei der Kommunikation mit dem KI-Assistenten.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [inputText, isLoading, messages]);

  // Workout erstellen aus aufgelöstem Workout
  const handleCreateWorkout = useCallback(
    async (workout: ResolvedWorkout) => {
      try {
        // Neue Session erstellen
        const newSession = createSession(
          workout.sessionName,
          workout.description,
        );

        // Übungen hinzufügen
        for (const resolved of workout.exercises) {
          const config: ExerciseConfig = {
            mode: resolved.mode || "reps",
            sets: resolved.sets,
            reps: resolved.reps,
            duration: resolved.duration || 30,
            weight: 0,
            restBetweenSets: resolved.restBetweenSets,
            restAfterExercise: resolved.restAfterExercise,
            notes: resolved.notes,
          };

          addExerciseToSession(newSession.id, resolved.exercise, config);
        }

        // Session als aktiv setzen und Chat schließen
        setActiveSession(newSession.id);
        setIsOpen(false);

        // Zur neuen Session navigieren
        router.push(`/session/${newSession.id}` as any);

        // Erfolgsmeldung hinzufügen
        const successMessage: ExtendedChatMessage = {
          id: Date.now().toString(),
          role: "assistant",
          content: `✅ Session "${workout.sessionName}" wurde erstellt mit ${workout.exercises.length} Übungen!`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, successMessage]);
      } catch (err) {
        console.error("Fehler beim Erstellen der Session:", err);
        setError(
          "Fehler beim Erstellen der Session. Bitte versuche es erneut.",
        );
      }
    },
    [createSession, addExerciseToSession, setActiveSession, router],
  );

  // Quick Suggestions - kurz und klar für schnelle KI-Antworten
  const quickSuggestions = [
    "5 Arm-Übungen",
    "Bein-Workout",
    "Brust & Rücken",
    "Schulter-Training",
  ];

  // Render Message
  const renderMessage = useCallback(
    ({ item }: { item: ExtendedChatMessage }) => {
      const isUser = item.role === "user";

      return (
        <View
          style={[
            styles.messageContainer,
            isUser ? styles.userMessage : styles.assistantMessage,
          ]}
        >
          {!isUser && (
            <View
              style={[
                styles.avatarContainer,
                { backgroundColor: colors.accent },
              ]}
            >
              <MaterialCommunityIcons name="robot" size={20} color="#fff" />
            </View>
          )}

          <View
            style={[
              styles.messageBubble,
              isUser
                ? { backgroundColor: colors.accent }
                : { backgroundColor: colors.cardBackground },
            ]}
          >
            <Text
              style={[
                styles.messageText,
                { color: isUser ? "#fff" : colors.text },
              ]}
            >
              {item.content}
            </Text>

            {/* Workout-Vorschlag Button - jetzt mit resolvedWorkout */}
            {item.resolvedWorkout &&
              item.resolvedWorkout.exercises.length > 0 && (
                <Pressable
                  style={[
                    styles.createWorkoutButton,
                    { backgroundColor: colors.accent },
                  ]}
                  onPress={() => handleCreateWorkout(item.resolvedWorkout!)}
                >
                  <Ionicons name="add-circle" size={20} color="#fff" />
                  <Text style={styles.createWorkoutText}>
                    Session erstellen ({item.resolvedWorkout.exercises.length}{" "}
                    Übungen)
                  </Text>
                </Pressable>
              )}
          </View>

          {isUser && (
            <View
              style={[styles.avatarContainer, { backgroundColor: colors.tint }]}
            >
              <Ionicons name="person" size={18} color="#fff" />
            </View>
          )}
        </View>
      );
    },
    [colors, handleCreateWorkout],
  );

  return (
    <>
      {/* Floating Button */}
      <Animated.View
        style={[
          styles.floatingButton,
          {
            bottom: 70,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Pressable
          style={[
            styles.floatingButtonInner,
            { backgroundColor: colors.accent },
          ]}
          onPress={() => {
            pulseAnimation();
            setIsOpen(true);
          }}
        >
          <MaterialCommunityIcons name="robot-excited" size={28} color="#fff" />
        </Pressable>
      </Animated.View>

      {/* Chat Modal */}
      <Modal
        visible={isOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsOpen(false)}
      >
        <KeyboardAvoidingView
          style={[
            styles.modalContainer,
            { backgroundColor: colors.background },
          ]}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Pressable
              onPress={() => setIsOpen(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
            <View style={styles.headerTitleContainer}>
              <MaterialCommunityIcons
                name="robot"
                size={24}
                color={colors.accent}
              />
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                KI Workout-Assistent
              </Text>
            </View>
            <View style={styles.closeButton} />
          </View>

          {/* Messages */}
          {messages.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="arm-flex"
                size={64}
                color={colors.textSecondary}
              />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                Hallo! 👋
              </Text>
              <Text
                style={[styles.emptySubtitle, { color: colors.textSecondary }]}
              >
                Ich bin dein KI Fitness-Trainer. Sag mir was du trainieren
                möchtest und ich erstelle dir eine passende Session!
              </Text>

              {/* Quick Suggestions */}
              <View style={styles.suggestionsContainer}>
                {quickSuggestions.map((suggestion, index) => (
                  <Pressable
                    key={index}
                    style={[
                      styles.suggestionChip,
                      {
                        backgroundColor: colors.cardBackground,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => setInputText(suggestion)}
                  >
                    <Text
                      style={[styles.suggestionText, { color: colors.text }]}
                    >
                      {suggestion}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={renderMessage}
              contentContainerStyle={styles.messagesList}
              onContentSizeChange={() =>
                flatListRef.current?.scrollToEnd({ animated: true })
              }
            />
          )}

          {/* Error */}
          {error && (
            <View
              style={[styles.errorContainer, { backgroundColor: "#FF5252" }]}
            >
              <Text style={styles.errorText}>{error}</Text>
              <Pressable onPress={() => setError(null)}>
                <Ionicons name="close-circle" size={20} color="#fff" />
              </Pressable>
            </View>
          )}

          {/* Input */}
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: colors.background,
                borderTopColor: colors.border,
                paddingBottom: Math.max(insets.bottom, 16),
              },
            ]}
          >
            <View
              style={[
                styles.inputWrapper,
                { backgroundColor: colors.cardBackground },
              ]}
            >
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                placeholder="Was möchtest du trainieren?"
                placeholderTextColor={colors.textSecondary}
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
                editable={!isLoading}
                onSubmitEditing={handleSend}
              />
              <Pressable
                style={[
                  styles.sendButton,
                  {
                    backgroundColor:
                      inputText.trim() && !isLoading
                        ? colors.accent
                        : colors.border,
                  },
                ]}
                onPress={handleSend}
                disabled={!inputText.trim() || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="send" size={20} color="#fff" />
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: "absolute",
    left: 16,
    width: 56,
    height: 56,
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: Fonts.rounded,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 16,
    fontFamily: Fonts.rounded,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 24,
    fontFamily: Fonts.rounded,
  },
  suggestionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginTop: 24,
    paddingHorizontal: 16,
  },
  suggestionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  suggestionText: {
    fontSize: 14,
    fontFamily: Fonts.rounded,
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-end",
  },
  userMessage: {
    justifyContent: "flex-end",
  },
  assistantMessage: {
    justifyContent: "flex-start",
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  messageBubble: {
    maxWidth: "75%",
    padding: 12,
    borderRadius: 16,
    marginHorizontal: 8,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: Fonts.rounded,
  },
  createWorkoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
  },
  createWorkoutText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: Fonts.rounded,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  errorText: {
    color: "#fff",
    fontSize: 14,
    flex: 1,
    fontFamily: Fonts.rounded,
  },
  inputContainer: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderRadius: 24,
    paddingLeft: 16,
    paddingRight: 4,
    paddingVertical: 4,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 10,
    fontFamily: Fonts.rounded,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
