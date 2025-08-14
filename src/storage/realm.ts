import Realm from "realm";
import { Road } from "./models/assets/Road";
import { Inspection } from "./models/Inspection";

const realmConfig: Realm.Configuration = {
  schema: [Road, Inspection],
  schemaVersion: 1,
  onMigration: (oldRealm, newRealm) => {
    // this will run when schemaVersion is incremented
    console.log("Realm migration running...");
  },
};

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
