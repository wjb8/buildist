import { AssetCondition, AssetType, RoadSurfaceType, TrafficVolume } from "@/types";
import { Asset } from "./Asset";

export class Road extends Asset {
  surfaceType!: RoadSurfaceType;
  trafficVolume!: TrafficVolume;
  length?: number;
  width?: number;
  lanes?: number;
  speedLimit?: number;

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
