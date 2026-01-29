import { useCallback, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Image,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import type { Exercise, TimingMode } from "@/src/models";
import type { GestureResponderEvent, StyleProp, ViewStyle } from "react-native";

export interface ExerciseCardProps {
  /** Übungsdaten */
  exercise: Exercise;
  /** Used to override the default root style. */
  style?: StyleProp<ViewStyle>;
  /** Used to locate this view in end-to-end tests. */
  testID?: string;
  /** Callback wenn der Timing-Modus gewechselt wird */
  onTimingModeChange?: (mode: TimingMode) => void;
  /** Callback wenn die Card gedrückt wird */
  onPress?: () => void;
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

/** Long-Press Dauer in Millisekunden */
const LONG_PRESS_DURATION = 300;

export function ExerciseCard(props: ExerciseCardProps) {
  const { exercise, style, testID, onTimingModeChange, onPress } = props;
  const isTotal = exercise.timing.mode === "total";

  // State für Long-Press GIF Animation
  const [isLongPressed, setIsLongPressed] = useState(false);
  const [isGifLoading, setIsGifLoading] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Long-Press Handler
  const handlePressIn = useCallback(
    (_event: GestureResponderEvent) => {
      // Starte Long-Press Timer
      longPressTimer.current = setTimeout(() => {
        if (exercise.gifUrl) {
          setIsLongPressed(true);
          setIsGifLoading(true);
          // Scale Animation
          Animated.spring(scaleAnim, {
            toValue: 1.02,
            useNativeDriver: true,
          }).start();
        }
      }, LONG_PRESS_DURATION);
    },
    [exercise.gifUrl, scaleAnim],
  );

  const handlePressOut = useCallback(() => {
    // Clear Timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    // Reset State
    setIsLongPressed(false);
    // Reset Scale Animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  // GIF Load Handler
  const handleGifLoad = useCallback(() => {
    setIsGifLoading(false);
  }, []);

  // Bestimme welches Bild angezeigt werden soll
  const displayImage =
    isLongPressed && exercise.gifUrl
      ? { uri: exercise.gifUrl }
      : exercise.image;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        testID={testID ?? "exercise-card"}
        style={[styles.root, style, { transform: [{ scale: scaleAnim }] }]}
      >
        <View style={styles.imageContainer}>
          <Image
            source={displayImage}
            style={styles.exerciseImage}
            onLoad={isLongPressed ? handleGifLoad : undefined}
          />
          {isLongPressed && isGifLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="small" color="#5c77ba" />
            </View>
          )}
          {isLongPressed && (
            <View style={styles.gifBadge}>
              <Text style={styles.gifBadgeText}>GIF</Text>
            </View>
          )}
        </View>
        <Text testID="exercise-name" style={styles.exerciseName}>
          {exercise.name}
        </Text>
        <View testID="stats-row" style={styles.statsRow}>
          <View testID="sets-block" style={styles.setsBlock}>
            <Text testID="sets-label" style={styles.statLabel}>
              {`Sets:`}
            </Text>
            <Text testID="sets-value" style={styles.statValue}>
              {`${exercise.sets} x`}
            </Text>
          </View>
          <View testID="reps-block" style={styles.repsBlock}>
            <Text testID="reps-label" style={styles.statLabel}>
              {`Reps:`}
            </Text>
            <Text testID="reps-value" style={styles.statValue}>
              {`${exercise.reps} x`}
            </Text>
          </View>
          <View testID="weight-block" style={styles.weightBlock}>
            <Text testID="weight-label" style={styles.statLabel}>
              {`Weight:`}
            </Text>
            <Text testID="weight-value" style={styles.statValue}>
              {`${exercise.weight} kg`}
            </Text>
          </View>
        </View>
        <View testID="intensity-block" style={styles.intensityBlock}>
          <Text testID="intensity-label" style={styles.statLabel}>
            {`Intensity:`}
          </Text>
          <Text testID="intensity-value" style={styles.intensityValue}>
            {`${exercise.intensity}%`}
          </Text>
        </View>
        <View testID="progress-bg" style={styles.progressBg}>
          <View
            testID="progress-fill"
            style={[styles.progressFill, { width: `${exercise.intensity}%` }]}
          />
        </View>
        <View testID="timing-block" style={styles.timingBlock}>
          <View testID="timing-mode-toggle" style={styles.timingModeToggle}>
            <View
              testID="toggle-total"
              style={isTotal ? styles.toggleActive : styles.toggleInactive}
              onTouchEnd={() => onTimingModeChange?.("total")}
            >
              <Text
                style={
                  isTotal ? styles.toggleIconActive : styles.toggleIconInactive
                }
              >
                {`⏱`}
              </Text>
              <Text
                style={
                  isTotal ? styles.toggleTextActive : styles.toggleTextInactive
                }
              >
                {`Total`}
              </Text>
            </View>
            <View
              testID="toggle-intervals"
              style={!isTotal ? styles.toggleActive : styles.toggleInactive}
              onTouchEnd={() => onTimingModeChange?.("intervals")}
            >
              <Text
                style={
                  !isTotal ? styles.toggleIconActive : styles.toggleIconInactive
                }
              >
                {`🔁`}
              </Text>
              <Text
                style={
                  !isTotal ? styles.toggleTextActive : styles.toggleTextInactive
                }
              >
                {`Intervals`}
              </Text>
            </View>
          </View>
          <View testID="timing-content" style={styles.timingContent}>
            <View
              testID="total-duration-block"
              style={styles.totalDurationBlock}
            >
              <Text testID="total-duration-label" style={styles.timingLabel}>
                {`Total Duration:`}
              </Text>
              <Text testID="total-duration-value" style={styles.timingValue}>
                {formatDuration(exercise.timing.totalDuration)}
              </Text>
            </View>
            <View testID="interval-block" style={styles.intervalBlock}>
              <View testID="interval-grid-row" style={styles.intervalGridRow}>
                <View testID="set-column" style={styles.setColumn}>
                  <Text testID="set-label" style={styles.intervalLabel}>
                    {`Set:`}
                  </Text>
                  <Text testID="set-value" style={styles.intervalValue}>
                    {formatSeconds(exercise.timing.setDuration)}
                  </Text>
                </View>
                <View testID="pause-column" style={styles.pauseColumn}>
                  <Text testID="pause-label" style={styles.intervalLabel}>
                    {`Pause:`}
                  </Text>
                  <Text testID="pause-value" style={styles.intervalValue}>
                    {formatSeconds(exercise.timing.pauseDuration)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
        <View testID="calories-block" style={styles.caloriesBlock}>
          <Text testID="calories-label" style={styles.statLabel}>
            {`Calories:`}
          </Text>
          <Text testID="calories-value" style={styles.caloriesValue}>
            {`~${exercise.calories}kcal`}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 100,
  },
  exerciseImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
    resizeMode: "cover",
    backgroundColor: "#2d2d44",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 8,
  },
  gifBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(92, 119, 186, 0.9)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  gifBadgeText: {
    color: "#ffffff",
    fontSize: 8,
    fontWeight: "700",
  },
  root: {
    padding: 10,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "stretch",
    gap: 6,
    borderRadius: 16,
    backgroundColor: "#1a1a2e",
    borderWidth: 1,
    borderColor: "rgba(92, 119, 186, 0.2)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  exerciseName: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
  },
  statLabel: {
    color: "#9ca3af",
    fontSize: 9,
    fontWeight: "600",
  },
  statValue: {
    color: "#e5e7eb",
    fontSize: 10,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  setsBlock: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
  },
  repsBlock: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  weightBlock: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  intensityValue: {
    color: "#5c77ba",
    fontSize: 10,
    fontWeight: "600",
  },
  intensityBlock: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 4,
  },
  progressBg: {
    height: 4,
    alignSelf: "stretch",
    borderRadius: 2,
    backgroundColor: "#2d2d44",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
    backgroundColor: "#5c77ba",
  },
  toggleIconActive: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "600",
  },
  toggleTextActive: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "600",
  },
  toggleIconInactive: {
    color: "#9ca3af",
    fontSize: 9,
    fontWeight: "600",
  },
  toggleTextInactive: {
    color: "#9ca3af",
    fontSize: 9,
    fontWeight: "400",
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
  toggleActive: {
    flexDirection: "row",
    paddingVertical: 4,
    paddingHorizontal: 6,
    justifyContent: "center",
    alignItems: "center",
    gap: 3,
    borderRadius: 6,
    backgroundColor: "rgba(92, 119, 186, 0.2)",
  },
  toggleInactive: {
    flexDirection: "row",
    paddingVertical: 4,
    paddingHorizontal: 6,
    justifyContent: "center",
    alignItems: "center",
    gap: 3,
    borderRadius: 6,
  },
  timingLabel: {
    color: "#9ca3af",
    fontSize: 7,
    fontWeight: "500",
  },
  timingValue: {
    color: "#e5e7eb",
    fontSize: 8,
    fontWeight: "600",
  },
  timingContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 4,
  },
  totalDurationBlock: {
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
  },
  intervalLabel: {
    color: "#9ca3af",
    fontSize: 7,
    fontWeight: "600",
  },
  intervalValue: {
    color: "#ffffff",
    fontSize: 8,
    fontWeight: "600",
  },
  intervalBlock: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    gap: 8,
  },
  intervalGridRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  setColumn: {
    flexDirection: "column",
    alignItems: "center",
  },
  pauseColumn: {
    flexDirection: "column",
    alignItems: "center",
  },
  caloriesValue: {
    color: "#f97316",
    fontSize: 10,
    fontWeight: "600",
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
});
