import { Model } from "@nozbe/watermelondb";
import { text, field, date, children, readonly } from "@nozbe/watermelondb/decorators";
import { AssetType, AssetCondition } from "@/types/models";
import type { Inspection } from "./Inspection";

export class Asset extends Model {
  static table = "assets";
  static associations = {
    inspections: { type: "has_many" as const, foreignKey: "asset_id" },
  };

  @text("type") type!: AssetType;
  @text("name") name!: string;
  @text("location") location?: string;
  @text("condition") condition!: AssetCondition;
  @text("notes") notes?: string;
  @text("qr_tag_id") qrTagId?: string;

  @readonly @date("created_at") createdAt!: Date;
  @readonly @date("updated_at") updatedAt!: Date;
  @field("synced") synced!: boolean;

  @children("inspections") inspections!: Inspection[];

  // Computed properties
  get isMaintenanceOverdue(): boolean {
    // Check if any recent inspection indicates maintenance is overdue
    // This would need to be implemented with actual inspection data
    return false;
  }

  get lastInspectionDate(): Date | null {
    // This would need to be implemented with actual inspection queries
    return null;
  }

  get conditionScore(): number {
    // Convert condition enum to numeric score for sorting/filtering
    const scores = {
      [AssetCondition.EXCELLENT]: 5,
      [AssetCondition.GOOD]: 4,
      [AssetCondition.FAIR]: 3,
      [AssetCondition.POOR]: 2,
      [AssetCondition.CRITICAL]: 1,
    };
    return scores[this.condition] || 0;
  }

  // Helper methods for common operations
  async markAsNeedsMaintenance(): Promise<void> {
    await this.update((asset) => {
      asset.condition = AssetCondition.POOR;
      asset.synced = false;
    });
  }

  async updateCondition(newCondition: AssetCondition): Promise<void> {
    await this.update((asset) => {
      asset.condition = newCondition;
      asset.synced = false;
    });
  }

  async generateQRTagId(): Promise<string> {
    // Generate a unique QR tag ID based on asset type and timestamp
    const timestamp = Date.now().toString(36);
    const typePrefix = this.type.substring(0, 3).toUpperCase();
    return `${typePrefix}-${timestamp}`;
  }
}
