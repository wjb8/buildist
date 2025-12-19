import {
	applyCreateRoad,
	applyDeleteAsset,
	applyDeleteRoadBy,
	applyFindAsset,
	applyUpdateRoad,
	applyUpdateRoadBy,
} from "./ai/handlers";
import { ToolCall, ToolName } from "./ai/toolSchemas";
import { AssetCondition } from "@/types/asset";
import { RoadSurfaceType, TrafficVolume } from "@/types/road";
import type {
	CreateRoadArgs,
	UpdateRoadArgs,
	UpdateRoadByArgs,
	DeleteAssetArgs,
	DeleteRoadByArgs,
	FindAssetArgs,
} from "./ai/toolSchemas";

interface AIServiceOptions {
	proxyBaseUrl: string;
	assistantId?: string;
}

export interface AITextResponse {
	type: "text";
	messages: string[];
}

export interface AIProposedAction<TArgs = unknown> {
	type: "tool_proposal";
	summary: string;
	toolCall: ToolCall<TArgs>;
}

export type AIResponse = AITextResponse | AIProposedAction;

interface ProxyRunResponse {
	content: string[];
	toolCalls?: ToolCall[];
}

export interface ConversationTurn {
  role: "user" | "assistant";
  content: string;
}

interface FetchResponse {
	ok: boolean;
	status: number;
	json: () => Promise<ProxyRunResponse>;
	text: () => Promise<string>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return !!value && typeof value === "object";
}

function isAssetCondition(value: unknown): value is AssetCondition {
	return value === AssetCondition.GOOD || value === AssetCondition.FAIR || value === AssetCondition.POOR;
}

function isRoadSurfaceType(value: unknown): value is RoadSurfaceType {
	return (
		value === RoadSurfaceType.ASPHALT ||
		value === RoadSurfaceType.CONCRETE ||
		value === RoadSurfaceType.GRAVEL ||
		value === RoadSurfaceType.DIRT ||
		value === RoadSurfaceType.PAVER ||
		value === RoadSurfaceType.OTHER
	);
}

function isTrafficVolume(value: unknown): value is TrafficVolume {
	return (
		value === TrafficVolume.LOW ||
		value === TrafficVolume.MEDIUM ||
		value === TrafficVolume.HIGH ||
		value === TrafficVolume.VERY_HIGH
	);
}

function isFiniteNumber(value: unknown): value is number {
	return typeof value === "number" && Number.isFinite(value);
}

function parsePartialCreateRoadArgs(value: unknown): Partial<CreateRoadArgs> | null {
	if (!isRecord(value)) return null;
	const out: Partial<CreateRoadArgs> = {};

	if (typeof value.name === "string") out.name = value.name;
	if (typeof value.location === "string") out.location = value.location;
	if (typeof value.notes === "string") out.notes = value.notes;
	if (typeof value.qrTagId === "string") out.qrTagId = value.qrTagId;

	if (value.condition !== undefined) {
		if (!isAssetCondition(value.condition)) return null;
		out.condition = value.condition;
	}
	if (value.surfaceType !== undefined) {
		if (!isRoadSurfaceType(value.surfaceType)) return null;
		out.surfaceType = value.surfaceType;
	}
	if (value.trafficVolume !== undefined) {
		if (!isTrafficVolume(value.trafficVolume)) return null;
		out.trafficVolume = value.trafficVolume;
	}

	if (value.length !== undefined) {
		if (!isFiniteNumber(value.length)) return null;
		out.length = value.length;
	}
	if (value.width !== undefined) {
		if (!isFiniteNumber(value.width)) return null;
		out.width = value.width;
	}
	if (value.lanes !== undefined) {
		if (!isFiniteNumber(value.lanes)) return null;
		out.lanes = value.lanes;
	}
	if (value.speedLimit !== undefined) {
		if (!isFiniteNumber(value.speedLimit)) return null;
		out.speedLimit = value.speedLimit;
	}

	return out;
}

