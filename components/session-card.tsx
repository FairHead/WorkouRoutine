import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { Session } from "@/src/models";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { ExerciseCardStack } from "./exercise-card-stack";

interface SessionCardProps {
  session: Session;
  /** Zeigt den Exercise Stack an */
  showStack?: boolean;
}

export function SessionCard({ session, showStack = true }: SessionCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();

  const exerciseCount = session.exercises.length;
  const totalSets = session.exercises.reduce((sum, ex) => sum + ex.sets, 0);
  const timerCount = session.exercises.filter(
    (ex) => ex.mode === "timer",
  ).length;

  const getStatusColor = () => {
    switch (session.status) {
      case "in-progress":
        return "#F59E0B";
      case "completed":
        return "#10B981";
      case "cancelled":
        return "#EF4444";
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = () => {
    switch (session.status) {
      case "in-progress":
        return "Läuft";
      case "completed":
        return "Abgeschlossen";
      case "cancelled":
        return "Abgebrochen";
      default:
        return "Geplant";
    }
  };

  const navigateToSession = () => {
    router.push(`/session/${session.id}` as Href);
  };

  return (
    <Pressable
      style={[
        styles.card,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.border,
        },
      ]}
      onPress={navigateToSession}
    >
      {/* Status Badge */}
      <View
        style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor() + "20" },
        ]}
      >
        <View
          style={[styles.statusDot, { backgroundColor: getStatusColor() }]}
        />
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
      </View>

      {/* Exercise Card Stack */}
      {showStack && (
        <View style={styles.stackSection}>
          <ExerciseCardStack
            exercises={session.exercises}
            onPress={navigateToSession}
          />
        </View>
      )}

      {/* Session Info */}
      <View style={styles.infoSection}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {session.name}
        </Text>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Ionicons name="fitness" size={12} color={colors.textSecondary} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {exerciseCount}
            </Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="layers" size={12} color={colors.textSecondary} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {totalSets}
            </Text>
          </View>
          {timerCount > 0 && (
            <View style={styles.stat}>
              <Ionicons name="timer" size={12} color="#F59E0B" />
              <Text style={[styles.statText, { color: "#F59E0B" }]}>
                {timerCount}
              </Text>
            </View>
          )}
        </View>

        {/* Play Button */}
        <View style={[styles.playButton, { backgroundColor: colors.accent }]}>
          <Ionicons name="play" size={14} color="#fff" />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 5,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  statusText: {
    fontSize: 10,
    fontFamily: Fonts.medium,
  },
  stackSection: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  infoSection: {
    gap: 4,
  },
  title: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    lineHeight: 18,
  },
  stats: {
    flexDirection: "row",
    gap: 10,
    marginTop: 2,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  statText: {
    fontSize: 11,
    fontFamily: Fonts.regular,
  },
  playButton: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});
