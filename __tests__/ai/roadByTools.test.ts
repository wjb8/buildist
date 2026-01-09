import {
  applyCreateRoad,
  applyDeleteRoadBy,
  applyUpdateRoadBy,
  applyFindAsset,
} from "@/services/ai/handlers";
import { getRealm } from "@/storage/realm";
import { AssetCondition, AssetType } from "@/types/asset";
import { RoadSurfaceType, TrafficVolume } from "@/types/road";
import Realm from "realm";

function assertArray(value: unknown): asserts value is unknown[] {
  if (!Array.isArray(value)) throw new Error("Expected data to be an array");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object";
}

describe("Road selector-based tools", () => {
  it("update_road_by updates a single matched road", async () => {
    const created = await applyCreateRoad({
      name: "Main Street",
      condition: AssetCondition.GOOD,
      surfaceType: RoadSurfaceType.ASPHALT,
      trafficVolume: TrafficVolume.HIGH,
      location: "Downtown",
    });
    expect(created.success).toBe(true);

    const updateRes = await applyUpdateRoadBy({
      by: "name",
      value: "Main Street",
      fields: { condition: AssetCondition.POOR },
    });
    expect(updateRes.success).toBe(true);

    const findRes = await applyFindAsset({
      by: "name",
      value: "Main Street",
      type: AssetType.ROAD,
      limit: 1,
    });
    expect(findRes.success).toBe(true);
    const data = findRes.data;
    assertArray(data);
    const found = data[0];
    expect(isRecord(found) ? found.condition : undefined).toBe(AssetCondition.POOR);
  });

  it("delete_road_by deletes a single matched road", async () => {
    await applyCreateRoad({
      name: "Cedar Lane",
      condition: AssetCondition.FAIR,
      surfaceType: RoadSurfaceType.ASPHALT,
      trafficVolume: TrafficVolume.LOW,
    });

    const del = await applyDeleteRoadBy({ by: "name", value: "Cedar Lane" });
    expect(del.success).toBe(true);

    const findRes = await applyFindAsset({
      by: "name",
      value: "Cedar Lane",
      type: AssetType.ROAD,
    });
    expect(findRes.success).toBe(true);
    expect(findRes.data).toEqual([]);
  });

  it("delete_road_by also deletes inspections linked to the road", async () => {
    const created = await applyCreateRoad({
      name: "Inspection Test Road",
      condition: AssetCondition.GOOD,
      surfaceType: RoadSurfaceType.ASPHALT,
      trafficVolume: TrafficVolume.MEDIUM,
    });
    expect(created.success).toBe(true);
    const createdId = (created.data as any)?._id as string | undefined;
    expect(typeof createdId).toBe("string");

    const realm = await getRealm();
    realm.write(() => {
      realm.create("Inspection", {
        _id: new Realm.BSON.ObjectId(),
        assetId: createdId,
        inspector: "Tester",
        description: "Test inspection",
        score: 3,
        timestamp: new Date(),
        maintenanceNeeded: false,
        issueType: "none",
        priority: "low",
        photos: [],
        nextDue: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        synced: false,
      });
    });

    const before = realm.objects("Inspection").filtered("assetId == $0", createdId);
    expect(before.length).toBe(1);

    const del = await applyDeleteRoadBy({ by: "name", value: "Inspection Test Road" });
    expect(del.success).toBe(true);

    const after = realm.objects("Inspection").filtered("assetId == $0", createdId);
    expect(after.length).toBe(0);
  });

  it("update_road_by returns candidates when selection is ambiguous", async () => {
    await applyCreateRoad({
      name: "Main Street East",
      condition: AssetCondition.GOOD,
      surfaceType: RoadSurfaceType.ASPHALT,
      trafficVolume: TrafficVolume.MEDIUM,
    });
    await applyCreateRoad({
      name: "Main Street West",
      condition: AssetCondition.GOOD,
      surfaceType: RoadSurfaceType.ASPHALT,
      trafficVolume: TrafficVolume.MEDIUM,
    });

    const res = await applyUpdateRoadBy({
      by: "nameContains",
      value: "Main Street",
      fields: { condition: AssetCondition.POOR },
    });
    expect(res.success).toBe(false);
    const data = res.data;
    assertArray(data);
    expect(data.length).toBeGreaterThan(1);
  });
});
