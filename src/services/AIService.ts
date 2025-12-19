import {
	applyCreateRoad,
	applyDeleteAsset,
	applyDeleteRoadBy,
	applyFindAsset,
	applyUpdateRoad,
	applyUpdateRoadBy,
} from "./ai/handlers";
import { ToolCall, ToolName } from "./ai/toolSchemas";

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

export class AIService {
	private proxyBaseUrl: string;
	private assistantId?: string;

	constructor(options: AIServiceOptions) {
		this.proxyBaseUrl = (options.proxyBaseUrl || "").trim();
		this.assistantId = options.assistantId;
	}

	private async fetchWithTimeout(input: RequestInfo | URL, init: any, timeoutMs = 20000): Promise<Response> {
		const controller = new AbortController();
		const id = setTimeout(() => controller.abort(), timeoutMs);
		try {
			const res = await fetch(input, { ...(init || {}), signal: controller.signal });
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
				mode: "cors" as any,
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
					mode: "cors" as any,
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
				return await applyCreateRoad(call.arguments as any);
			case "update_road":
				return await applyUpdateRoad(call.arguments as any);
			case "update_road_by":
				return await applyUpdateRoadBy(call.arguments as any);
			case "delete_asset":
				return await applyDeleteAsset(call.arguments as any);
			case "delete_road_by":
				return await applyDeleteRoadBy(call.arguments as any);
			case "find_asset":
				return await applyFindAsset(call.arguments as any);
			default:
				return { success: false, message: "Unsupported tool" };
		}
	}
}
