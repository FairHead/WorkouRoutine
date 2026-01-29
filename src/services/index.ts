/**
 * Services - Zentrale Export-Datei für alle Services
 */

export {
    calculateTotalCalories,
    calculateTotalDuration,
    formatDuration,
    formatDurationWithUnit,
    getExerciseById,
    getExercises,
    getExercisesByCategory
} from "./exercise.service";

export {
    exerciseSearchTerms,
    getGifForExercise,
    searchExerciseGif,
    searchMultipleExerciseGifs
} from "./tenor-gif.service";

