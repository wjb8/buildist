import { Road } from "./assets";
import { collections } from "../database";

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
   * Creates a new road through the collection
   * @param roadData The road data
   * @returns A promise that resolves to the created road
   */
  static async createNewRoad(roadData: any): Promise<Road> {
    return await collections.roads.create((road) => {
      // Set all the properties on the road
      Object.assign(road, roadData);
    });
  }

  /**
   * Gets the collection name for roads
   * @returns The collection name
   */
  static getCollectionName(): string {
    return "roads";
  }
}
