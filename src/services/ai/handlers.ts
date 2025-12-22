import Realm from "realm";
import { getRealm } from "@/storage/realm";
import {
  CreateRoadArgs,
  DeleteAssetArgs,
  DeleteRoadByArgs,
  FindAssetArgs,
  UpdateRoadArgs,
  UpdateRoadByArgs,
} from "./toolSchemas";
import { AssetType } from "@/types/asset";

export interface ToolExecutionResult {
  success: boolean;
  message: string;
  data?: unknown;
}

function toArray<T>(results: any): T[] {
  if (!results) return [];
  if (Array.isArray(results)) return results as T[];
  try {
    return Array.from(results as Iterable<T>);
  } catch {
    try {
      if (typeof results.map === "function") return results.map((x: T) => x);
    } catch {}
    return [];
  }
}

export async function applyCreateRoad(args: CreateRoadArgs): Promise<ToolExecutionResult> {
  const realm = await getRealm();
  let createdId: Realm.BSON.ObjectId | null = null;
  realm.write(() => {
    createdId = new Realm.BSON.ObjectId();
    realm.create("Asset", {
      _id: createdId,
      type: AssetType.ROAD,
      name: args.name,
      location: args.location,
      condition: args.condition,
      notes: args.notes,
      qrTagId: args.qrTagId ?? undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      synced: false,
    });
  });
  const idValue = createdId ? String(createdId) : undefined;
  return { success: true, message: "Road created", data: { _id: idValue } };
}

export async function applyUpdateRoad(args: UpdateRoadArgs): Promise<ToolExecutionResult> {
  const realm = await getRealm();
  const objectId = new Realm.BSON.ObjectId(args._id);
  const asset = realm.objectForPrimaryKey<any>("Asset", objectId);
  if (!asset) {
    return { success: false, message: "Asset not found" };
  }
  if (asset.type !== AssetType.ROAD) {
    return { success: false, message: "Asset is not a road" };
  }
  realm.write(() => {
    if (args.fields.name !== undefined) asset.name = args.fields.name;
    if (args.fields.location !== undefined) asset.location = args.fields.location;
    if (args.fields.condition !== undefined) asset.condition = args.fields.condition;
    if (args.fields.notes !== undefined) asset.notes = args.fields.notes;
    if (args.fields.qrTagId !== undefined) asset.qrTagId = args.fields.qrTagId;
    asset.updatedAt = new Date();
    asset.synced = false;
  });
  return { success: true, message: "Road updated", data: { _id: args._id } };
}

function fuzzyMatchField(value: any, searchTerm: string): boolean {
  if (value === null || value === undefined) return false;
  const str = String(value).toLowerCase();
  return str.includes(searchTerm.toLowerCase());
}

function matchesAssetFuzzySearch(obj: any, searchTerm: string): boolean {
  return (
    fuzzyMatchField(obj.name, searchTerm) ||
    fuzzyMatchField(obj.location, searchTerm) ||
    fuzzyMatchField(obj.condition, searchTerm) ||
    fuzzyMatchField(obj.notes, searchTerm) ||
    fuzzyMatchField(obj.qrTagId, searchTerm) ||
    fuzzyMatchField(obj.type, searchTerm)
  );
}

function pickAssetCandidates(
  realm: Realm,
  args: { by: UpdateRoadByArgs["by"]; value: string; limit?: number; type?: AssetType }
): any[] {
  const allResults = realm.objects<any>("Asset");
  const all = toArray<any>(allResults);

  let matches: any[] = [];
  if (args.by === "id") {
    try {
      const objectId = new Realm.BSON.ObjectId(args.value);
      const obj = realm.objectForPrimaryKey<any>("Asset", objectId);
      if (obj && (!args.type || obj.type === args.type)) matches = [obj];
    } catch {
      matches = [];
    }
  } else if (args.by === "name") {
    matches = all.filter(
      (r) =>
        typeof r?.name === "string" &&
        r.name === args.value &&
        (!args.type || r.type === args.type)
    );
  } else if (args.by === "nameContains") {
    const q = args.value.toLowerCase();
    matches = all.filter(
      (r) =>
        typeof r?.name === "string" &&
        r.name.toLowerCase().includes(q) &&
        (!args.type || r.type === args.type)
    );
  } else if (args.by === "qrTagId") {
    matches = all.filter(
      (r) =>
        typeof r?.qrTagId === "string" &&
        r.qrTagId === args.value &&
        (!args.type || r.type === args.type)
    );
  } else if (args.by === "search") {
    const q = (args.value || "").trim();
    if (!q) {
      matches = all.filter((r) => !args.type || r.type === args.type);
    } else {
      matches = all.filter(
        (r) => matchesAssetFuzzySearch(r, q) && (!args.type || r.type === args.type)
      );
    }
  }

  if (args.limit && args.limit > 0) {
    return matches.slice(0, args.limit);
  }
  return matches;
}

