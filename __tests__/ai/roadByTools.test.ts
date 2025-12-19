import { applyCreateRoad, applyDeleteRoadBy, applyUpdateRoadBy, applyFindAsset } from "@/services/ai/handlers";
import { AssetCondition } from "@/types/asset";
import { RoadSurfaceType, TrafficVolume } from "@/types/road";

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

    const findRes = await applyFindAsset({ by: "name", value: "Main Street", type: "Road", limit: 1 });
    expect(findRes.success).toBe(true);
    expect(Array.isArray(findRes.data)).toBe(true);
    const found = (findRes.data as any[])[0];
    expect(found.condition).toBe(AssetCondition.POOR);
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

    const findRes = await applyFindAsset({ by: "name", value: "Cedar Lane", type: "Road" });
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
    expect(Array.isArray(res.data)).toBe(true);
    expect((res.data as any[]).length).toBeGreaterThan(1);
  });
});


