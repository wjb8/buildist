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
    realm.create("Road", {
      _id: createdId,
      name: args.name,
      location: args.location,
      condition: args.condition,
      notes: args.notes,
      qrTagId: args.qrTagId ?? undefined,
      surfaceType: args.surfaceType,
      trafficVolume: args.trafficVolume,
      length: args.length,
      width: args.width,
      lanes: args.lanes,
      speedLimit: args.speedLimit,
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
  const road = realm.objectForPrimaryKey<any>("Road", objectId);
  if (!road) {
    return { success: false, message: "Road not found" };
  }
  realm.write(() => {
    Object.assign(road, { ...args.fields, updatedAt: new Date() });
  });
  return { success: true, message: "Road updated", data: { _id: args._id } };
}

function fuzzyMatchField(value: any, searchTerm: string): boolean {
  if (value === null || value === undefined) return false;
  const str = String(value).toLowerCase();
  return str.includes(searchTerm.toLowerCase());
}

function matchesRoadFuzzySearch(obj: any, searchTerm: string): boolean {
  return (
    fuzzyMatchField(obj.name, searchTerm) ||
    fuzzyMatchField(obj.location, searchTerm) ||
    fuzzyMatchField(obj.condition, searchTerm) ||
    fuzzyMatchField(obj.notes, searchTerm) ||
    fuzzyMatchField(obj.qrTagId, searchTerm) ||
    fuzzyMatchField(obj.surfaceType, searchTerm) ||
    fuzzyMatchField(obj.trafficVolume, searchTerm) ||
    (obj.length !== undefined && fuzzyMatchField(String(obj.length), searchTerm)) ||
    (obj.width !== undefined && fuzzyMatchField(String(obj.width), searchTerm)) ||
    (obj.lanes !== undefined && fuzzyMatchField(String(obj.lanes), searchTerm)) ||
    (obj.speedLimit !== undefined && fuzzyMatchField(String(obj.speedLimit), searchTerm))
  );
}

function pickRoadCandidates(
  realm: Realm,
  args: { by: UpdateRoadByArgs["by"]; value: string; limit?: number }
): any[] {
  const allResults = realm.objects<any>("Road");
  const all = toArray<any>(allResults);

  let matches: any[] = [];
  if (args.by === "id") {
    try {
      const objectId = new Realm.BSON.ObjectId(args.value);
      const obj = realm.objectForPrimaryKey<any>("Road", objectId);
      if (obj) matches = [obj];
    } catch {
      matches = [];
    }
  } else if (args.by === "name") {
    matches = all.filter((r) => typeof r?.name === "string" && r.name === args.value);
  } else if (args.by === "nameContains") {
    const q = args.value.toLowerCase();
    matches = all.filter((r) => typeof r?.name === "string" && r.name.toLowerCase().includes(q));
  } else if (args.by === "qrTagId") {
    matches = all.filter((r) => typeof r?.qrTagId === "string" && r.qrTagId === args.value);
  } else if (args.by === "search") {
    const q = (args.value || "").trim();
    if (!q) {
      matches = all;
    } else {
      matches = all.filter((r) => matchesRoadFuzzySearch(r, q));
    }
  }

  if (args.limit && args.limit > 0) {
    return matches.slice(0, args.limit);
  }
  return matches;
}

export async function applyUpdateRoadBy(args: UpdateRoadByArgs): Promise<ToolExecutionResult> {
  const realm = await getRealm();
  const candidates = pickRoadCandidates(realm, args);

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
    Object.assign(target, { ...args.fields, updatedAt: new Date(), synced: false });
  });

  const idValue =
    target?._id instanceof Realm.BSON.ObjectId ? target._id.toHexString() : String(target?._id);
  return { success: true, message: "Road updated", data: { _id: idValue } };
}

export async function applyDeleteAsset(args: DeleteAssetArgs): Promise<ToolExecutionResult> {
  const realm = await getRealm();
  const objectId = new Realm.BSON.ObjectId(args._id);
  const obj = realm.objectForPrimaryKey<any>(args.type, objectId);
  if (!obj) {
    return { success: false, message: `${args.type} not found` };
  }
  realm.write(() => {
    realm.delete(obj);
  });
  return { success: true, message: `${args.type} deleted`, data: { _id: args._id } };
}

