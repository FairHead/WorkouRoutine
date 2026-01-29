# Contributing zu WorkoutRoutine

Vielen Dank für dein Interesse an WorkoutRoutine! Dieses Dokument erklärt, wie du zum Projekt beitragen kannst.

## 📋 Inhaltsverzeichnis

- [Code of Conduct](#code-of-conduct)
- [Wie kann ich beitragen?](#wie-kann-ich-beitragen)
- [Entwicklungsumgebung einrichten](#entwicklungsumgebung-einrichten)
- [Code Style Guidelines](#code-style-guidelines)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)

## 📜 Code of Conduct

Dieses Projekt und alle Teilnehmer sind dem [Contributor Covenant](https://www.contributor-covenant.org/) verpflichtet. Durch die Teilnahme erklärst du dich einverstanden, dich respektvoll und professionell zu verhalten.

## 🤔 Wie kann ich beitragen?

### 🐛 Bugs melden

Wenn du einen Bug findest, erstelle bitte ein Issue mit:
- **Titel**: Kurze, beschreibende Zusammenfassung
- **Beschreibung**: Was passiert vs. was erwartet wird
- **Schritte zur Reproduktion**: Wie kann der Bug reproduziert werden
- **Umgebung**: Betriebssystem, Gerät, React Native Version
- **Screenshots/Videos**: Falls zutreffend

### 💡 Feature Requests

Hast du eine Idee für ein neues Feature?
1. Prüfe zuerst, ob ein ähnliches Issue bereits existiert
2. Erstelle ein Issue mit dem Label `enhancement`
3. Beschreibe das Feature und seinen Nutzen
4. Füge Mockups/Wireframes hinzu (falls vorhanden)

### 📝 Dokumentation

Verbesserungen an der Dokumentation sind immer willkommen:
- Tippfehler korrigieren
- Beispiele hinzufügen
- Übersetzungen

### 💻 Code beitragen

1. Wähle ein Issue aus oder erstelle ein neues
2. Kommentiere, dass du daran arbeitest
3. Fork das Repository
4. Implementiere die Änderungen
5. Erstelle einen Pull Request

## 🛠️ Entwicklungsumgebung einrichten

### Voraussetzungen

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git
- VS Code (empfohlen)
- Android Studio / Xcode

### Setup

```bash
# Repository klonen
git clone https://github.com/yourusername/WorkoutRoutine.git
cd WorkoutRoutine

# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npx expo start
```

### VS Code Extensions (empfohlen)

- ESLint
- Prettier
- React Native Tools
- TypeScript Importer
- Error Lens

## 📏 Code Style Guidelines

### TypeScript

- Verwende TypeScript für alle neuen Dateien
- Definiere Interfaces für Props und State
- Vermeide `any` - nutze spezifische Typen
- Exportiere Types aus zentralen Model-Dateien

```typescript
// ✅ Gut
interface SessionCardProps {
  session: Session;
  onPress: (id: string) => void;
}

// ❌ Vermeiden
function SessionCard(props: any) { ... }
```

### React Native

- Verwende funktionale Komponenten mit Hooks
- Extrahiere komplexe Logik in Custom Hooks
- Nutze `useCallback` und `useMemo` für Performance
- Benenne Komponenten in PascalCase

```typescript
// ✅ Gut
export function SessionCard({ session, onPress }: SessionCardProps) {
  const handlePress = useCallback(() => {
    onPress(session.id);
  }, [session.id, onPress]);
  
  return <Pressable onPress={handlePress}>...</Pressable>;
}
```

### Styling

- Verwende `StyleSheet.create()` für Styles
- Nutze das Theme-System für Farben
- Unterstütze Dark Mode

```typescript
// ✅ Gut
const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
  },
});

// In der Komponente
const colors = Colors[colorScheme ?? 'light'];
```

### Dateistruktur

- Eine Komponente pro Datei
- Kebab-case für Dateinamen: `session-card.tsx`
- Gruppiere verwandte Dateien in Ordnern
- Index-Dateien für Re-Exports

## ✍️ Commit Messages

Wir verwenden [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Beschreibung |
|------|-------------|
| `feat` | Neues Feature |
| `fix` | Bugfix |
| `docs` | Dokumentation |
| `style` | Formatierung (kein Code-Change) |
| `refactor` | Code-Refactoring |
| `perf` | Performance-Verbesserungen |
| `test` | Tests hinzufügen/ändern |
| `chore` | Build-Prozess, Dependencies |

### Beispiele

```bash
# Feature
git commit -m "feat(carousel): add 3D perspective animation"

# Bugfix
git commit -m "fix(session): prevent crash on empty exercise list"

# Dokumentation
git commit -m "docs: update installation instructions"
```

## 🔄 Pull Request Process

### Vor dem PR

1. **Teste lokal**: Stelle sicher, dass die App funktioniert
2. **Lint**: Führe `npm run lint` aus
3. **Typ-Check**: Keine TypeScript-Fehler
4. **Commit History**: Saubere, beschreibende Commits

### PR erstellen

1. **Titel**: Beschreibend, folgt Conventional Commits
2. **Beschreibung**: 
   - Was wurde geändert?
   - Warum wurde es geändert?
   - Wie kann man es testen?
   - Verlinke relevante Issues
3. **Labels**: Passende Labels hinzufügen
4. **Screenshots/Videos**: Für UI-Änderungen

### Review Process

1. Ein Maintainer wird deinen PR reviewen
2. Feedback wird als Kommentare gegeben
3. Arbeite Änderungen ein und pushe erneut
4. Nach Genehmigung wird der PR gemerged

### Nach dem Merge

- Dein Feature-Branch kann gelöscht werden
- Das Issue wird automatisch geschlossen (wenn verlinkt)
- Dein Beitrag erscheint im Changelog

## 🏷️ Labels

| Label | Beschreibung |
|-------|-------------|
| `bug` | Etwas funktioniert nicht |
| `enhancement` | Neues Feature oder Verbesserung |
| `documentation` | Dokumentation |
| `good first issue` | Gut für Einsteiger |
| `help wanted` | Hilfe benötigt |
| `priority: high` | Hohe Priorität |
| `wip` | Work in Progress |

## ❓ Fragen?

Bei Fragen erstelle ein Issue mit dem Label `question` oder kontaktiere die Maintainer.

---

Vielen Dank für deinen Beitrag! 🎉
