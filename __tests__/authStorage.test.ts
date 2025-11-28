import * as SecureStore from "expo-secure-store";
import { saveAuthState, getAuthState, clearAuthState, AuthState } from "@/services/auth/storage";

jest.mock("expo-secure-store", () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const mockSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;
const AUTH_KEY = "buildist-auth-state-v1";

describe("auth storage helpers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("persists auth state with expo secure store", async () => {
    const state: AuthState = {
      username: "admin",
      loggedInAt: "2024-01-01T00:00:00.000Z",
    };

    await saveAuthState(state);

    expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(AUTH_KEY, JSON.stringify(state));
  });

  it("rehydrates auth state when stored value exists", async () => {
    const storedState: AuthState = {
      username: "admin",
      loggedInAt: "2024-02-02T00:00:00.000Z",
    };
    mockSecureStore.getItemAsync.mockResolvedValueOnce(JSON.stringify(storedState));

    const result = await getAuthState();

    expect(result).toEqual(storedState);
  });

  it("returns null when stored value cannot be parsed", async () => {
    mockSecureStore.getItemAsync.mockResolvedValueOnce("{invalid-json");

    const result = await getAuthState();

    expect(result).toBeNull();
  });

  it("clears auth state on logout", async () => {
    await clearAuthState();

    expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith(AUTH_KEY);
  });
});

