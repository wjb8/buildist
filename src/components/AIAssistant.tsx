import { useMemo, useState } from "react";
import { ActivityIndicator, ScrollView } from "react-native";
import { View } from "./View";
import { Text } from "./Text";
import { Input } from "./Input";
import { Button } from "./Button";
import { Card } from "./Card";
import DraftRoadForm from "./ai/DraftRoadForm";
import { layoutStyles, spacing, colors } from "../styles";
import { AI_PROXY_BASE_URL, OPENAI_ASSISTANT_ID } from "../config/ai";
import { AIProposedAction, AIService, ConversationTurn } from "../services/AIService";
import type { ToolCall } from "../services/ai/toolSchemas";
import type { CreateRoadArgs } from "../services/ai/toolSchemas";
import {
  RoadDraftFields,
  buildCreateRoadArgsFromDraft,
  buildUpdateRoadFieldsFromDraft,
  normalizeRoadDraftFields,
  normalizeString,
} from "../services/ai/draftRoad";

interface AIAssistantProps {
  onActionApplied?: (result: { success: boolean; message: string }) => void;
  onClose?: () => void;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object";
}

function cleanMessages(raw: string[]): string[] {
  const cleaned: string[] = [];
  for (const msg of raw) {
    const parts = msg.split("\n");
    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed || trimmed.startsWith("DRAFT_JSON:")) continue;
      if (cleaned[cleaned.length - 1] === trimmed) continue;
      cleaned.push(trimmed);
    }
  }
  return cleaned;
}

function tryExtractDraft(lines: string[]): Record<string, unknown> | null {
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    const idx = line.indexOf("DRAFT_JSON:");
    if (idx < 0) continue;
    const jsonPart = line.slice(idx + "DRAFT_JSON:".length).trim();
    try {
      const parsed = JSON.parse(jsonPart);
      if (isRecord(parsed)) {
        const fieldsCandidate = isRecord(parsed.fields) ? parsed.fields : parsed;
        return fieldsCandidate;
      }
    } catch {}
  }
  return null;
}

function inferIntent(value?: string): RoadDraftFields["intent"] | undefined {
  if (!value) return undefined;
  const v = value.toLowerCase();
  if (v.includes("delete") || v.includes("remove")) return "delete";
  if (v.includes("update") || v.includes("edit") || v.includes("change")) return "update";
  if (v.includes("find") || v.includes("search") || v.includes("show") || v.includes("list"))
    return "find";
  if (v.includes("create") || v.includes("add") || v.includes("new")) return "create";
  return undefined;
}

function displayProposalArgs(toolCall: ToolCall<unknown>) {
  const args = toolCall.arguments;
  if (!isRecord(args)) return args;

  if (toolCall.name === "update_road" && typeof args._id === "string") {
    return { ...args, _id: "<selected road>" };
  }
  if (toolCall.name === "delete_asset" && typeof args._id === "string") {
    return { ...args, _id: "<selected road>" };
  }
  return args;
}

