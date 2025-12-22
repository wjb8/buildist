/**
 * Road Model (Phase 1)
 *
 * Plain TypeScript class extending Asset for type safety and future extensibility.
 * NOT stored in Realm during Phase 1 - only generic Asset instances are stored.
 * See Asset.ts for architecture details.
 */
import { AssetCondition, AssetType, RoadSurfaceType, TrafficVolume } from "@/types";
import { Asset } from "./Asset";

export class Road extends Asset {
  surfaceType!: RoadSurfaceType;
  trafficVolume!: TrafficVolume;
  length?: number;
  width?: number;
  lanes?: number;
  speedLimit?: number;

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
