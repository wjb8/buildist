import * as SecureStore from "expo-secure-store";

const AUTH_STATE_KEY = "buildist-auth-state-v1";

export interface AuthState {
  username: string;
  loggedInAt: string;
}

const serializeState = (state: AuthState): string => JSON.stringify(state);

const parseState = (value: string | null): AuthState | null => {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as AuthState;
    if (parsed && typeof parsed.username === "string" && typeof parsed.loggedInAt === "string") {
      return parsed;
    }
    return null;
  } catch (error) {
    console.warn("Failed to parse stored auth state", error);
    return null;
  }
};

export const saveAuthState = async (state: AuthState): Promise<void> => {
  try {
    await SecureStore.setItemAsync(AUTH_STATE_KEY, serializeState(state));
  } catch (error) {
    console.error("Failed to save auth state", error);
    throw error;
  }
};

export const getAuthState = async (): Promise<AuthState | null> => {
  try {
    const storedValue = await SecureStore.getItemAsync(AUTH_STATE_KEY);
    return parseState(storedValue);
  } catch (error) {
    console.error("Failed to read auth state", error);
    return null;
  }
};

export const clearAuthState = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(AUTH_STATE_KEY);
  } catch (error) {
    console.error("Failed to clear auth state", error);
  }
};





