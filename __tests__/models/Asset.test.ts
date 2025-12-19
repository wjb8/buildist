import { Asset } from "@/storage/models/assets/Asset";
import { AssetCondition, AssetType } from "@/types/asset";
import { createMockAsset } from "../utils/mockDatabase";

describe("Asset Model", () => {
  describe("Basic Properties", () => {
    it("should create asset with basic properties", () => {
      const asset = createMockAsset({
        name: "Test Asset",
        location: "Test Location",
        condition: AssetCondition.GOOD,
      });

      expect(asset.name).toBe("Test Asset");
      expect(asset.location).toBe("Test Location");
      expect(asset.condition).toBe(AssetCondition.GOOD);
    });

    it("should have default values", () => {
      const asset = createMockAsset();
      expect(asset.type).toBe(AssetType.ROAD);
      expect(asset.condition).toBe(AssetCondition.GOOD);
    });
  });

  describe("Computed Properties", () => {
    it("should return asset type", () => {
      const asset = createMockAsset();
      expect(asset.assetType).toBe(AssetType.ROAD);
    });

    it("should have type property", () => {
      const asset = createMockAsset();
      expect(asset.type).toBe(AssetType.ROAD);
    });
  });

  describe("Utility Methods", () => {
    it("should generate QR tag ID", () => {
      const asset = createMockAsset();
      const qrTagId = asset.generateQRTagId();
      expect(qrTagId).toMatch(/^ROA-/);
    });
  });
});

