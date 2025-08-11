import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Alert } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { withObservables } from "@nozbe/watermelondb/react";
import "react-native-get-random-values";
import { initializeDatabase, collections } from "@storage/database";
import AssetListScreen from "@screens/AssetListScreen";
import AssetFormScreen from "@screens/AssetFormScreen";
import { colors, spacing, typography } from "./src/styles";
import { View, Text } from "./src/components";

export type RootStackParamList = {
  AssetList: undefined;
  AssetForm: { assetId?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AssetListScreenWithData = withObservables([], () => ({
  roads: collections.roads.query().observe(),
}))(AssetListScreen);

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
          component={AssetListScreenWithData}
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
    <View style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <StatusBar style="light" />
      {appState.isLoading && renderLoadingScreen()}
      {appState.error && renderErrorScreen()}
      {appState.isReady && renderMainApp()}
    </View>
  );
}