export async function applyUpdateRoadBy(args: UpdateRoadByArgs): Promise<ToolExecutionResult> {
  const realm = await getRealm();
  const candidates = pickAssetCandidates(realm, { ...args, type: AssetType.ROAD });

  if (candidates.length === 0) {
    return { success: false, message: "No matching road found", data: [] };
  }

  if (!args.fields || Object.keys(args.fields).length === 0) {
    return {
      success: false,
      message: "No update fields provided",
      data: candidates.map(serializeRealmObject),
    };
  }

  if (candidates.length > 1) {
    return {
      success: false,
      message: `Multiple roads matched (${candidates.length}). Please narrow the selection (e.g., by QR tag) or pick one result to update.`,
      data: candidates.map(serializeRealmObject),
    };
  }

  const target = candidates[0];
  realm.write(() => {
    if (args.fields.name !== undefined) target.name = args.fields.name;
    if (args.fields.location !== undefined) target.location = args.fields.location;
    if (args.fields.condition !== undefined) target.condition = args.fields.condition;
    if (args.fields.notes !== undefined) target.notes = args.fields.notes;
    if (args.fields.qrTagId !== undefined) target.qrTagId = args.fields.qrTagId;
    target.updatedAt = new Date();
    target.synced = false;
  });

  const idValue =
    target?._id instanceof Realm.BSON.ObjectId ? target._id.toHexString() : String(target?._id);
  return { success: true, message: "Road updated", data: { _id: idValue } };
}

export async function applyDeleteAsset(args: DeleteAssetArgs): Promise<ToolExecutionResult> {
  const realm = await getRealm();
  const objectId = new Realm.BSON.ObjectId(args._id);
  const obj = realm.objectForPrimaryKey<any>("Asset", objectId);
  if (!obj) {
    return { success: false, message: "Asset not found" };
  }
  if (obj.type !== args.type) {
    return { success: false, message: `Asset type mismatch: expected ${args.type}, found ${obj.type}` };
  }
  realm.write(() => {
    realm.delete(obj);
  });
  return { success: true, message: "Asset deleted", data: { _id: args._id } };
}

export async function applyDeleteRoadBy(args: DeleteRoadByArgs): Promise<ToolExecutionResult> {
  const realm = await getRealm();
  const candidates = pickAssetCandidates(realm, { ...args, type: AssetType.ROAD });

  if (candidates.length === 0) {
    return { success: false, message: "No matching road found", data: [] };
  }

  if (candidates.length > 1) {
    return {
      success: false,
      message: `Multiple roads matched (${candidates.length}). Please narrow the selection (e.g., by QR tag) or pick one result to delete.`,
      data: candidates.map(serializeRealmObject),
    };
  }

  const target = candidates[0];
  const idValue =
    target?._id instanceof Realm.BSON.ObjectId ? target._id.toHexString() : String(target?._id);

  realm.write(() => {
    realm.delete(target);
  });

  return { success: true, message: "Road deleted", data: { _id: idValue } };
}

export async function applyFindAsset(args: FindAssetArgs): Promise<ToolExecutionResult> {
  const realm = await getRealm();
  let results: any[] = [];
  const allAssets = realm.objects<any>("Asset");
  const all = toArray<any>(allAssets);

  let filtered: any[] = [];

  if (args.type) {
    filtered = all.filter((a) => a.type === args.type);
  } else {
    filtered = all;
  }

  if (args.by === "id") {
    try {
      const objectId = new Realm.BSON.ObjectId(args.value);
      const obj = realm.objectForPrimaryKey<any>("Asset", objectId);
      if (obj && (!args.type || obj.type === args.type)) {
        results.push(serializeRealmObject(obj));
      }
    } catch {}
  } else if (args.by === "name") {
    results = filtered
      .filter((obj) => typeof obj?.name === "string" && obj.name === args.value)
      .map(serializeRealmObject);
  } else if (args.by === "nameContains") {
    results = filtered
      .filter(
        (obj) =>
          obj.name &&
          typeof obj.name === "string" &&
          obj.name.toLowerCase().includes(args.value.toLowerCase())
      )
      .map(serializeRealmObject);
  } else if (args.by === "qrTagId") {
    results = filtered
      .filter((obj) => typeof obj?.qrTagId === "string" && obj.qrTagId === args.value)
      .map(serializeRealmObject);
  } else if (args.by === "search") {
    const q = (args.value || "").trim();
    if (!q) {
      results = filtered.map(serializeRealmObject);
    } else {
      results = filtered
        .filter((obj) => matchesAssetFuzzySearch(obj, q))
        .map(serializeRealmObject);
    }
  }

  if (args.limit && args.limit > 0) {
    results = results.slice(0, args.limit);
  }

  const count = results.length;
  const message =
    count === 0 ? "No results found" : `Found ${count} result${count === 1 ? "" : "s"}`;
  return { success: true, message, data: results };
}

function serializeRealmObject(obj: unknown) {
  if (!obj || typeof obj !== "object") return obj;
  const record = obj as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  Object.keys(record).forEach((k) => {
    const v = record[k];
    if (v instanceof Date) out[k] = v.toISOString();
    else if (v instanceof Realm.BSON.ObjectId) out[k] = v.toHexString();
    else out[k] = v;
  });
  return out;
}
