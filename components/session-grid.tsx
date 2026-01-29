import { SessionCard } from "@/components/session-card";
import type { Session } from "@/src/models";
import React from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";

interface SessionGridProps {
  sessions: Session[];
}

/**
 * Responsive Grid für Session Cards
 * - Handy (< 600px): 2 Spalten
 * - Tablet (600-900px): 3 Spalten
 * - Größerer Screen (> 900px): 4 Spalten
 */
export function SessionGrid({ sessions }: SessionGridProps) {
  const { width } = useWindowDimensions();

  // Berechne Anzahl der Spalten basierend auf Bildschirmbreite
  const getColumns = () => {
    if (width >= 900) return 4;
    if (width >= 600) return 3;
    return 2;
  };

  const columns = getColumns();
  const gap = 12;
  const padding = 16;
  const availableWidth = width - padding * 2;
  const cardWidth = (availableWidth - gap * (columns - 1)) / columns;

  // Sessions in Zeilen aufteilen
  const rows: Session[][] = [];
  for (let i = 0; i < sessions.length; i += columns) {
    rows.push(sessions.slice(i, i + columns));
  }

  return (
    <View style={styles.container}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={[styles.row, { gap }]}>
          {row.map((session) => (
            <View key={session.id} style={{ width: cardWidth }}>
              <SessionCard session={session} />
            </View>
          ))}
          {/* Platzhalter für unvollständige Zeilen */}
          {row.length < columns &&
            Array.from({ length: columns - row.length }).map((_, i) => (
              <View key={`placeholder-${i}`} style={{ width: cardWidth }} />
            ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  row: {
    flexDirection: "row",
  },
});
