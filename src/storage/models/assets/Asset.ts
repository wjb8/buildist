/**
 * Asset Model Architecture (Phase 1)
 *
 * For Phase 1, we use a generic Asset model that can handle any asset type (roads, vehicles,
 * bridges, sidewalks, etc.) with minimal fields. This approach:
 *
 * 1. Simplifies Phase 1 development - no need for specialized schemas per asset type
 * 2. Allows flexible asset management - can add new asset types without schema changes
 * 3. Keeps the codebase maintainable - single model to work with
 *
 * Road and Vehicle classes exist as plain TypeScript classes extending Asset for:
 * - Type safety and code organization
 * - Future extensibility (can convert to Realm.Object subclasses in later phases)
 * - They are NOT stored in Realm during Phase 1 (only Asset instances are stored)
 *
 * In future phases, Road and Vehicle can be converted to Realm.Object subclasses with
 * their own schemas if specialized fields are needed, but for Phase 1, all assets are
 * stored as generic Asset instances with a `type` field indicating the asset type.
 */
import Realm from "realm";
import { AssetCondition, AssetType } from "../../../types/asset";

export class Asset extends Realm.Object {
  static schema = {
    name: "Asset",
    primaryKey: "_id",
    properties: {
      _id: "objectId",
      type: "string",
      name: "string",
      condition: "string",
      notes: "string?",
      qrTagId: "string?",
      location: "string?",
      createdAt: "date",
      updatedAt: "date",
      synced: "bool",
    },
  };

  _id!: Realm.BSON.ObjectId;
  type!: AssetType;
  name!: string;
  condition!: AssetCondition;
  notes?: string;
  qrTagId?: string;
  location?: string;
  createdAt!: Date;
  updatedAt!: Date;
  synced!: boolean;

  get assetType(): AssetType {
    return this.type as AssetType;
  }

  generateQRTagId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 5);
    return `${this.type.toUpperCase().substring(0, 3)}-${timestamp}-${random}`.toUpperCase();
  }
}

