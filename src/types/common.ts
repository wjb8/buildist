import { AssetType, AssetCondition } from "./asset";

export type SortOrder = "asc" | "desc";

export interface AssetFilters {
  type?: AssetType;
  condition?: AssetCondition;
  location?: string;
  searchQuery?: string;
}

export interface AssetSortOptions {
  field: "name" | "type" | "condition" | "createdAt" | "updatedAt";
  order: SortOrder;
}
