// Minimal serverless-compatible proxy for OpenAI tool-calling
// Deploy as a serverless function (e.g., Vercel/Supabase/Cloudflare) and set OPENAI_API_KEY

import { TOOL_DEFINITIONS, parseToolArguments } from "./tools";

declare const process: { env: Record<string, string | undefined> };

export interface ProxyRequestBody {
  prompt: string;
  assistantId?: string;
}

export default async function handler(req: Request): Promise<Response> {
  // Reject non-POST requests and ensure the proxy has the credentials it needs
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return new Response("Missing OPENAI_API_KEY", { status: 500 });

  const body = (await req.json()) as ProxyRequestBody;
  const prompt = body.prompt?.toString() ?? "";
  if (!prompt) return new Response(JSON.stringify({ content: ["Empty prompt"] }), { status: 400 });

  // Build the request payload for the OpenAI Responses API
  const payload: Record<string, unknown> = {
    input: prompt,
    tools: TOOL_DEFINITIONS,
    tool_choice: "auto",
  };

  if (body.assistantId) {
    payload.assistant_id = body.assistantId;
  } else {
    payload.model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
  }

  // Call OpenAI with the prompt and tool definitions
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    return new Response(JSON.stringify({ content: ["Upstream error", text] }), { status: 502 });
  }

  const data = await response.json();

  // Normalize the OpenAI output into { content: string[], toolCalls?: ... }
  const content: string[] = [];
  const toolCalls: Array<{ name: string; arguments: unknown }> = [];

  const outputs = data.output ?? data.choices ?? [];
  const items = Array.isArray(outputs) ? outputs : [outputs];
  for (const item of items) {
    const contentArr = item.content ?? item.message?.content ?? [];
    for (const c of contentArr) {
      if ((c.type === "output_text" || c.type === "text") && typeof c.text === "string") {
        content.push(c.text);
      }
      if (c.type === "tool_call") {
        toolCalls.push({ name: c.name, arguments: parseToolArguments(c.arguments) });
      }
    }
  }

  return new Response(JSON.stringify({ content, toolCalls }), {
    headers: { "Content-Type": "application/json" },
  });
}
