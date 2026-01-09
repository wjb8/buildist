/**
 * Vehicle Model (Phase 1)
 *
 * Plain TypeScript class extending Asset for type safety and future extensibility.
 * NOT stored in Realm during Phase 1 - only generic Asset instances are stored.
 * See Asset.ts for architecture details.
 */
import { AssetType } from "@/types/asset";
import { VehiclePriority } from "@/types/vehicle";
import { Asset } from "./Asset";

export class Vehicle extends Asset {
  identifier!: string;
  mileage?: number;
  hours?: number;
  lastServiceDate?: Date;
  requiresService?: boolean;
  priority?: VehiclePriority;
  photoUris!: string[];

  generateQRTagId(): string {
    const timestamp = Date.now().toString(36);
    return `VEH-${timestamp}`;
  }
}

