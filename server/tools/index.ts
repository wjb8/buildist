import { CREATE_ROAD_TOOL } from "./createRoad";
import { UPDATE_ROAD_TOOL } from "./updateRoad";
import { UPDATE_ROAD_BY_TOOL } from "./updateRoadBy";
import { DELETE_ASSET_TOOL } from "./deleteAsset";
import { DELETE_ROAD_BY_TOOL } from "./deleteRoadBy";
import { FIND_ASSET_TOOL } from "./findAsset";

export {
  CREATE_ROAD_TOOL,
  UPDATE_ROAD_TOOL,
  UPDATE_ROAD_BY_TOOL,
  DELETE_ASSET_TOOL,
  DELETE_ROAD_BY_TOOL,
  FIND_ASSET_TOOL,
};

export interface OpenAIToolDefinition {
  type: "function";
  name: string;
  description?: string;
  parameters: {
    type: "object";
    required?: string[];
    properties: Record<
      string,
      {
        type: string;
        enum?: string[];
        description?: string;
        minProperties?: number;
        additionalProperties?: boolean;
      }
    >;
    minProperties?: number;
    additionalProperties?: boolean;
  };
}

export const TOOL_DEFINITIONS: OpenAIToolDefinition[] = [
  CREATE_ROAD_TOOL,
  UPDATE_ROAD_TOOL,
  UPDATE_ROAD_BY_TOOL,
  DELETE_ASSET_TOOL,
  DELETE_ROAD_BY_TOOL,
  FIND_ASSET_TOOL,
] as OpenAIToolDefinition[];

export function parseToolArguments(raw: unknown): unknown {
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return { __raw: raw, __parseError: "Failed to parse tool arguments JSON" };
    }
  }
  return raw;
}
