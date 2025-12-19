import { AssetCondition } from "../../types/asset";
import { RoadSurfaceType, TrafficVolume } from "../../types/road";
import type { CreateRoadArgs } from "./toolSchemas";

export type RoadDraftFields = Partial<Record<keyof CreateRoadArgs, unknown>> & {
  intent?: "create" | "find" | "update" | "delete";
};

export interface RoadDraftValidation {
  isValidForCreate: boolean;
  errors: Partial<Record<keyof CreateRoadArgs, string>>;
}

export function normalizeString(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  const s = String(value).trim();
  return s ? s : undefined;
}

export function normalizeNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const s = normalizeString(value);
  if (!s) return undefined;
  const parsed = Number(s);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function normalizeCondition(value: unknown): AssetCondition | undefined {
  const s = normalizeString(value)?.toLowerCase();
  if (!s) return undefined;
  if (s === "good" || s === "great" || s === "excellent") return AssetCondition.GOOD;
  if (s === "fair" || s === "ok" || s === "okay" || s === "average") return AssetCondition.FAIR;
  if (s === "poor" || s === "bad" || s === "terrible") return AssetCondition.POOR;
  return undefined;
}

export function normalizeSurfaceType(value: unknown): RoadSurfaceType | undefined {
  const s = normalizeString(value)?.toLowerCase();
  if (!s) return undefined;
  if (s === "asphalt" || s === "bitumen") return RoadSurfaceType.ASPHALT;
  if (s === "concrete") return RoadSurfaceType.CONCRETE;
  if (s === "gravel" || s === "chipseal" || s === "chip seal") return RoadSurfaceType.GRAVEL;
  if (s === "dirt" || s === "earth") return RoadSurfaceType.DIRT;
  if (s === "paver" || s === "pavers") return RoadSurfaceType.PAVER;
  if (s === "other") return RoadSurfaceType.OTHER;
  return undefined;
}

export function normalizeTrafficVolume(value: unknown): TrafficVolume | undefined {
  const s = normalizeString(value)?.toLowerCase();
  if (!s) return undefined;
  if (s === "low") return TrafficVolume.LOW;
  if (s === "medium" || s === "med") return TrafficVolume.MEDIUM;
  if (s === "high") return TrafficVolume.HIGH;
  if (s === "very_high" || s === "very high" || s === "veryhigh") return TrafficVolume.VERY_HIGH;
  return undefined;
}

export function normalizeRoadDraftFields(fields: Record<string, unknown>): Record<string, unknown> {
  const next: Record<string, unknown> = { ...fields };
  if ("condition" in next) next.condition = normalizeCondition(next.condition) ?? next.condition;
  if ("surfaceType" in next)
    next.surfaceType = normalizeSurfaceType(next.surfaceType) ?? next.surfaceType;
  if ("trafficVolume" in next)
    next.trafficVolume = normalizeTrafficVolume(next.trafficVolume) ?? next.trafficVolume;
  return next;
}

export function validateRoadDraftForCreate(fields: RoadDraftFields): RoadDraftValidation {
  const errors: RoadDraftValidation["errors"] = {};
  const name = normalizeString(fields.name);
  const condition = normalizeCondition(fields.condition);
  const surfaceType = normalizeSurfaceType(fields.surfaceType);
  const trafficVolume = normalizeTrafficVolume(fields.trafficVolume);

  if (!name) errors.name = "Road name is required";
  if (!condition) errors.condition = "Select a valid condition";
  if (!surfaceType) errors.surfaceType = "Select a valid surface type";
  if (!trafficVolume) errors.trafficVolume = "Select a valid traffic volume";

  return { isValidForCreate: Object.keys(errors).length === 0, errors };
}

export function buildCreateRoadArgsFromDraft(fields: RoadDraftFields): CreateRoadArgs | null {
  const v = validateRoadDraftForCreate(fields);
  if (!v.isValidForCreate) return null;

  const args: CreateRoadArgs = {
    name: String(normalizeString(fields.name)),
    condition: normalizeCondition(fields.condition)!,
    surfaceType: normalizeSurfaceType(fields.surfaceType)!,
    trafficVolume: normalizeTrafficVolume(fields.trafficVolume)!,
  };

  const optional: Array<keyof CreateRoadArgs> = [
    "location",
    "notes",
    "qrTagId",
    "length",
    "width",
    "lanes",
    "speedLimit",
  ];

  optional.forEach((k) => {
    const raw = fields[k];
    if (raw === undefined || raw === null || raw === "") return;
    if (k === "length" || k === "width" || k === "lanes" || k === "speedLimit") {
      const n = normalizeNumber(raw);
      if (n !== undefined) (args as any)[k] = n;
    } else {
      const s = normalizeString(raw);
      if (s) (args as any)[k] = s;
    }
  });

  return args;
}

export function buildUpdateRoadFieldsFromDraft(
  fields: RoadDraftFields,
  options?: { includeName?: boolean }
): Partial<CreateRoadArgs> {
  const allowed: Array<keyof CreateRoadArgs> = [
    "name",
    "location",
    "condition",
    "notes",
    "qrTagId",
    "surfaceType",
    "trafficVolume",
    "length",
    "width",
    "lanes",
    "speedLimit",
  ];
  const out: Partial<CreateRoadArgs> = {};

  for (const k of allowed) {
    if (k === "name" && !options?.includeName) continue;
    const raw = fields[k];
    if (raw === undefined || raw === null || raw === "") continue;

    if (k === "condition") {
      const c = normalizeCondition(raw);
      if (c) out.condition = c;
      continue;
    }
    if (k === "surfaceType") {
      const s = normalizeSurfaceType(raw);
      if (s) out.surfaceType = s;
      continue;
    }
    if (k === "trafficVolume") {
      const tv = normalizeTrafficVolume(raw);
      if (tv) out.trafficVolume = tv;
      continue;
    }
    if (k === "length" || k === "width" || k === "lanes" || k === "speedLimit") {
      const n = normalizeNumber(raw);
      if (n !== undefined) (out as any)[k] = n;
      continue;
    }

    const str = normalizeString(raw);
    if (str) (out as any)[k] = str;
  }

  return out;
}
