import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator, Alert } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import "react-native-get-random-values"; // Required for WatermelonDB

// Import database initialization
import { initializeDatabase } from "@storage/database";

// Import screens
import AssetListScreen from "@screens/AssetListScreen";
import AssetFormScreen from "@screens/AssetFormScreen";

// Import global styles and styled components
import { colors, spacing, typography } from "./src/styles";
import { StyledView, StyledText } from "./src/components/StyledComponents";

// Navigation types
export type RootStackParamList = {
  AssetList: undefined;
  AssetForm: { assetId?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

interface AppState {
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
}

export default function App() {
  const [appState, setAppState] = useState<AppState>({
    isLoading: true,
    isReady: false,
    error: null,
  });

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setAppState({ isLoading: true, isReady: false, error: null });

      // Initialize the database
      await initializeDatabase();

      // Add any other initialization logic here
      // e.g., authentication, app state restoration, etc.

      setAppState({ isLoading: false, isReady: true, error: null });
    } catch (error) {
      console.error("Failed to initialize app:", error);
      setAppState({
        isLoading: false,
        isReady: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      });

      Alert.alert(
        "Initialization Error",
        "Failed to initialize the application. Please restart the app.",
        [{ text: "OK" }]
      );
    }
  };

  const renderLoadingScreen = () => (
    <StyledView
      center
      style={{ padding: spacing.xl, backgroundColor: colors.background.secondary }}
    >
      <ActivityIndicator size="large" color={colors.primary.main} />
      <StyledText variant="h4" style={{ marginTop: spacing.md }}>
        Initializing Buildist...
      </StyledText>
      <StyledText variant="bodySmall" center style={{ marginTop: spacing.sm }}>
        Setting up offline storage
      </StyledText>
    </StyledView>
  );

  const renderErrorScreen = () => (
    <StyledView
      center
      style={{ padding: spacing.xl, backgroundColor: colors.background.secondary }}
    >
      <StyledText variant="h3" color="error" center style={{ marginBottom: spacing.md }}>
        Initialization Failed
      </StyledText>
      <StyledText variant="body" center style={{ marginBottom: spacing.md }}>
        {appState.error}
      </StyledText>
      <StyledText variant="bodySmall" center>
        Please restart the application
      </StyledText>
    </StyledView>
  );

  const renderMainApp = () => (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="AssetList"
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.primary.main,
          },
          headerTintColor: colors.text.inverse,
          headerTitleStyle: {
            fontWeight: typography.fontWeight.bold,
          },
        }}
      >
        <Stack.Screen
          name="AssetList"
          component={AssetListScreen}
          options={{
            title: "Assets",
            headerLargeTitle: true,
          }}
        />
        <Stack.Screen
          name="AssetForm"
          component={AssetFormScreen}
          options={({ route }) => ({
            title: route.params?.assetId ? "Edit Asset" : "New Asset",
            presentation: "modal",
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );

  return (
    <StyledView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <StatusBar style="light" />
      {appState.isLoading && renderLoadingScreen()}
      {appState.error && renderErrorScreen()}
      {appState.isReady && renderMainApp()}
    </StyledView>
  );
}
