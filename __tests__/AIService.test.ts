import { AIService } from "@/services/AIService";

// Avoid loading realm via handlers at import-time
jest.mock("@/services/ai/handlers", () => ({
  applyCreateRoad: jest.fn(),
  applyUpdateRoad: jest.fn(),
  applyDeleteAsset: jest.fn(),
  applyFindAsset: jest.fn(),
}));

const SUCCESS_TEXT = {
  ok: true,
  status: 200,
  json: async () => ({ content: ["ok"] }),
  text: async () => "ok",
};

const SUCCESS_TOOL = {
  ok: true,
  status: 200,
  json: async () => ({
    content: ["proposed"],
    toolCalls: [{ name: "create_road", arguments: {} }],
  }),
  text: async () => "ok",
};

describe("AIService", () => {
  const url = "https://example.com/api/assistantProxy";
  const fetchMock = jest.fn();

  beforeEach(() => {
    globalThis.fetch = fetchMock;
  });

  it("returns text response on success", async () => {
    fetchMock.mockResolvedValueOnce(SUCCESS_TEXT);
    const ai = new AIService({ proxyBaseUrl: url });
    const res = await ai.sendPromptAndPropose("hello");
    expect(res.type).toBe("text");
  });

  it("returns tool proposal when toolCalls present", async () => {
    fetchMock.mockResolvedValueOnce(SUCCESS_TOOL);
    const ai = new AIService({ proxyBaseUrl: url });
    const res = await ai.sendPromptAndPropose("hello");
    expect(res.type).toBe("tool_proposal");
  });

  it("retries once on network error", async () => {
    fetchMock.mockRejectedValueOnce(new Error("network")).mockResolvedValueOnce(SUCCESS_TEXT);
    const ai = new AIService({ proxyBaseUrl: url });
    const res = await ai.sendPromptAndPropose("hello");
    expect(res.type).toBe("text");
    expect(fetchMock.mock.calls.length).toBe(2);
  });
});
