import React from "react";
import { render, RenderOptions } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

// Custom render function with providers
interface CustomRenderOptions extends RenderOptions {
  initialRouteName?: string;
  navigationParams?: Record<string, any>;
}

export const renderWithProviders = (
  component: React.ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { initialRouteName = "Test", navigationParams = {}, ...renderOptions } = options;

  // Mock navigation container for testing
  const TestNavigationContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRouteName}>
        <Stack.Screen
          name="Test"
          component={() => children as React.ReactElement}
          initialParams={navigationParams}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );

  return render(component, {
    wrapper: TestNavigationContainer,
    ...renderOptions,
  });
};

// Helper to create mock navigation prop
export const createMockNavigation = (overrides: Partial<any> = {}) => ({
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
  setParams: jest.fn(),
  dispatch: jest.fn(),
  setOptions: jest.fn(),
  isFocused: jest.fn(() => true),
  canGoBack: jest.fn(() => false),
  getId: jest.fn(),
  getParent: jest.fn(),
  getState: jest.fn(),
  ...overrides,
});

// Helper to create mock route prop
export const createMockRoute = (params: Record<string, any> = {}) => ({
  key: "test-key",
  name: "Test",
  params,
});

// Re-export everything from React Native Testing Library
export * from "@testing-library/react-native";
