import type {
    ExerciseInfo,
    Session,
    SessionExercise,
    SessionExerciseMode,
} from "@/src/models";
import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from "react";

/**
 * Session Store Interface
 */
interface SessionStore {
  /** Alle Sessions */
  sessions: Session[];
  /** Aktive Session (die gerade bearbeitet/erstellt wird) */
  activeSessionId: string | null;
  /** Session die gerade abgearbeitet wird */
  workoutSessionId: string | null;

  // Session CRUD
  createSession: (name: string, description?: string) => Session;
  updateSession: (id: string, updates: Partial<Session>) => void;
  deleteSession: (id: string) => void;
  getSession: (id: string) => Session | undefined;

  // Active Session
  setActiveSession: (id: string | null) => void;
  getActiveSession: () => Session | undefined;

  // Exercise Management
  addExerciseToSession: (
    sessionId: string,
    exerciseInfo: ExerciseInfo,
    config: ExerciseConfig,
  ) => void;
  updateExerciseInSession: (
    sessionId: string,
    exerciseId: string,
    updates: Partial<SessionExercise>,
  ) => void;
  removeExerciseFromSession: (sessionId: string, exerciseId: string) => void;
  reorderExercises: (sessionId: string, exerciseIds: string[]) => void;

  // Workout
  startWorkout: (sessionId: string) => void;
  completeWorkout: (sessionId: string) => void;
  cancelWorkout: (sessionId: string) => void;
}

/**
 * Konfiguration beim Hinzufügen einer Übung
 */
export interface ExerciseConfig {
  /** Modus: Wiederholungen oder Timer */
  mode: SessionExerciseMode;
  /** Anzahl der Sets */
  sets: number;
  /** Wiederholungen pro Set (wenn mode = 'reps') */
  reps: number;
  /** Dauer pro Set in Sekunden (wenn mode = 'timer') */
  duration: number;
  /** Gewicht in kg */
  weight: number;
  /** Pause zwischen Sets in Sekunden */
  restBetweenSets: number;
  /** Pause nach dieser Übung zur nächsten in Sekunden */
  restAfterExercise: number;
  /** Notizen */
  notes?: string;
}

// Default Config
export const defaultExerciseConfig: ExerciseConfig = {
  mode: "reps",
  sets: 3,
  reps: 12,
  duration: 30,
  weight: 0,
  restBetweenSets: 60,
  restAfterExercise: 90,
};

// Context
const SessionContext = createContext<SessionStore | null>(null);

