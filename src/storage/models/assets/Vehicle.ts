import Realm from "realm";
import { AssetCondition, AssetType } from "@/types/asset";
import { VehiclePriority } from "@/types/vehicle";

export class Vehicle extends Realm.Object {
  static schema: Realm.ObjectSchema = {
    name: "Vehicle",
    primaryKey: "_id",
    properties: {
      _id: "objectId",
      name: "string", // display name
      identifier: "string", // e.g., Snowplow Truck #3
      location: "string?",
      condition: "string", // AssetCondition
      notes: "string?",
      qrTagId: "string?",
      mileage: "double?",
      hours: "double?",
      lastServiceDate: "date?",
      requiresService: "bool?",
      priority: "string?", // VehiclePriority
      photoUris: "string[]",
      createdAt: "date",
      updatedAt: "date",
      synced: "bool",
    },
  };

  _id!: Realm.BSON.ObjectId;
  name!: string;
  identifier!: string;
  location?: string;
  condition!: AssetCondition;
  notes?: string;
  qrTagId?: string;
  mileage?: number;
  hours?: number;
  lastServiceDate?: Date;
  requiresService?: boolean;
  priority?: VehiclePriority;
  photoUris!: string[];
  createdAt!: Date;
  updatedAt!: Date;
  synced!: boolean;

  get type(): AssetType.VEHICLE {
    return AssetType.VEHICLE;
  }

  generateQRTagId(): string {
    const timestamp = Date.now().toString(36);
    return `VEH-${timestamp}`;
  }
}

