// Minimal serverless-compatible proxy for OpenAI tool-calling
// Deploy as a serverless function (e.g., Vercel/Supabase/Cloudflare) and set OPENAI_API_KEY

export interface ProxyRequestBody {
	prompt: string;
	assistantId?: string;
}

const CREATE_ROAD_TOOL = {
	type: "function",
	name: "create_road",
	parameters: {
		type: "object",
		required: ["name", "condition", "surfaceType", "trafficVolume"],
		properties: {
			name: { type: "string" },
			location: { type: "string" },
			condition: { type: "string", enum: ["good", "fair", "poor"] },
			notes: { type: "string" },
			qrTagId: { type: "string" },
			surfaceType: { type: "string", enum: ["asphalt", "concrete", "gravel", "dirt", "paver", "other"] },
			trafficVolume: { type: "string", enum: ["low", "medium", "high", "very_high"] },
			length: { type: "number" },
			width: { type: "number" },
			lanes: { type: "integer" },
			speedLimit: { type: "integer" },
		},
	},
};

export default async function handler(req: Request): Promise<Response> {
	if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
	const apiKey = process.env.OPENAI_API_KEY;
	if (!apiKey) return new Response("Missing OPENAI_API_KEY", { status: 500 });

	const body = (await req.json()) as ProxyRequestBody;
	const prompt = body.prompt?.toString() ?? "";
	if (!prompt) return new Response(JSON.stringify({ content: ["Empty prompt"] }), { status: 400 });

	// Use Responses API with tool definitions
	const response = await fetch("https://api.openai.com/v1/responses", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`,
		},
		body: JSON.stringify({
			model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
			input: prompt,
			tools: [CREATE_ROAD_TOOL],
		})
	});

	if (!response.ok) {
		const text = await response.text();
		return new Response(JSON.stringify({ content: ["Upstream error", text] }), { status: 502 });
	}

	const data = await response.json();

	// Normalize into { content: string[], toolCalls?: { name, arguments }[] }
	const content: string[] = [];
	const toolCalls: Array<{ name: string; arguments: unknown }> = [];

	const outputs = data.output ?? data.choices ?? [];
	const items = Array.isArray(outputs) ? outputs : [outputs];
	for (const item of items) {
		const contentArr = item.content ?? item.message?.content ?? [];
		for (const c of contentArr) {
			if (c.type === "output_text" || c.type === "text") {
				if (c.text) content.push(c.text);
			}
			if (c.type === "tool_call") {
				toolCalls.push({ name: c.name, arguments: c.arguments });
			}
		}
	}

	return new Response(JSON.stringify({ content, toolCalls }), {
		headers: { "Content-Type": "application/json" },
	});
}




