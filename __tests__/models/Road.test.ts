import { Road } from "@/storage/models/assets/Road";
import { AssetCondition, AssetType, RoadSurfaceType, TrafficVolume } from "@/types";
import { createMockRoad } from "../utils/mockDatabase";

describe("Road Model", () => {
  describe("Basic Properties", () => {
    it("should create road with basic properties", () => {
      const road = createMockRoad({
        name: "Test Road",
        location: "Test Location",
        condition: AssetCondition.GOOD,
      });

      expect(road.name).toBe("Test Road");
      expect(road.location).toBe("Test Location");
      expect(road.condition).toBe(AssetCondition.GOOD);
    });

    it("should have default values", () => {
      const road = createMockRoad();
      expect(road.surfaceType).toBe(RoadSurfaceType.ASPHALT);
      expect(road.trafficVolume).toBe(TrafficVolume.HIGH);
      expect(road.condition).toBe(AssetCondition.GOOD);
    });
  });

  describe("Computed Properties", () => {
    it("should identify as road asset", () => {
      const road = createMockRoad();
      expect(road.isRoadAsset).toBe(true);
    });

    it("should return road dimensions", () => {
      const road = createMockRoad();
      expect(road.roadDimensions).toBe("1000m × 12m");
    });

    it("should return 'Dimensions not specified' when length or width is missing", () => {
      const road = createMockRoad({
        length: undefined,
        width: undefined,
      });
      expect(road.roadDimensions).toBe("Dimensions not specified");
    });

    it("should have type property", () => {
      const road = createMockRoad();
      expect(road.type).toBe(AssetType.ROAD);
    });
  });

  describe("Utility Methods", () => {
    it("should generate QR tag ID", () => {
      const road = createMockRoad();
      const qrTagId = road.generateQRTagId();
      expect(qrTagId).toMatch(/^ROA-/);
    });
  });
});
