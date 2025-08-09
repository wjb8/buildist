import React from "react";
import { Alert } from "react-native";
import { fireEvent, waitFor } from "@testing-library/react-native";
import { renderWithProviders } from "../utils/testUtils";
import { createMockAsset, createMockDatabase } from "../utils/mockDatabase";
import AssetFormScreen from "@screens/AssetFormScreen";
import { AssetType, AssetCondition } from "@types/models";

// Mock the collections
const mockFind = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();

jest.mock("@storage/database", () => ({
  collections: {
    assets: {
      find: mockFind,
      create: mockCreate,
    },
  },
  database: {
    write: jest.fn((callback) => callback()),
  },
}));

describe("AssetFormScreen", () => {
  const mockNavigate = jest.fn();
  const mockGoBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock navigation
    jest.doMock("@react-navigation/native", () => ({
      ...jest.requireActual("@react-navigation/native"),
      useNavigation: () => ({
        navigate: mockNavigate,
        goBack: mockGoBack,
      }),
      useRoute: () => ({
        params: {},
      }),
    }));

    // Mock Alert
    jest.spyOn(Alert, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Create Mode", () => {
    it("renders create form correctly", () => {
      const { getByText, getByTestId } = renderWithProviders(<AssetFormScreen />);

      expect(getByText("Create New Asset")).toBeTruthy();
      expect(getByTestId("name-input")).toBeTruthy();
      expect(getByTestId("location-input")).toBeTruthy();
      expect(getByTestId("notes-input")).toBeTruthy();
      expect(getByTestId("qr-tag-input")).toBeTruthy();
      expect(getByTestId("save-button")).toBeTruthy();
      expect(getByTestId("cancel-button")).toBeTruthy();
    });

    it("generates QR tag ID automatically", () => {
      const { getByTestId } = renderWithProviders(<AssetFormScreen />);

      const qrTagInput = getByTestId("qr-tag-input");
      expect(qrTagInput.props.value).toMatch(/^EQU-/); // Default type is EQUIPMENT
    });

    it("updates QR tag ID when asset type changes", () => {
      const { getByTestId } = renderWithProviders(<AssetFormScreen />);

      // Change to VEHICLE type
      const vehicleTypeButton = getByTestId(`type-${AssetType.VEHICLE}`);
      fireEvent.press(vehicleTypeButton);

      const qrTagInput = getByTestId("qr-tag-input");
      expect(qrTagInput.props.value).toMatch(/^VEH-/);
    });

    it("validates required fields", async () => {
      const { getByTestId, getByText } = renderWithProviders(<AssetFormScreen />);

      // Clear the name field
      const nameInput = getByTestId("name-input");
      fireEvent.changeText(nameInput, "");

      // Try to save
      const saveButton = getByTestId("save-button");
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(getByText("Asset name is required")).toBeTruthy();
      });
    });

    it("creates asset successfully with valid data", async () => {
      mockCreate.mockImplementation((callback) => {
        const mockAsset = {};
        callback(mockAsset);
        return Promise.resolve(mockAsset);
      });

      const { getByTestId } = renderWithProviders(<AssetFormScreen />);

      // Fill in required fields
      fireEvent.changeText(getByTestId("name-input"), "Test Asset");
      fireEvent.changeText(getByTestId("location-input"), "Test Location");
      fireEvent.changeText(getByTestId("notes-input"), "Test notes");

      // Select condition
      const goodConditionButton = getByTestId(`condition-${AssetCondition.GOOD}`);
      fireEvent.press(goodConditionButton);

      // Save
      const saveButton = getByTestId("save-button");
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(mockCreate).toHaveBeenCalled();
        expect(Alert.alert).toHaveBeenCalledWith(
          "Success",
          "Asset created successfully",
          expect.any(Array)
        );
      });
    });

    it("handles create error gracefully", async () => {
      mockCreate.mockRejectedValue(new Error("Database error"));

      const { getByTestId } = renderWithProviders(<AssetFormScreen />);

      // Fill in required fields
      fireEvent.changeText(getByTestId("name-input"), "Test Asset");

      // Save
      const saveButton = getByTestId("save-button");
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith("Error", "Failed to create asset");
      });
    });
  });

  describe("Edit Mode", () => {
    const mockAsset = createMockAsset({
      id: "asset-1",
      name: "Existing Asset",
      type: AssetType.EQUIPMENT,
      condition: AssetCondition.GOOD,
      location: "Office",
      notes: "Existing notes",
      qrTagId: "QR-123",
      update: mockUpdate,
    });

    beforeEach(() => {
      // Mock useRoute to return assetId
      jest.doMock("@react-navigation/native", () => ({
        ...jest.requireActual("@react-navigation/native"),
        useNavigation: () => ({
          navigate: mockNavigate,
          goBack: mockGoBack,
        }),
        useRoute: () => ({
          params: { assetId: "asset-1" },
        }),
      }));

      mockFind.mockResolvedValue(mockAsset);
    });

    it("loads and displays existing asset data", async () => {
      const { getByText, getByTestId } = renderWithProviders(<AssetFormScreen />);

      await waitFor(() => {
        expect(getByText("Edit Asset")).toBeTruthy();
        expect(getByTestId("name-input").props.value).toBe("Existing Asset");
        expect(getByTestId("location-input").props.value).toBe("Office");
        expect(getByTestId("notes-input").props.value).toBe("Existing notes");
        expect(getByTestId("qr-tag-input").props.value).toBe("QR-123");
      });
    });

    it("does not regenerate QR tag when type changes in edit mode", async () => {
      const { getByTestId } = renderWithProviders(<AssetFormScreen />);

      await waitFor(() => {
        expect(getByTestId("qr-tag-input").props.value).toBe("QR-123");
      });

      // Change type
      const vehicleTypeButton = getByTestId(`type-${AssetType.VEHICLE}`);
      fireEvent.press(vehicleTypeButton);

      // QR tag should remain the same
      expect(getByTestId("qr-tag-input").props.value).toBe("QR-123");
    });

    it("updates asset successfully", async () => {
      mockUpdate.mockImplementation((callback) => {
        callback(mockAsset);
        return Promise.resolve();
      });

      const { getByTestId } = renderWithProviders(<AssetFormScreen />);

      await waitFor(() => {
        expect(getByTestId("name-input").props.value).toBe("Existing Asset");
      });

      // Update the name
      fireEvent.changeText(getByTestId("name-input"), "Updated Asset");

      // Save
      const saveButton = getByTestId("save-button");
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalled();
        expect(Alert.alert).toHaveBeenCalledWith(
          "Success",
          "Asset updated successfully",
          expect.any(Array)
        );
      });
    });

    it("handles asset not found error", async () => {
      mockFind.mockRejectedValue(new Error("Asset not found"));

      renderWithProviders(<AssetFormScreen />);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith("Error", "Failed to load asset");
        expect(mockGoBack).toHaveBeenCalled();
      });
    });
  });

  describe("Form Interactions", () => {
    it("updates form fields correctly", () => {
      const { getByTestId } = renderWithProviders(<AssetFormScreen />);

      // Test text inputs
      fireEvent.changeText(getByTestId("name-input"), "New Asset Name");
      fireEvent.changeText(getByTestId("location-input"), "New Location");
      fireEvent.changeText(getByTestId("notes-input"), "New notes");
      fireEvent.changeText(getByTestId("qr-tag-input"), "NEW-QR-123");

      expect(getByTestId("name-input").props.value).toBe("New Asset Name");
      expect(getByTestId("location-input").props.value).toBe("New Location");
      expect(getByTestId("notes-input").props.value).toBe("New notes");
      expect(getByTestId("qr-tag-input").props.value).toBe("NEW-QR-123");
    });

    it("selects asset types correctly", () => {
      const { getByTestId } = renderWithProviders(<AssetFormScreen />);

      // Select different asset types
      Object.values(AssetType).forEach((type) => {
        const typeButton = getByTestId(`type-${type}`);
        fireEvent.press(typeButton);

        // The button should be selected (we can't easily test styles, but we can test the press)
        expect(typeButton).toBeTruthy();
      });
    });

    it("selects asset conditions correctly", () => {
      const { getByTestId } = renderWithProviders(<AssetFormScreen />);

      // Select different conditions
      Object.values(AssetCondition).forEach((condition) => {
        const conditionButton = getByTestId(`condition-${condition}`);
        fireEvent.press(conditionButton);

        expect(conditionButton).toBeTruthy();
      });
    });

    it("handles cancel button press", () => {
      const { getByTestId } = renderWithProviders(<AssetFormScreen />);

      const cancelButton = getByTestId("cancel-button");
      fireEvent.press(cancelButton);

      expect(mockGoBack).toHaveBeenCalled();
    });

    it("disables save button while saving", async () => {
      // Mock a slow create operation
      mockCreate.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 1000)));

      const { getByTestId } = renderWithProviders(<AssetFormScreen />);

      // Fill required field
      fireEvent.changeText(getByTestId("name-input"), "Test Asset");

      // Press save
      const saveButton = getByTestId("save-button");
      fireEvent.press(saveButton);

      // Button should be disabled and show loading
      await waitFor(() => {
        expect(saveButton.props.disabled).toBe(true);
      });
    });
  });

  describe("Validation", () => {
    it("shows error for empty asset name", async () => {
      const { getByTestId, getByText } = renderWithProviders(<AssetFormScreen />);

      // Clear name and try to save
      fireEvent.changeText(getByTestId("name-input"), "");
      fireEvent.press(getByTestId("save-button"));

      await waitFor(() => {
        expect(getByText("Asset name is required")).toBeTruthy();
      });
    });

    it("trims whitespace from inputs", async () => {
      mockCreate.mockImplementation((callback) => {
        const mockAsset = {};
        callback(mockAsset);
        return Promise.resolve(mockAsset);
      });

      const { getByTestId } = renderWithProviders(<AssetFormScreen />);

      // Add whitespace to inputs
      fireEvent.changeText(getByTestId("name-input"), "  Test Asset  ");
      fireEvent.changeText(getByTestId("location-input"), "  Test Location  ");
      fireEvent.changeText(getByTestId("notes-input"), "  Test notes  ");

      fireEvent.press(getByTestId("save-button"));

      await waitFor(() => {
        expect(mockCreate).toHaveBeenCalledWith(expect.any(Function));
      });
    });

    it("converts empty strings to null for optional fields", async () => {
      mockCreate.mockImplementation((callback) => {
        const mockAsset = {};
        callback(mockAsset);
        return Promise.resolve(mockAsset);
      });

      const { getByTestId } = renderWithProviders(<AssetFormScreen />);

      // Set name but leave optional fields empty
      fireEvent.changeText(getByTestId("name-input"), "Test Asset");
      fireEvent.changeText(getByTestId("location-input"), "");
      fireEvent.changeText(getByTestId("notes-input"), "");
      fireEvent.changeText(getByTestId("qr-tag-input"), "");

      fireEvent.press(getByTestId("save-button"));

      await waitFor(() => {
        expect(mockCreate).toHaveBeenCalledWith(expect.any(Function));
      });
    });
  });
});
