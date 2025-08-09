import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { View, Text, ActivityIndicator, StyleSheet, Alert } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import "react-native-get-random-values"; // Required for WatermelonDB

// Import database initialization
import { initializeDatabase } from "@storage/database";

// Import screens
import AssetListScreen from "@screens/AssetListScreen";
import AssetFormScreen from "@screens/AssetFormScreen";

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
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.loadingText}>Initializing Buildist...</Text>
      <Text style={styles.subText}>Setting up offline storage</Text>
    </View>
  );

  const renderErrorScreen = () => (
    <View style={styles.centerContainer}>
      <Text style={styles.errorTitle}>Initialization Failed</Text>
      <Text style={styles.errorMessage}>{appState.error}</Text>
      <Text style={styles.subText}>Please restart the application</Text>
    </View>
  );

  const renderMainApp = () => (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="AssetList"
        screenOptions={{
          headerStyle: {
            backgroundColor: "#007AFF",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
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
    <View style={styles.container}>
      <StatusBar style="light" />
      {appState.isLoading && renderLoadingScreen()}
      {appState.error && renderErrorScreen()}
      {appState.isReady && renderMainApp()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
  },
  subText: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF3B30",
    marginBottom: 16,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 16,
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
});
