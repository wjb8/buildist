import Realm from "realm";
import { Road } from "./assets";
import { getRealm } from "../realm";

export class AssetFactory {
  /**
   * Creates a road asset instance
   * @param roadData The raw road data from the database
   * @returns A Road instance
   */
  static createRoad(roadData: any): Road {
    return roadData as Road;
  }

  /**
   * Creates a new road through Realm
   * @param roadData The road data
   * @returns A promise that resolves to the created road
   */
  static async createNewRoad(roadData: any): Promise<Road> {
    const realm = await getRealm();
    let road: Road;

    realm.write(() => {
      road = realm.create("Road", {
        _id: new Realm.BSON.ObjectId(),
        ...roadData,
        createdAt: new Date(),
        updatedAt: new Date(),
        synced: false,
      });
    });

    return road!;
  }

  /**
   * Gets the collection name for roads
   * @returns The collection name
   */
  static getCollectionName(): string {
    return "Road";
  }
}
