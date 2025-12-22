import { TOOL_DEFINITIONS, parseToolArguments } from "../server/tools";

export const config = {
  runtime: "edge",
};

const GUIDANCE =
  "You are an assistant for an asset management app that manages roads, vehicles, bridges, sidewalks, street lights, traffic signals, and other assets. " +
  "IMPORTANT: Do not run long back-and-forth questioning. The UI shows a draft form for the user to confirm missing required fields. " +
  "Each time you respond, include a single-line DRAFT_JSON: {...} with any fields you inferred (even partial). " +
  "If required fields are missing, list them once and stop; do not ask multiple sequential questions. " +
  "When the user wants to find, search, or retrieve assets, use the find_asset tool immediately. " +
  "When the user wants to create an asset, use create_road (for roads) with the provided details. " +
  "When the user wants to update a road but they provide a name/QR tag (not an ID), prefer update_road_by (by=name|qrTagId|search) instead of update_road. " +
  "When the user wants to update a road and they provide an exact asset ID, use update_road with the asset ID and fields to update. " +
  "When the user wants to delete a road but they provide a name/QR tag (not an ID), prefer delete_road_by (by=name|qrTagId|search) instead of delete_asset. " +
  "When the user wants to delete an asset and they provide an exact asset ID, use delete_asset with the asset ID and type. " +
  "Use tools proactively - don't ask clarifying questions unless the user's intent is genuinely unclear. " +
  "For find/search queries, use find_asset with by='search' to search across all fields. " +
  "If the user asks for 'any road', 'all roads', or similar generic queries, use find_asset with by='search', value='', and type='Road'. " +
  "If the user asks for 'one road', 'a single road', or 'just one', use find_asset with by='search', value='', type='Road', and limit=1. " +
  "Be concise and action-oriented.";

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
      payload.assistant_id = body.assistantId;
      console.log("[assistantProxy] Using assistant_id:", body.assistantId);
      console.log(
        "[assistantProxy] NOTE: If assistant has custom instructions, they may override GUIDANCE"
      );
      console.log(
        "[assistantProxy] To use our instructions, update the assistant in OpenAI dashboard or remove assistantId"
      );
    } else {
      payload.model = process.env.OPENAI_MODEL || "gpt-4o-mini";
      console.log("[assistantProxy] Using model directly:", payload.model);
      console.log("[assistantProxy] Our GUIDANCE will be used");
    }

    console.log("[assistantProxy] Tool definitions:", TOOL_DEFINITIONS.length, "tools");
    TOOL_DEFINITIONS.forEach((tool, i) => {
      const desc = tool.description;
      console.log(
        `[assistantProxy] Tool ${i + 1}:`,
        tool.name,
        "-",
        typeof desc === "string" ? desc.slice(0, 50) : "no description"
      );
    });
    console.log("[assistantProxy] Tool choice:", payload.tool_choice);
    console.log("[assistantProxy] First 200 chars of GUIDANCE:", GUIDANCE.slice(0, 200));
    console.log("[assistantProxy] Payload keys:", Object.keys(payload));

    // Upstream fetch with timeout
    const controller = new AbortController();
    const timeoutMs = Number(process.env.OPENAI_TIMEOUT_MS || 20000);
    const timeoutId = setTimeout(() => controller.abort("timeout"), timeoutMs);
    let upstream: Response;
    try {
      console.log("[assistantProxy] Calling OpenAI API...");
      upstream = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      console.log("[assistantProxy] OpenAI API responded with status:", upstream.status);
    } catch (err) {
      console.error("[assistantProxy] Upstream fetch failed", String(err));
      clearTimeout(timeoutId);
      return new Response(JSON.stringify({ content: ["Upstream timeout or network error"] }), {
        status: 504,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!upstream.ok) {
      const text = await upstream.text();
      console.error("[assistantProxy] Upstream error", upstream.status, text.slice(0, 1000));
      return new Response(JSON.stringify({ content: ["Upstream error", text.slice(0, 300)] }), {
        status: 502,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    console.log("[assistantProxy] Upstream response OK, parsing JSON...");
    let data;
    try {
      const responseText = await upstream.text();
      console.log("[assistantProxy] Raw response length:", responseText.length);
      console.log("[assistantProxy] Raw response preview:", responseText.slice(0, 1000));
      data = JSON.parse(responseText);
      console.log("[assistantProxy] JSON parsed successfully");
    } catch (parseError) {
      console.error("[assistantProxy] Failed to parse JSON response:", parseError);
      return new Response(JSON.stringify({ content: ["Failed to parse API response"] }), {
        status: 502,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const content: string[] = [];
    const toolCalls: Array<{ name: string; arguments: unknown }> = [];

    console.log("[assistantProxy] Full response keys:", Object.keys(data));

    if (data.text && typeof data.text === "string") {
      console.log("[assistantProxy] data.text:", data.text.slice(0, 200));
      content.push(data.text);
    }

    if (data.output) {
      console.log(
        "[assistantProxy] data.output type:",
        typeof data.output,
        Array.isArray(data.output) ? `array[${data.output.length}]` : ""
      );
      if (Array.isArray(data.output) && data.output.length > 0) {
        console.log("[assistantProxy] data.output[0] keys:", Object.keys(data.output[0]));
        console.log(
          "[assistantProxy] data.output[0]:",
          JSON.stringify(data.output[0], null, 2).slice(0, 1500)
        );
      }
    }

    const outputs = data.output ?? data.choices ?? data.items ?? data.response ?? [];
    const items = Array.isArray(outputs) ? outputs : [outputs];

    for (const item of items) {
      if (!item) continue;

      if (item.type === "tool_call" || (item.name && item.arguments)) {
        console.log("[assistantProxy] Tool call detected in output:", item.name);
        const toolName = item.name;
        const toolArgs = item.arguments;
        if (toolName) {
          toolCalls.push({ name: toolName, arguments: parseToolArguments(toolArgs) });
        }
        continue;
      }

      const contentArr = item.content ?? item.message?.content ?? item.parts ?? item.text ?? [];

      if (typeof contentArr === "string") {
        content.push(contentArr);
      } else if (Array.isArray(contentArr)) {
        for (const c of contentArr) {
          if (typeof c === "string") {
            content.push(c);
          } else if (c && typeof c === "object") {
            if (
              (c.type === "output_text" || c.type === "text" || c.type === "text_delta") &&
              typeof c.text === "string"
            ) {
              content.push(c.text);
            }
            if (c.type === "tool_call" || c.type === "function") {
              console.log("[assistantProxy] Tool call detected:", c.name || c.function?.name);
              const toolName = c.name || c.function?.name;
              const toolArgs = c.arguments || c.function?.arguments || c.input;
              if (toolName) {
                toolCalls.push({ name: toolName, arguments: parseToolArguments(toolArgs) });
              }
            }
          }
        }
      }

      if (item.tool_calls && Array.isArray(item.tool_calls)) {
        for (const tc of item.tool_calls) {
          console.log(
            "[assistantProxy] Tool call in tool_calls array:",
            tc.function?.name || tc.name
          );
          const toolName = tc.function?.name || tc.name;
          const toolArgs = tc.function?.arguments || tc.arguments || tc.input;
          if (toolName) {
            toolCalls.push({ name: toolName, arguments: parseToolArguments(toolArgs) });
          }
        }
      }
    }

    if (data.tool_calls && Array.isArray(data.tool_calls)) {
      console.log("[assistantProxy] Found tool_calls at root level:", data.tool_calls.length);
      for (const tc of data.tool_calls) {
        console.log("[assistantProxy] Tool call at root level:", tc.function?.name || tc.name);
        const toolName = tc.function?.name || tc.name;
        const toolArgs = tc.function?.arguments || tc.arguments || tc.input;
        if (toolName) {
          toolCalls.push({ name: toolName, arguments: parseToolArguments(toolArgs) });
        }
      }
    } else {
      console.log("[assistantProxy] No tool_calls at root level");
    }

    console.log("[assistantProxy] Checking for tool calls in output items...");
    for (const item of items) {
      if (item && typeof item === "object") {
        const itemKeys = Object.keys(item);
        console.log("[assistantProxy] Item keys:", itemKeys);
        if (item.tool_calls) {
          console.log("[assistantProxy] Found tool_calls in item:", item.tool_calls.length);
        }
        if (item.tool_calls && Array.isArray(item.tool_calls)) {
          for (const tc of item.tool_calls) {
            console.log("[assistantProxy] Tool call in item:", tc.function?.name || tc.name);
            const toolName = tc.function?.name || tc.name;
            const toolArgs = tc.function?.arguments || tc.arguments || tc.input;
            if (toolName && !toolCalls.find((t) => t.name === toolName)) {
              toolCalls.push({ name: toolName, arguments: parseToolArguments(toolArgs) });
            }
          }
        }
      }
    }

    console.log(
      "[assistantProxy] Extracted:",
      content.length,
      "content items,",
      toolCalls.length,
      "tool calls"
    );
    if (content.length > 0) {
      console.log("[assistantProxy] Content preview:", content.slice(0, 2));
    }
    if (toolCalls.length > 0) {
      console.log(
        "[assistantProxy] Tool call payload preview:",
        JSON.stringify(toolCalls[0]).slice(0, 500)
      );
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
