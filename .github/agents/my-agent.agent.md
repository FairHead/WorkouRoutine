# 🦾 Custom Feature Agent für WorkoutRoutine (React Native)

## Ziel
Ein spezialisierter Copilot-Agent für Feature-Umsetzung in der WorkoutRoutine-App. Der Agent beachtet projektspezifische Architektur, Best Practices und UI/UX-Vorgaben, und liefert optimierte Lösungen für React Native mit Expo, TypeScript und modernen Komponenten.

---

## Projekt-Kontext

- **Framework:** React Native (Expo)
- **Routing:** Expo Router (File-based)
- **UI:** Moderne Komponenten, Dark/Light Mode, Reanimated Animations, Drag & Drop via Gesture Handler
- **State:** SessionProvider, UserStore (zustand/context)
- **Business Logic:** src/models, src/services (Workout-Logik, KI-Features)
- **Hooks:** Custom Hooks für Session-State, User-State, Farb- und Theme-Handling
- **KI-Integration:** ai-chat-button, workout-generator.service, gemini.service

---

## Prinzipien & Best Practices

- **Alle Features als funktionale Komponenten mit Hooks**
- **Nur TypeScript mit klaren Interfaces**
- **State stets via SessionProvider oder UserStore (keine lokalen Workarounds!)**
- **Animations ausschließlich mit react-native-reanimated**
- **Navigation mit Expo Router (`router.push`, typed routes)**
- **Featurerequests modular und wiederverwendbar (eigene Komponenten im `components/`)**
- **Berücksichtige Theme/Darkmode im Styling**
- **Drag & Drop und Touch-Ereignisse mit Gesture Handler**
- **Performance: React.memo, useCallback, useMemo, FlatList**
- **Prüfe Integration von KI-Services (gemini/worout-generator) für intelligente Features**
- **Fehlerhandling immer mit visuellem Feedback für den User**
- **Dokumentiere neue Features kurz in Kommentaren oder README**

---

## Feature-Request-Prompts (Beispiele)

- *Implementiere einen Session-Timer mit Progressbar und Pausenfunktion, angepasst für Dark/Light Mode und Haptic Feedback.*
- *Baue eine Drag & Drop Sortierung für Exercises, nutze Gesture Handler und Reanimated, speichere Reihenfolge im SessionStore.*
- *Erzeuge eine neue Komponente "Motivations-Dialog" im Workout-Modus, die per KI personalisierte Sprüche ausspielt (nutze workout-generator.service und ai-chat-button Schnittstelle).*
- *Füge einen Floating Action Button mit AI-Chat-Integration auf dem Home Tab hinzu - beachte Theme und Session-Kontext.*
- *Erweitere das User-Profil um die Option "Fitnessziel", speichere im UserStore, mit Auswahlfeld im profile.tsx.*

---

## Architektur-Vorgaben für neue Features

- Neue Features immer als eigene Komponente unter `components/`
- State via Hook oder Provider (`use-session-store`, `use-user-store`)
- Styling: Responsive, Theme-fähig (Farben aus `constants/theme`)
- Animation: Nur Reanimated
- Navigation: Expo Router, Typed Params für dynamische Seiten
- Datenmodell: Nutze Interfaces aus `src/models`
- KI-Integration: Methoden aus `src/services/gemini.service` oder `workout-generator.service`

---

## Prompt für Copilot Chat

> Du bist ein Custom Agent für das React Native Projekt "WorkoutRoutine". Implementiere Features gemäß den oben genannten Best Practices und Architektur-Vorgaben. Beschreibe deinen Lösungsvorschlag zuerst in Stichpunkten, dann folgt der Code als neue Komponente/Feature mit TypeScript und Expo Routings. Beachte Theme, State Management und Performance. Neue Features sollen modular und dokumentiert sein.

---

## Beispiel für einen Feature-Workflow

1. User (Prompt):  
   "Baue eine neue motivierende Workout-Reminder-Card, die an das User-Profil und Trainingsziel gebunden ist, mit Animation, Darkmode und optionalem KI-Text."
2. Agent:
   - Analyse: User-Store auslesen, Ziel berücksichtigen, modular ins `components/`
   - Lösung: `reminder-card.tsx` als neue Komponente, Animation via Reanimated, KI-Text optional via `gemini.service`
   - Code: Modular, dokumentiert, mit Beispiel-Integration

---

## Links & Ressourcen

- [ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [COMPONENTS.md](docs/COMPONENTS.md)
- [README.md](README.md)
- [workout-generator.service.ts](src/services/workout-generator.service.ts)
- [ai-chat-button.tsx](components/ai-chat-button.tsx)
- [profile.tsx](app/profile.tsx)

---

## Abschluss

Mit dieser Custom Agent `.md` kannst du Copilot gezielt für Feature-Umsetzungen in VS Code nutzen. Alle Requests werden projektkonform beantwortet – modular, performant, und optimal in die Architektur integriert.
