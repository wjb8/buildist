export const FIND_ASSET_TOOL = {
  type: "function",
  name: "find_asset",
  description: "Search for assets by any field. Use this tool when the user wants to find, search, list, show, get, or retrieve assets. Use 'search' for general queries - it searches across all fields (name, location, condition, notes, identifier, etc.) with fuzzy matching. If the user asks for 'any road', 'one road', 'all roads', or similar generic queries without a specific search term, use by='search' with value='' (empty string) and type='road' to return all roads. If the user asks for 'one' or 'a single' asset, set limit=1.",
  parameters: {
    type: "object",
    required: ["by", "value"],
    properties: {
      by: { 
        type: "string", 
        enum: ["id", "name", "nameContains", "qrTagId", "search"],
        description: "Use 'search' for most queries - it searches ALL fields with fuzzy matching. Use empty string for value when user wants 'any', 'all', or 'one' without a specific search term. Use 'id' for exact ID, 'name' for exact name match, 'nameContains' for partial name only, 'qrTagId' for QR tag lookup."
      },
      value: { 
        type: "string",
        description: "The search term. For 'search' option, this can match any field (name, location, condition, notes, etc.). Use empty string '' when user asks for 'any', 'all', 'one', or similar generic queries without a specific search term."
      },
      type: { 
        type: "string", 
        enum: [
          "road",
          "vehicle",
          "bridge",
          "sidewalk",
          "street_light",
          "traffic_signal",
          "other",
        ],
        description: "Optional: filter by asset type. If the user mentions an asset type, use that. If omitted, searches all asset types."
      },
      limit: {
        type: "number",
        description: "Optional: maximum number of results to return. Use 1 when user asks for 'one', 'a single', etc. If omitted, returns all matching results."
      },
    },
  },
};
