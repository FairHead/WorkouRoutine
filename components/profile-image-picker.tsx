/**
 * Profile Image Picker Komponente
 * 
 * Ermöglicht:
 * - Bild aus Galerie wählen
 * - Foto mit Kamera aufnehmen
 * - Vorschau mit Avatar-Fallback
 * - Upload zu Firebase Storage
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from "react-native-reanimated";
import { Colors } from "@/constants/theme";
import { uploadProfileImage } from "@/src/services/storage.service";

interface ProfileImagePickerProps {
  /** Aktuelle Avatar-URL */
  imageUrl?: string;
  /** Anzeigename für Fallback-Initial */
  displayName?: string;
  /** Callback bei erfolgreichem Upload */
  onImageSelected: (url: string) => void;
  /** Ist aktuell im Bearbeitungsmodus? */
  isEditing?: boolean;
  /** Größe des Avatars */
  size?: number;
}

export function ProfileImagePicker({
  imageUrl,
  displayName = "B",
  onImageSelected,
  isEditing = false,
  size = 100,
}: ProfileImagePickerProps) {
  const [showModal, setShowModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  /**
   * Kamera-Berechtigung anfragen
   */
  const requestCameraPermission = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Berechtigung erforderlich",
        "Bitte erlaube der App den Zugriff auf die Kamera, um ein Foto aufzunehmen.",
        [{ text: "OK" }]
      );
      return false;
    }
    return true;
  };

  /**
   * Galerie-Berechtigung anfragen
   */
  const requestGalleryPermission = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Berechtigung erforderlich",
        "Bitte erlaube der App den Zugriff auf deine Fotos.",
        [{ text: "OK" }]
      );
      return false;
    }
    return true;
  };

  /**
   * Bild aus Galerie wählen
   */
  const pickFromGallery = async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await Haptics.selectionAsync();
        setPreviewUri(result.assets[0].uri);
        handleUpload(result.assets[0].uri);
      }
    } catch (error) {
      if (__DEV__) {
        console.error("Error picking image:", error);
      }
      Alert.alert("Fehler", "Bild konnte nicht geladen werden.");
    }
    
    setShowModal(false);
  };

  /**
   * Foto mit Kamera aufnehmen
   */
  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await Haptics.selectionAsync();
        setPreviewUri(result.assets[0].uri);
        handleUpload(result.assets[0].uri);
      }
    } catch (error) {
      if (__DEV__) {
        console.error("Error taking photo:", error);
      }
      Alert.alert("Fehler", "Foto konnte nicht aufgenommen werden.");
    }
    
    setShowModal(false);
  };

  /**
   * Bild zu Firebase hochladen
   */
  const handleUpload = async (uri: string) => {
    setIsUploading(true);
    
    try {
      const result = await uploadProfileImage(uri);
      
      if (result.success && result.url) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onImageSelected(result.url);
        setPreviewUri(null);
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("Fehler", result.error || "Upload fehlgeschlagen");
        setPreviewUri(null);
      }
    } catch {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Fehler", "Upload fehlgeschlagen");
      setPreviewUri(null);
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Avatar-Placeholder mit Initial
   */
  const renderAvatar = () => {
    const currentImage = previewUri || imageUrl;
    const initial = (displayName || "B")[0].toUpperCase();

    return (
      <View style={[styles.avatarContainer, { width: size, height: size }]}>
        {currentImage ? (
          <Image
            source={{ uri: currentImage }}
            style={[styles.avatarImage, { width: size, height: size, borderRadius: size / 2 }]}
          />
        ) : (
          <View style={[styles.avatarPlaceholder, { width: size, height: size, borderRadius: size / 2 }]}>
            <Text style={[styles.avatarInitial, { fontSize: size * 0.4 }]}>{initial}</Text>
          </View>
        )}
        
        {/* Upload-Overlay */}
        {isUploading && (
          <View style={[styles.uploadOverlay, { borderRadius: size / 2 }]}>
            <ActivityIndicator color="#fff" size="large" />
          </View>
        )}
        
        {/* Edit-Button */}
        {isEditing && !isUploading && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowModal(true);
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="camera" size={size * 0.18} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <>
      {renderAvatar()}

      {/* Auswahl-Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="none"
        onRequestClose={() => setShowModal(false)}
      >
        <Animated.View 
          style={styles.modalOverlay}
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
        >
          <TouchableOpacity 
            style={styles.modalBackground} 
            onPress={() => setShowModal(false)}
            activeOpacity={1}
          />
          
          <Animated.View 
            style={styles.modalContent}
            entering={ZoomIn.duration(250).springify()}
            exiting={ZoomOut.duration(200)}
          >
            <Text style={styles.modalTitle}>Profilbild ändern</Text>
            
            <View style={styles.optionsContainer}>
              {/* Kamera Option */}
              <TouchableOpacity
                style={styles.option}
                onPress={takePhoto}
                activeOpacity={0.7}
              >
                <View style={styles.optionIconContainer}>
                  <Ionicons name="camera" size={28} color={Colors.dark.accent} />
                </View>
                <Text style={styles.optionText}>Foto aufnehmen</Text>
              </TouchableOpacity>

              {/* Galerie Option */}
              <TouchableOpacity
                style={styles.option}
                onPress={pickFromGallery}
                activeOpacity={0.7}
              >
                <View style={styles.optionIconContainer}>
                  <Ionicons name="images" size={28} color={Colors.dark.accent} />
                </View>
                <Text style={styles.optionText}>Aus Galerie wählen</Text>
              </TouchableOpacity>
            </View>

            {/* Abbrechen Button */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                Haptics.selectionAsync();
                setShowModal(false);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>Abbrechen</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  avatarContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    backgroundColor: Colors.dark.cardBackground,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.dark.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    color: "#fff",
    fontWeight: "700",
  },
  uploadOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  editButton: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: Colors.dark.accent,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: Colors.dark.background,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: Colors.dark.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.dark.text,
    textAlign: "center",
    marginBottom: 24,
  },
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 24,
  },
  option: {
    alignItems: "center",
    padding: 16,
  },
  optionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${Colors.dark.accent}20`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  optionText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.dark.text,
    textAlign: "center",
  },
  cancelButton: {
    backgroundColor: Colors.dark.background,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark.textSecondary,
  },
});
