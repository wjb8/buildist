import "react-native-get-random-values";
import React from "react";

// Mock React Native modules
jest.mock("react-native/Libraries/EventEmitter/NativeEventEmitter");

// Mock React Navigation without requiring the ESM implementation
jest.mock("@react-navigation/native", () => {
  const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
    dispatch: jest.fn(),
    canGoBack: jest.fn().mockReturnValue(false),
  };

  return {
    NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
    useNavigation: () => mockNavigation,
    useRoute: () => ({ params: {} }),
    useFocusEffect: jest.fn(),
    createNavigationContainerRef: jest.fn(),
  };
});

// Mock Expo modules
jest.mock("expo-camera", () => ({
  Camera: "Camera",
  PermissionStatus: {
    GRANTED: "granted",
    DENIED: "denied",
  },
}));

jest.mock("openai", () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  })),
}));

// Force Jest to use our manual mock for the native Realm module
jest.mock("realm");

// Mock getRealm to avoid loading native bindings during tests
jest.mock("@/storage/realm", () => {
  const records: Record<string, any[]> = { Road: [], Vehicle: [] };
  const realm = {
    write: (fn: () => void) => fn(),
    create: (type: string, obj: any) => {
      records[type] = records[type] || [];
      records[type].push(obj);
    },
    objects: (type: string) => {
      const arr = records[type] || [];
      return {
        filtered: (_q: string, val: any) => ({
          map: (fn: (x: any) => any) => arr.filter((o) => Object.values(o).includes(val)).map(fn),
        }),
        map: (fn: (x: any) => any) => arr.map(fn),
      };
    },
    objectForPrimaryKey: (type: string, id: any) => {
      const arr = records[type] || [];
      const want = typeof id?.toHexString === "function" ? id.toHexString() : id;
      return (
        arr.find((o) => {
          const got = typeof o?._id?.toHexString === "function" ? o._id.toHexString() : o?._id;
          return got === want;
        }) || null
      );
    },
    delete: (_obj: any) => {},
  };
  return { getRealm: jest.fn().mockResolvedValue(realm) };
});

beforeEach(() => {
  jest.clearAllMocks();
});
