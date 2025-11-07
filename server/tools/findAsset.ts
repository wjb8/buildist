export const FIND_ASSET_TOOL = {
  type: "function",
  name: "find_asset",
  parameters: {
    type: "object",
    required: ["by", "value"],
    properties: {
      by: { type: "string", enum: ["id", "name", "qrTagId"] },
      value: { type: "string" },
      type: { type: "string", enum: ["Road", "Vehicle"] },
    },
  },
};
