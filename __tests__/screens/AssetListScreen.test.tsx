import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import AssetListScreen from "@/screens/AssetListScreen";
import { AssetCondition, RoadSurfaceType, TrafficVolume } from "@/types";
import { createMockRoad, createMockRoadList } from "../utils/mockDatabase";

// Mock the navigation
const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
};

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => mockNavigation,
}));

describe("AssetListScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithNavigation = (component: React.ReactElement) => {
    return render(<NavigationContainer>{component}</NavigationContainer>);
  };

  describe("Basic Rendering", () => {
    it("renders empty state when no roads exist", () => {
      const { getByText } = renderWithNavigation(<AssetListScreen roads={[]} />);

      expect(getByText("Road Assets")).toBeTruthy();
      expect(getByText("No roads found. Add your first road asset!")).toBeTruthy();
      expect(getByText("Add Road")).toBeTruthy();
    });

    it("renders road list when roads exist", () => {
      const mockRoads = createMockRoadList(2);
      const { getByText } = renderWithNavigation(<AssetListScreen roads={mockRoads} />);

      expect(getByText("Road Assets")).toBeTruthy();
      expect(getByText("Road 1")).toBeTruthy();
      expect(getByText("Road 2")).toBeTruthy();
    });
  });

  describe("Basic Functionality", () => {
    it("navigates to create new road when add button is pressed", async () => {
      const mockRoads = createMockRoadList(1);
      const { getByText } = renderWithNavigation(<AssetListScreen roads={mockRoads} />);

      const addButton = getByText("+ Add Road");
      fireEvent.press(addButton);

      expect(mockNavigate).toHaveBeenCalledWith("AssetForm", {});
    });

    it("navigates to edit road when road item is pressed", async () => {
      const mockRoads = createMockRoadList(1);
      const { getByText } = renderWithNavigation(<AssetListScreen roads={mockRoads} />);

      const roadItem = getByText("Road 1");
      fireEvent.press(roadItem);

      expect(mockNavigate).toHaveBeenCalledWith("AssetForm", { assetId: "road-1" });
    });
  });
});