function parseCreateRoadArgs(value: unknown): CreateRoadArgs | null {
	if (!isRecord(value)) return null;
	if (typeof value.name !== "string") return null;
	if (!isAssetCondition(value.condition)) return null;
	if (!isRoadSurfaceType(value.surfaceType)) return null;
	if (!isTrafficVolume(value.trafficVolume)) return null;

	const base: CreateRoadArgs = {
		name: value.name,
		condition: value.condition,
		surfaceType: value.surfaceType,
		trafficVolume: value.trafficVolume,
	};

	const partial = parsePartialCreateRoadArgs(value);
	if (!partial) return null;
	return { ...base, ...partial };
}

function parseUpdateRoadArgs(value: unknown): UpdateRoadArgs | null {
	if (!isRecord(value)) return null;
	if (typeof value._id !== "string") return null;
	const fields = parsePartialCreateRoadArgs(value.fields);
	if (!fields) return null;
	return { _id: value._id, fields };
}

function parseUpdateRoadByArgs(value: unknown): UpdateRoadByArgs | null {
	if (!isRecord(value)) return null;
	const by = value.by;
	if (by !== "id" && by !== "name" && by !== "nameContains" && by !== "qrTagId" && by !== "search") return null;
	if (typeof value.value !== "string") return null;
	if (value.limit !== undefined && !isFiniteNumber(value.limit)) return null;
	const fields = parsePartialCreateRoadArgs(value.fields);
	if (!fields) return null;
	return { by, value: value.value, limit: value.limit as number | undefined, fields };
}

function parseDeleteAssetArgs(value: unknown): DeleteAssetArgs | null {
	if (!isRecord(value)) return null;
	if (typeof value._id !== "string") return null;
	if (value.type !== "Road" && value.type !== "Vehicle") return null;
	return { _id: value._id, type: value.type };
}

function parseDeleteRoadByArgs(value: unknown): DeleteRoadByArgs | null {
	if (!isRecord(value)) return null;
	const by = value.by;
	if (by !== "id" && by !== "name" && by !== "nameContains" && by !== "qrTagId" && by !== "search") return null;
	if (typeof value.value !== "string") return null;
	if (value.limit !== undefined && !isFiniteNumber(value.limit)) return null;
	return { by, value: value.value, limit: value.limit as number | undefined };
}

function parseFindAssetArgs(value: unknown): FindAssetArgs | null {
	if (!isRecord(value)) return null;
	const by = value.by;
	if (by !== "id" && by !== "name" && by !== "nameContains" && by !== "qrTagId" && by !== "search") return null;
	if (typeof value.value !== "string") return null;
	if (value.type !== undefined && value.type !== "Road" && value.type !== "Vehicle") return null;
	if (value.limit !== undefined && !isFiniteNumber(value.limit)) return null;
	return {
		by,
		value: value.value,
		type: value.type as "Road" | "Vehicle" | undefined,
		limit: value.limit as number | undefined,
	};
}

export class AIService {
	private proxyBaseUrl: string;
	private assistantId?: string;

	constructor(options: AIServiceOptions) {
		this.proxyBaseUrl = (options.proxyBaseUrl || "").trim();
		this.assistantId = options.assistantId;
	}

	private async fetchWithTimeout(
		input: RequestInfo | URL,
		init: RequestInit | undefined,
		timeoutMs = 20000
	): Promise<FetchResponse> {
		const controller = new AbortController();
		const id = setTimeout(() => controller.abort(), timeoutMs);
		try {
			const res = await fetch(input, { ...(init ?? {}), signal: controller.signal });
			return res;
		} finally {
			clearTimeout(id);
		}
	}

	async checkOnline(timeoutMs = 3000): Promise<boolean> {
		try {
			const res = await this.fetchWithTimeout(this.proxyBaseUrl, { method: "OPTIONS" }, timeoutMs);
			return res.ok || res.status === 204 || res.status === 405;
		} catch {
			return false;
		}
	}

