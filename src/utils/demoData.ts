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

    // Demo seed data for beta testing (seeded only when DB is empty).
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
        name: "Industrial Boulevard",
        location: "Industrial Zone",
        condition: AssetCondition.POOR,
        notes: "Heavy truck traffic causing surface deterioration. Requires attention.",
      },
      {
        type: AssetType.ROAD,
        name: "Cedar Lane",
        location: "Residential District",
        condition: AssetCondition.FAIR,
        notes: "Moderate wear with minor drainage issues reported by residents.",
      },
      {
        type: AssetType.ROAD,
        name: "Riverside Drive",
        location: "Riverside Park Area",
        condition: AssetCondition.GOOD,
        notes: "Scenic route along the river. Light traffic and generally good surface.",
      },
      {
        type: AssetType.ROAD,
        name: "Highway 101 - Northbound",
        location: "Interstate Highway",
        condition: AssetCondition.POOR,
        notes: "High-speed corridor with recurring potholes. High priority for repair.",
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

    console.log(`Seeded ${demoAssets.length} demo assets`);
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
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const demoInspections = [
    assetIds[0]
      ? {
          assetId: assetIds[0],
          inspector: "Demo Inspector",
          description: "Routine inspection completed. Road in good condition.",
          score: 4,
          timestamp: twoWeeksAgo,
          maintenanceNeeded: false,
          issueType: "none",
          priority: "low",
          photos: [],
          nextDue: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
        }
      : null,
    assetIds[1]
      ? {
          assetId: assetIds[1],
          inspector: "Demo Inspector",
          description: "Severe surface deterioration observed. Repair recommended.",
          score: 1,
          timestamp: oneWeekAgo,
          maintenanceNeeded: true,
          issueType: "potholes",
          priority: "high",
          photos: [],
          nextDue: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        }
      : null,
    assetIds[2]
      ? {
          assetId: assetIds[2],
          inspector: "Demo Inspector",
          description: "Moderate wear observed. Monitor drainage and minor cracking.",
          score: 3,
          timestamp: oneWeekAgo,
          maintenanceNeeded: false,
          issueType: "drainage",
          priority: "medium",
          photos: [],
          nextDue: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        }
      : null,
    assetIds[4]
      ? {
          assetId: assetIds[4],
          inspector: "Demo Inspector",
          description: "Multiple potholes impacting traffic flow. Maintenance required.",
          score: 2,
          timestamp: twoWeeksAgo,
          maintenanceNeeded: true,
          issueType: "potholes",
          priority: "high",
          photos: [],
          nextDue: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        }
      : null,
  ].filter(Boolean) as Array<{
    assetId: string;
    inspector: string;
    description: string;
    score: number;
    timestamp: Date;
    maintenanceNeeded: boolean;
    nextDue?: Date;
    issueType?: string;
    priority?: string;
    photos?: string[];
  }>;

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
