import { useMemo, useRef, useState } from "react";
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
import { AssetType } from "../types/asset";
import {
  RoadDraftFields,
  buildCreateRoadArgsFromDraft,
  buildUpdateRoadFieldsFromDraft,
  normalizeRoadDraftFields,
  normalizeString,
  validateRoadDraftForCreate,
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
    return { ...args, _id: "<selected asset>" };
  }
  return args;
}

function capitalizeWords(value: string): string {
  return value
    .split(/[_\s]+/g)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function normalizeDisplayValue(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }
  if (typeof value === "number") {
    // Avoid clutter from default zeros in optional numeric fields
    if (!Number.isFinite(value) || value === 0) return null;
    return String(value);
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function humanizeToolName(name: string): string {
  switch (name) {
    case "create_road":
      return "Create road";
    case "update_road":
      return "Update road";
    case "update_road_by":
      return "Update road (find then update)";
    case "delete_asset":
      return "Delete asset";
    case "delete_road_by":
      return "Delete road (find then delete)";
    case "find_asset":
      return "Find assets";
    default:
      return capitalizeWords(name);
  }
}

function buildProposalRows(toolCall: ToolCall<unknown>): Array<{ label: string; value: string }> {
  const args = displayProposalArgs(toolCall);
  if (!isRecord(args)) return [{ label: "Details", value: String(args) }];

  const supportedAssetFields = new Set(["name", "condition", "location", "notes", "qrTagId"]);
  const isSupportedAssetField = (key: string): boolean => supportedAssetFields.has(key);

  const add = (label: string, raw: unknown, options?: { transform?: (v: string) => string }) => {
    const v = normalizeDisplayValue(raw);
    if (!v) return;
    rows.push({ label, value: options?.transform ? options.transform(v) : v });
  };

  const rows: Array<{ label: string; value: string }> = [];

  if (toolCall.name === "create_road") {
    add("Name", args.name);
    add("Condition", args.condition, { transform: (v) => capitalizeWords(v.toLowerCase()) });
    add("Location", args.location);
    add("Notes", args.notes);
    add("QR Tag", args.qrTagId);
    return rows;
  }

  if (toolCall.name === "update_road") {
    add("Road", "<selected road>");
    const fields = isRecord(args.fields) ? args.fields : null;
    if (!fields) return rows.length > 0 ? rows : [{ label: "Fields", value: "(none)" }];
    Object.entries(fields)
      .filter(([k]) => isSupportedAssetField(k))
      .forEach(([k, v]) => add(capitalizeWords(k), v));
    return rows;
  }

  if (toolCall.name === "update_road_by") {
    add("Find by", args.by, { transform: (v) => capitalizeWords(v) });
    add("Match", args.value);
    add("Limit", args.limit);
    const fields = isRecord(args.fields) ? args.fields : null;
    if (fields)
      Object.entries(fields)
        .filter(([k]) => isSupportedAssetField(k))
        .forEach(([k, v]) => add(capitalizeWords(k), v));
    return rows;
  }

  if (toolCall.name === "delete_asset") {
    add("Type", args.type, { transform: (v) => capitalizeWords(v) });
    add("Asset", "<selected asset>");
    return rows;
  }

  if (toolCall.name === "delete_road_by") {
    add("Find by", args.by, { transform: (v) => capitalizeWords(v) });
    add("Match", args.value);
    add("Limit", args.limit);
    return rows;
  }

  if (toolCall.name === "find_asset") {
    add("Find by", args.by, { transform: (v) => capitalizeWords(v) });
    add("Query", args.value);
    add("Type", args.type, { transform: (v) => capitalizeWords(v) });
    add("Limit", args.limit);
    return rows;
  }

  return [{ label: "Details", value: JSON.stringify(args, null, 2) }];
}

export default function AIAssistant({ onActionApplied, onClose }: AIAssistantProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [proposal, setProposal] = useState<AIProposedAction | null>(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [showDraft, setShowDraft] = useState(false);
  const [history, setHistory] = useState<ConversationTurn[]>([]);
  const [draftFields, setDraftFields] = useState<RoadDraftFields>({});
  const [showOptionalRoadFields, setShowOptionalRoadFields] = useState(false);
  const [lastSearchResults, setLastSearchResults] = useState<any[]>([]);
  const [lastUserPrompt, setLastUserPrompt] = useState("");
  const requestSeqRef = useRef(0);

  const nextRequestToken = () => {
    requestSeqRef.current += 1;
    return requestSeqRef.current;
  };

  const ai = useMemo(
    () => new AIService({ proxyBaseUrl: AI_PROXY_BASE_URL, assistantId: OPENAI_ASSISTANT_ID }),
    [AI_PROXY_BASE_URL, OPENAI_ASSISTANT_ID]
  );

  const reset = () => {
    // Invalidate any in-flight request so its result can't overwrite the reset state.
    nextRequestToken();
    setPrompt("");
    setLoading(false);
    setLoadingMessage(null);
    setMessages([]);
    setProposal(null);
    setShowTechnicalDetails(false);
    setShowDraft(false);
    setHistory([]);
    setDraftFields({});
    setLastSearchResults([]);
    setShowOptionalRoadFields(false);
    setLastUserPrompt("");
  };

  const handleSend = async () => {
    if (!prompt.trim()) return;
    const requestToken = nextRequestToken();
    try {
      const online = await ai.checkOnline(3000);
      if (!online) {
        if (requestToken !== requestSeqRef.current) return;
        setMessages((prev) => [...prev, "You're offline. Please check your connection."]);
        return;
      }
    } catch {}

    if (requestToken !== requestSeqRef.current) return;
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
      if (requestToken !== requestSeqRef.current) return;
      setLoadingMessage(null);

      if (res.type === "tool_proposal") {
        setProposal(res);
        setShowTechnicalDetails(false);
        setShowDraft(false);
        const normalizedSummary = res.summary || "Ready. Review the details and Apply.";
        const summaryLines = cleanMessages([normalizedSummary]);
        if (summaryLines.length > 0) setMessages(summaryLines);
        setHistory([...nextHistory, { role: "assistant" as const, content: normalizedSummary }]);
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
      if (requestToken !== requestSeqRef.current) return;
      setLoadingMessage(null);
      setMessages(["Failed to contact assistant."]);
    } finally {
      if (requestToken !== requestSeqRef.current) return;
      setLoading(false);
      setLoadingMessage(null);
    }
  };

  const handleApply = async () => {
    if (!proposal) return;
    const requestToken = nextRequestToken();
    setLoading(true);
    setLoadingMessage("Applying action...");
    try {
      const result = await ai.applyToolCall(proposal.toolCall as ToolCall);
      if (requestToken !== requestSeqRef.current) return;
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
      if (requestToken !== requestSeqRef.current) return;
      const message = e instanceof Error ? e.message : "Unknown error occurred";
      setMessages((prev) => [...prev, `Error: ${message}`]);
    } finally {
      if (requestToken !== requestSeqRef.current) return;
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
      setShowDraft(true);
      return;
    }
    setProposal({
      type: "tool_proposal",
      summary: "Ready to create this road. Review and Apply.",
      toolCall: { name: "create_road", arguments: args },
    });
    setShowDraft(false);
  };

  const proposeUpdateForRoad = (selectedRoad: any) => {
    const id = normalizeString(selectedRoad?._id);
    if (!id) {
      setMessages(["Error: Selected road is missing an _id"]);
      return;
    }

    const selectedType = normalizeString(selectedRoad?.type)?.toLowerCase();
    if (selectedType && selectedType !== AssetType.ROAD) {
      setMessages([
        "This item isn't a road. Phase 1 only supports updating roads via the assistant (you can still delete non-road assets).",
      ]);
      return;
    }

    const checkForRenameIntent = (text: string): boolean => {
      const lower = text.toLowerCase();
      return lower.includes("rename") || lower.includes("name to");
    };

    const includeName =
      checkForRenameIntent(lastUserPrompt) ||
      history.some((turn) => turn.role === "user" && checkForRenameIntent(turn.content));
    const fields = buildUpdateRoadFieldsFromDraft(draftFields, { includeName });
    if (Object.keys(fields).length === 0) {
      setMessages([
        "I found the road, but I don't have any update details yet. Try: “Set condition to poor” or “Update notes to …”.",
      ]);
      setShowDraft(true);
      return;
    }

    setProposal({
      type: "tool_proposal",
      summary: "Ready to update the selected road. Review and Apply.",
      toolCall: { name: "update_road", arguments: { _id: id, fields } },
    });
    setShowDraft(false);
  };

  const proposeDeleteForRoad = (selectedRoad: any) => {
    const id = normalizeString(selectedRoad?._id);
    if (!id) {
      setMessages(["Error: Selected road is missing an _id"]);
      return;
    }
    const typeRaw = normalizeString(selectedRoad?.type);
    const assetType =
      typeRaw && Object.values(AssetType).includes(typeRaw as AssetType)
        ? (typeRaw as AssetType)
        : AssetType.ROAD;
    setProposal({
      type: "tool_proposal",
      summary: "Ready to delete the selected asset. Review and Apply.",
      toolCall: { name: "delete_asset", arguments: { _id: id, type: assetType } },
    });
    setShowDraft(false);
  };

  const draftValidation = validateRoadDraftForCreate(draftFields);
  const shouldPromptForDraft =
    !proposal && draftFields.intent === "create" && !draftValidation.isValidForCreate;

  return (
    <ScrollView contentContainerStyle={[layoutStyles.p3, layoutStyles.pb5]}>
      <View section>
        <View row spaceBetween style={[layoutStyles.mb2]}>
          <Text variant="h3">AI Assistant</Text>
          <View row>
            <Button
              variant="secondary"
              onPress={reset}
              style={[layoutStyles.mr2]}
              disabled={loading}
            >
              Reset
            </Button>
            {onClose ? (
              <Button variant="secondary" onPress={onClose}>
                Close
              </Button>
            ) : null}
          </View>
        </View>

        <Input
          placeholder="Describe what you want to do (e.g., create, update, or find an asset...)"
          value={prompt}
          onChangeText={setPrompt}
          multiline
          numberOfLines={4}
          fullWidth
          style={[
            layoutStyles.mb2,
            { minHeight: spacing.xl * 3, paddingVertical: spacing.sm, textAlignVertical: "top" },
          ]}
          editable={!loading}
        />

        <Button onPress={handleSend} disabled={loading || !AI_PROXY_BASE_URL}>
          {loading ? "Working..." : !AI_PROXY_BASE_URL ? "Configure AI proxy" : "Send"}
        </Button>

        <View style={[layoutStyles.mt2]}>
          {showDraft || shouldPromptForDraft ? (
            <Button
              variant="secondary"
              size="small"
              onPress={() => setShowDraft(false)}
              disabled={loading}
            >
              Hide details
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="small"
              onPress={() => setShowDraft(true)}
              disabled={loading}
            >
              Review details
            </Button>
          )}
        </View>
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
          <Text variant="bodySmall" style={[layoutStyles.mb1]}>
            - “Add road Cedar Lane with poor condition”
          </Text>
          <Text variant="bodySmall" style={[layoutStyles.mb1]}>
            - “Update Main Street condition to poor”
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

      {showDraft || shouldPromptForDraft ? (
        <DraftRoadForm
          fields={draftFields}
          onChangeField={handleDraftChange}
          onToggleOptional={() => setShowOptionalRoadFields((v) => !v)}
          showOptional={showOptionalRoadFields}
          onCreate={proposeCreateFromDraft}
          disabled={loading}
        />
      ) : null}

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
                Condition: {String(item.condition ?? "—")}
              </Text>

              <View row style={[layoutStyles.mt2]}>
                {String(item.type || "").toLowerCase() === AssetType.ROAD ? (
                  <Button
                    variant="secondary"
                    size="small"
                    onPress={() => proposeUpdateForRoad(item)}
                    style={[layoutStyles.mr2]}
                    disabled={loading}
                  >
                    Update
                  </Button>
                ) : null}
                <Button
                  variant="secondary"
                  size="small"
                  onPress={() => proposeDeleteForRoad(item)}
                  disabled={loading}
                >
                  Delete
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
            {humanizeToolName(proposal.toolCall.name)}
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
            {buildProposalRows(proposal.toolCall).map((row) => (
              <View key={row.label} row spaceBetween style={[layoutStyles.mb1]}>
                <Text variant="bodySmall" style={{ color: colors.text.secondary }}>
                  {row.label}
                </Text>
                <Text variant="bodySmall">{row.value}</Text>
              </View>
            ))}

            <View style={[layoutStyles.mt2]}>
              <Button
                variant="secondary"
                size="small"
                onPress={() => setShowTechnicalDetails((v) => !v)}
                disabled={loading}
              >
                {showTechnicalDetails ? "Hide technical details" : "Show technical details"}
              </Button>
            </View>

            {showTechnicalDetails ? (
              <View style={[layoutStyles.mt2]}>
                <Text variant="caption" style={{ color: colors.text.secondary }}>
                  {JSON.stringify(displayProposalArgs(proposal.toolCall), null, 2)}
                </Text>
              </View>
            ) : null}
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
