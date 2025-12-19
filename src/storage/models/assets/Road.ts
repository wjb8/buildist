import Realm from "realm";
import { AssetCondition, AssetType, RoadSurfaceType, TrafficVolume } from "@/types";

export class Road extends Realm.Object {
  static schema = {
    name: "Road",
    primaryKey: "_id",
    properties: {
      _id: "objectId",
      name: "string",
      location: "string?",
      condition: "string",
      notes: "string?",
      qrTagId: "string?",
      surfaceType: "string",
      trafficVolume: "string",
      length: "double?",
      width: "double?",
      lanes: "int?",
      speedLimit: "int?",
      createdAt: "date",
      updatedAt: "date",
      synced: "bool",
    },
  };

  _id!: Realm.BSON.ObjectId;
  name!: string;
  location?: string;
  condition!: AssetCondition;
  notes?: string;
  qrTagId?: string;
  surfaceType!: RoadSurfaceType;
  trafficVolume!: TrafficVolume;
  length?: number;
  width?: number;
  lanes?: number;
  speedLimit?: number;
  createdAt!: Date;
  updatedAt!: Date;
  synced!: boolean;

  get type(): AssetType.ROAD {
    return AssetType.ROAD;
  }

  get isRoadAsset(): boolean {
    return true;
  }

  get roadDimensions(): string {
    if (this.length && this.width) {
      return `${this.length}m × ${this.width}m`;
    }
    return "Dimensions not specified";
  }

  generateQRTagId(): string {
    const timestamp = Date.now().toString(36);
    return `ROA-${timestamp}`;
  }
}
