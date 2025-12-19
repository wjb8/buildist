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

// Mock Expo vector icons (ESM) for Jest
jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const MockIcon = (props: any) => React.createElement("Icon", props, null);
  return {
    __esModule: true,
    MaterialIcons: MockIcon,
    FontAwesome: MockIcon,
    AntDesign: MockIcon,
    Ionicons: MockIcon,
  };
});

// Force Jest to use our manual mock for the native Realm module
jest.mock("realm");

// Mock getRealm to avoid loading native bindings during tests
jest.mock("@/storage/realm", () => {
  const records: Record<string, any[]> = { Road: [], Vehicle: [] };

  const makeResults = (arr: any[]) => {
    const results = [...arr];
    (results as any).filtered = (_q: string, val: any) => {
      const filtered = arr.filter((o) => Object.values(o).includes(val));
      return makeResults(filtered);
    };
    (results as any).map = (fn: (x: any) => any) => Array.prototype.map.call(results, fn);
    return results;
  };

  const realm = {
    write: (fn: () => void) => fn(),
    create: (type: string, obj: any) => {
      records[type] = records[type] || [];
      records[type].push(obj);
    },
    objects: (type: string) => {
      const arr = records[type] || [];
      return makeResults(arr);
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
    delete: (obj: any) => {
      const typeKeys = Object.keys(records);
      for (const t of typeKeys) {
        records[t] = (records[t] || []).filter((o) => o !== obj);
      }
    },
  };
  return { getRealm: jest.fn().mockResolvedValue(realm) };
});

beforeEach(() => {
  jest.clearAllMocks();
});
