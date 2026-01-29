import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";

import { ExerciseCard } from "@/components/exercise-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useExercisesWithGifs } from "@/hooks/use-exercises";

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const { exercises, isLoading, loadedCount, totalCount } =
    useExercisesWithGifs();

  // Responsive columns: 2 auf Handy, 3 auf Tablet, 4 auf großen Bildschirmen
  const getColumns = () => {
    if (width >= 900) return 4;
    if (width >= 600) return 3;
    return 2;
  };

  const columns = getColumns();
  const gap = 12;
  const padding = 16;
  // Berechne Kartenbreite basierend auf verfügbarem Platz
  const availableWidth = width - padding * 2;
  const totalGapWidth = gap * (columns - 1);
  const cardWidth = Math.floor((availableWidth - totalGapWidth) / columns);

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Mein Workout
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          {exercises.length} Übungen • {columns} Spalten
          {isLoading && ` • Lade Bilder (${loadedCount}/${totalCount})...`}
        </ThemedText>
        {isLoading && (
          <ActivityIndicator
            size="small"
            color="#5c77ba"
            style={styles.loader}
          />
        )}
      </ThemedView>

      {/* Cards Grid - mit expliziten Margins statt gap */}
      <View style={styles.grid}>
        {exercises.map((exercise, index) => {
          // Berechne ob diese Karte am rechten Rand ist (keine marginRight)
          const isLastInRow = (index + 1) % columns === 0;

          return (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              style={{
                width: cardWidth,
                marginRight: isLastInRow ? 0 : gap,
                marginBottom: gap,
              }}
            />
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#0a0a14",
  },
  scrollContent: {
    padding: 16,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 20,
    backgroundColor: "transparent",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
  },
  subtitle: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 4,
  },
  loader: {
    marginTop: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
});
