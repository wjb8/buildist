import { Road } from "@/storage/models/assets/Road";
import { AssetCondition, RoadSurfaceType, TrafficVolume } from "@/types";
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

    it("should return traffic level", () => {
      const road = createMockRoad();
      expect(road.trafficLevel).toBe("High traffic (arterial)");
    });

    it("should return condition score", () => {
      const road = createMockRoad();
      expect(road.conditionScore).toBe(4);
    });

    it("should return maintenance priority", () => {
      const road = createMockRoad();
      expect(road.maintenancePriority).toBe("LOW - Standard maintenance");
    });

    it("should return estimated maintenance cost", () => {
      const road = createMockRoad();
      expect(road.estimatedMaintenanceCost).toBe(2000);
    });

    it("should return next inspection due date", () => {
      const road = createMockRoad();
      expect(road.nextInspectionDue).toBeInstanceOf(Date);
    });
  });

  describe("Validation", () => {
    it("should pass validation for valid road", () => {
      const road = createMockRoad();
      const validation = road.validateRoadData();
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toEqual([]);
    });
  });

  describe("Utility Methods", () => {
    it("should generate QR tag ID", () => {
      const road = createMockRoad();
      const qrTagId = road.generateQRTagId();
      expect(qrTagId).toBe("ROA-123");
    });

    it("should have mock update methods", () => {
      const road = createMockRoad();
      expect(road.update).toBeDefined();
      expect(road.markAsNeedsMaintenance).toBeDefined();
      expect(road.updateCondition).toBeDefined();
    });
  });
});
