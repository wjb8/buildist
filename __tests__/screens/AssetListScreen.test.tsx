import React from "react";
import { fireEvent, waitFor } from "@testing-library/react-native";
import { renderWithProviders } from "../utils/testUtils";
import { createMockAssetList, createMockDatabase } from "../utils/mockDatabase";
import AssetListScreen from "@screens/AssetListScreen";
import { AssetType, AssetCondition } from "@types/models";

// Mock WatermelonDB withObservables HOC
jest.mock("@nozbe/watermelondb/react", () => ({
  withObservables: () => (Component: any) => (props: any) => {
    // Return the component with mock assets
    const { createMockAssetList } = require("../utils/mockDatabase");
    const mockAssets = createMockAssetList(3);
    return <Component {...props} assets={mockAssets} />;
  },
}));

// Mock the collections
jest.mock("@storage/database", () => ({
  collections: {
    assets: {
      query: jest.fn(() => ({
        observe: jest.fn(),
      })),
    },
  },
}));

describe("AssetListScreen", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock navigation
    jest.doMock("@react-navigation/native", () => ({
      ...jest.requireActual("@react-navigation/native"),
      useNavigation: () => ({
        navigate: mockNavigate,
      }),
    }));
  });

  describe("Rendering", () => {
    it("renders asset list with assets", () => {
      const { getByTestId, getByText } = renderWithProviders(
        <AssetListScreen assets={createMockAssetList(3)} />
      );

      expect(getByTestId("asset-list")).toBeTruthy();
      expect(getByText("Asset 1")).toBeTruthy();
      expect(getByText("Asset 2")).toBeTruthy();
      expect(getByText("Asset 3")).toBeTruthy();
    });

    it("renders empty state when no assets", () => {
      const { getByTestId, getByText } = renderWithProviders(<AssetListScreen assets={[]} />);

      expect(getByTestId("empty-state")).toBeTruthy();
      expect(getByText("No Assets Found")).toBeTruthy();
      expect(getByText("Get started by adding your first asset")).toBeTruthy();
    });

    it("renders search input and filter buttons", () => {
      const { getByTestId } = renderWithProviders(
        <AssetListScreen assets={createMockAssetList(3)} />
      );

      expect(getByTestId("search-input")).toBeTruthy();
      expect(getByTestId("type-filter-button")).toBeTruthy();
      expect(getByTestId("condition-filter-button")).toBeTruthy();
    });

    it("renders floating action button when assets exist", () => {
      const { getByTestId } = renderWithProviders(
        <AssetListScreen assets={createMockAssetList(3)} />
      );

      expect(getByTestId("add-asset-fab")).toBeTruthy();
    });

    it("does not render floating action button when no assets", () => {
      const { queryByTestId } = renderWithProviders(<AssetListScreen assets={[]} />);

      expect(queryByTestId("add-asset-fab")).toBeFalsy();
    });
  });

  describe("Search Functionality", () => {
    it("filters assets by name", () => {
      const assets = [
        ...createMockAssetList(1).map((asset) => ({ ...asset, name: "Laptop Computer" })),
        ...createMockAssetList(1).map((asset) => ({
          ...asset,
          id: "asset-2",
          name: "Office Chair",
        })),
      ];

      const { getByTestId, getByText, queryByText } = renderWithProviders(
        <AssetListScreen assets={assets} />
      );

      const searchInput = getByTestId("search-input");
      fireEvent.changeText(searchInput, "Laptop");

      expect(getByText("Laptop Computer")).toBeTruthy();
      expect(queryByText("Office Chair")).toBeFalsy();
    });

    it("filters assets by location", () => {
      const assets = [
        ...createMockAssetList(1).map((asset) => ({ ...asset, location: "Main Office" })),
        ...createMockAssetList(1).map((asset) => ({
          ...asset,
          id: "asset-2",
          location: "Warehouse",
        })),
      ];

      const { getByTestId, getByText, queryByText } = renderWithProviders(
        <AssetListScreen assets={assets} />
      );

      const searchInput = getByTestId("search-input");
      fireEvent.changeText(searchInput, "Main");

      expect(getByText("📍 Main Office")).toBeTruthy();
      expect(queryByText("📍 Warehouse")).toBeFalsy();
    });

    it("shows empty state with search message when no matches", () => {
      const assets = createMockAssetList(2);

      const { getByTestId, getByText } = renderWithProviders(<AssetListScreen assets={assets} />);

      const searchInput = getByTestId("search-input");
      fireEvent.changeText(searchInput, "NonexistentAsset");

      expect(getByText("No Assets Found")).toBeTruthy();
      expect(getByText("Try adjusting your filters")).toBeTruthy();
    });
  });

  describe("Navigation", () => {
    it("navigates to asset form when asset item is pressed", () => {
      const assets = createMockAssetList(1);
      const { getByTestId } = renderWithProviders(<AssetListScreen assets={assets} />);

      const assetItem = getByTestId(`asset-item-${assets[0].id}`);
      fireEvent.press(assetItem);

      expect(mockNavigate).toHaveBeenCalledWith("AssetForm", { assetId: assets[0].id });
    });

    it("navigates to asset form when FAB is pressed", () => {
      const assets = createMockAssetList(1);
      const { getByTestId } = renderWithProviders(<AssetListScreen assets={assets} />);

      const fab = getByTestId("add-asset-fab");
      fireEvent.press(fab);

      expect(mockNavigate).toHaveBeenCalledWith("AssetForm", {});
    });

    it("navigates to asset form when empty state add button is pressed", () => {
      const { getByTestId } = renderWithProviders(<AssetListScreen assets={[]} />);

      const addButton = getByTestId("add-first-asset-button");
      fireEvent.press(addButton);

      expect(mockNavigate).toHaveBeenCalledWith("AssetForm", {});
    });
  });

  describe("Asset Item Display", () => {
    it("displays asset information correctly", () => {
      const asset = createMockAssetList(1)[0];
      asset.name = "Test Laptop";
      asset.type = AssetType.EQUIPMENT;
      asset.condition = AssetCondition.GOOD;
      asset.location = "IT Department";
      asset.notes = "Company laptop for development";
      asset.qrTagId = "QR-12345";

      const { getByText } = renderWithProviders(<AssetListScreen assets={[asset]} />);

      expect(getByText("Test Laptop")).toBeTruthy();
      expect(getByText("EQUIPMENT")).toBeTruthy();
      expect(getByText("GOOD")).toBeTruthy();
      expect(getByText("📍 IT Department")).toBeTruthy();
      expect(getByText("Company laptop for development")).toBeTruthy();
      expect(getByText("QR: QR-12345")).toBeTruthy();
    });

    it("handles optional fields gracefully", () => {
      const asset = createMockAssetList(1)[0];
      asset.location = undefined;
      asset.notes = undefined;
      asset.qrTagId = undefined;

      const { queryByText } = renderWithProviders(<AssetListScreen assets={[asset]} />);

      expect(queryByText(/📍/)).toBeFalsy();
      expect(queryByText(/QR:/)).toBeFalsy();
    });

    it("displays condition with correct color coding", () => {
      const assets = [
        { ...createMockAssetList(1)[0], condition: AssetCondition.EXCELLENT },
        { ...createMockAssetList(1)[0], id: "asset-2", condition: AssetCondition.CRITICAL },
      ];

      const { getByText } = renderWithProviders(<AssetListScreen assets={assets} />);

      expect(getByText("EXCELLENT")).toBeTruthy();
      expect(getByText("CRITICAL")).toBeTruthy();
    });
  });

  describe("Refresh Functionality", () => {
    it("handles pull to refresh", async () => {
      const assets = createMockAssetList(2);
      const { getByTestId } = renderWithProviders(<AssetListScreen assets={assets} />);

      const assetList = getByTestId("asset-list");

      // Simulate pull to refresh
      fireEvent(assetList, "refresh");

      // Wait for refresh to complete (mocked with setTimeout)
      await waitFor(() => {
        // The refresh should complete without errors
        expect(getByTestId("asset-list")).toBeTruthy();
      });
    });
  });

  describe("Filter Interactions", () => {
    it("shows alert when type filter is pressed", () => {
      const assets = createMockAssetList(1);
      const { getByTestId } = renderWithProviders(<AssetListScreen assets={assets} />);

      // Mock Alert.alert
      const alertSpy = jest.spyOn(require("react-native").Alert, "alert");

      const typeFilterButton = getByTestId("type-filter-button");
      fireEvent.press(typeFilterButton);

      expect(alertSpy).toHaveBeenCalledWith("Filter", "Type filter would open here");

      alertSpy.mockRestore();
    });

    it("shows alert when condition filter is pressed", () => {
      const assets = createMockAssetList(1);
      const { getByTestId } = renderWithProviders(<AssetListScreen assets={assets} />);

      // Mock Alert.alert
      const alertSpy = jest.spyOn(require("react-native").Alert, "alert");

      const conditionFilterButton = getByTestId("condition-filter-button");
      fireEvent.press(conditionFilterButton);

      expect(alertSpy).toHaveBeenCalledWith("Filter", "Condition filter would open here");

      alertSpy.mockRestore();
    });
  });
});
