import "react-native-get-random-values";

// Mock React Native modules
jest.mock("react-native/Libraries/EventEmitter/NativeEventEmitter");

// Mock React Navigation
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    dispatch: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
  useFocusEffect: jest.fn(),
}));

// Mock Expo modules
jest.mock("expo-camera", () => ({
  Camera: "Camera",
  PermissionStatus: {
    GRANTED: "granted",
    DENIED: "denied",
  },
}));

jest.mock("expo-barcode-scanner", () => ({
  BarCodeScanner: "BarCodeScanner",
  PermissionStatus: {
    GRANTED: "granted",
    DENIED: "denied",
  },
}));

// Mock WatermelonDB
jest.mock("@nozbe/watermelondb/Database", () => ({
  Database: jest.fn(),
}));

jest.mock("@nozbe/watermelondb/adapters/sqlite", () => ({
  default: jest.fn(),
}));

// Mock OpenAI
jest.mock("openai", () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  })),
}));

// Global test utilities
global.console = {
  ...console,
  // Uncomment to hide console logs during testing
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Setup fake timers for testing
beforeEach(() => {
  jest.clearAllMocks();
});
