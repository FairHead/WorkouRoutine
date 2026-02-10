import { View, ActivityIndicator } from "react-native";
import { AIChatButton } from "@/components/ai-chat-button";
import { SessionProvider } from "@/hooks/use-session-store";
import { useUserStore } from "@/src/stores/user.store";
import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { Slot, Redirect, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

function RootLayoutNav() {
  const { isLoaded, hasCompletedOnboarding, isAuthenticated } = useUserStore();
  const segments = useSegments();

  // Ladebildschirm während Store lädt - aber Slot muss trotzdem rendern!
  if (!isLoaded) {
    return (
      <>
        <Slot />
        <View style={{ 
          position: 'absolute', 
          top: 0, left: 0, right: 0, bottom: 0,
          alignItems: "center", 
          justifyContent: "center", 
          backgroundColor: Colors.dark.background 
        }}>
          <ActivityIndicator size="large" color={Colors.dark.accent} />
        </View>
      </>
    );
  }

  const inOnboarding = segments[0] === "onboarding";
  const inAuth = segments[0] === "auth";

  // Redirect-Logik:
  // 1. Nicht authentifiziert → /auth (außer wir sind schon dort)
  // 2. Authentifiziert aber kein Onboarding → /onboarding
  // 3. Beides erledigt → /(tabs)
  const needsAuth = !isAuthenticated && !inAuth;
  const needsOnboarding = isAuthenticated && !hasCompletedOnboarding && !inOnboarding && !inAuth;
  const needsHome = isAuthenticated && hasCompletedOnboarding && (inOnboarding || inAuth);

  return (
    <>
      <Slot />
      
      {/* Redirect nach Slot-Mount */}
      {needsAuth && <Redirect href="/auth" />}
      {needsOnboarding && <Redirect href="/onboarding" />}
      {needsHome && <Redirect href="/(tabs)" />}
      
      <StatusBar style="auto" />

      {/* Floating AI Chat Button - nur wenn nicht im Onboarding oder Auth */}
      {!inOnboarding && !inAuth && <AIChatButton />}
    </>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SessionProvider>
          <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
            <RootLayoutNav />
          </ThemeProvider>
        </SessionProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
