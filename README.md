# WorkoutRoutine 💪

Eine moderne React Native Workout-App mit 3D-Karussell, Drag & Drop Sortierung und Session-Management.

![React Native](https://img.shields.io/badge/React_Native-0.81.5-blue?logo=react)
![Expo](https://img.shields.io/badge/Expo-54.0-black?logo=expo)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue?logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### 🏋️ Workout Sessions
- **Session erstellen & verwalten** - Erstelle individuelle Trainingseinheiten
- **Übungen hinzufügen** - Wähle aus einer umfangreichen Übungsdatenbank
- **Drag & Drop Sortierung** - Ordne Übungen per Ziehen und Ablegen neu an
- **Workout-Tracking** - Verfolge Sets, Wiederholungen und Pausenzeiten

### 🎠 3D-Karussell
- **Perspektivisches Design** - Übungen werden in einem beeindruckenden 3D-Karussell dargestellt
- **Flüssige Animationen** - Smooth Swipe-Gesten mit Spring-Animationen
- **Aktiver Workout-Modus** - Karussell funktioniert auch während des Trainings

### ⏱️ Timer & Tracking
- **Workout-Timer** - Gesamtdauer des Trainings
- **Set-Timer** - Timer für zeitbasierte Übungen
- **Pausenzeiten** - Automatische Countdown-Timer zwischen Sets
- **Fortschrittsanzeige** - Visuelles Feedback zum aktuellen Set

### 🎨 UI/UX
- **Dark & Light Mode** - Automatische Anpassung an System-Einstellungen
- **Modernes Design** - Klares, benutzerfreundliches Interface
- **Haptic Feedback** - Haptische Rückmeldung bei Interaktionen
- **Responsive Layout** - Optimiert für verschiedene Bildschirmgrößen

## 🚀 Installation

### Voraussetzungen

- [Node.js](https://nodejs.org/) (v18 oder höher)
- [npm](https://www.npmjs.com/) oder [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Android Studio](https://developer.android.com/studio) (für Android) oder [Xcode](https://developer.apple.com/xcode/) (für iOS)

### Schritte

1. **Repository klonen**
   ```bash
   git clone https://github.com/yourusername/WorkoutRoutine.git
   cd WorkoutRoutine
   ```

2. **Abhängigkeiten installieren**
   ```bash
   npm install
   ```

3. **App starten**
   ```bash
   npx expo start
   ```

4. **Auf Gerät/Emulator öffnen**
   - Drücke `a` für Android Emulator
   - Drücke `i` für iOS Simulator
   - Scanne den QR-Code mit der [Expo Go](https://expo.dev/go) App

## 📱 Verwendung

### Session erstellen
1. Tippe auf "Neue Session" auf der Startseite
2. Gib einen Namen und optional eine Beschreibung ein
3. Füge Übungen aus der Datenbank hinzu
4. Konfiguriere Sets, Wiederholungen und Gewichte

### Workout starten
1. Wähle eine Session aus
2. Tippe auf "Workout starten"
3. Navigiere durch die Übungen im 3D-Karussell
4. Markiere abgeschlossene Sets
5. Beende das Workout wenn du fertig bist

### Übungen sortieren
- Halte eine Übung gedrückt, um den Drag-Modus zu aktivieren
- Ziehe die Übung an die gewünschte Position
- Lasse los, um die neue Reihenfolge zu speichern

## 🛠️ Technologie-Stack

| Technologie | Version | Beschreibung |
|-------------|---------|--------------|
| React Native | 0.81.5 | Cross-Platform Framework |
| Expo | 54.0 | Development Platform |
| TypeScript | 5.9.2 | Typ-sichere Entwicklung |
| Expo Router | 6.0 | File-based Navigation |
| Reanimated | 4.1.1 | Smooth Animations |
| Gesture Handler | 2.28.0 | Touch-Gesten |

## 📁 Projektstruktur

```
WorkoutRoutine/
├── app/                    # Expo Router Pages
│   ├── (tabs)/            # Tab-Navigation
│   │   ├── index.tsx      # Startseite (Sessions)
│   │   └── explore.tsx    # Übungsdatenbank
│   ├── session/           # Session-Details
│   │   └── [id].tsx       # Dynamische Session-Seite
│   ├── workout/           # Workout-Player
│   │   └── [id].tsx       # Aktives Workout
│   └── _layout.tsx        # Root-Layout
├── components/            # Wiederverwendbare Komponenten
│   ├── carousel-3d.tsx    # 3D-Karussell
│   ├── draggable-list.tsx # Drag & Drop Liste
│   ├── session-card.tsx   # Session-Karte
│   └── ...
├── hooks/                 # Custom React Hooks
│   ├── use-session-store.tsx  # Session State Management
│   └── ...
├── src/                   # Business Logic
│   ├── data/             # Übungsdatenbank
│   ├── models/           # TypeScript Interfaces
│   └── services/         # API Services
├── constants/            # Konstanten (Theme, etc.)
└── assets/              # Bilder, Fonts, etc.
```

## 📖 Dokumentation

- [Architektur](docs/ARCHITECTURE.md) - Technische Architektur und Komponenten
- [Komponenten](docs/COMPONENTS.md) - Detaillierte Komponenten-Dokumentation
- [Contributing](CONTRIBUTING.md) - Wie du beitragen kannst
- [Changelog](CHANGELOG.md) - Versionshistorie

## 🤝 Contributing

Beiträge sind willkommen! Lies bitte zuerst die [Contributing Guidelines](CONTRIBUTING.md).

1. Fork das Repository
2. Erstelle einen Feature-Branch (`git checkout -b feature/AmazingFeature`)
3. Committe deine Änderungen (`git commit -m 'Add some AmazingFeature'`)
4. Push den Branch (`git push origin feature/AmazingFeature`)
5. Öffne einen Pull Request

## 📄 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert - siehe [LICENSE](LICENSE) für Details.

## 🙏 Danksagung

- [Expo Team](https://expo.dev) für das großartige Framework
- [ExerciseDB](https://exercisedb.io/) für die Übungsdatenbank
- Die React Native Community für die tollen Bibliotheken

---

<p align="center">
  Made with ❤️ using React Native & Expo
</p>
