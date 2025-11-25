import { TOOL_DEFINITIONS, parseToolArguments } from "../server/tools";

export const config = {
  runtime: "edge",
};

const GUIDANCE =
  "You are an assistant for an asset management app. " +
  "If required fields for a tool are missing, ask ONE short follow-up question at a time to gather them. " +
  "Do NOT restate previously collected values; just ask the next question or propose the action. " +
  "When you have enough information, propose exactly one tool call with arguments that match the tool's JSON schema. " +
  "Always include a single line at the END that starts with DRAFT_JSON: followed by a compact JSON object " +
  "containing the fields you have collected so far for a potential create_road action. Only include known fields. " +
  'Example: DRAFT_JSON: {"name":"Main St","condition":"good","surfaceType":"asphalt","trafficVolume":"low"}. ' +
  "Be concise.";

interface ProxyRequestBody {
  prompt: string;
  assistantId?: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
}

export default async function handler(req: Request): Promise<Response> {
  try {
    // Basic CORS handling for web/preview environments
    if (req.method === "OPTIONS") {
      const requestHeaders =
        req.headers.get("access-control-request-headers") || "Content-Type, Authorization, Accept";
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": requestHeaders,
          "Access-Control-Max-Age": "86400",
          Vary: "Origin, Access-Control-Request-Headers, Access-Control-Request-Method",
        },
      });
    }
    if (req.method !== "POST") {
      return new Response("Method not allowed", {
        status: 405,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    const apiKey: string | undefined = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("[assistantProxy] Missing OPENAI_API_KEY");
      return new Response(JSON.stringify({ content: ["Missing OPENAI_API_KEY"] }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    let body: ProxyRequestBody | undefined;
    try {
      body = (await req.json()) as ProxyRequestBody;
    } catch {
      body = { prompt: "" };
    }

    const prompt = body?.prompt?.toString() ?? "";
    if (!prompt) {
      return new Response(JSON.stringify({ content: ["Empty prompt"] }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }
    console.log("[assistantProxy] Prompt received:", prompt.slice(0, 120));

    const historyText =
      Array.isArray(body?.history) && body!.history.length > 0
        ? body!.history
            .slice(-8)
            .map((m) => `${m.role === "assistant" ? "Assistant" : "User"}: ${m.content}`)
            .join("\n")
        : "";
    const composedInput = historyText ? `${historyText}\nUser: ${prompt}` : prompt;

    const payload: Record<string, unknown> = {
      input: composedInput,
      instructions: GUIDANCE,
      tools: TOOL_DEFINITIONS,
      tool_choice: "auto",
    };
    if (body?.assistantId) {
      (payload as any).assistant_id = body.assistantId;
    } else {
      (payload as any).model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
    }

    // Upstream fetch with timeout
    const controller = new AbortController();
    const timeoutMs = Number(process.env.OPENAI_TIMEOUT_MS || 20000);
    const timeoutId = setTimeout(() => controller.abort("timeout"), timeoutMs);
    let upstream: Response;
    try {
      upstream = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } catch (err) {
      console.error("[assistantProxy] Upstream fetch failed", String(err));
      return new Response(JSON.stringify({ content: ["Upstream timeout or network error"] }), {
        status: 504,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!upstream.ok) {
      const text = await upstream.text();
      console.error("[assistantProxy] Upstream error", upstream.status, text);
      return new Response(JSON.stringify({ content: ["Upstream error", text] }), {
        status: 502,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const data = await upstream.json();

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
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (error) {
    console.error("[assistantProxy] Unhandled error", error);
    return new Response(JSON.stringify({ content: ["Proxy error", String(error)] }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
}
