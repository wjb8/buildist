import {
  applyCreateRoad,
  applyDeleteRoadBy,
  applyUpdateRoadBy,
  applyFindAsset,
} from "@/services/ai/handlers";
import { AssetCondition, AssetType } from "@/types/asset";
import { RoadSurfaceType, TrafficVolume } from "@/types/road";

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
