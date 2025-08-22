import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Alert } from "react-native";
import "react-native-get-random-values";
import { RealmProvider } from "@realm/react";
import { initRealm, schema, schemaVersion } from "@storage/realm";
import { colors, spacing } from "./src/styles";
import { View, Text, MainPage, LoginScreen } from "./src/components";

interface AppState {
  isLoading: boolean;
  isReady: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export default function App() {
  const [appState, setAppState] = useState<AppState>({
    isLoading: true,
    isReady: false,
    isAuthenticated: false,
    error: null,
  });

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setAppState({ isLoading: true, isReady: false, isAuthenticated: false, error: null });

      // Initialize the Realm database
      await initRealm();

      // Add any other initialization logic here
      // e.g., authentication, app state restoration, etc.

      setAppState({ isLoading: false, isReady: true, isAuthenticated: false, error: null });
    } catch (error) {
      console.error("Failed to initialize app:", error);
      setAppState({
        isLoading: false,
        isReady: false,
        isAuthenticated: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      });

      Alert.alert(
        "Initialization Error",
        "Failed to initialize the application. Please restart the app.",
        [{ text: "OK" }]
      );
    }
  };

  const handleLoginSuccess = () => {
    setAppState((prev) => ({ ...prev, isAuthenticated: true }));
  };

  const handleLogout = () => {
    setAppState((prev) => ({ ...prev, isAuthenticated: false }));
  };

  const renderLoadingScreen = () => (
    <View center style={{ padding: spacing.xl, backgroundColor: colors.background.secondary }}>
      <ActivityIndicator size="large" color={colors.primary.main} />
      <Text variant="h4" style={{ marginTop: spacing.md }}>
        Initializing Buildist...
      </Text>
      <Text variant="bodySmall" center style={{ marginTop: spacing.sm }}>
        Setting up offline storage
      </Text>
    </View>
  );

  const renderErrorScreen = () => (
    <View center style={{ padding: spacing.xl, backgroundColor: colors.background.secondary }}>
      <Text variant="h3" color="error" center style={{ marginBottom: spacing.md }}>
        Initialization Failed
      </Text>
      <Text variant="body" center style={{ marginBottom: spacing.md }}>
        {appState.error}
      </Text>
      <Text variant="bodySmall" center>
        Please restart the application
      </Text>
    </View>
  );

  const renderMainApp = () => (
    <RealmProvider schema={schema} schemaVersion={schemaVersion}>
      <MainPage onLogout={handleLogout} />
    </RealmProvider>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <StatusBar style="light" />
      {appState.isLoading && renderLoadingScreen()}
      {appState.error && renderErrorScreen()}
      {appState.isReady && !appState.isAuthenticated && (
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      )}
      {appState.isReady && appState.isAuthenticated && renderMainApp()}
    </View>
  );
}
