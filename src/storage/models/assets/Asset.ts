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
  type!: string;
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

