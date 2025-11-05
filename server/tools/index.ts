export { CREATE_ROAD_TOOL } from "./createRoad";
export { UPDATE_ROAD_TOOL } from "./updateRoad";
export { DELETE_ASSET_TOOL } from "./deleteAsset";
export { FIND_ASSET_TOOL } from "./findAsset";

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
