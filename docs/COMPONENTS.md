# Komponenten-Dokumentation

Detaillierte Dokumentation aller wiederverwendbaren Komponenten in WorkoutRoutine.

## 📑 Inhaltsverzeichnis

- [Carousel3D](#carousel3d)
- [DraggableList](#draggablelist)
- [SessionCard](#sessioncard)
- [SessionExerciseCard](#sessionexercisecard)
- [WorkoutExerciseCard](#workoutexercisecard)
- [ExerciseCard](#exercisecard)
- [ThemedText](#themedtext)
- [ThemedView](#themedview)

---

## Carousel3D

Ein 3D-Karussell mit perspektivischer Darstellung und Swipe-Gesten.

### Import

```typescript
import { Carousel3D } from "@/components/carousel-3d";
```

### Props

| Prop            | Type                      | Default    | Beschreibung                    |
| --------------- | ------------------------- | ---------- | ------------------------------- |
| `children`      | `ReactNode[]`             | (required) | Die Karten-Elemente             |
| `initialIndex`  | `number`                  | `0`        | Startindex                      |
| `activeIndex`   | `number`                  | -          | Kontrollierter Index (optional) |
| `onIndexChange` | `(index: number) => void` | -          | Callback bei Index-Änderung     |

### Beispiel

```tsx
<Carousel3D
  initialIndex={0}
  activeIndex={currentExercise}
  onIndexChange={(index) => setCurrentExercise(index)}
>
  {exercises.map((exercise) => (
    <ExerciseCard key={exercise.id} exercise={exercise} />
  ))}
</Carousel3D>
```

### Features

- 🎠 3D-Perspektive mit Tiefeneffekt
- 👆 Swipe-Gesten (links/rechts)
- 🔘 Navigation mit Pfeiltasten
- 🔄 Synchronisation mit externem Index
- ✨ Spring-Animationen

### Technische Details

- Verwendet `react-native-reanimated` für Animationen
- `Animated.Value` für Scroll-Position
- `PanResponder` für Swipe-Erkennung
- Automatische Index-Berechnung mit Wrapping

---

## DraggableList

Eine sortierbare Liste mit Drag & Drop Funktionalität.

### Import

```typescript
import { DraggableList } from "@/components/draggable-list";
```

### Props

| Prop              | Type                                       | Default    | Beschreibung                |
| ----------------- | ------------------------------------------ | ---------- | --------------------------- |
| `data`            | `T[]`                                      | (required) | Die Listendaten             |
| `keyExtractor`    | `(item: T) => string`                      | (required) | Key-Funktion                |
| `renderItem`      | `(props: RenderItemProps<T>) => ReactNode` | (required) | Render-Funktion             |
| `onReorder`       | `(newData: T[]) => void`                   | (required) | Callback nach Sortierung    |
| `itemHeight`      | `number`                                   | `80`       | Höhe eines Elements         |
| `activationDelay` | `number`                                   | `200`      | Long-Press Verzögerung (ms) |

### RenderItemProps

```typescript
interface RenderItemProps<T> {
  item: T;
  index: number;
  isDragging: boolean;
  dragHandleProps: object; // Auf den Drag-Handle anwenden
}
```

### Beispiel

```tsx
<DraggableList
  data={exercises}
  keyExtractor={(ex) => ex.id}
  onReorder={(newExercises) => {
    reorderExercises(
      sessionId,
      newExercises.map((e) => e.id),
    );
  }}
  renderItem={({ item, isDragging, dragHandleProps }) => (
    <View style={[styles.item, isDragging && styles.dragging]}>
      <Text>{item.name}</Text>
      <View {...dragHandleProps}>
        <Ionicons name="menu" size={24} />
      </View>
    </View>
  )}
/>
```

### Features

- ✋ Long-Press zum Aktivieren (200ms)
- 🎯 Drag Handle Support
- ✨ Smooth Animationen beim Verschieben
- 📱 Visuelles Feedback (Schatten, Skalierung)
- 🔄 Automatische Neuordnung

---

## SessionCard

Zeigt eine Session-Vorschau auf der Startseite.

### Import

```typescript
import { SessionCard } from "@/components/session-card";
```

### Props

| Prop          | Type         | Default    | Beschreibung       |
| ------------- | ------------ | ---------- | ------------------ |
| `session`     | `Session`    | (required) | Session-Daten      |
| `onPress`     | `() => void` | -          | Klick-Handler      |
| `onLongPress` | `() => void` | -          | Long-Press Handler |

### Beispiel

```tsx
<SessionCard
  session={session}
  onPress={() => router.push(`/session/${session.id}`)}
  onLongPress={() => showActionSheet(session)}
/>
```

### Darstellung

- Session-Name
- Beschreibung (falls vorhanden)
- Anzahl der Übungen
- Status-Badge (Geplant/Aktiv/Abgeschlossen)
- Letztes Update-Datum

---

## SessionExerciseCard

Zeigt eine Übung innerhalb einer Session-Detailansicht.

### Import

```typescript
import { SessionExerciseCard } from "@/components/session-exercise-card";
```

### Props

| Prop       | Type              | Default    | Beschreibung       |
| ---------- | ----------------- | ---------- | ------------------ |
| `exercise` | `SessionExercise` | (required) | Übungsdaten        |
| `onPress`  | `() => void`      | -          | Klick-Handler      |
| `onEdit`   | `() => void`      | -          | Bearbeiten-Handler |
| `onDelete` | `() => void`      | -          | Löschen-Handler    |

### Darstellung

- Übungsbild
- Übungsname
- Sets × Reps oder Timer
- Gewicht (falls vorhanden)
- Zielmuskel
- Equipment

---

## WorkoutExerciseCard

Spezialisierte Karte für den aktiven Workout-Modus.

### Import

```typescript
import { WorkoutExerciseCard } from "@/components/workout-exercise-card";
```

### Props

| Prop                    | Type              | Default    | Beschreibung                   |
| ----------------------- | ----------------- | ---------- | ------------------------------ |
| `exercise`              | `SessionExercise` | (required) | Übungsdaten                    |
| `isActive`              | `boolean`         | `false`    | Ob die Übung gerade aktiv ist  |
| `completedSets`         | `number`          | `0`        | Anzahl abgeschlossener Sets    |
| `isResting`             | `boolean`         | `false`    | Ob gerade Pause ist            |
| `restTimeRemaining`     | `number`          | `0`        | Verbleibende Pausenzeit        |
| `exerciseTimeRemaining` | `number`          | -          | Timer für zeitbasierte Übungen |
| `onCompleteSet`         | `() => void`      | -          | Set abschließen                |
| `onSkipRest`            | `() => void`      | -          | Pause überspringen             |

### Zustände

1. **Inaktiv** - Gedimmte Darstellung, wartet auf Aktivierung
2. **Aktiv** - Volle Darstellung, Set-Tracking aktiv
3. **Ruhepause** - Countdown-Overlay mit verbleibender Zeit
4. **Timer-Modus** - Countdown für die Übung selbst

### Beispiel

```tsx
<WorkoutExerciseCard
  exercise={currentExercise}
  isActive={true}
  completedSets={2}
  isResting={isResting}
  restTimeRemaining={45}
  onCompleteSet={handleCompleteSet}
  onSkipRest={handleSkipRest}
/>
```

---

## ExerciseCard

Basis-Übungskarte für die Übungsdatenbank.

### Import

```typescript
import { ExerciseCard } from "@/components/exercise-card";
```

### Props

| Prop            | Type           | Default    | Beschreibung               |
| --------------- | -------------- | ---------- | -------------------------- |
| `exercise`      | `ExerciseInfo` | (required) | Übungsdaten                |
| `onPress`       | `() => void`   | -          | Klick-Handler              |
| `onLongPress`   | `() => void`   | -          | Long-Press (GIF Vorschau)  |
| `showAddButton` | `boolean`      | `false`    | "Hinzufügen" Button zeigen |
| `onAdd`         | `() => void`   | -          | Hinzufügen-Handler         |

---

## ThemedText

Text-Komponente mit automatischer Theme-Unterstützung.

### Import

```typescript
import { ThemedText } from "@/components/themed-text";
```

### Props

| Prop           | Type                                           | Default     | Beschreibung                 |
| -------------- | ---------------------------------------------- | ----------- | ---------------------------- |
| `type`         | `'default' \| 'title' \| 'subtitle' \| 'link'` | `'default'` | Textstil                     |
| `lightColor`   | `string`                                       | -           | Override für Light Mode      |
| `darkColor`    | `string`                                       | -           | Override für Dark Mode       |
| `...TextProps` | -                                              | -           | Alle React Native Text Props |

### Beispiel

```tsx
<ThemedText type="title">Überschrift</ThemedText>
<ThemedText type="subtitle">Unterüberschrift</ThemedText>
<ThemedText>Normaler Text</ThemedText>
<ThemedText type="link" onPress={handlePress}>Link</ThemedText>
```

---

## ThemedView

View-Komponente mit automatischer Theme-Unterstützung.

### Import

```typescript
import { ThemedView } from "@/components/themed-view";
```

### Props

| Prop           | Type     | Default | Beschreibung                 |
| -------------- | -------- | ------- | ---------------------------- |
| `lightColor`   | `string` | -       | Override für Light Mode      |
| `darkColor`    | `string` | -       | Override für Dark Mode       |
| `...ViewProps` | -        | -       | Alle React Native View Props |

### Beispiel

```tsx
<ThemedView style={styles.container}>
  <ThemedText>Inhalt</ThemedText>
</ThemedView>

<ThemedView
  lightColor="#f0f0f0"
  darkColor="#1a1a1a"
  style={styles.card}
>
  <ThemedText>Karte mit Custom Farben</ThemedText>
</ThemedView>
```

---

## 🎨 Styling Patterns

### Theme-Aware Komponenten

```typescript
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function MyComponent() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBackground }]}>
      <Text style={[styles.text, { color: colors.text }]}>
        Hello
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
  },
  text: {
    fontSize: 16,
  },
});
```

### Animierte Komponenten

```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring
} from 'react-native-reanimated';

export function AnimatedCard({ isActive }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(isActive ? 1.05 : 1);
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      {/* Content */}
    </Animated.View>
  );
}
```

---

## 📝 Best Practices

1. **Props dokumentieren** - Jede Komponente sollte ihre Props beschreiben
2. **Default Values** - Sinnvolle Defaults für optionale Props
3. **Callback Naming** - `onXxx` für Event-Handler Props
4. **Memoization** - `React.memo` für teure Komponenten
5. **Theme Support** - Alle Komponenten sollten Dark/Light Mode unterstützen
