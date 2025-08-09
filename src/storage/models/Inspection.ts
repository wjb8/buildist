import { Model } from "@nozbe/watermelondb";
import { text, field, date, relation, readonly } from "@nozbe/watermelondb/decorators";
import type { Asset } from "./Asset";

export class Inspection extends Model {
  static table = "inspections";
  static associations = {
    assets: { type: "belongs_to" as const, key: "asset_id" },
  };

  @text("asset_id") assetId!: string;
  @text("inspector") inspector!: string;
  @text("description") description!: string;
  @field("score") score!: number;
  @date("timestamp") timestamp!: Date;
  @field("maintenance_needed") maintenanceNeeded!: boolean;
  @date("next_due") nextDue?: Date;

  @readonly @date("created_at") createdAt!: Date;
  @readonly @date("updated_at") updatedAt!: Date;
  @field("synced") synced!: boolean;

  @relation("assets", "asset_id") asset!: Asset;

  // Computed properties
  get isOverdue(): boolean {
    if (!this.nextDue) return false;
    return new Date() > this.nextDue;
  }

  get scoreCategory(): "excellent" | "good" | "fair" | "poor" | "critical" {
    if (this.score >= 9) return "excellent";
    if (this.score >= 7) return "good";
    if (this.score >= 5) return "fair";
    if (this.score >= 3) return "poor";
    return "critical";
  }

  get daysUntilDue(): number | null {
    if (!this.nextDue) return null;
    const now = new Date();
    const diffTime = this.nextDue.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Helper methods
  async scheduleNextInspection(daysFromNow: number): Promise<void> {
    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + daysFromNow);

    await this.update((inspection) => {
      inspection.nextDue = nextDueDate;
      inspection.synced = false;
    });
  }

  async updateScore(newScore: number, aiGenerated: boolean = false): Promise<void> {
    await this.update((inspection) => {
      inspection.score = Math.max(1, Math.min(10, newScore)); // Clamp to 1-10
      inspection.maintenanceNeeded = newScore < 5; // Auto-flag for maintenance if score is low
      inspection.synced = false;
    });
  }

  async markMaintenanceComplete(): Promise<void> {
    await this.update((inspection) => {
      inspection.maintenanceNeeded = false;
      inspection.synced = false;
    });
  }
}
