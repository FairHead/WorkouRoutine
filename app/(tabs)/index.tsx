import { SessionGrid } from "@/components/session-grid";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  useSessionStore,
  useSessionsByStatus,
} from "@/hooks/use-session-store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { sessions, createSession } = useSessionStore();
  const inProgressSessions = useSessionsByStatus("in-progress");
  const plannedSessions = useSessionsByStatus("planned");
  const completedSessions = useSessionsByStatus("completed");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSessionName, setNewSessionName] = useState("");

  const handleCreateSession = () => {
    if (newSessionName.trim()) {
      const newSession = createSession(newSessionName.trim());
      setNewSessionName("");
      setShowCreateModal(false);
      // Navigate to the new session
      router.push(`/session/${newSession.id}` as Href);
    }
  };

  const hasAnySessions = sessions.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <ThemedView style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerTitles}>
              <ThemedText
                type="title"
                style={[styles.title, { color: colors.text }]}
              >
                Meine Sessions
              </ThemedText>
              <ThemedText
                style={[styles.subtitle, { color: colors.textSecondary }]}
              >
                {sessions.length} {sessions.length === 1 ? "Session" : "Sessions"}
              </ThemedText>
            </View>
          </View>
        </ThemedView>

        {/* Empty State */}
        {!hasAnySessions && (
          <View style={[styles.emptyState, { borderColor: colors.border }]}>
            <View
              style={[
                styles.emptyIcon,
                { backgroundColor: colors.accent + "20" },
              ]}
            >
              <Ionicons name="barbell" size={48} color={colors.accent} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Noch keine Sessions
            </Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Erstelle deine erste Workout-Session und füge Übungen aus der
              Suche hinzu!
            </Text>
            <Pressable
              style={[styles.emptyButton, { backgroundColor: colors.accent }]}
              onPress={() => setShowCreateModal(true)}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.emptyButtonText}>Session erstellen</Text>
            </Pressable>
          </View>
        )}

        {/* In Progress Section */}
        {inProgressSessions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View
                style={[styles.sectionDot, { backgroundColor: "#F59E0B" }]}
              />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Aktive Sessions
              </Text>
            </View>
            <SessionGrid sessions={inProgressSessions} />
          </View>
        )}

        {/* Planned Section */}
        {plannedSessions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionDot,
                  { backgroundColor: colors.textSecondary },
                ]}
              />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Geplante Sessions
              </Text>
            </View>
            <SessionGrid sessions={plannedSessions} />
          </View>
        )}

        {/* Completed Section */}
        {completedSessions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View
                style={[styles.sectionDot, { backgroundColor: "#10B981" }]}
              />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Abgeschlossene Sessions
              </Text>
            </View>
            <SessionGrid sessions={completedSessions} />
          </View>
        )}
      </ScrollView>

      {/* FAB - Create Session */}
      {hasAnySessions && (
        <Pressable
          style={[
            styles.fab,
            { backgroundColor: colors.accent, bottom: 20 },
          ]}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </Pressable>
      )}

      {/* Create Session Modal */}
      <Modal
        visible={showCreateModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowCreateModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowCreateModal(false)}
        >
          <Pressable
            style={[
              styles.modalContent,
              { backgroundColor: colors.cardBackground },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Neue Session erstellen
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="Session Name..."
              placeholderTextColor={colors.textSecondary}
              value={newSessionName}
              onChangeText={setNewSessionName}
              autoFocus
              onSubmitEditing={handleCreateSession}
            />

            <View style={styles.modalButtons}>
              <Pressable
                style={[
                  styles.modalButton,
                  styles.cancelButton,
                  { borderColor: colors.border },
                ]}
                onPress={() => {
                  setNewSessionName("");
                  setShowCreateModal(false);
                }}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                  Abbrechen
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.modalButton,
                  styles.createButton,
                  {
                    backgroundColor: newSessionName.trim()
                      ? colors.accent
                      : colors.border,
                  },
                ]}
                onPress={handleCreateSession}
                disabled={!newSessionName.trim()}
              >
                <Text style={styles.createButtonText}>Erstellen</Text>
              </Pressable>
            </View>
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
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
    backgroundColor: "transparent",
  },
  title: {
    fontSize: 28,
    fontFamily: Fonts.bold,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    marginTop: 4,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: Fonts.semiBold,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: Fonts.semiBold,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: Fonts.semiBold,
  },
  fab: {
    position: "absolute",
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
    fontSize: 20,
    fontFamily: Fonts.semiBold,
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: Fonts.regular,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: Fonts.medium,
  },
  createButton: {},
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: Fonts.semiBold,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerTitles: {
    flex: 1,
  },
});
