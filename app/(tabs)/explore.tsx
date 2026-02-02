import { ExerciseSearchCard } from "@/components/exercise-search-card";
import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useFirebaseExercises } from "@/hooks/use-firebase-exercises";
import type { ExerciseInfo } from "@/src/models";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    useWindowDimensions,
    View,
} from "react-native";

export default function ExerciseSearchScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { width } = useWindowDimensions();

  // Firebase Hook für Übungen
  const {
    filteredExercises,
    isLoading,
    error,
    bodyParts,
    searchQuery,
    selectedBodyPart,
    filteredCount,
    totalCount,
    setSearchQuery,
    setSelectedBodyPart,
    clearFilters,
    refresh,
  } = useFirebaseExercises();

  // Responsive Columns
  const numColumns = width >= 1024 ? 4 : width >= 768 ? 3 : 2;
  const cardMargin = 8;
  const containerPadding = 16;
  const availableWidth = width - containerPadding * 2;
  const cardWidth =
    (availableWidth - cardMargin * (numColumns - 1)) / numColumns;

  // Render Card
  const renderCard = useCallback(
    ({ item, index }: { item: ExerciseInfo; index: number }) => {
      const isLastInRow = (index + 1) % numColumns === 0;
      return (
        <ExerciseSearchCard
          exercise={item}
          style={{
            width: cardWidth,
            marginRight: isLastInRow ? 0 : cardMargin,
            marginBottom: cardMargin,
          }}
        />
      );
    },
    [cardWidth, numColumns, cardMargin],
  );

  const keyExtractor = useCallback((item: ExerciseInfo) => item.id, []);

  // Loading State
  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Lade Übungen aus der Datenbank...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error State
  if (error) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.errorContainer}>
          <Ionicons name="cloud-offline" size={64} color={colors.textSecondary} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>
            Verbindungsfehler
          </Text>
          <Text style={[styles.errorSubtitle, { color: colors.textSecondary }]}>
            {error}
          </Text>
          <Pressable
            style={[styles.retryButton, { backgroundColor: colors.tint }]}
            onPress={refresh}
          >
            <Text style={styles.retryButtonText}>Erneut versuchen</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Übungen finden
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {filteredCount} von {totalCount} Übungen
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
            },
          ]}
        >
          <Ionicons
            name="search"
            size={20}
            color={colors.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Übung, Muskel oder Gerät suchen..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <Ionicons
                name="close-circle"
                size={20}
                color={colors.textSecondary}
              />
            </Pressable>
          )}
        </View>
      </View>

      {/* Body Part Filter */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {/* All Button */}
          <Pressable
            style={[
              styles.filterChip,
              {
                backgroundColor: !selectedBodyPart
                  ? colors.tint
                  : colors.cardBackground,
                borderColor: colors.border,
              },
            ]}
            onPress={() => setSelectedBodyPart(null)}
          >
            <Text
              style={[
                styles.filterChipText,
                { color: !selectedBodyPart ? "#fff" : colors.text },
              ]}
            >
              Alle
            </Text>
          </Pressable>

          {/* Body Part Chips */}
          {bodyParts.map((bodyPart) => (
            <Pressable
              key={bodyPart}
              style={[
                styles.filterChip,
                {
                  backgroundColor:
                    selectedBodyPart === bodyPart
                      ? colors.tint
                      : colors.cardBackground,
                  borderColor: colors.border,
                },
              ]}
              onPress={() =>
                setSelectedBodyPart(
                  selectedBodyPart === bodyPart ? null : bodyPart,
                )
              }
            >
              <Text
                style={[
                  styles.filterChipText,
                  {
                    color: selectedBodyPart === bodyPart ? "#fff" : colors.text,
                  },
                ]}
              >
                {bodyPart}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Results Grid */}
      {filteredExercises.length > 0 ? (
        <FlatList
          data={filteredExercises}
          renderItem={renderCard}
          keyExtractor={keyExtractor}
          numColumns={numColumns}
          key={`grid-${numColumns}`}
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons
            name="barbell-outline"
            size={64}
            color={colors.textSecondary}
          />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Keine Übungen gefunden
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Versuche einen anderen Suchbegriff oder Filter
          </Text>
          <Pressable
            style={[styles.clearButton, { backgroundColor: colors.accent }]}
            onPress={clearFilters}
          >
            <Text style={styles.clearButtonText}>Filter zurücksetzen</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    fontFamily: Fonts.rounded,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
    fontFamily: Fonts.rounded,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: Fonts.rounded,
  },
  filterContainer: {
    paddingVertical: 8,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: Fonts.rounded,
  },
  gridContainer: {
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
    fontFamily: Fonts.rounded,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    fontFamily: Fonts.rounded,
  },
  clearButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  clearButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: Fonts.rounded,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: Fonts.rounded,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
    fontFamily: Fonts.rounded,
  },
  errorSubtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    fontFamily: Fonts.rounded,
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: Fonts.rounded,
  },
});
