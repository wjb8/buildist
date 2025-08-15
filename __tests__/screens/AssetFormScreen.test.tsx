import React from "react";
import { Alert } from "react-native";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import AssetFormScreen from "@/screens/AssetFormScreen";
import { AssetCondition, RoadSurfaceType, TrafficVolume } from "@/types";
import { createMockRoad } from "../utils/mockDatabase";

// Mock the Realm storage module
const mockGetRealm = jest.fn();
const mockRealm = {
  objectForPrimaryKey: jest.fn(),
  write: jest.fn((callback) => callback()),
  create: jest.fn(),
};

jest.mock("@storage/realm", () => ({
  getRealm: mockGetRealm,
}));

jest.mock("@storage/models", () => ({
  Road: jest.requireActual("@storage/models").Road,
  AssetFactory: {
    createRoad: jest.fn((road) => road),
    createNewRoad: jest.fn(),
  },
}));

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
let mockRouteParams = {};

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
  useRoute: () => ({
    params: mockRouteParams,
  }),
}));

describe("AssetFormScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouteParams = {}; // Default to create mode
    jest.spyOn(Alert, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders create form correctly", () => {
      const { getByText, getByPlaceholderText } = render(
        <NavigationContainer>
          <AssetFormScreen />
        </NavigationContainer>
      );

      expect(getByText("Create New Road")).toBeTruthy();
      expect(getByPlaceholderText("Enter road name")).toBeTruthy();
      expect(getByPlaceholderText("Enter location")).toBeTruthy();
    });

    it("renders edit form correctly", async () => {
      const mockRoad = createMockRoad({
        id: "road-1",
        name: "Existing Road",
        condition: AssetCondition.GOOD,
        location: "Main Street",
        notes: "Existing notes",
        qrTagId: "ROA-123",
        surfaceType: RoadSurfaceType.ASPHALT,
        trafficVolume: TrafficVolume.MEDIUM,
      });

      mockRouteParams = { assetId: "road-1" };
      mockGetRealm.mockResolvedValue(mockRealm);
      mockRealm.objectForPrimaryKey.mockReturnValue(mockRoad);

      const { getByText } = render(
        <NavigationContainer>
          <AssetFormScreen />
        </NavigationContainer>
      );

      await waitFor(() => {
        expect(getByText("Edit Road")).toBeTruthy();
      });
    });
  });

  describe("Basic Functionality", () => {
    it("handles cancel button press", () => {
      const { getByText } = render(
        <NavigationContainer>
          <AssetFormScreen />
        </NavigationContainer>
      );

      const cancelButton = getByText("Cancel");
      fireEvent.press(cancelButton);

      expect(mockGoBack).toHaveBeenCalled();
    });

    it("shows required field validation", async () => {
      const { getByPlaceholderText, getByText } = render(
        <NavigationContainer>
          <AssetFormScreen />
        </NavigationContainer>
      );

      // Try to save without filling required fields
      const saveButton = getByText("Create");
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(getByText("Road name is required")).toBeTruthy();
      });
    });
  });
});
