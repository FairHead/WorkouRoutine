/**
 * Firebase Storage Service - Verwaltet Datei-Uploads
 * 
 * Features:
 * - Profilbild Upload
 * - Bildkomprimierung
 * - URL-Generierung
 */

import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage, auth } from "@/src/config/firebase.config";

/**
 * Upload Result Interface
 */
export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Lädt ein Profilbild hoch
 * @param uri - Lokaler URI des Bildes
 * @returns UploadResult mit Download-URL
 */
export async function uploadProfileImage(uri: string): Promise<UploadResult> {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      return { success: false, error: "Nicht angemeldet" };
    }
    
    // Bild als Blob laden
    const response = await fetch(uri);
    const blob = await response.blob();
    
    // Dateiname mit Timestamp für Cache-Busting
    const timestamp = Date.now();
    const fileName = `profile_${timestamp}.jpg`;
    const storageRef = ref(storage, `users/${user.uid}/profile/${fileName}`);
    
    // Upload
    if (__DEV__) {
      console.log("📤 Uploading profile image...");
    }
    
    await uploadBytes(storageRef, blob);
    
    // Download URL holen
    const downloadUrl = await getDownloadURL(storageRef);
    
    if (__DEV__) {
      console.log("✅ Profile image uploaded successfully");
    }
    
    return { success: true, url: downloadUrl };
  } catch (error) {
    if (__DEV__) {
      console.error("❌ Error uploading profile image:", error);
    }
    
    // Benutzerfreundliche Fehlermeldungen
    const errorMessage = error instanceof Error ? error.message : "Unbekannter Fehler";
    
    if (errorMessage.includes("storage/unauthorized")) {
      return { success: false, error: "Keine Berechtigung zum Hochladen" };
    }
    if (errorMessage.includes("storage/canceled")) {
      return { success: false, error: "Upload abgebrochen" };
    }
    if (errorMessage.includes("storage/quota-exceeded")) {
      return { success: false, error: "Speicherplatz erschöpft" };
    }
    
    return { success: false, error: "Bild konnte nicht hochgeladen werden" };
  }
}

/**
 * Löscht ein Profilbild aus dem Storage
 * @param url - Download-URL des zu löschenden Bildes
 */
export async function deleteProfileImage(url: string): Promise<{ success: boolean; error?: string }> {
  try {
    // URL in Storage-Referenz umwandeln
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
    
    if (__DEV__) {
      console.log("🗑️ Profile image deleted");
    }
    
    return { success: true };
  } catch (error) {
    if (__DEV__) {
      console.error("❌ Error deleting profile image:", error);
    }
    return { success: false, error: "Bild konnte nicht gelöscht werden" };
  }
}
