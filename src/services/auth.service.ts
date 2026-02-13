/**
 * Firebase Authentication Service
 * 
 * Verwaltet Benutzer-Authentifizierung mit Firebase:
 * - Email/Passwort Registrierung
 * - Login/Logout
 * - Passwort zurücksetzen
 * - Auth State Listener
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
} from "firebase/auth";
import { auth } from "../config/firebase.config";

/**
 * Auth Error Codes mit deutschen Fehlermeldungen
 */
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "auth/email-already-in-use": "Diese E-Mail-Adresse wird bereits verwendet.",
  "auth/invalid-email": "Ungültige E-Mail-Adresse.",
  "auth/operation-not-allowed": "Diese Anmeldemethode ist nicht aktiviert.",
  "auth/weak-password": "Das Passwort muss mindestens 6 Zeichen lang sein.",
  "auth/user-disabled": "Dieses Konto wurde deaktiviert.",
  "auth/user-not-found": "Kein Konto mit dieser E-Mail-Adresse gefunden.",
  "auth/wrong-password": "Falsches Passwort.",
  "auth/invalid-credential": "Ungültige Anmeldedaten. Bitte überprüfe E-Mail und Passwort.",
  "auth/too-many-requests": "Zu viele Versuche. Bitte versuche es später erneut.",
  "auth/network-request-failed": "Netzwerkfehler. Bitte überprüfe deine Internetverbindung.",
};

/**
 * Konvertiert Firebase Auth Error zu deutschem Text
 */
function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "code" in error) {
    const code = (error as { code: string }).code;
    return AUTH_ERROR_MESSAGES[code] || "Ein unbekannter Fehler ist aufgetreten.";
  }
  return "Ein unbekannter Fehler ist aufgetreten.";
}

/**
 * Auth Response Type
 */
export interface AuthResult {
  success: boolean;
  user?: FirebaseUser;
  error?: string;
}

/**
 * Registriert einen neuen Benutzer mit E-Mail und Passwort
 */
export async function registerWithEmail(
  email: string,
  password: string,
  displayName?: string
): Promise<AuthResult> {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );

    // Optional: Display Name setzen
    if (displayName && userCredential.user) {
      await updateProfile(userCredential.user, { displayName: displayName.trim() });
    }

    if (__DEV__) {
      console.log("✅ Benutzer erfolgreich registriert:", userCredential.user.email);
    }

    return {
      success: true,
      user: userCredential.user,
    };
  } catch (error) {
    if (__DEV__) {
      console.error("❌ Registrierung fehlgeschlagen:", error);
    }
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

/**
 * Meldet einen Benutzer mit E-Mail und Passwort an
 */
export async function loginWithEmail(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );

    if (__DEV__) {
      console.log("✅ Benutzer erfolgreich angemeldet:", userCredential.user.email);
    }

    return {
      success: true,
      user: userCredential.user,
    };
  } catch (error) {
    if (__DEV__) {
      console.error("❌ Anmeldung fehlgeschlagen:", error);
    }
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

/**
 * Meldet den aktuellen Benutzer ab
 */
export async function logout(): Promise<AuthResult> {
  try {
    await signOut(auth);

    if (__DEV__) {
      console.log("✅ Benutzer erfolgreich abgemeldet");
    }

    return { success: true };
  } catch (error) {
    if (__DEV__) {
      console.error("❌ Abmeldung fehlgeschlagen:", error);
    }
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

/**
 * Sendet eine E-Mail zum Zurücksetzen des Passworts
 */
export async function sendPasswordReset(email: string): Promise<AuthResult> {
  try {
    await sendPasswordResetEmail(auth, email.trim());

    if (__DEV__) {
      console.log("✅ Passwort-Reset E-Mail gesendet an:", email);
    }

    return { success: true };
  } catch (error) {
    if (__DEV__) {
      console.error("❌ Passwort-Reset fehlgeschlagen:", error);
    }
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

/**
 * Listener für Auth State Änderungen
 * Gibt unsubscribe Funktion zurück
 */
export function subscribeToAuthState(
  callback: (user: FirebaseUser | null) => void
): () => void {
  return onAuthStateChanged(auth, callback);
}

/**
 * Aktueller Benutzer (synchron)
 */
export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser;
}

/**
 * Überprüft ob ein Benutzer angemeldet ist
 */
export function isAuthenticated(): boolean {
  return auth.currentUser !== null;
}

/**
 * Aktualisiert das Benutzerprofil (Display Name, Photo URL)
 */
export async function updateUserProfile(updates: {
  displayName?: string;
  photoURL?: string;
}): Promise<AuthResult> {
  try {
    const user = auth.currentUser;
    if (!user) {
      return {
        success: false,
        error: "Kein Benutzer angemeldet.",
      };
    }

    await updateProfile(user, updates);

    if (__DEV__) {
      console.log("✅ Profil aktualisiert:", updates);
    }

    return { success: true, user };
  } catch (error) {
    if (__DEV__) {
      console.error("❌ Profil-Update fehlgeschlagen:", error);
    }
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

// Re-export Firebase User Type
export type { FirebaseUser };
