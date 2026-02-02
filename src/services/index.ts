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

// Firebase Services
export {
    clearExerciseCache,
    getAllBodyPartsFromFirebase,
    getAllEquipmentFromFirebase,
    getAllExercisesFromFirebase,
    getExerciseByIdFromFirebase,
    getExercisesByBodyPart,
    getExercisesByDifficulty,
    getExercisesByEquipment,
    searchAndFilterExercises,
    searchExercisesInFirebase
} from "./firebase.service";