export default function AIAssistant({ onActionApplied, onClose }: AIAssistantProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [proposal, setProposal] = useState<AIProposedAction | null>(null);
  const [history, setHistory] = useState<ConversationTurn[]>([]);
  const [draftFields, setDraftFields] = useState<RoadDraftFields>({});
  const [showOptionalRoadFields, setShowOptionalRoadFields] = useState(false);
  const [lastSearchResults, setLastSearchResults] = useState<any[]>([]);
  const [lastUserPrompt, setLastUserPrompt] = useState("");

  const ai = useMemo(
    () => new AIService({ proxyBaseUrl: AI_PROXY_BASE_URL, assistantId: OPENAI_ASSISTANT_ID }),
    [AI_PROXY_BASE_URL, OPENAI_ASSISTANT_ID]
  );

  const reset = () => {
    setPrompt("");
    setMessages([]);
    setProposal(null);
    setHistory([]);
    setDraftFields({});
    setLastSearchResults([]);
    setShowOptionalRoadFields(false);
    setLastUserPrompt("");
  };

  const handleSend = async () => {
    if (!prompt.trim()) return;
    try {
      const online = await ai.checkOnline(3000);
      if (!online) {
        setMessages((prev) => [...prev, "You're offline. Please check your connection."]);
        return;
      }
    } catch {}

    setLoading(true);
    setLoadingMessage("Processing your request...");
    setProposal(null);
    setLastSearchResults([]);

    try {
      const text = prompt.trim();
      setLastUserPrompt(text);
      setPrompt("");

      const nextHistory = [...history, { role: "user" as const, content: text }];
      const res = await ai.sendPromptAndPropose(text, nextHistory);
      setLoadingMessage(null);

      if (res.type === "tool_proposal") {
        setProposal(res);
        const summaryLines = cleanMessages([res.summary || "Ready. Review the details and Apply."]);
        if (summaryLines.length > 0) setMessages(summaryLines);
        setHistory([...nextHistory, { role: "assistant" as const, content: res.summary }]);
        return;
      }

      const newMessages = cleanMessages(res.messages);
      setMessages(newMessages.length > 0 ? newMessages : ["(No response text)"]);

      const extracted = tryExtractDraft(res.messages);
      if (extracted) {
        setDraftFields((prev) => ({
          ...prev,
          ...normalizeRoadDraftFields(extracted),
          intent: prev.intent ?? inferIntent(text) ?? inferIntent(res.messages.join(" ")),
        }));
      } else {
        const nextIntent = inferIntent(text) ?? inferIntent(res.messages.join(" "));
        if (nextIntent) setDraftFields((prev) => ({ ...prev, intent: prev.intent ?? nextIntent }));
      }

      setHistory([
        ...nextHistory,
        { role: "assistant" as const, content: res.messages.join("\n") },
      ]);
    } catch {
      setLoadingMessage(null);
      setMessages(["Failed to contact assistant."]);
    } finally {
      setLoading(false);
      setLoadingMessage(null);
    }
  };

  const handleApply = async () => {
    if (!proposal) return;
    setLoading(true);
    setLoadingMessage("Applying action...");
    try {
      const result = await ai.applyToolCall(proposal.toolCall as ToolCall);
      const resultMessage = (result.success ? "Success: " : "Error: ") + result.message;

      if (Array.isArray(result.data) && result.data.length > 0) {
        setLastSearchResults(result.data);
      } else {
        setLastSearchResults([]);
      }

      setMessages([resultMessage]);
      setProposal(null);

      if (onActionApplied) onActionApplied(result);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error occurred";
      setMessages((prev) => [...prev, `Error: ${message}`]);
    } finally {
      setLoading(false);
      setLoadingMessage(null);
    }
  };

  const handleDraftChange = (key: keyof CreateRoadArgs, value: unknown) => {
    setDraftFields((prev) => ({ ...prev, [key]: value }));
  };

  const proposeCreateFromDraft = () => {
    const args = buildCreateRoadArgsFromDraft(draftFields);
    if (!args) {
      setMessages(["Please fill the required Road fields below (highlighted), then click Create."]);
      return;
    }
    setProposal({
      type: "tool_proposal",
      summary: "Ready to create this road. Review and Apply.",
      toolCall: { name: "create_road", arguments: args },
    });
  };

  const proposeUpdateForRoad = (selectedRoad: any) => {
    const id = normalizeString(selectedRoad?._id);
    if (!id) {
      setMessages(["Error: Selected road is missing an _id"]);
      return;
    }

    const includeName =
      lastUserPrompt.toLowerCase().includes("rename") ||
      lastUserPrompt.toLowerCase().includes("name to");
    const fields = buildUpdateRoadFieldsFromDraft(draftFields, { includeName });
    if (Object.keys(fields).length === 0) {
      setMessages([
        "I found the road, but I don't have any update details yet. Try: “Set condition to poor” or “Update traffic volume to high”.",
      ]);
      return;
    }

    setProposal({
      type: "tool_proposal",
      summary: "Ready to update the selected road. Review and Apply.",
      toolCall: { name: "update_road", arguments: { _id: id, fields } },
    });
  };

  const proposeDeleteForRoad = (selectedRoad: any) => {
    const id = normalizeString(selectedRoad?._id);
    if (!id) {
      setMessages(["Error: Selected road is missing an _id"]);
      return;
    }
    setProposal({
      type: "tool_proposal",
      summary: "Ready to delete the selected road. Review and Apply.",
      toolCall: { name: "delete_asset", arguments: { _id: id, type: "Road" } },
    });
  };

  return (
    <ScrollView contentContainerStyle={[layoutStyles.p3, layoutStyles.pb5]}>
      <View section>
        <View row spaceBetween style={[layoutStyles.mb2]}>
          <Text variant="h3">AI Assistant</Text>
          <View row>
            <Button variant="secondary" onPress={reset} style={[layoutStyles.mr2]}>
              Reset
            </Button>
            {onClose ? (
              <Button variant="secondary" onPress={onClose}>
                Close
              </Button>
            ) : null}
          </View>
        </View>

        <Text variant="bodySmall" style={[layoutStyles.mb2]}>
          Describe what you want (Roads), then confirm details in the draft form.
        </Text>

        <Input
          placeholder="Describe what you want to do (e.g., create, update, or find an asset...)"
          value={prompt}
          onChangeText={setPrompt}
          fullWidth
          style={[layoutStyles.mb2]}
          editable={!loading}
        />

        <Button onPress={handleSend} disabled={loading || !AI_PROXY_BASE_URL}>
          {loading ? "Working..." : !AI_PROXY_BASE_URL ? "Configure AI proxy" : "Send"}
        </Button>
      </View>

      {loading && loadingMessage ? (
        <View card style={[layoutStyles.mt3]}>
          <View row center style={[layoutStyles.mb1]}>
            <ActivityIndicator
              size="small"
              color={colors.primary.main}
              style={{ marginRight: spacing.sm }}
            />
            <Text variant="bodySmall" style={{ color: colors.text.secondary }}>
              {loadingMessage}
            </Text>
          </View>
        </View>
      ) : null}

      {messages.length === 0 && !loading ? (
        <View card style={[layoutStyles.mt3]}>
          <Text variant="h4" style={[layoutStyles.mb1]}>
            Quick examples
          </Text>
          <Text variant="bodySmall" style={[layoutStyles.mb1]}>
            - “Add road Cedar Lane with poor condition”
          </Text>
          <Text variant="bodySmall" style={[layoutStyles.mb1]}>
            - “Update Main Street traffic volume to very high”
          </Text>
          <Text variant="bodySmall">- “Find roads in downtown”</Text>
        </View>
      ) : null}

      {messages.length > 0 ? (
        <View card style={[layoutStyles.mt3]}>
          {messages.map((m, i) => (
            <Text key={i} style={{ marginBottom: i < messages.length - 1 ? spacing.xs : 0 }}>
              {m}
            </Text>
          ))}
        </View>
      ) : null}

      <DraftRoadForm
        fields={draftFields}
        onChangeField={handleDraftChange}
        onToggleOptional={() => setShowOptionalRoadFields((v) => !v)}
        showOptional={showOptionalRoadFields}
        onCreate={proposeCreateFromDraft}
        disabled={loading}
      />

      {lastSearchResults.length > 0 ? (
        <View style={[layoutStyles.mt3]}>
          <Text variant="h4" style={[layoutStyles.mb2]}>
            Results ({lastSearchResults.length})
          </Text>
          {lastSearchResults.map((item: any, i: number) => (
            <Card key={item._id || i} style={[layoutStyles.mb2]}>
              <Text variant="h4" style={[layoutStyles.mb1]}>
                {item.name || item.qrTagId || item._id}
              </Text>
              {item.location ? (
                <Text
                  variant="bodySmall"
                  style={[layoutStyles.mb1, { color: colors.text.secondary }]}
                >
                  {item.location}
                </Text>
              ) : null}
              <Text variant="bodySmall" style={{ color: colors.text.secondary }}>
                Condition: {String(item.condition ?? "—")} · Surface:{" "}
                {String(item.surfaceType ?? "—")} · Traffic: {String(item.trafficVolume ?? "—")}
              </Text>

              <View row style={[layoutStyles.mt2]}>
                <Button
                  variant="secondary"
                  size="small"
                  onPress={() => proposeUpdateForRoad(item)}
                  style={[layoutStyles.mr2]}
                  disabled={loading}
                >
                  Update this road
                </Button>
                <Button
                  variant="secondary"
                  size="small"
                  onPress={() => proposeDeleteForRoad(item)}
                  disabled={loading}
                >
                  Delete this road
                </Button>
              </View>
            </Card>
          ))}
        </View>
      ) : null}

      {proposal ? (
        <View card style={[layoutStyles.mt3]}>
          <Text variant="h4" style={[layoutStyles.mb2]}>
            Proposed action
          </Text>
          <Text variant="bodySmall" style={[layoutStyles.mb2, { color: colors.text.secondary }]}>
            {proposal.toolCall.name}
          </Text>
          <View
            style={[
              layoutStyles.border1,
              layoutStyles.borderLight,
              layoutStyles.roundedMd,
              layoutStyles.p2,
              { marginBottom: spacing.sm },
            ]}
          >
            <Text variant="bodySmall" style={{ color: colors.text.secondary }}>
              {JSON.stringify(displayProposalArgs(proposal.toolCall), null, 2)}
            </Text>
          </View>
          <View row spaceBetween>
            <Button variant="secondary" onPress={() => setProposal(null)} disabled={loading}>
              Cancel
            </Button>
            <Button onPress={handleApply} disabled={loading}>
              {loading ? "Applying..." : "Apply"}
            </Button>
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}
