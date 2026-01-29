# Changelog

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/),
und dieses Projekt folgt [Semantic Versioning](https://semver.org/lang/de/).

## [1.0.0] - 2025-07-08

### ✨ Hinzugefügt

#### Workout Session Management
- **Session erstellen & verwalten** - Erstelle individuelle Trainingseinheiten mit Namen und Beschreibung
- **Session Store** - Zentrales State Management für alle Sessions mit Zustand-ähnlicher API
- **Übungen hinzufügen** - Modal zum Durchsuchen und Hinzufügen von Übungen aus der Datenbank
- **Workout starten/beenden** - Vollständiger Workout-Flow mit Timer und Fortschrittsverfolgung
- **Status-Synchronisation** - Workout-Status wird automatisch auf der Hauptseite aktualisiert

#### 3D-Karussell
- **Carousel3D Komponente** - Beeindruckendes 3D-Karussell mit perspektivischer Darstellung
- **Smooth Animations** - Flüssige Swipe-Gesten mit Spring-Animationen (react-native-reanimated)
- **Aktiver Index Sync** - Karussell synchronisiert sich mit externen Index-Änderungen
- **Vor/Zurück Navigation** - Pfeiltasten zur Navigation zwischen Übungen
- **Workout-Integration** - Karussell funktioniert auch während des aktiven Trainings

#### Drag & Drop
- **DraggableList Komponente** - Übungen per Drag & Drop neu sortieren
- **Long-Press Aktivierung** - 200ms langes Drücken aktiviert den Drag-Modus
- **Visual Feedback** - Visuelles Feedback während des Ziehens (Schatten, Skalierung)
- **Smooth Reordering** - Animierte Neuanordnung der Elemente

#### Workout-Modus
- **WorkoutExerciseCard** - Spezialisierte Karten für den Workout-Modus
- **Set-Tracking** - Fortschrittsanzeige für abgeschlossene Sets
- **Workout-Timer** - Gesamtdauer des Trainings
- **Pausen-Timer** - Countdown zwischen Sets und Übungen
- **Übungs-Timer** - Timer für zeitbasierte Übungen (z.B. Planks)

#### UI/UX
- **Dark Mode Support** - Vollständige Unterstützung für Dark/Light Mode
- **Theme System** - Zentrales Farbsystem mit Akzentfarbe (#5c77ba)
- **Responsive Design** - Optimiert für verschiedene Bildschirmgrößen
- **Haptic Feedback** - Haptische Rückmeldung bei Interaktionen
- **GestureHandlerRootView** - Korrekte Integration für Touch-Gesten

#### Datenmodelle
- **Exercise Model** - Umfassendes Übungsmodell mit allen relevanten Eigenschaften
- **Session Model** - Sessions mit Übungen, Status und Metadaten
- **SessionExercise** - Übungskonfiguration pro Session (Sets, Reps, Gewicht)
- **TypeScript Types** - Vollständige Typisierung aller Datenstrukturen

#### Übungsdatenbank
- **ExerciseInfo Interface** - Standardisiertes Format für Übungen
- **Kategorien** - Strength, Cardio, Flexibility, Balance, Endurance
- **Schwierigkeitsgrade** - Beginner, Intermediate, Advanced
- **Detaillierte Informationen** - Zielmuskel, Equipment, Anleitung

### 🔧 Technisch

- React Native 0.81.5 mit New Architecture
- Expo SDK 54 mit Typed Routes
- expo-router 6 für File-based Navigation
- react-native-reanimated 4.1.1 für Animationen
- react-native-gesture-handler 2.28.0 für Touch-Gesten
- TypeScript 5.9.2 für Typ-Sicherheit

---

## Geplant für zukünftige Versionen

### [1.1.0] - Geplant
- [ ] Workout-Historie
- [ ] Statistiken und Fortschritts-Tracking
- [ ] Export/Import von Sessions
- [ ] Cloud-Synchronisation

### [1.2.0] - Geplant
- [ ] Übungen aus API laden (ExerciseDB)
- [ ] Eigene Übungen erstellen
- [ ] Bilder/GIFs für Übungen
- [ ] Video-Tutorials

### [2.0.0] - Geplant
- [ ] Multi-User Support
- [ ] Trainingsplanung (Wochenplan)
- [ ] Push-Benachrichtigungen
- [ ] Apple Watch / Wear OS Integration
