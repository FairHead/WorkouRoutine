# Architektur

Dieses Dokument beschreibt die technische Architektur der WorkoutRoutine App.

## 📐 Übersicht

WorkoutRoutine ist eine React Native App, die mit Expo entwickelt wurde. Die Architektur folgt modernen Best Practices für React Native Entwicklung.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Presentation Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   Screens    │  │  Components  │  │    Hooks     │           │
│  │  (app/*.tsx) │  │(components/) │  │  (hooks/)    │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
├─────────────────────────────────────────────────────────────────┤
│                        Business Logic                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  State Management                         │   │
│  │                (SessionProvider / Context)                │   │
│  └──────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                         Data Layer                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   Models     │  │    Data      │  │   Services   │           │
│  │(src/models/) │  │ (src/data/)  │  │(src/services)│           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

## 📁 Verzeichnisstruktur

### `/app` - Expo Router Pages

Die App verwendet [Expo Router](https://docs.expo.dev/router/introduction/) für File-based Routing.

```
app/
├── _layout.tsx          # Root Layout mit GestureHandlerRootView
├── modal.tsx            # Modales Fenster Template
├── (tabs)/              # Tab-Navigation Gruppe
│   ├── _layout.tsx      # Tab Bar Konfiguration
│   ├── index.tsx        # Home Tab - Session Übersicht
│   └── explore.tsx      # Explore Tab - Übungsdatenbank
├── session/
│   └── [id].tsx         # Session Detail mit Workout-Modus
├── workout/
│   └── [id].tsx         # Standalone Workout Player
└── exercise/
    └── [id].tsx         # Übungs-Details (falls vorhanden)
```

### `/components` - Wiederverwendbare UI-Komponenten

```
components/
├── carousel-3d.tsx          # 3D-Karussell mit Perspektive
├── draggable-list.tsx       # Drag & Drop Liste
├── session-card.tsx         # Session-Vorschau Karte
├── session-exercise-card.tsx # Übung in Session-Ansicht
├── workout-exercise-card.tsx # Übung im Workout-Modus
├── exercise-card.tsx        # Basis-Übungskarte
├── exercise-search-card.tsx # Übung in Suchansicht
├── add-to-session-modal.tsx # Modal zum Hinzufügen
├── themed-text.tsx          # Text mit Theme-Unterstützung
├── themed-view.tsx          # View mit Theme-Unterstützung
└── ui/                      # Basis-UI Komponenten
    ├── collapsible.tsx
    ├── icon-symbol.tsx
    └── icon-symbol.ios.tsx
```

### `/hooks` - Custom React Hooks

```
hooks/
├── use-session-store.tsx    # Zentrales Session State Management
├── use-exercises.ts         # Übungsdaten Hook
├── use-color-scheme.ts      # Dark/Light Mode Hook
├── use-color-scheme.web.ts  # Web-spezifische Implementierung
└── use-theme-color.ts       # Theme Farben Hook
```

### `/src` - Business Logic & Daten

```
src/
├── models/
│   ├── index.ts             # Re-Export aller Models
│   └── exercise.model.ts    # Exercise, Session, Workout Types
├── data/
│   ├── index.ts
│   ├── exercises.data.ts    # Statische Übungsdaten
│   └── exercise-database.ts # Übungsdatenbank
└── services/
    └── (zukünftige API Services)
```

## 🔄 State Management

### SessionProvider (Context API)

Die App verwendet React Context für State Management, ähnlich wie Zustand/Redux.

```typescript
interface SessionStore {
  // State
  sessions: Session[];
  activeSessionId: string | null;
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
  addExerciseToSession: (sessionId, exerciseInfo, config) => void;
  updateExerciseInSession: (sessionId, exerciseId, updates) => void;
  removeExerciseFromSession: (sessionId, exerciseId) => void;
  reorderExercises: (sessionId, exerciseIds) => void;

  // Workout
  startWorkout: (sessionId: string) => void;
  completeWorkout: (sessionId: string) => void;
  cancelWorkout: (sessionId: string) => void;
}
```

### Verwendung

```typescript
import { useSessionStore } from '@/hooks/use-session-store';

function MyComponent() {
  const { sessions, createSession, startWorkout } = useSessionStore();
  
  // ...
}
```

## 🎨 Theme System

### Farben

Das Farbsystem ist in `constants/theme.ts` definiert:

```typescript
export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: '#5c77ba',      // Akzentfarbe
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#5c77ba',
    cardBackground: '#f8f9fa',
    border: '#e1e1e1',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: '#5c77ba',      // Gleiche Akzentfarbe
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#5c77ba',
    cardBackground: '#1e2022',
    border: '#2d2d2d',
  },
};
```

### Verwendung in Komponenten

```typescript
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

function MyComponent() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }}>Hello</Text>
    </View>
  );
}
```

## 🎭 Animationen

### React Native Reanimated

Die App nutzt `react-native-reanimated` für performante Animationen:

```typescript
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';

function AnimatedComponent() {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  return <Animated.View style={animatedStyle} />;
}
```

### Gesture Handler

Für Touch-Gesten wird `react-native-gesture-handler` verwendet:

```typescript
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

function DraggableItem() {
  const dragGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateY.value = e.translationY;
    });
    
  return (
    <GestureDetector gesture={dragGesture}>
      <Animated.View />
    </GestureDetector>
  );
}
```

**Wichtig:** `GestureHandlerRootView` muss das Root-Layout wrappen!

```typescript
// app/_layout.tsx
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SessionProvider>
        <Stack />
      </SessionProvider>
    </GestureHandlerRootView>
  );
}
```

## 📊 Datenmodelle

### Exercise

```typescript
interface ExerciseInfo {
  id: string;
  name: string;
  image: ImageSourcePropType;
  gifUrl?: string;
  bodyPart: string;
  targetMuscle: string;
  secondaryMuscles: string[];
  equipment: string;
  instructions: string[];
  caloriesPerMinute: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: ExerciseCategory;
}
```

### Session

```typescript
interface Session {
  id: string;
  name: string;
  description?: string;
  exercises: SessionExercise[];
  status: SessionStatus;  // 'planned' | 'in_progress' | 'completed'
  createdAt: Date;
  updatedAt: Date;
}
```

### SessionExercise

```typescript
interface SessionExercise {
  id: string;
  exerciseInfo: ExerciseInfo;
  mode: 'reps' | 'timer';
  sets: number;
  reps: number;
  duration: number;  // Sekunden
  weight: number;
  restBetweenSets: number;
  restAfterExercise: number;
  notes?: string;
}
```

## 🔌 Navigation

### Expo Router

Die Navigation erfolgt über Expo Router mit typed routes:

```typescript
import { router } from 'expo-router';

// Navigation
router.push('/session/123');
router.push({
  pathname: '/workout/[id]',
  params: { id: '123' },
});

// Zurück
router.back();

// Replace
router.replace('/');
```

### Tab Navigation

Die Tab-Navigation ist in `app/(tabs)/_layout.tsx` konfiguriert:

```typescript
export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Sessions',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Übungen',
          tabBarIcon: ({ color }) => <TabBarIcon name="search" color={color} />,
        }}
      />
    </Tabs>
  );
}
```

## 🧪 Testing

(Geplant für zukünftige Versionen)

- **Unit Tests**: Jest für Business Logic
- **Component Tests**: React Native Testing Library
- **E2E Tests**: Detox oder Maestro

## 📈 Performance Optimierungen

1. **React.memo()** für teure Komponenten
2. **useCallback/useMemo** für stabile Referenzen
3. **FlatList** statt ScrollView für Listen
4. **Reanimated** für 60fps Animationen
5. **Image Optimization** mit expo-image
