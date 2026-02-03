import { View, ActivityIndicator } from "react-native";
import { AIChatButton } from "@/components/ai-chat-button";
import { SessionProvider } from "@/hooks/use-session-store";
import { useUserStore } from "@/hooks/use-user-store";
import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { Stack, Redirect, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isLoaded, hasCompletedOnboarding } = useUserStore();
  const segments = useSegments();

  // Ladebildschirm während Store lädt
  if (!isLoaded) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.dark.background }}>
        <ActivityIndicator size="large" color={Colors.dark.accent} />
      </View>
    );
  }

  const inOnboarding = segments[0] === "onboarding";

  // Redirect-Logik mit der Redirect-Komponente
  // Diese wird erst gerendert nachdem der Stack gemountet ist
  const needsOnboarding = !hasCompletedOnboarding && !inOnboarding;
  const needsHome = hasCompletedOnboarding && inOnboarding;

  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="onboarding" 
          options={{ 
            headerShown: false,
            gestureEnabled: false,
          }} 
        />
        <Stack.Screen 
          name="profile" 
          options={{ 
            headerShown: false,
            presentation: "card",
          }} 
        />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>
      
      {/* Redirect nach Stack-Mount */}
      {needsOnboarding && <Redirect href="/onboarding" />}
      {needsHome && <Redirect href="/(tabs)" />}
      
      <StatusBar style="auto" />

      {/* Floating AI Chat Button - nur wenn nicht im Onboarding */}
      {!inOnboarding && <AIChatButton />}
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
