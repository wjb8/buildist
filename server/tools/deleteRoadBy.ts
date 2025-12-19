export const DELETE_ROAD_BY_TOOL = {
  type: "function",
  name: "delete_road_by",
  description:
    "Delete a road by selector (name/qrTagId/search) without requiring the user to provide an ObjectId. Prefer this when the user says 'Delete Main Street' or 'Remove the road with QR ROA-123'. If multiple roads match, this tool will return candidates so the user can pick one.",
  parameters: {
    type: "object",
    required: ["by", "value"],
    properties: {
      by: {
        type: "string",
        enum: ["id", "name", "nameContains", "qrTagId", "search"],
        description:
          "How to select the road. Use 'search' for most natural language queries. Use 'qrTagId' when the user provides a QR tag.",
      },
      value: {
        type: "string",
        description:
          "Selector value. For 'search', this can be any free-text term (or empty string to list all roads, though delete will fail if multiple matches).",
      },
      limit: {
        type: "number",
        description:
          "Optional: limit candidates when selector is broad (e.g., by='search'). Use 1 when you're confident it should match a single road.",
      },
    },
    additionalProperties: false,
  },
};


