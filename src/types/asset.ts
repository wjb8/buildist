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

export interface AssetData {
  type: AssetType;
  name: string;
  location?: string;
  condition: AssetCondition;
  notes?: string;
  qrTagId?: string;
}
