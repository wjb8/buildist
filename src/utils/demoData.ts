import Realm from "realm";
import { getRealm } from "@/storage/realm";
import { AssetCondition, AssetType } from "@/types/asset";

export const seedDemoData = async (forceReseed = false) => {
  try {
    const realm = await getRealm();
    const existingAssets = realm.objects("Asset");

    if (existingAssets.length > 0 && !forceReseed) {
      console.log("Demo data already exists, skipping seeding");
      return;
    }

    if (forceReseed && existingAssets.length > 0) {
      console.log("Force reseeding - clearing existing data");
      realm.write(() => {
        realm.deleteAll();
      });
    }

    const demoAssets = [
      {
        type: AssetType.ROAD,
        name: "Main Street",
        location: "Downtown Business District",
        condition: AssetCondition.GOOD,
        notes: "Primary arterial road serving downtown area. Recently maintained.",
      },
      {
        type: AssetType.ROAD,
        name: "Riverside Drive",
        location: "Riverside Park Area",
        condition: AssetCondition.GOOD,
        notes: "Recently resurfaced scenic route along the river",
      },
      {
        type: AssetType.ROAD,
        name: "Industrial Boulevard",
        location: "Industrial Zone",
        condition: AssetCondition.POOR,
        notes: "Heavy truck traffic causing surface deterioration. Requires immediate attention.",
      },
      {
        type: AssetType.ROAD,
        name: "Cedar Lane - East Section",
        location: "Residential District East",
        condition: AssetCondition.FAIR,
        notes: "Residential street with moderate wear. Some drainage issues reported.",
      },
      {
        type: AssetType.ROAD,
        name: "Highway 101 - Northbound",
        location: "Interstate Highway",
        condition: AssetCondition.POOR,
        notes: "Major highway with significant pothole damage. High priority for repair.",
      },
      {
        type: AssetType.VEHICLE,
        name: "Snowplow Truck #3",
        location: "Municipal Garage",
        condition: AssetCondition.FAIR,
        notes: "Plow blade shows moderate wear. Oil change due soon.",
      },
    ];

    const assetIds: string[] = [];

    realm.write(() => {
      for (const assetData of demoAssets) {
        const assetId = new Realm.BSON.ObjectId();
        const qrTagId = generateQRTagId(assetData.type);
        realm.create("Asset", {
          _id: assetId,
          ...assetData,
          qrTagId,
          createdAt: new Date(),
          updatedAt: new Date(),
          synced: false,
        });
        assetIds.push(assetId.toHexString());
      }
    });

    await seedDemoInspections(realm, assetIds);

    console.log(`Seeded ${demoAssets.length} assets with inspections`);
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

export const forceReseedDemoData = async () => {
  await seedDemoData(true);
};

const generateQRTagId = (type: AssetType): string => {
  const timestamp = Date.now().toString(36);
  const prefix = type.toUpperCase().substring(0, 3);
  return `${prefix}-${timestamp}`;
};

const seedDemoInspections = async (realm: Realm, assetIds: string[]) => {
  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  const demoInspections = [
    {
      assetId: assetIds[3],
      inspector: "Sarah Johnson",
      description:
        "Drainage issues observed after heavy rainfall. Water pooling in several locations.",
      score: 2,
      timestamp: oneWeekAgo,
      maintenanceNeeded: true,
      issueType: "drainage",
      priority: "high",
      photos: [],
      nextDue: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    },
    {
      assetId: assetIds[3],
      inspector: "Mike Chen",
      description: "General wear observed, minor cracking beginning to appear.",
      score: 3,
      timestamp: oneMonthAgo,
      maintenanceNeeded: false,
      issueType: "cracks",
      priority: "medium",
      photos: [],
      nextDue: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
    },
    {
      assetId: assetIds[4],
      inspector: "Robert Martinez",
      description:
        "Severe pothole damage affecting traffic flow. Multiple large potholes in both lanes.",
      score: 1,
      timestamp: threeDaysAgo,
      maintenanceNeeded: true,
      issueType: "potholes",
      priority: "high",
      photos: [],
      nextDue: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
    },
    {
      assetId: assetIds[2],
      inspector: "Lisa Thompson",
      description:
        "Heavy truck traffic causing significant surface damage. Multiple areas need resurfacing.",
      score: 2,
      timestamp: twoWeeksAgo,
      maintenanceNeeded: true,
      issueType: "other",
      priority: "medium",
      photos: [],
      nextDue: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
    },
    {
      assetId: assetIds[0],
      inspector: "David Wilson",
      description: "Routine inspection completed. Road in good condition with minor wear.",
      score: 4,
      timestamp: twoWeeksAgo,
      maintenanceNeeded: false,
      issueType: "none",
      priority: "low",
      photos: [],
      nextDue: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
    },
  ];

  realm.write(() => {
    for (const inspectionData of demoInspections) {
      realm.create("Inspection", {
        _id: new Realm.BSON.ObjectId(),
        ...inspectionData,
        createdAt: inspectionData.timestamp,
        updatedAt: inspectionData.timestamp,
        synced: false,
      });
    }
  });
};
