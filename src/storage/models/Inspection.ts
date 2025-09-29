import Realm from "realm";

export class Inspection extends Realm.Object {
  static schema = {
    name: "Inspection",
    primaryKey: "_id",
    properties: {
      _id: "objectId",
      assetId: "string",
      inspector: "string",
      description: "string",
      score: "int",
      timestamp: "date",
      maintenanceNeeded: "bool",
      nextDue: "date?",
      createdAt: "date",
      updatedAt: "date",
      synced: "bool",
    },
  };

  _id!: Realm.BSON.ObjectId;
  assetId!: string;
  inspector!: string;
  description!: string;
  score!: number;
  timestamp!: Date;
  maintenanceNeeded!: boolean;
  nextDue?: Date;
  createdAt!: Date;
  updatedAt!: Date;
  synced!: boolean;

  get isOverdue(): boolean {
    if (!this.nextDue) return false;
    return new Date() > this.nextDue;
  }

  get scoreCategory(): "good" | "fair" | "poor" {
    // Map 1–5 to 3-level buckets
    if (this.score >= 4) return "good";
    if (this.score >= 3) return "fair";
    return "poor";
  }

  get daysUntilDue(): number | null {
    if (!this.nextDue) return null;
    const now = new Date();
    const diffTime = this.nextDue.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
