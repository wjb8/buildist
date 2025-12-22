import { AssetCondition } from "@/types/asset";
import { RoadSurfaceType, TrafficVolume } from "@/types/road";

export type ToolName =
  | "create_road"
  | "update_road"
  | "update_road_by"
  | "delete_asset"
  | "delete_road_by"
  | "find_asset";

export interface CreateRoadArgs {
  name: string;
  location?: string;
  condition: AssetCondition;
  notes?: string;
  qrTagId?: string;
  surfaceType: RoadSurfaceType;
  trafficVolume: TrafficVolume;
  length?: number;
  width?: number;
  lanes?: number;
  speedLimit?: number;
}

export interface UpdateRoadArgs {
  _id: string; // hex string of ObjectId
  fields: Partial<CreateRoadArgs>;
}

export interface UpdateRoadByArgs {
  by: "id" | "name" | "nameContains" | "qrTagId" | "search";
  value: string;
  limit?: number;
  fields: Partial<CreateRoadArgs>;
}

export interface DeleteRoadByArgs {
  by: "id" | "name" | "nameContains" | "qrTagId" | "search";
  value: string;
  limit?: number;
}

import { AssetType } from "@/types/asset";

export interface DeleteAssetArgs {
  _id: string;
  type: AssetType;
}

export interface FindAssetArgs {
  by: "id" | "name" | "nameContains" | "qrTagId" | "search";
  value: string;
  type?: AssetType;
  limit?: number;
}

export type ToolArgs =
  | { name: "create_road"; arguments: CreateRoadArgs }
  | { name: "update_road"; arguments: UpdateRoadArgs }
  | { name: "update_road_by"; arguments: UpdateRoadByArgs }
  | { name: "delete_asset"; arguments: DeleteAssetArgs }
  | { name: "delete_road_by"; arguments: DeleteRoadByArgs }
  | { name: "find_asset"; arguments: FindAssetArgs };

export interface ToolCall<T = unknown> {
  name: ToolName;
  arguments: T;
}

export const createRoadJsonSchema = {
  type: "function",
  name: "create_road",
  parameters: {
    type: "object",
    required: ["name", "condition", "surfaceType", "trafficVolume"],
    properties: {
      name: { type: "string" },
      location: { type: "string" },
      condition: { type: "string", enum: ["good", "fair", "poor"] },
      notes: { type: "string" },
      qrTagId: { type: "string" },
      surfaceType: {
        type: "string",
        enum: ["asphalt", "concrete", "gravel", "dirt", "paver", "other"],
      },
      trafficVolume: { type: "string", enum: ["low", "medium", "high", "very_high"] },
      length: { type: "number" },
      width: { type: "number" },
      lanes: { type: "integer" },
      speedLimit: { type: "integer" },
    },
  },
};
