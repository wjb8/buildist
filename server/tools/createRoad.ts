export const CREATE_ROAD_TOOL = {
  type: "function",
  name: "create_road",
  parameters: {
    type: "object",
    required: ["name", "condition"],
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
