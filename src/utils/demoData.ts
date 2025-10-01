import Realm from "realm";
import { getRealm } from "@/storage/realm";
import { AssetCondition, RoadSurfaceType, TrafficVolume } from "@/types";

export const seedDemoData = async (forceReseed = false) => {
  try {
    const realm = await getRealm();
    const existingRoads = realm.objects("Road");

    if (existingRoads.length > 0 && !forceReseed) {
      console.log("Demo data already exists, skipping seeding");
      return;
    }

    if (forceReseed && existingRoads.length > 0) {
      console.log("Force reseeding - clearing existing data");
      realm.write(() => {
        realm.deleteAll();
      });
    }

    const demoRoads = [
      {
        name: "Main Street",
        location: "Downtown Business District",
        condition: AssetCondition.GOOD,
        notes: "Primary arterial road serving downtown area. Recently maintained.",
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
        notes: "Heavy truck traffic causing surface deterioration. Requires immediate attention.",
        surfaceType: RoadSurfaceType.CONCRETE,
        trafficVolume: TrafficVolume.VERY_HIGH,
        length: 2000,
        width: 16,
        lanes: 6,
        speedLimit: 60,
      },
      {
        name: "Cedar Lane - East Section",
        location: "Residential District East",
        condition: AssetCondition.FAIR,
        notes: "Residential street with moderate wear. Some drainage issues reported.",
        surfaceType: RoadSurfaceType.ASPHALT,
        trafficVolume: TrafficVolume.LOW,
        length: 600,
        width: 6,
        lanes: 2,
        speedLimit: 30,
      },
      {
        name: "Highway 101 - Northbound",
        location: "Interstate Highway",
        condition: AssetCondition.POOR,
        notes: "Major highway with significant pothole damage. High priority for repair.",
        surfaceType: RoadSurfaceType.ASPHALT,
        trafficVolume: TrafficVolume.VERY_HIGH,
        length: 5000,
        width: 20,
        lanes: 8,
        speedLimit: 70,
      },
      {
        name: "Oak Street",
        location: "Historic District",
        condition: AssetCondition.GOOD,
        notes: "Historic cobblestone street in excellent condition",
        surfaceType: RoadSurfaceType.CONCRETE,
        trafficVolume: TrafficVolume.LOW,
        length: 300,
        width: 4,
        lanes: 2,
        speedLimit: 25,
      },
      {
        name: "Commerce Avenue",
        location: "Shopping District",
        condition: AssetCondition.FAIR,
        notes: "Commercial area with moderate traffic. Some surface cracking.",
        surfaceType: RoadSurfaceType.ASPHALT,
        trafficVolume: TrafficVolume.MEDIUM,
        length: 900,
        width: 10,
        lanes: 4,
        speedLimit: 35,
      },
      {
        name: "School Road",
        location: "Education District",
        condition: AssetCondition.GOOD,
        notes: "School zone road with good surface condition",
        surfaceType: RoadSurfaceType.ASPHALT,
        trafficVolume: TrafficVolume.MEDIUM,
        length: 400,
        width: 8,
        lanes: 2,
        speedLimit: 25,
      },
    ];

    const roadIds: string[] = [];

    realm.write(() => {
      for (const roadData of demoRoads) {
        const roadId = new Realm.BSON.ObjectId();
        const qrTagId = generateQRTagId();
        realm.create("Road", {
          _id: roadId,
          ...roadData,
          qrTagId,
          createdAt: new Date(),
          updatedAt: new Date(),
          synced: false,
        });
        roadIds.push(roadId.toHexString());
      }
    });

    // Add demo inspections to showcase different scenarios
    await seedDemoInspections(realm, roadIds);

    console.log(`Successfully seeded ${demoRoads.length} demo road assets with inspections`);
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

const generateQRTagId = (): string => {
  const timestamp = Date.now().toString(36);
  return `ROA-${timestamp}`;
};

const seedDemoInspections = async (realm: Realm, roadIds: string[]) => {
  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  const demoInspections = [
    {
      assetId: roadIds[3], // Cedar Lane
      inspector: "Sarah Johnson",
      description:
        "Drainage issues observed after heavy rainfall. Water pooling in several locations.",
      score: 2,
      timestamp: oneWeekAgo,
      maintenanceNeeded: true,
      issueType: "drainage",
      priority: "high",
      photos: [],
      nextDue: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // Due in 1 week
    },
    {
      assetId: roadIds[3], // Cedar Lane - previous inspection
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

    // Highway 101 - High priority with potholes (triggers repair plan + council flag)
    {
      assetId: roadIds[4], // Highway 101
      inspector: "Robert Martinez",
      description:
        "Severe pothole damage affecting traffic flow. Multiple large potholes in both lanes.",
      score: 1,
      timestamp: threeDaysAgo,
      maintenanceNeeded: true,
      issueType: "potholes",
      priority: "high",
      photos: [],
      nextDue: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // Due in 3 days
    },

    // Industrial Boulevard - Poor condition (triggers repair plan)
    {
      assetId: roadIds[2], // Industrial Boulevard
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

    // Main Street - Good condition, routine inspection
    {
      assetId: roadIds[0], // Main Street
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

    // Commerce Avenue - Fair condition with cracks
    {
      assetId: roadIds[6], // Commerce Avenue
      inspector: "Jennifer Davis",
      description: "Surface cracking observed in multiple locations. Monitor for progression.",
      score: 3,
      timestamp: oneWeekAgo,
      maintenanceNeeded: false,
      issueType: "cracks",
      priority: "medium",
      photos: [],
      nextDue: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
    },

    // Oak Street - Good condition, no issues
    {
      assetId: roadIds[5], // Oak Street
      inspector: "Tom Anderson",
      description: "Historic street in excellent condition. No maintenance required.",
      score: 5,
      timestamp: oneMonthAgo,
      maintenanceNeeded: false,
      issueType: "none",
      priority: "low",
      photos: [],
      nextDue: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
    },

    // School Road - Overdue inspection (triggers overdue flag)
    {
      assetId: roadIds[7], // School Road
      inspector: "Maria Rodriguez",
      description: "Routine school zone inspection. Road in good condition.",
      score: 4,
      timestamp: threeMonthsAgo,
      maintenanceNeeded: false,
      issueType: "none",
      priority: "low",
      photos: [],
      nextDue: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // Overdue by 1 week
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