/**
 * Session Provider Component
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [workoutSessionId, setWorkoutSessionId] = useState<string | null>(null);

  // Generate unique ID
  const generateId = useCallback(() => {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Create Session
  const createSession = useCallback(
    (name: string, description?: string): Session => {
      const newSession: Session = {
        id: generateId(),
        name,
        description,
        exercises: [],
        status: "planned",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setSessions((prev) => [...prev, newSession]);
      return newSession;
    },
    [generateId],
  );

  // Update Session
  const updateSession = useCallback((id: string, updates: Partial<Session>) => {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === id
          ? { ...session, ...updates, updatedAt: new Date() }
          : session,
      ),
    );
  }, []);

  // Delete Session
  const deleteSession = useCallback((id: string) => {
    setSessions((prev) => prev.filter((session) => session.id !== id));
    setActiveSessionId((prev) => (prev === id ? null : prev));
    setWorkoutSessionId((prev) => (prev === id ? null : prev));
  }, []);

  // Get Session by ID
  const getSession = useCallback(
    (id: string): Session | undefined => {
      return sessions.find((session) => session.id === id);
    },
    [sessions],
  );

  // Get Active Session
  const getActiveSession = useCallback((): Session | undefined => {
    if (!activeSessionId) return undefined;
    return sessions.find((session) => session.id === activeSessionId);
  }, [sessions, activeSessionId]);

  // Add Exercise to Session
  const addExerciseToSession = useCallback(
    (sessionId: string, exerciseInfo: ExerciseInfo, config: ExerciseConfig) => {
      const exerciseId = `exercise-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const sessionExercise: SessionExercise = {
        id: exerciseId,
        exerciseInfoId: exerciseInfo.id,
        exerciseInfo: exerciseInfo,
        mode: config.mode,
        sets: config.sets,
        reps: config.reps,
        duration: config.duration,
        weight: config.weight,
        restBetweenSets: config.restBetweenSets,
        restAfterExercise: config.restAfterExercise,
        notes: config.notes,
        order: 0, // Will be set below
      };

      setSessions((prev) =>
        prev.map((session) => {
          if (session.id !== sessionId) return session;

          const newExercise = {
            ...sessionExercise,
            order: session.exercises.length,
          };

          return {
            ...session,
            exercises: [...session.exercises, newExercise],
            updatedAt: new Date(),
          };
        }),
      );
    },
    [],
  );

  // Update Exercise in Session
  const updateExerciseInSession = useCallback(
    (
      sessionId: string,
      exerciseId: string,
      updates: Partial<SessionExercise>,
    ) => {
      setSessions((prev) =>
        prev.map((session) => {
          if (session.id !== sessionId) return session;

          return {
            ...session,
            exercises: session.exercises.map((ex) =>
              ex.id === exerciseId ? { ...ex, ...updates } : ex,
            ),
            updatedAt: new Date(),
          };
        }),
      );
    },
    [],
  );

  // Remove Exercise from Session
  const removeExerciseFromSession = useCallback(
    (sessionId: string, exerciseId: string) => {
      setSessions((prev) =>
        prev.map((session) => {
          if (session.id !== sessionId) return session;

          const filteredExercises = session.exercises
            .filter((ex) => ex.id !== exerciseId)
            .map((ex, index) => ({ ...ex, order: index }));

          return {
            ...session,
            exercises: filteredExercises,
            updatedAt: new Date(),
          };
        }),
      );
    },
    [],
  );

  // Reorder Exercises
  const reorderExercises = useCallback(
    (sessionId: string, exerciseIds: string[]) => {
      setSessions((prev) =>
        prev.map((session) => {
          if (session.id !== sessionId) return session;

          const reorderedExercises = exerciseIds
            .map((id, index) => {
              const exercise = session.exercises.find((ex) => ex.id === id);
              return exercise ? { ...exercise, order: index } : null;
            })
            .filter((ex): ex is SessionExercise => ex !== null);

          return {
            ...session,
            exercises: reorderedExercises,
            updatedAt: new Date(),
          };
        }),
      );
    },
    [],
  );

  // Start Workout
  const startWorkout = useCallback((sessionId: string) => {
    setWorkoutSessionId(sessionId);
    setSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              status: "in-progress" as const,
              startedAt: new Date(),
              updatedAt: new Date(),
            }
          : session,
      ),
    );
  }, []);

  // Complete Workout
  const completeWorkout = useCallback((sessionId: string) => {
    setWorkoutSessionId(null);
    setSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              status: "completed" as const,
              completedAt: new Date(),
              updatedAt: new Date(),
            }
          : session,
      ),
    );
  }, []);

  // Cancel Workout
  const cancelWorkout = useCallback((sessionId: string) => {
    setWorkoutSessionId(null);
    setSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              status: "planned" as const,
              startedAt: undefined,
              updatedAt: new Date(),
            }
          : session,
      ),
    );
  }, []);

  // Memoized store value
  const store = useMemo<SessionStore>(
    () => ({
      sessions,
      activeSessionId,
      workoutSessionId,
      createSession,
      updateSession,
      deleteSession,
      getSession,
      setActiveSession: setActiveSessionId,
      getActiveSession,
      addExerciseToSession,
      updateExerciseInSession,
      removeExerciseFromSession,
      reorderExercises,
      startWorkout,
      completeWorkout,
      cancelWorkout,
    }),
    [
      sessions,
      activeSessionId,
      workoutSessionId,
      createSession,
      updateSession,
      deleteSession,
      getSession,
      getActiveSession,
      addExerciseToSession,
      updateExerciseInSession,
      removeExerciseFromSession,
      reorderExercises,
      startWorkout,
      completeWorkout,
      cancelWorkout,
    ],
  );

  return (
    <SessionContext.Provider value={store}>{children}</SessionContext.Provider>
  );
}

/**
 * Hook to use the Session Store
 */
export function useSessionStore(): SessionStore {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSessionStore must be used within a SessionProvider");
  }
  return context;
}

/**
 * Hook to get sessions filtered by status
 */
export function useSessionsByStatus(status: Session["status"]): Session[] {
  const { sessions } = useSessionStore();
  return useMemo(
    () => sessions.filter((s) => s.status === status),
    [sessions, status],
  );
}

/**
 * Hook to get the active session
 */
export function useActiveSession(): Session | undefined {
  const { getActiveSession } = useSessionStore();
  return getActiveSession();
}
