import { AssetCondition } from "@/types/asset";
import { RoadSurfaceType, TrafficVolume } from "@/types/road";

export type ToolName = "create_road" | "update_road" | "delete_asset" | "find_asset";

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

export interface DeleteAssetArgs {
  _id: string;
  type: "Road" | "Vehicle";
}

export interface FindAssetArgs {
  by: "id" | "name" | "nameContains" | "qrTagId" | "search";
  value: string;
  type?: "Road" | "Vehicle";
  limit?: number;
}

export type ToolArgs =
  | { name: "create_road"; arguments: CreateRoadArgs }
  | { name: "update_road"; arguments: UpdateRoadArgs }
  | { name: "delete_asset"; arguments: DeleteAssetArgs }
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
