/**
 * Src - Zentrale Export-Datei
 * Ermöglicht einfachen Import aus dem src-Ordner
 */

// Models
export type {
    Exercise,
    ExerciseCategory,
    ExerciseTiming,
    TimingMode,
    Workout
} from "./models";

// Data
export { mockExercises } from "./data";

// Services
export {
    calculateTotalCalories,
    calculateTotalDuration,
    formatDuration,
    formatDurationWithUnit,
    getExerciseById,
    getExercises,
    getExercisesByCategory
} from "./services";

