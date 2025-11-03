import { AssetCondition, type AssetData } from "@/types/asset";
import { TrafficVolume } from "@/types/road";
import type { Inspection } from "@/storage/models/Inspection";

export interface AttentionConfig {
  dueSoonDays: number;
  conditionThreshold: AssetCondition; // assets at or below this need attention
  scoreMaintenanceThreshold: number; // scores <= threshold imply maintenance
  trafficPriorityWeights: Record<TrafficVolume, number>;
}

export const defaultAttentionConfig: AttentionConfig = {
  dueSoonDays: 7,
  conditionThreshold: AssetCondition.FAIR,
  scoreMaintenanceThreshold: 2,
  trafficPriorityWeights: {
    [TrafficVolume.LOW]: 0,
    [TrafficVolume.MEDIUM]: 0,
    [TrafficVolume.HIGH]: 1,
    [TrafficVolume.VERY_HIGH]: 2,
  },
};

export interface AssetWithLatestInspection<TAsset extends { _id: any }> {
  asset: TAsset;
  latestInspection: Inspection | null;
}

export interface AttentionFlags {
  overdue: boolean;
  dueSoon: boolean;
  maintenance: boolean;
  poorCondition: boolean;
  repairPlan: boolean;
  councilFlag: boolean;
}

export function getAttentionFlags(
  asset: AssetData & { condition: AssetCondition },
  latestInspection: Inspection | null,
  config: AttentionConfig = defaultAttentionConfig
): AttentionFlags {
  const now = new Date();
  const dueSoonCutoff = new Date(now.getTime() + config.dueSoonDays * 24 * 60 * 60 * 1000);

  const overdue = !!(latestInspection?.nextDue && latestInspection.nextDue < now);
  const dueSoon = !!(
    latestInspection?.nextDue &&
    latestInspection.nextDue >= now &&
    latestInspection.nextDue <= dueSoonCutoff
  );

  const maintenance = !!(
    latestInspection?.maintenanceNeeded ||
    (typeof latestInspection?.score === "number" &&
      latestInspection.score <= config.scoreMaintenanceThreshold)
  );

  const poorCondition = conditionIsAtOrBelow(asset.condition, config.conditionThreshold);

  // Admin recommendations
  const issueType = latestInspection?.issueType || null;
  const priority = latestInspection?.priority || null;
  // Repair plan when condition is explicitly poor or issue is potholes
  const repairPlan = asset.condition === AssetCondition.POOR || issueType === "potholes";
  const councilFlag = priority === "high";

  return { overdue, dueSoon, maintenance, poorCondition, repairPlan, councilFlag };
}

export function conditionIsAtOrBelow(
  condition: AssetCondition,
  threshold: AssetCondition
): boolean {
  const order: AssetCondition[] = [AssetCondition.GOOD, AssetCondition.FAIR, AssetCondition.POOR];
  return order.indexOf(condition) >= order.indexOf(threshold);
}

export function computeAttentionScore(
  asset: AssetData & { condition: AssetCondition; trafficVolume?: TrafficVolume },
  flags: AttentionFlags,
  latestInspection: Inspection | null,
  config: AttentionConfig = defaultAttentionConfig
): number {
  let score = 0;

  if (flags.overdue) score += 100;
  if (flags.maintenance) score += 80;
  if (flags.councilFlag) score += 40; // elevate high-priority items
  if (flags.dueSoon) {
    // Sooner due dates rank higher
    const daysUntil = latestInspection?.nextDue
      ? Math.max(
          0,
          Math.ceil((latestInspection.nextDue.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        )
      : config.dueSoonDays;
    score += 50 + Math.max(0, config.dueSoonDays - daysUntil);
  }

  // Condition severity
  const conditionWeights: Record<AssetCondition, number> = {
    [AssetCondition.GOOD]: 0,
    [AssetCondition.FAIR]: 10,
    [AssetCondition.POOR]: 20,
  };
  score += conditionWeights[asset.condition];

  // Traffic priority influence
  if (asset.trafficVolume) score += config.trafficPriorityWeights[asset.trafficVolume] || 0;

  // Newer inspections slightly lower urgency vs. stale
  if (latestInspection) {
    const daysSince = Math.floor(
      (Date.now() - latestInspection.timestamp.getTime()) / (1000 * 60 * 60 * 24)
    );
    score += Math.min(15, Math.max(0, daysSince / 7));
  }

  return score;
}

export function getAttentionReasonBadges(flags: AttentionFlags): string[] {
  const badges: string[] = [];
  if (flags.overdue) badges.push("Overdue");
  if (flags.maintenance) badges.push("Maintenance");
  if (flags.dueSoon) badges.push("Due soon");
  if (flags.poorCondition) badges.push("Condition: Poor");
  if (flags.repairPlan) badges.push("Repair plan");
  if (flags.councilFlag) badges.push("Council flag");
  return badges;
}
