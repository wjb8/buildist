export const UPDATE_ROAD_BY_TOOL = {
  type: "function",
  name: "update_road_by",
  description:
    "Update a road by selector (name/qrTagId/search) without requiring the user to provide an ObjectId. Use this when the user says things like 'Update Main Street condition to poor' or 'Change the road with QR ROA-123 to fair'. If multiple roads match, this tool will return candidates so the user can pick one.",
  parameters: {
    type: "object",
    required: ["by", "value", "fields"],
    properties: {
      by: {
        type: "string",
        enum: ["id", "name", "nameContains", "qrTagId", "search"],
        description:
          "How to select the road. Use 'search' for most natural language queries. Use 'qrTagId' when the user provides a QR tag. Use 'name' for exact match and 'nameContains' for partial match.",
      },
      value: {
        type: "string",
        description:
          "Selector value. For 'search', this can be any free-text term (or empty string to list all roads, though update will fail if multiple matches).",
      },
      limit: {
        type: "number",
        description:
          "Optional: limit candidates when selector is broad (e.g., by='search'). Use 1 when you're confident it should match a single road.",
      },
      fields: {
        type: "object",
        minProperties: 1,
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
        additionalProperties: false,
      },
    },
    additionalProperties: false,
  },
};


