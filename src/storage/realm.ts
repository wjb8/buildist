import Realm from "realm";
import { Road } from "./models/assets/Road";
import { Inspection } from "./models/Inspection";

const realmConfig: Realm.Configuration = {
  schema: [Road, Inspection],
  schemaVersion: 2,
  onMigration: (oldRealm, newRealm) => {
    // Map old 5-level road conditions to 3-level if present
    try {
      const oldRoads = oldRealm.objects("Road");
      const newRoads = newRealm.objects("Road");
      for (let i = 0; i < newRoads.length; i++) {
        const oldObj = oldRoads[i] as any;
        const newObj = newRoads[i] as any;
        switch (oldObj?.condition) {
          case "excellent":
            newObj.condition = "good";
            break;
          case "critical":
            newObj.condition = "poor";
            break;
          default:
            // good/fair/poor remain as-is or assign if undefined
            if (oldObj?.condition) newObj.condition = oldObj.condition;
        }
      }
    } catch {}

    // Initialize new Inspection fields (issueType, priority, photos)
    try {
      const inspections = newRealm.objects("Inspection");
      for (let i = 0; i < inspections.length; i++) {
        const insp = inspections[i] as any;
        if (!Array.isArray(insp.photos)) insp.photos = [];
        if (insp.priority == null) insp.priority = "medium";
        // issueType is optional; leave undefined if not set
      }
    } catch {}
  },
};

// Export schema for RealmProvider
export const schema = [Road, Inspection];
export const schemaVersion = 2;

// init and get realm instance
export const initRealm = async (): Promise<Realm> => {
  try {
    const realm = await Realm.open(realmConfig);
    console.log("Realm initialized");
    return realm;
  } catch (error) {
    console.error("Realm initialization failed", error);
    throw error;
  }
};

// get realm instance (creates instance if it doesn't exist)
export const getRealm = async (): Promise<Realm> => {
  return await Realm.open(realmConfig);
};

// reset database
export const resetRealm = async (): Promise<void> => {
  try {
    const realm = await getRealm();
    realm.write(() => {
      realm.deleteAll();
    });
    console.log("Database reset complete");
  } catch (error) {
    console.error("Database reset failed", error);
    throw error;
  }
};

export default realmConfig;
