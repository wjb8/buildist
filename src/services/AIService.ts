import { applyCreateRoad, applyDeleteAsset, applyFindAsset, applyUpdateRoad } from "./ai/handlers";
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

export class AIService {
	private proxyBaseUrl: string;
	private assistantId?: string;

	constructor(options: AIServiceOptions) {
		this.proxyBaseUrl = options.proxyBaseUrl;
		this.assistantId = options.assistantId;
	}

	async sendPromptAndPropose(prompt: string): Promise<AIResponse> {
		const res = await fetch(this.proxyBaseUrl, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ prompt, assistantId: this.assistantId }),
		});
		if (!res.ok) {
			return { type: "text", messages: ["Assistant request failed."] };
		}
		const data: ProxyRunResponse = await res.json();
		if (data.toolCalls && data.toolCalls.length > 0) {
			// For now, take the first proposed action
			const first = data.toolCalls[0];
			return {
				type: "tool_proposal",
				summary: data.content?.[0] ?? "Proposed change",
				toolCall: first,
			};
		}
		return { type: "text", messages: data.content ?? [] };
	}

	async applyToolCall(call: ToolCall): Promise<{ success: boolean; message: string; data?: unknown }> {
		switch (call.name as ToolName) {
			case "create_road":
				return await applyCreateRoad(call.arguments as any);
			case "update_road":
				return await applyUpdateRoad(call.arguments as any);
			case "delete_asset":
				return await applyDeleteAsset(call.arguments as any);
			case "find_asset":
				return await applyFindAsset(call.arguments as any);
			default:
				return { success: false, message: "Unsupported tool" };
		}
	}
}



