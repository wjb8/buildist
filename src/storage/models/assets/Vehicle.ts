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

  get type(): AssetType.VEHICLE {
    return AssetType.VEHICLE;
  }

  generateQRTagId(): string {
    const timestamp = Date.now().toString(36);
    return `VEH-${timestamp}`;
  }
}

