import Realm from "realm";
import { getRealm } from "@/storage/realm";
import { CreateRoadArgs, DeleteAssetArgs, FindAssetArgs, UpdateRoadArgs } from "./toolSchemas";

export interface ToolExecutionResult {
	success: boolean;
	message: string;
	data?: unknown;
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
	return { success: true, message: "Road created", data: { _id: createdId?.toHexString() } };
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

export async function applyFindAsset(args: FindAssetArgs): Promise<ToolExecutionResult> {
	const realm = await getRealm();
	let results: any[] = [];
	const types = args.type ? [args.type] as const : ([("Road" as const), ("Vehicle" as const)]);
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
		} else if (args.by === "qrTagId") {
			const found = realm.objects<any>(t).filtered("qrTagId == $0", args.value);
			results.push(...found.map(serializeRealmObject));
		}
	});
	return { success: true, message: "ok", data: results };
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




