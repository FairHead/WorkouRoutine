/**
 * Hook zum Laden von Übungen aus Firebase
 *
 * Dieser Hook lädt alle Übungen aus der Firebase Firestore Datenbank
 * und bietet Such- und Filterfunktionen mit React State Management.
 */

import type { ExerciseInfo } from "@/src/models";
import {
    getAllBodyPartsFromFirebase,
    getAllEquipmentFromFirebase,
    getAllExercisesFromFirebase,
} from "@/src/services/firebase.service";
import { useCallback, useEffect, useMemo, useState } from "react";

interface UseFirebaseExercisesOptions {
  /** Automatisch laden beim Mount */
  autoLoad?: boolean;
  /** Initiale Suchbegriffe */
  initialSearch?: string;
  /** Initialer Körperteil-Filter */
  initialBodyPart?: string;
}

interface UseFirebaseExercisesReturn {
  /** Alle geladenen Übungen */
  exercises: ExerciseInfo[];
  /** Gefilterte Übungen basierend auf Suche/Filtern */
  filteredExercises: ExerciseInfo[];
  /** Lädt gerade */
  isLoading: boolean;
  /** Fehler beim Laden */
  error: string | null;
  /** Alle verfügbaren Körperteile */
  bodyParts: string[];
  /** Alle verfügbaren Equipment-Typen */
  equipmentTypes: string[];
  /** Aktueller Suchbegriff */
  searchQuery: string;
  /** Aktueller Körperteil-Filter */
  selectedBodyPart: string | null;
  /** Aktueller Equipment-Filter */
  selectedEquipment: string | null;
  /** Aktueller Schwierigkeits-Filter */
  selectedDifficulty: "beginner" | "intermediate" | "advanced" | null;
  /** Gesamtanzahl Übungen */
  totalCount: number;
  /** Anzahl gefilterter Übungen */
  filteredCount: number;
  /** Suchbegriff setzen */
  setSearchQuery: (query: string) => void;
  /** Körperteil-Filter setzen */
  setSelectedBodyPart: (bodyPart: string | null) => void;
  /** Equipment-Filter setzen */
  setSelectedEquipment: (equipment: string | null) => void;
  /** Schwierigkeits-Filter setzen */
  setSelectedDifficulty: (
    difficulty: "beginner" | "intermediate" | "advanced" | null,
  ) => void;
  /** Alle Filter zurücksetzen */
  clearFilters: () => void;
  /** Daten neu laden */
  refresh: () => Promise<void>;
  /** Übung nach ID finden */
  getExerciseById: (id: string) => ExerciseInfo | undefined;
}

/**
 * Hook für Firebase Übungen mit Such- und Filterfunktionen
 */
export function useFirebaseExercises(
  options: UseFirebaseExercisesOptions = {},
): UseFirebaseExercisesReturn {
  const {
    autoLoad = true,
    initialSearch = "",
    initialBodyPart = null,
  } = options;

  // State
  const [exercises, setExercises] = useState<ExerciseInfo[]>([]);
  const [bodyParts, setBodyParts] = useState<string[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter State
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(
    initialBodyPart,
  );
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(
    null,
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    "beginner" | "intermediate" | "advanced" | null
  >(null);

  /**
   * Daten laden
   */
  const loadExercises = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Übungen laden
      const loadedExercises = await getAllExercisesFromFirebase();
      setExercises(loadedExercises);

      // Body Parts laden
      const loadedBodyParts = await getAllBodyPartsFromFirebase();
      setBodyParts(loadedBodyParts);

      // Equipment laden
      const loadedEquipment = await getAllEquipmentFromFirebase();
      setEquipmentTypes(loadedEquipment);
    } catch (err) {
      console.error("Error loading exercises:", err);
      setError(
        err instanceof Error ? err.message : "Fehler beim Laden der Übungen",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Automatisch laden beim Mount
   */
  useEffect(() => {
    if (autoLoad) {
      loadExercises();
    }
  }, [autoLoad, loadExercises]);

  /**
   * Gefilterte Übungen (memo für Performance)
   */
  const filteredExercises = useMemo(() => {
    let results = [...exercises];
    const lowerSearch = searchQuery.toLowerCase().trim();

    // Textsuche
    if (lowerSearch) {
      results = results.filter(
        (ex) =>
          ex.name.toLowerCase().includes(lowerSearch) ||
          ex.targetMuscle.toLowerCase().includes(lowerSearch) ||
          ex.bodyPart.toLowerCase().includes(lowerSearch) ||
          ex.equipment.toLowerCase().includes(lowerSearch),
      );
    }

    // Körperteil Filter
    if (selectedBodyPart) {
      results = results.filter(
        (ex) => ex.bodyPart.toLowerCase() === selectedBodyPart.toLowerCase(),
      );
    }

    // Equipment Filter
    if (selectedEquipment) {
      results = results.filter(
        (ex) => ex.equipment.toLowerCase() === selectedEquipment.toLowerCase(),
      );
    }

    // Schwierigkeit Filter
    if (selectedDifficulty) {
      results = results.filter((ex) => ex.difficulty === selectedDifficulty);
    }

    return results;
  }, [
    exercises,
    searchQuery,
    selectedBodyPart,
    selectedEquipment,
    selectedDifficulty,
  ]);

  /**
   * Filter zurücksetzen
   */
  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedBodyPart(null);
    setSelectedEquipment(null);
    setSelectedDifficulty(null);
  }, []);

  /**
   * Übung nach ID finden
   */
  const getExerciseById = useCallback(
    (id: string): ExerciseInfo | undefined => {
      return exercises.find((ex) => ex.id === id);
    },
    [exercises],
  );

  return {
    exercises,
    filteredExercises,
    isLoading,
    error,
    bodyParts,
    equipmentTypes,
    searchQuery,
    selectedBodyPart,
    selectedEquipment,
    selectedDifficulty,
    totalCount: exercises.length,
    filteredCount: filteredExercises.length,
    setSearchQuery,
    setSelectedBodyPart,
    setSelectedEquipment,
    setSelectedDifficulty,
    clearFilters,
    refresh: loadExercises,
    getExerciseById,
  };
}

/**
 * Einfacher Hook nur zum Laden aller Übungen
 */
export function useAllExercises() {
  const [exercises, setExercises] = useState<ExerciseInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getAllExercisesFromFirebase();
        setExercises(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Fehler beim Laden");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return { exercises, isLoading, error };
}
