import Realm from "realm";
import { getRealm } from "@/storage/realm";
import { AssetCondition, RoadSurfaceType, TrafficVolume } from "@/types";

export const seedDemoData = async () => {
  try {
    const realm = await getRealm();
    const existingRoads = realm.objects("Road");

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
        condition: AssetCondition.GOOD,
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

    realm.write(() => {
      for (const roadData of demoRoads) {
        const qrTagId = generateQRTagId();
        realm.create("Road", {
          _id: new Realm.BSON.ObjectId(),
          ...roadData,
          qrTagId,
          createdAt: new Date(),
          updatedAt: new Date(),
          synced: false,
        });
      }
    });

    console.log(`Successfully seeded ${demoRoads.length} demo road assets`);
  } catch (error) {
    console.error("Failed to seed demo data:", error);
  }
};

export const clearDemoData = async () => {
  try {
    const realm = await getRealm();
    realm.write(() => {
      realm.deleteAll();
    });
    console.log("Demo data cleared successfully");
  } catch (error) {
    console.error("Failed to clear demo data:", error);
  }
};

const generateQRTagId = (): string => {
  const timestamp = Date.now().toString(36);
  return `ROA-${timestamp}`;
};
