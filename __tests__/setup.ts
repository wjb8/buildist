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

jest.mock("openai", () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  })),
}));

beforeEach(() => {
  jest.clearAllMocks();
});
