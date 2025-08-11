import { Model } from "@nozbe/watermelondb";
import { text, field, date, children, readonly } from "@nozbe/watermelondb/decorators";
import { AssetCondition, RoadSurfaceType, TrafficVolume } from "@/types";
import type { Inspection } from "../Inspection";

export class Road extends Model {
  static table = "roads";
  static associations = {
    inspections: { type: "has_many" as const, foreignKey: "asset_id" },
  };

  @text("name") name!: string;
  @text("location") location?: string;
  @text("condition") condition!: AssetCondition;
  @text("notes") notes?: string;
  @text("qr_tag_id") qrTagId?: string;
  @text("surface_type") surfaceType!: RoadSurfaceType;
  @text("traffic_volume") trafficVolume!: TrafficVolume;
  @field("length") length?: number;
  @field("width") width?: number;
  @field("lanes") lanes?: number;
  @field("speed_limit") speedLimit?: number;

  @readonly @date("created_at") createdAt!: Date;
  @readonly @date("updated_at") updatedAt!: Date;
  @field("synced") synced!: boolean;

  @children("inspections") inspections!: Inspection[];

  // Computed properties
  get isRoadAsset(): boolean {
    return true;
  }

  get roadDimensions(): string {
    if (this.length && this.width) {
      return `${this.length}m × ${this.width}m`;
    }
    return "Dimensions not specified";
  }

  get trafficLevel(): string {
    if (this.trafficVolume) {
      const labels = {
        [TrafficVolume.LOW]: "Low traffic (residential)",
        [TrafficVolume.MEDIUM]: "Medium traffic (collector)",
        [TrafficVolume.HIGH]: "High traffic (arterial)",
        [TrafficVolume.VERY_HIGH]: "Very high traffic (highway)",
      };
      return labels[this.trafficVolume] || "Traffic level not specified";
    }
    return "Traffic level not specified";
  }

  get conditionScore(): number {
    const scores = {
      [AssetCondition.EXCELLENT]: 5,
      [AssetCondition.GOOD]: 4,
      [AssetCondition.FAIR]: 3,
      [AssetCondition.POOR]: 2,
      [AssetCondition.CRITICAL]: 1,
    };
    return scores[this.condition] || 0;
  }

  // Validation
  validateRoadData(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.name.trim()) {
      errors.push("Road name is required");
    }

    if (!this.surfaceType) {
      errors.push("Surface type is required");
    }

    if (!this.trafficVolume) {
      errors.push("Traffic volume is required");
    }

    if (this.length && this.length <= 0) {
      errors.push("Length must be positive");
    }

    if (this.width && this.width <= 0) {
      errors.push("Width must be positive");
    }

    if (this.lanes && this.lanes <= 0) {
      errors.push("Number of lanes must be positive");
    }

    if (this.speedLimit && this.speedLimit <= 0) {
      errors.push("Speed limit must be positive");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Business logic
  get maintenancePriority(): string {
    if (this.condition === AssetCondition.CRITICAL || this.condition === AssetCondition.POOR) {
      return "HIGH - Poor condition";
    }
    if (
      this.trafficVolume === TrafficVolume.HIGH ||
      this.trafficVolume === TrafficVolume.VERY_HIGH
    ) {
      return "MEDIUM - High traffic area";
    }
    return "LOW - Standard maintenance";
  }

  get estimatedMaintenanceCost(): number {
    let baseCost = 2000;

    if (this.condition === AssetCondition.CRITICAL) {
      baseCost += 3000;
    } else if (this.condition === AssetCondition.POOR) {
      baseCost += 2000;
    }

    if (this.length && this.length > 100) {
      baseCost += Math.floor(this.length / 100) * 500;
    }

    if (
      this.trafficVolume === TrafficVolume.HIGH ||
      this.trafficVolume === TrafficVolume.VERY_HIGH
    ) {
      baseCost += 1000;
    }

    return baseCost;
  }

  get nextInspectionDue(): Date {
    const lastInspection = this.inspections[0];
    if (lastInspection) {
      const nextDue = new Date(lastInspection.timestamp);
      // Roads inspected annually, but high-traffic roads more frequently
      if (
        this.trafficVolume === TrafficVolume.HIGH ||
        this.trafficVolume === TrafficVolume.VERY_HIGH
      ) {
        nextDue.setMonth(nextDue.getMonth() + 6); // Every 6 months
      } else {
        nextDue.setFullYear(nextDue.getFullYear() + 1); // Annually
      }
      return nextDue;
    }
    return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // Default: 1 year from now
  }

  // Helper methods
  async markAsNeedsMaintenance(): Promise<void> {
    await this.update((road) => {
      road.condition = AssetCondition.POOR;
      road.synced = false;
    });
  }

  async updateCondition(newCondition: AssetCondition): Promise<void> {
    await this.update((road) => {
      road.condition = newCondition;
      road.synced = false;
    });
  }

  generateQRTagId(): string {
    const timestamp = Date.now().toString(36);
    return `ROA-${timestamp}`;
  }
}
