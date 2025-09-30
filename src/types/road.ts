import { AssetType, AssetData } from "./asset";

export enum RoadSurfaceType {
  ASPHALT = "asphalt",
  CONCRETE = "concrete",
  GRAVEL = "gravel",
  DIRT = "dirt",
  PAVER = "paver",
  OTHER = "other",
}

export enum TrafficVolume {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  VERY_HIGH = "very_high",
}

export interface RoadData extends AssetData {
  type: AssetType.ROAD;
  surfaceType: RoadSurfaceType;
  trafficVolume: TrafficVolume;
  length?: number;
  width?: number;
  lanes?: number;
  speedLimit?: number;
}
