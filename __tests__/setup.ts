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
  const records: Record<string, unknown[]> = { Road: [], Vehicle: [] };

  type MockResults<T> = T[] & {
    filtered: (_q: string, val: unknown) => MockResults<T>;
    map: <U>(fn: (value: T, index: number, array: T[]) => U) => U[];
  };

  const makeResults = <T>(arr: T[]): MockResults<T> => {
    const results = [...arr] as MockResults<T>;
    results.filtered = (_q: string, val: unknown) => {
      const filtered = arr.filter((o) => {
        if (!o || typeof o !== "object") return false;
        return Object.values(o as Record<string, unknown>).includes(val);
      });
      return makeResults(filtered);
    };
    results.map = <U>(fn: (value: T, index: number, array: T[]) => U) =>
      Array.prototype.map.call(results, fn) as U[];
    return results;
  };

  const realm = {
    write: (fn: () => void) => fn(),
    create: (type: string, obj: unknown) => {
      records[type] = records[type] || [];
      records[type].push(obj);
    },
    objects: (type: string) => {
      const arr = records[type] || [];
      return makeResults(arr);
    },
    objectForPrimaryKey: (type: string, id: unknown) => {
      const arr = records[type] || [];
      const maybeId = id as { toHexString?: () => string } | null;
      const want = typeof maybeId?.toHexString === "function" ? maybeId.toHexString() : id;
      return (
        arr.find((o) => {
          const rec = o as Record<string, unknown> | null;
          const maybeObjId = rec?._id as { toHexString?: () => string } | null;
          const got =
            typeof maybeObjId?.toHexString === "function" ? maybeObjId.toHexString() : rec?._id;
          return got === want;
        }) || null
      );
    },
    delete: (obj: unknown) => {
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
