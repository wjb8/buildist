export const DELETE_ASSET_TOOL = {
  type: "function",
  name: "delete_asset",
  parameters: {
    type: "object",
    required: ["_id", "type"],
    properties: {
      _id: { type: "string", description: "Hex string ObjectId of the asset" },
      type: { type: "string", enum: ["Road", "Vehicle"] },
    },
  },
};
