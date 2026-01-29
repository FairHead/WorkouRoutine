import { mockExercises } from "@/src/data/exercises.data";
import type { Exercise } from "@/src/models";
import { getGifForExercise } from "@/src/services/tenor-gif.service";
import { useEffect, useState } from "react";

/**
 * Hook zum Laden der Übungen mit animierten GIFs von Tenor API
 * Lädt die GIFs asynchron im Hintergrund
 */
export function useExercisesWithGifs() {
  const [exercises, setExercises] = useState<Exercise[]>(mockExercises);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedCount, setLoadedCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadGifs() {
      const updatedExercises = [...mockExercises];
      let count = 0;

      // Lade GIFs für alle Übungen parallel (aber mit Limit um Rate Limits zu vermeiden)
      const batchSize = 3; // Kleinere Batches für Tenor API
      for (let i = 0; i < updatedExercises.length; i += batchSize) {
        const batch = updatedExercises.slice(i, i + batchSize);

        await Promise.all(
          batch.map(async (exercise, batchIndex) => {
            const index = i + batchIndex;
            try {
              const gifUrl = await getGifForExercise(exercise.name);
              if (gifUrl && isMounted) {
                updatedExercises[index] = {
                  ...updatedExercises[index],
                  gifUrl,
                  // Behalte das statische Bild von GitHub für normale Anzeige
                  // GIF wird nur beim Long-Press gezeigt
                };
                count++;
                setLoadedCount(count);
              }
            } catch (error) {
              console.warn(`Failed to load GIF for ${exercise.name}:`, error);
            }
          }),
        );

        // Update state nach jedem Batch
        if (isMounted) {
          setExercises([...updatedExercises]);
        }

        // Pause zwischen Batches für Rate Limiting
        if (i + batchSize < updatedExercises.length) {
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      }

      if (isMounted) {
        setIsLoading(false);
      }
    }

    loadGifs();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    exercises,
    isLoading,
    loadedCount,
    totalCount: mockExercises.length,
  };
}
