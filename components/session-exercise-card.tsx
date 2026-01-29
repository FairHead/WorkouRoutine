import { Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { SessionExercise } from "@/src/models";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

interface SessionExerciseCardProps {
  exercise: SessionExercise;
  index: number;
  /** Kompakte Darstellung für Karussell (volle ExerciseCard-Design) */
  compact?: boolean;
  /** Große Detail-Darstellung für Session-Detail-Karussell */
  variant?: "default" | "compact" | "detail";
  /** Callback wenn die Card gedrückt wird */
  onPress?: () => void;
  /** Callback für Löschen-Button */
  onRemove?: () => void;
}

/** Formatiert Sekunden in "MM:SS min" Format */
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")} min`;
}

/** Formatiert Sekunden in "XXs" Format */
function formatSeconds(seconds: number): string {
  return `${seconds}s`;
}

/** Berechnet geschätzte Kalorien basierend auf Sets, Reps/Duration und Intensität */
function estimateCalories(exercise: SessionExercise): number {
  const baseCaloriesPerSet = 8;
  const isTimer = exercise.mode === "timer";
  const workPerSet = isTimer ? exercise.duration / 10 : exercise.reps;
  const intensityMultiplier = 0.8; // Basis-Intensität
  return Math.round(
    exercise.sets * workPerSet * baseCaloriesPerSet * intensityMultiplier,
  );
}

/** Berechnet Gesamt-Trainingsdauer in Sekunden */
function calculateTotalDuration(exercise: SessionExercise): number {
  const isTimer = exercise.mode === "timer";
  const setDuration = isTimer ? exercise.duration : exercise.reps * 3; // 3s pro Rep geschätzt
  const totalSetTime = exercise.sets * setDuration;
  const totalRestTime = (exercise.sets - 1) * exercise.restBetweenSets;
  return totalSetTime + totalRestTime;
}