	async sendPromptAndPropose(prompt: string, history?: ConversationTurn[]): Promise<AIResponse> {
		try {
			const res = await this.fetchWithTimeout(this.proxyBaseUrl, {
			method: "POST",
				// mode is ignored in native, used by web
				mode: "cors",
				headers: { "Content-Type": "application/json", Accept: "application/json" },
				body: JSON.stringify({ prompt, assistantId: this.assistantId, history }),
			}, 20000);
		if (!res.ok) {
				let text = "";
				try {
					text = await res.text();
					console.error("[AIService] API error response:", res.status, text.slice(0, 500));
				} catch {}
				const msg = `Assistant request failed (${res.status})`;
				return { type: "text", messages: text ? [msg, text.slice(0, 300)] : [msg] };
		}
		const data: ProxyRunResponse = await res.json();
		console.log("[AIService] Response received:", JSON.stringify(data).slice(0, 500));
		
		if (data.toolCalls && data.toolCalls.length > 0) {
			console.log("[AIService] Tool calls detected:", data.toolCalls.length);
			const first = data.toolCalls[0];
			const toolName = first.name?.replace(/_/g, " ") || "action";
			const defaultSummary = `I'll ${toolName} for you.`;
			return {
				type: "tool_proposal",
				summary: data.content?.[0] ?? defaultSummary,
				toolCall: first,
			};
		}
		
		const messages = data.content ?? [];
		console.log("[AIService] No tool calls, returning text response with", messages.length, "messages");
		if (messages.length === 0) {
			console.warn("[AIService] Empty response from API - this might indicate an error");
		}
		return { type: "text", messages };
		} catch (e) {
			const message = (e instanceof Error && e.message) ? e.message : String(e);
			// one light retry for transient network errors
			try {
				const res = await this.fetchWithTimeout(this.proxyBaseUrl, {
					method: "POST",
					mode: "cors",
					headers: { "Content-Type": "application/json", Accept: "application/json" },
					body: JSON.stringify({ prompt, assistantId: this.assistantId, history }),
				}, 20000);
				if (res.ok) {
					const data: ProxyRunResponse = await res.json();
					if (data.toolCalls && data.toolCalls.length > 0) {
						const first = data.toolCalls[0];
						const toolName = first.name?.replace(/_/g, " ") || "action";
						const defaultSummary = `I'll ${toolName} for you.`;
						return {
							type: "tool_proposal",
							summary: data.content?.[0] ?? defaultSummary,
							toolCall: first,
						};
					}
					return { type: "text", messages: data.content ?? [] };
				}
			} catch {}
			return { type: "text", messages: [`Network error contacting assistant`, message] };
		}
	}

  async applyToolCall(
    call: ToolCall
  ): Promise<{ success: boolean; message: string; data?: unknown }> {
		switch (call.name as ToolName) {
			case "create_road":
				{
					const args = parseCreateRoadArgs(call.arguments);
					if (!args) return { success: false, message: "Invalid arguments for create_road" };
					return await applyCreateRoad(args);
				}
			case "update_road":
				{
					const args = parseUpdateRoadArgs(call.arguments);
					if (!args) return { success: false, message: "Invalid arguments for update_road" };
					return await applyUpdateRoad(args);
				}
			case "update_road_by":
				{
					const args = parseUpdateRoadByArgs(call.arguments);
					if (!args) return { success: false, message: "Invalid arguments for update_road_by" };
					return await applyUpdateRoadBy(args);
				}
			case "delete_asset":
				{
					const args = parseDeleteAssetArgs(call.arguments);
					if (!args) return { success: false, message: "Invalid arguments for delete_asset" };
					return await applyDeleteAsset(args);
				}
			case "delete_road_by":
				{
					const args = parseDeleteRoadByArgs(call.arguments);
					if (!args) return { success: false, message: "Invalid arguments for delete_road_by" };
					return await applyDeleteRoadBy(args);
				}
			case "find_asset":
				{
					const args = parseFindAssetArgs(call.arguments);
					if (!args) return { success: false, message: "Invalid arguments for find_asset" };
					return await applyFindAsset(args);
				}
			default:
				return { success: false, message: "Unsupported tool" };
		}
	}
}
