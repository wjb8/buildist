import { AssetType, AssetData, AssetCondition } from "./asset";

export enum VehiclePriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

export interface VehicleData extends AssetData {
  type: AssetType.VEHICLE;
  identifier: string; // e.g., Snowplow Truck #3
  mileage?: number; // numeric entry
  hours?: number; // engine hours for equipment
  lastServiceDate?: Date;
  requiresService?: boolean;
  priority?: VehiclePriority; // low, medium, high
  condition: AssetCondition; // good, fair, poor
  photoUris?: string[];
}