export function SessionExerciseCard({
  exercise,
  index,
  compact = false,
  variant = "default",
  onPress,
  onRemove,
}: SessionExerciseCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Timing Mode State (Total vs Intervals)
  const [timingMode, setTimingMode] = useState<"total" | "intervals">("total");

  const isTimerMode = exercise.mode === "timer";
  const intensity = 75; // Basis-Intensität für Session-Übungen
  const calories = estimateCalories(exercise);
  const totalDuration = calculateTotalDuration(exercise);
  const setDuration = isTimerMode ? exercise.duration : exercise.reps * 3;

  // Use compact prop or variant
  const isCompact = compact || variant === "compact";
  const isDetail = variant === "detail";

  // Theme Colors
  const colors = {
    bgPrimary: isDark ? "#1a1a2e" : "#ffffff",
    bgSecondary: isDark ? "#2d2d44" : "#f0f0f5",
    textPrimary: isDark ? "#ffffff" : "#1a1a2e",
    textSecondary: isDark ? "#e5e7eb" : "#4a4a5a",
    textMuted: isDark ? "#9ca3af" : "#6b7280",
    accentPrimary: "#5c77ba",
    border: isDark ? "rgba(92, 119, 186, 0.2)" : "rgba(92, 119, 186, 0.15)",
  };

  if (isCompact) {
    // Kompakte Version für Karussell - Volles ExerciseCard-Design
    return (
      <Pressable onPress={onPress} style={styles.cardWrapper}>
        <View
          style={[
            styles.root,
            { backgroundColor: colors.bgPrimary, borderColor: colors.border },
          ]}
        >
          {/* Exercise Image */}
          <View style={styles.imageContainer}>
            <Image
              source={exercise.exerciseInfo.image}
              style={styles.exerciseImage}
              contentFit="cover"
            />
            {/* Mode Badge */}
            <View
              style={[
                styles.modeBadge,
                {
                  backgroundColor: isTimerMode
                    ? "#F59E0B"
                    : colors.accentPrimary,
                },
              ]}
            >
              <Ionicons
                name={isTimerMode ? "timer" : "repeat"}
                size={10}
                color="#fff"
              />
            </View>
          </View>

          {/* Exercise Name */}
          <Text
            style={[styles.exerciseName, { color: colors.textPrimary }]}
            numberOfLines={1}
          >
            {exercise.exerciseInfo.name}
          </Text>

          {/* Stats Row: Sets, Reps, Weight */}
          <View style={styles.statsRow}>
            <View style={styles.statBlock}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                Sets:
              </Text>
              <Text style={[styles.statValue, { color: colors.textSecondary }]}>
                {exercise.sets} x
              </Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                {isTimerMode ? "Zeit:" : "Reps:"}
              </Text>
              <Text style={[styles.statValue, { color: colors.textSecondary }]}>
                {isTimerMode
                  ? formatSeconds(exercise.duration)
                  : `${exercise.reps} x`}
              </Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                Weight:
              </Text>
              <Text style={[styles.statValue, { color: colors.textSecondary }]}>
                {exercise.weight} kg
              </Text>
            </View>
          </View>

          {/* Intensity Block */}
          <View style={styles.intensityBlock}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>
              Intensity:
            </Text>
            <Text
              style={[styles.intensityValue, { color: colors.accentPrimary }]}
            >
              {intensity}%
            </Text>
          </View>

          {/* Progress Bar */}
          <View
            style={[styles.progressBg, { backgroundColor: colors.bgSecondary }]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  width: `${intensity}%`,
                  backgroundColor: colors.accentPrimary,
                },
              ]}
            />
          </View>

          {/* Timing Block */}
          <View style={styles.timingBlock}>
            {/* Timing Mode Toggle */}
            <View style={styles.timingModeToggle}>
              <Pressable
                style={[
                  styles.toggleButton,
                  timingMode === "total" && styles.toggleButtonActive,
                  timingMode === "total" && {
                    backgroundColor: "rgba(92, 119, 186, 0.15)",
                  },
                ]}
                onPress={() => setTimingMode("total")}
              >
                <Text
                  style={[
                    styles.toggleIcon,
                    timingMode === "total"
                      ? { color: colors.textPrimary }
                      : { color: colors.textMuted },
                  ]}
                >
                  ⏱
                </Text>
                <Text
                  style={[
                    styles.toggleText,
                    timingMode === "total"
                      ? { color: colors.textPrimary, fontWeight: "600" }
                      : { color: colors.textMuted },
                  ]}
                >
                  Total
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.toggleButton,
                  timingMode === "intervals" && styles.toggleButtonActive,
                  timingMode === "intervals" && {
                    backgroundColor: "rgba(92, 119, 186, 0.15)",
                  },
                ]}
                onPress={() => setTimingMode("intervals")}
              >
                <Text
                  style={[
                    styles.toggleIcon,
                    timingMode === "intervals"
                      ? { color: colors.textPrimary }
                      : { color: colors.textMuted },
                  ]}
                >
                  🔁
                </Text>
                <Text
                  style={[
                    styles.toggleText,
                    timingMode === "intervals"
                      ? { color: colors.textPrimary, fontWeight: "600" }
                      : { color: colors.textMuted },
                  ]}
                >
                  Intervals
                </Text>
              </Pressable>
            </View>

            {/* Timing Content */}
            <View style={styles.timingContent}>
              <View style={styles.totalDurationBlock}>
                <Text style={[styles.timingLabel, { color: colors.textMuted }]}>
                  Total Duration:
                </Text>
                <Text
                  style={[styles.timingValue, { color: colors.textSecondary }]}
                >
                  {formatDuration(totalDuration)}
                </Text>
              </View>
              <View style={styles.intervalBlock}>
                <View style={styles.intervalGridRow}>
                  <View style={styles.intervalColumn}>
                    <Text
                      style={[
                        styles.intervalLabel,
                        { color: colors.textMuted },
                      ]}
                    >
                      Set:
                    </Text>
                    <Text
                      style={[
                        styles.intervalValue,
                        { color: colors.textPrimary },
                      ]}
                    >
                      {formatSeconds(setDuration)}
                    </Text>
                  </View>
                  <View style={styles.intervalColumn}>
                    <Text
                      style={[
                        styles.intervalLabel,
                        { color: colors.textMuted },
                      ]}
                    >
                      Pause:
                    </Text>
                    <Text
                      style={[
                        styles.intervalValue,
                        { color: colors.textPrimary },
                      ]}
                    >
                      {formatSeconds(exercise.restBetweenSets)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Calories Block */}
          <View style={styles.caloriesBlock}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>
              Calories:
            </Text>
            <Text style={styles.caloriesValue}>~{calories}kcal</Text>
          </View>
        </View>
      </Pressable>
    );
  }

  // Detail Version für großes Karussell in Session Detail
  if (isDetail) {
    return (
      <View
        style={[
          styles.detailCarouselCard,
          { backgroundColor: colors.bgPrimary, borderColor: colors.border },
        ]}
      >
        {/* Large Exercise Image */}
        <View style={styles.detailCarouselImageContainer}>
          <Image
            source={
              exercise.exerciseInfo.gifUrl
                ? { uri: exercise.exerciseInfo.gifUrl }
                : exercise.exerciseInfo.image
            }
            style={styles.detailCarouselImage}
            contentFit="cover"
          />
          {/* Mode Badge */}
          <View
            style={[
              styles.detailCarouselModeBadge,
              {
                backgroundColor: isTimerMode ? "#F59E0B" : colors.accentPrimary,
              },
            ]}
          >
            <Ionicons
              name={isTimerMode ? "timer" : "repeat"}
              size={14}
              color="#fff"
            />
            <Text style={styles.detailCarouselModeBadgeText}>
              {isTimerMode ? "Timer" : "Reps"}
            </Text>
          </View>
          {/* Exercise Number Badge */}
          <View
            style={[
              styles.detailCarouselNumberBadge,
              { backgroundColor: colors.accentPrimary },
            ]}
          >
            <Text style={styles.detailCarouselNumberText}>{index + 1}</Text>
          </View>
          {/* Remove Button */}
          {onRemove && (
            <Pressable
              style={styles.detailCarouselRemoveButton}
              onPress={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              <Ionicons name="close-circle" size={28} color="#EF4444" />
            </Pressable>
          )}
        </View>

        {/* Exercise Info */}
        <View style={styles.detailCarouselContent}>
          {/* Exercise Name */}
          <Text
            style={[styles.detailCarouselName, { color: colors.textPrimary }]}
            numberOfLines={2}
          >
            {exercise.exerciseInfo.name}
          </Text>

          {/* Main Stats - Big Numbers */}
          <View style={styles.detailCarouselStatsRow}>
            <View style={styles.detailCarouselStatBlock}>
              <Text
                style={[
                  styles.detailCarouselStatValue,
                  { color: colors.accentPrimary },
                ]}
              >
                {exercise.sets}
              </Text>
              <Text
                style={[
                  styles.detailCarouselStatLabel,
                  { color: colors.textMuted },
                ]}
              >
                Sets
              </Text>
            </View>
            <View
              style={[
                styles.detailCarouselDivider,
                { backgroundColor: colors.border },
              ]}
            />
            <View style={styles.detailCarouselStatBlock}>
              <Text
                style={[
                  styles.detailCarouselStatValue,
                  { color: colors.accentPrimary },
                ]}
              >
                {isTimerMode ? exercise.duration : exercise.reps}
              </Text>
              <Text
                style={[
                  styles.detailCarouselStatLabel,
                  { color: colors.textMuted },
                ]}
              >
                {isTimerMode ? "Sekunden" : "Wdh."}
              </Text>
            </View>
            {exercise.weight > 0 && (
              <>
                <View
                  style={[
                    styles.detailCarouselDivider,
                    { backgroundColor: colors.border },
                  ]}
                />
                <View style={styles.detailCarouselStatBlock}>
                  <Text
                    style={[
                      styles.detailCarouselStatValue,
                      { color: colors.accentPrimary },
                    ]}
                  >
                    {exercise.weight}
                  </Text>
                  <Text
                    style={[
                      styles.detailCarouselStatLabel,
                      { color: colors.textMuted },
                    ]}
                  >
                    kg
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Rest Times Row */}
          <View
            style={[
              styles.detailCarouselRestRow,
              { backgroundColor: colors.bgSecondary },
            ]}
          >
            <View style={styles.detailCarouselRestItem}>
              <Ionicons
                name="hourglass-outline"
                size={16}
                color={colors.accentPrimary}
              />
              <View>
                <Text
                  style={[
                    styles.detailCarouselRestLabel,
                    { color: colors.textMuted },
                  ]}
                >
                  Set-Pause
                </Text>
                <Text
                  style={[
                    styles.detailCarouselRestValue,
                    { color: colors.textPrimary },
                  ]}
                >
                  {formatSeconds(exercise.restBetweenSets)}
                </Text>
              </View>
            </View>
            {exercise.restAfterExercise > 0 && (
              <View style={styles.detailCarouselRestItem}>
                <Ionicons
                  name="timer-outline"
                  size={16}
                  color={colors.accentPrimary}
                />
                <View>
                  <Text
                    style={[
                      styles.detailCarouselRestLabel,
                      { color: colors.textMuted },
                    ]}
                  >
                    Übungs-Pause
                  </Text>
                  <Text
                    style={[
                      styles.detailCarouselRestValue,
                      { color: colors.textPrimary },
                    ]}
                  >
                    {formatSeconds(exercise.restAfterExercise)}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Timing & Calories Footer */}
          <View style={styles.detailCarouselFooter}>
            <View style={styles.detailCarouselFooterItem}>
              <Ionicons
                name="time-outline"
                size={14}
                color={colors.textMuted}
              />
              <Text
                style={[
                  styles.detailCarouselFooterText,
                  { color: colors.textMuted },
                ]}
              >
                {formatDuration(totalDuration)}
              </Text>
            </View>
            <View style={styles.detailCarouselFooterItem}>
              <Ionicons
                name="flame-outline"
                size={14}
                color={colors.textMuted}
              />
              <Text
                style={[
                  styles.detailCarouselFooterText,
                  { color: colors.textMuted },
                ]}
              >
                ~{calories} kcal
              </Text>
            </View>
          </View>

          {/* Notes */}
          {exercise.notes && (
            <View
              style={[
                styles.detailCarouselNotes,
                { backgroundColor: colors.bgSecondary },
              ]}
            >
              <Ionicons
                name="document-text-outline"
                size={14}
                color={colors.textMuted}
              />
              <Text
                style={[
                  styles.detailCarouselNotesText,
                  { color: colors.textSecondary },
                ]}
                numberOfLines={2}
              >
                {exercise.notes}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  // Volle Version für Session Detail (horizontal layout)
  return (
    <Pressable
      style={[
        styles.detailCard,
        { backgroundColor: colors.bgPrimary, borderColor: colors.border },
      ]}
      onPress={onPress}
    >
      {/* Exercise Number */}
      <View
        style={[
          styles.number,
          { backgroundColor: colors.accentPrimary + "20" },
        ]}
      >
        <Text style={[styles.numberText, { color: colors.accentPrimary }]}>
          {index + 1}
        </Text>
      </View>

      {/* Image */}
      <Image
        source={exercise.exerciseInfo.image}
        style={styles.detailImage}
        contentFit="cover"
      />

      {/* Content */}
      <View style={styles.detailContent}>
        <Text
          style={[styles.detailName, { color: colors.textPrimary }]}
          numberOfLines={1}
        >
          {exercise.exerciseInfo.name}
        </Text>

        {/* Stats Row */}
        <View style={styles.detailStatsRow}>
          {/* Mode Badge */}
          <View
            style={[
              styles.detailBadge,
              {
                backgroundColor: isTimerMode
                  ? "#F59E0B20"
                  : colors.accentPrimary + "20",
              },
            ]}
          >
            <Ionicons
              name={isTimerMode ? "timer" : "repeat"}
              size={12}
              color={isTimerMode ? "#F59E0B" : colors.accentPrimary}
            />
            <Text
              style={[
                styles.detailBadgeText,
                { color: isTimerMode ? "#F59E0B" : colors.accentPrimary },
              ]}
            >
              {isTimerMode ? "Timer" : "Reps"}
            </Text>
          </View>

          {/* Sets x Reps/Duration */}
          <Text style={[styles.detailStatText, { color: colors.textMuted }]}>
            {exercise.sets}x{" "}
            {isTimerMode
              ? formatDuration(exercise.duration)
              : `${exercise.reps} Wdh.`}
          </Text>

          {/* Weight */}
          {exercise.weight > 0 && (
            <Text style={[styles.detailStatText, { color: colors.textMuted }]}>
              • {exercise.weight}kg
            </Text>
          )}
        </View>

        {/* Rest Times */}
        <View style={styles.detailRestRow}>
          <View style={styles.detailRestItem}>
            <Ionicons name="hourglass" size={11} color={colors.textMuted} />
            <Text style={[styles.detailRestText, { color: colors.textMuted }]}>
              Set-Pause: {formatSeconds(exercise.restBetweenSets)}
            </Text>
          </View>
          {exercise.restAfterExercise > 0 && (
            <View style={styles.detailRestItem}>
              <Ionicons name="time" size={11} color={colors.textMuted} />
              <Text
                style={[styles.detailRestText, { color: colors.textMuted }]}
              >
                Danach: {formatSeconds(exercise.restAfterExercise)}
              </Text>
            </View>
          )}
        </View>

        {/* Notes */}
        {exercise.notes && (
          <Text
            style={[styles.detailNotes, { color: colors.textMuted }]}
            numberOfLines={1}
          >
            📝 {exercise.notes}
          </Text>
        )}
      </View>

      {/* Remove Button */}
      {onRemove && (
        <Pressable
          style={styles.removeButton}
          onPress={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <Ionicons name="close-circle" size={24} color="#EF4444" />
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // ========== Compact Card (Full ExerciseCard Design) ==========
  cardWrapper: {
    marginRight: 12,
  },
  root: {
    width: 160,
    padding: 10,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "stretch",
    gap: 6,
    borderRadius: 16,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 80,
  },
  exerciseImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
    backgroundColor: "#2d2d44",
  },
  modeBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  exerciseName: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: Fonts.semiBold,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  statBlock: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
  },
  statLabel: {
    fontSize: 9,
    fontWeight: "600",
    fontFamily: Fonts.sans,
  },
  statValue: {
    fontSize: 10,
    fontWeight: "600",
    fontFamily: Fonts.sans,
  },
  intensityBlock: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 4,
  },
  intensityValue: {
    fontSize: 10,
    fontWeight: "600",
    fontFamily: Fonts.sans,
  },
  progressBg: {
    height: 4,
    alignSelf: "stretch",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  timingBlock: {
    flexDirection: "column",
    alignItems: "stretch",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 8,
    padding: 6,
    gap: 4,
  },
  timingModeToggle: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  toggleButton: {
    flexDirection: "row",
    paddingVertical: 4,
    paddingHorizontal: 6,
    justifyContent: "center",
    alignItems: "center",
    gap: 3,
    borderRadius: 6,
  },
  toggleButtonActive: {},
  toggleIcon: {
    fontSize: 9,
    fontWeight: "600",
  },
  toggleText: {
    fontSize: 9,
    fontWeight: "400",
    fontFamily: Fonts.sans,
  },
  timingContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 4,
  },
  totalDurationBlock: {
    flexDirection: "column",
    alignItems: "flex-start",
    flex: 1,
  },
  timingLabel: {
    fontSize: 7,
    fontWeight: "500",
    fontFamily: Fonts.sans,
  },
  timingValue: {
    fontSize: 8,
    fontWeight: "600",
    fontFamily: Fonts.sans,
  },
  intervalBlock: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    flex: 1,
  },
  intervalGridRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 12,
  },
  intervalColumn: {
    flexDirection: "column",
    alignItems: "center",
  },
  intervalLabel: {
    fontSize: 7,
    fontWeight: "600",
    fontFamily: Fonts.sans,
  },
  intervalValue: {
    fontSize: 8,
    fontWeight: "600",
    fontFamily: Fonts.sans,
  },
  caloriesBlock: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.05)",
  },
  caloriesValue: {
    color: "#f97316",
    fontSize: 10,
    fontWeight: "600",
    fontFamily: Fonts.sans,
  },

  // ========== Detail Card (Horizontal Layout) ==========
  detailCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  number: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  numberText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
  },
  detailImage: {
    width: 56,
    height: 56,
    borderRadius: 10,
  },
  detailContent: {
    flex: 1,
    gap: 4,
  },
  detailName: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
  },
  detailStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  detailBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  detailBadgeText: {
    fontSize: 11,
    fontFamily: Fonts.medium,
  },
  detailStatText: {
    fontSize: 13,
    fontFamily: Fonts.sans,
  },
  detailRestRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  detailRestItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  detailRestText: {
    fontSize: 11,
    fontFamily: Fonts.sans,
  },
  detailNotes: {
    fontSize: 12,
    fontStyle: "italic",
    fontFamily: Fonts.sans,
  },
  removeButton: {
    padding: 4,
  },

  // ========== Detail Carousel Card (Large Version) ==========
  detailCarouselCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    minHeight: 420,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  detailCarouselImageContainer: {
    position: "relative",
    width: "100%",
    height: 180,
  },
  detailCarouselImage: {
    width: "100%",
    height: "100%",
  },
  detailCarouselModeBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  detailCarouselModeBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: Fonts.semiBold,
  },
  detailCarouselNumberBadge: {
    position: "absolute",
    bottom: 12,
    left: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  detailCarouselNumberText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: Fonts.bold,
  },
  detailCarouselRemoveButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  detailCarouselContent: {
    padding: 16,
    gap: 12,
  },
  detailCarouselName: {
    fontSize: 20,
    fontFamily: Fonts.bold,
  },
  detailCarouselStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  detailCarouselStatBlock: {
    alignItems: "center",
    paddingHorizontal: 16,
  },
  detailCarouselStatValue: {
    fontSize: 32,
    fontFamily: Fonts.bold,
  },
  detailCarouselStatLabel: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailCarouselDivider: {
    width: 1,
    height: 40,
  },
  detailCarouselRestRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  detailCarouselRestItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailCarouselRestLabel: {
    fontSize: 11,
    fontFamily: Fonts.regular,
  },
  detailCarouselRestValue: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
  },
  detailCarouselFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  detailCarouselFooterItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailCarouselFooterText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
  },
  detailCarouselNotes: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 10,
  },
  detailCarouselNotesText: {
    flex: 1,
    fontSize: 13,
    fontFamily: Fonts.regular,
    fontStyle: "italic",
  },
});
