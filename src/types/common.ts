export type SortOrder = "asc" | "desc";

export interface AssetFilters {
  type?: import("./asset").AssetType;
  condition?: import("./asset").AssetCondition;
  location?: string;
  searchQuery?: string;
}

export interface AssetSortOptions {
  field: "name" | "type" | "condition" | "createdAt" | "updatedAt";
  order: SortOrder;
}
