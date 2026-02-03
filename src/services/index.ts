/**
 * Services - Zentrale Export-Datei für alle Services
 */

export {
    calculateTotalCalories,
    calculateTotalDuration,
    formatDuration,
    formatDurationWithUnit
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

// Kalorienberechnung
export {
    calculateCalories,
    calculateSessionCalories,
    DEFAULT_PROFILE,
    estimateEPOC,
    formatCalories,
    getCaloriesPerMinute,
    MET_VALUES,
    type UserProfile
} from "./calorie-calculator.service";