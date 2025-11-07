import { CREATE_ROAD_TOOL } from "./createRoad";
import { UPDATE_ROAD_TOOL } from "./updateRoad";
import { DELETE_ASSET_TOOL } from "./deleteAsset";
import { FIND_ASSET_TOOL } from "./findAsset";

export { CREATE_ROAD_TOOL, UPDATE_ROAD_TOOL, DELETE_ASSET_TOOL, FIND_ASSET_TOOL };

export const TOOL_DEFINITIONS = [
  CREATE_ROAD_TOOL,
  UPDATE_ROAD_TOOL,
  DELETE_ASSET_TOOL,
  FIND_ASSET_TOOL,
];

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
