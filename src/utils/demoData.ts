import { collections } from "@/storage/database";
import { AssetCondition, RoadSurfaceType, TrafficVolume } from "@/types";

export const seedDemoData = async () => {
  try {
    const existingRoads = await collections.roads.query().fetch();

    if (existingRoads.length > 0) {
      console.log("Demo data already exists, skipping seeding");
      return;
    }

    const demoRoads = [
      {
        name: "Main Street",
        location: "Downtown Business District",
        condition: AssetCondition.GOOD,
        notes: "Primary arterial road serving downtown area",
        surfaceType: RoadSurfaceType.ASPHALT,
        trafficVolume: TrafficVolume.HIGH,
        length: 1200,
        width: 12,
        lanes: 4,
        speedLimit: 50,
      },
      {
        name: "Riverside Drive",
        location: "Riverside Park Area",
        condition: AssetCondition.EXCELLENT,
        notes: "Recently resurfaced scenic route along the river",
        surfaceType: RoadSurfaceType.ASPHALT,
        trafficVolume: TrafficVolume.MEDIUM,
        length: 800,
        width: 8,
        lanes: 2,
        speedLimit: 40,
      },
      {
        name: "Industrial Boulevard",
        location: "Industrial Zone",
        condition: AssetCondition.POOR,
        notes: "Heavy truck traffic causing surface deterioration",
        surfaceType: RoadSurfaceType.CONCRETE,
        trafficVolume: TrafficVolume.VERY_HIGH,
        length: 2000,
        width: 16,
        lanes: 6,
        speedLimit: 60,
      },
    ];

    for (const roadData of demoRoads) {
      await collections.roads.create((road) => {
        road.name = roadData.name;
        road.location = roadData.location;
        road.condition = roadData.condition;
        road.notes = roadData.notes;
        road.qrTagId = road.generateQRTagId();
        road.surfaceType = roadData.surfaceType;
        road.trafficVolume = roadData.trafficVolume;
        road.length = roadData.length;
        road.width = roadData.width;
        road.lanes = roadData.lanes;
        road.speedLimit = roadData.speedLimit;
        road.synced = false;
      });
    }

    console.log(`Successfully seeded ${demoRoads.length} demo road assets`);
  } catch (error) {
    console.error("Failed to seed demo data:", error);
  }
};

export const clearDemoData = async () => {
  try {
    await collections.roads.query().destroyAllPermanently();
    console.log("Demo data cleared successfully");
  } catch (error) {
    console.error("Failed to clear demo data:", error);
  }
};
