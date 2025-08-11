export enum AssetType {
  ROAD = "road",
  BRIDGE = "bridge",
  SIDEWALK = "sidewalk",
  STREET_LIGHT = "street_light",
  TRAFFIC_SIGNAL = "traffic_signal",
  OTHER = "other",
}

export enum AssetCondition {
  EXCELLENT = "excellent",
  GOOD = "good",
  FAIR = "fair",
  POOR = "poor",
  CRITICAL = "critical",
}

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

export interface AssetData {
  type: AssetType;
  name: string;
  location?: string;
  condition: AssetCondition;
  notes?: string;
  qrTagId?: string;
  surfaceType?: RoadSurfaceType;
  trafficVolume?: TrafficVolume;
  length?: number;
  width?: number;
  lanes?: number;
  speedLimit?: number;
}

// Utility types for specific operations
export type CreateAssetData = AssetData;
export type UpdateAssetData = Partial<AssetData>;