export async function applyDeleteRoadBy(args: DeleteRoadByArgs): Promise<ToolExecutionResult> {
  const realm = await getRealm();
  const candidates = pickRoadCandidates(realm, args);

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

function matchesFuzzySearch(obj: any, searchTerm: string, assetType: "Road" | "Vehicle"): boolean {
  const searchLower = searchTerm.toLowerCase();

  if (assetType === "Road") {
    return (
      fuzzyMatchField(obj.name, searchTerm) ||
      fuzzyMatchField(obj.location, searchTerm) ||
      fuzzyMatchField(obj.condition, searchTerm) ||
      fuzzyMatchField(obj.notes, searchTerm) ||
      fuzzyMatchField(obj.qrTagId, searchTerm) ||
      fuzzyMatchField(obj.surfaceType, searchTerm) ||
      fuzzyMatchField(obj.trafficVolume, searchTerm) ||
      (obj.length !== undefined && fuzzyMatchField(String(obj.length), searchTerm)) ||
      (obj.width !== undefined && fuzzyMatchField(String(obj.width), searchTerm)) ||
      (obj.lanes !== undefined && fuzzyMatchField(String(obj.lanes), searchTerm)) ||
      (obj.speedLimit !== undefined && fuzzyMatchField(String(obj.speedLimit), searchTerm))
    );
  } else if (assetType === "Vehicle") {
    return (
      fuzzyMatchField(obj.name, searchTerm) ||
      fuzzyMatchField(obj.identifier, searchTerm) ||
      fuzzyMatchField(obj.location, searchTerm) ||
      fuzzyMatchField(obj.condition, searchTerm) ||
      fuzzyMatchField(obj.notes, searchTerm) ||
      fuzzyMatchField(obj.qrTagId, searchTerm) ||
      fuzzyMatchField(obj.priority, searchTerm) ||
      (obj.mileage !== undefined && fuzzyMatchField(String(obj.mileage), searchTerm)) ||
      (obj.hours !== undefined && fuzzyMatchField(String(obj.hours), searchTerm))
    );
  }
  return false;
}

export async function applyFindAsset(args: FindAssetArgs): Promise<ToolExecutionResult> {
  const realm = await getRealm();
  let results: any[] = [];
  const types = args.type ? ([args.type] as const) : ["Road" as const, "Vehicle" as const];
  console.log("[applyFindAsset] Search args:", JSON.stringify(args));
  types.forEach((t) => {
    if (args.by === "id") {
      try {
        const objectId = new Realm.BSON.ObjectId(args.value);
        const obj = realm.objectForPrimaryKey<any>(t, objectId);
        if (obj) results.push(serializeRealmObject(obj));
      } catch {}
    } else if (args.by === "name") {
      const found = realm.objects<any>(t).filtered("name == $0", args.value);
      results.push(...found.map(serializeRealmObject));
    } else if (args.by === "nameContains") {
      const all = realm.objects<any>(t);
      const filtered = Array.from(all).filter(
        (obj) =>
          obj.name &&
          typeof obj.name === "string" &&
          obj.name.toLowerCase().includes(args.value.toLowerCase())
      );
      results.push(...filtered.map(serializeRealmObject));
    } else if (args.by === "qrTagId") {
      const found = realm.objects<any>(t).filtered("qrTagId == $0", args.value);
      results.push(...found.map(serializeRealmObject));
    } else if (args.by === "search") {
      const all = realm.objects<any>(t);
      const totalCount = all.length;
      console.log(
        `[applyFindAsset] Searching ${t}: total=${totalCount}, searchValue="${args.value}"`
      );
      if (!args.value || args.value.trim() === "") {
        console.log(`[applyFindAsset] Empty search value - returning all ${totalCount} ${t} items`);
        results.push(...Array.from(all).map(serializeRealmObject));
      } else {
        const filtered = Array.from(all).filter((obj) => matchesFuzzySearch(obj, args.value, t));
        console.log(
          `[applyFindAsset] Fuzzy search matched ${filtered.length} of ${totalCount} ${t} items`
        );
        results.push(...filtered.map(serializeRealmObject));
      }
    }
  });
  if (args.limit && args.limit > 0) {
    results = results.slice(0, args.limit);
  }

  const count = results.length;
  const message =
    count === 0 ? "No results found" : `Found ${count} result${count === 1 ? "" : "s"}`;
  return { success: true, message, data: results };
}

function serializeRealmObject(obj: any) {
  const out: Record<string, any> = {};
  Object.keys(obj).forEach((k) => {
    const v = (obj as any)[k];
    if (v instanceof Date) out[k] = v.toISOString();
    else if (v instanceof Realm.BSON.ObjectId) out[k] = v.toHexString();
    else out[k] = v;
  });
  return out;
}
