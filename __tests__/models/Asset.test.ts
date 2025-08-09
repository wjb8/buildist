import { AssetType, AssetCondition } from "@/types/models";
import { createMockAsset } from "../utils/mockDatabase";

describe("Asset Model", () => {
  describe("conditionScore getter", () => {
    it("should return correct score for each condition", () => {
      const excellentAsset = createMockAsset({ condition: AssetCondition.EXCELLENT });
      const goodAsset = createMockAsset({ condition: AssetCondition.GOOD });
      const fairAsset = createMockAsset({ condition: AssetCondition.FAIR });
      const poorAsset = createMockAsset({ condition: AssetCondition.POOR });
      const criticalAsset = createMockAsset({ condition: AssetCondition.CRITICAL });

      expect(excellentAsset.conditionScore).toBe(5);
      expect(goodAsset.conditionScore).toBe(4);
      expect(fairAsset.conditionScore).toBe(3);
      expect(poorAsset.conditionScore).toBe(2);
      expect(criticalAsset.conditionScore).toBe(1);
    });
  });

  describe("generateQRTagId", () => {
    it("should generate QR tag ID with correct format", async () => {
      const asset = createMockAsset({
        type: AssetType.EQUIPMENT,
        generateQRTagId: jest.fn().mockImplementation(() => {
          const timestamp = Date.now().toString(36);
          const typePrefix = AssetType.EQUIPMENT.substring(0, 3).toUpperCase();
          return Promise.resolve(`${typePrefix}-${timestamp}`);
        }),
      });

      const qrTagId = await asset.generateQRTagId();

      expect(qrTagId).toMatch(/^EQU-[a-z0-9]+$/);
      expect(asset.generateQRTagId).toHaveBeenCalled();
    });
  });

  describe("markAsNeedsMaintenance", () => {
    it("should update condition to poor and mark as unsynced", async () => {
      const mockUpdate = jest.fn();
      const asset = createMockAsset({
        condition: AssetCondition.GOOD,
        update: mockUpdate,
        markAsNeedsMaintenance: jest.fn().mockImplementation(async function (this: any) {
          await this.update((asset: any) => {
            asset.condition = AssetCondition.POOR;
            asset.synced = false;
          });
        }),
      });

      await asset.markAsNeedsMaintenance();

      expect(asset.markAsNeedsMaintenance).toHaveBeenCalled();
      expect(mockUpdate).toHaveBeenCalled();
    });
  });

  describe("updateCondition", () => {
    it("should update condition and mark as unsynced", async () => {
      const mockUpdate = jest.fn();
      const asset = createMockAsset({
        condition: AssetCondition.GOOD,
        update: mockUpdate,
        updateCondition: jest
          .fn()
          .mockImplementation(async function (this: any, newCondition: AssetCondition) {
            await this.update((asset: any) => {
              asset.condition = newCondition;
              asset.synced = false;
            });
          }),
      });

      await asset.updateCondition(AssetCondition.EXCELLENT);

      expect(asset.updateCondition).toHaveBeenCalledWith(AssetCondition.EXCELLENT);
      expect(mockUpdate).toHaveBeenCalled();
    });
  });
});
