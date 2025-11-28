import { useEffect, useMemo, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { ScrollView } from "react-native";
import { View } from "./View";
import { Text } from "./Text";
import { Input } from "./Input";
import { Button } from "./Button";
import { layoutStyles, spacing, colors } from "@/styles";
import {
  AIService,
  AIProposedAction,
  AITextResponse,
  ConversationTurn,
} from "@/services/AIService";
import { CreateRoadArgs } from "@/services/ai/toolSchemas";
import { AI_PROXY_BASE_URL, OPENAI_ASSISTANT_ID } from "@/config/ai";

interface AIAssistantProps {
  onActionApplied?: (result: { success: boolean; message: string }) => void;
  onClose?: () => void;
}

interface DraftState {
  assetType?: string;
  intent?: string;
  fields: Record<string, unknown>;
}

export default function AIAssistant({ onActionApplied, onClose }: AIAssistantProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [proposal, setProposal] = useState<AIProposedAction | null>(null);
  const [history, setHistory] = useState<ConversationTurn[]>([]);
  const [draft, setDraft] = useState<DraftState>({ fields: {} });
  const navigation = useNavigation<any>();
  const ai = useMemo(
    () => new AIService({ proxyBaseUrl: AI_PROXY_BASE_URL, assistantId: OPENAI_ASSISTANT_ID }),
    [AI_PROXY_BASE_URL, OPENAI_ASSISTANT_ID]
  );
  const handleClose = () => {
    if (onClose) onClose();
    else if (navigation?.canGoBack?.()) navigation.goBack();
  };

  function tryExtractDraft(lines: string[]): DraftState | null {
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();
      const idx = line.indexOf("DRAFT_JSON:");
      if (idx >= 0) {
        const jsonPart = line.slice(idx + "DRAFT_JSON:".length).trim();
        try {
          const parsed = JSON.parse(jsonPart);
          if (parsed && typeof parsed === "object") {
            const fieldsCandidate =
              parsed.fields && typeof parsed.fields === "object" ? parsed.fields : parsed;
            return {
              assetType: parsed.assetType || parsed.type,
              intent: parsed.intent || parsed.action,
              fields: fieldsCandidate,
            };
          }
        } catch {}
      }
    }
    return null;
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

  const handleSend = async () => {
    if (!prompt.trim()) return;
    // simple online guard
    try {
      const online = await ai.checkOnline(3000);
      if (!online) {
        setMessages(["You're offline. Please check your connection."]);
        return;
      }
    } catch {}
    setLoading(true);
    setMessages([]);
    setProposal(null);
    try {
      const text = prompt.trim();
      setPrompt("");
      const nextHistory = [...history, { role: "user" as const, content: text }];
      const res = await ai.sendPromptAndPropose(text, nextHistory);
      if (res.type === "text") {
        setMessages(cleanMessages(res.messages));
        const d = tryExtractDraft(res.messages);
        const promptAssetType = inferAssetType(text);
        const assistantAssetType = inferAssetType(res.messages.join(" "));
        if (d) {
          setDraft((prev) => ({
            assetType: d.assetType ?? prev.assetType ?? promptAssetType ?? assistantAssetType,
            intent: d.intent ?? prev.intent,
            fields: { ...prev.fields, ...d.fields },
          }));
        }
        if (res.messages.length > 0) {
          setHistory([
            ...nextHistory,
            { role: "assistant" as const, content: res.messages.join("\n") },
          ]);
        } else {
          setHistory(nextHistory);
        }
      } else if (res.type === "tool_proposal") {
        setProposal(res);
        if (res.summary) setMessages(cleanMessages([res.summary]));
        const d = tryExtractDraft(res.summary ? [res.summary] : []);
        const summaryAssetType = inferAssetType(res.summary);
        if (d) {
          setDraft((prev) => ({
            assetType: d.assetType ?? prev.assetType ?? summaryAssetType,
            intent: d.intent ?? prev.intent,
            fields: { ...prev.fields, ...d.fields },
          }));
        }
        if (res.summary) {
          setHistory([...nextHistory, { role: "assistant" as const, content: res.summary }]);
        } else {
          setHistory(nextHistory);
        }
      }
    } catch (e) {
      setMessages(["Failed to contact assistant."]);
      const text = prompt.trim();
      if (text) {
        setHistory([...history, { role: "user" as const, content: text }]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!proposal) return;
    setLoading(true);
    try {
      const result = await ai.applyToolCall(proposal.toolCall);
      if (onActionApplied) onActionApplied(result);
      setMessages([(result.success ? "Success: " : "Error: ") + result.message]);
      setProposal(null);
      setHistory([
        ...history,
        {
          role: "assistant" as const,
          content: (result.success ? "Success: " : "Error: ") + result.message,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (proposal || draft.assetType !== "road") return;
    const requiredFields: Array<keyof CreateRoadArgs> = [
      "name",
      "condition",
      "surfaceType",
      "trafficVolume",
    ];
    const hasAllRequired = requiredFields.every((field) => {
      const value = draft.fields[field];
      return value !== undefined && value !== null && value !== "";
    });

    if (!hasAllRequired) return;

    const optionalKeys: Array<keyof CreateRoadArgs> = [
      "location",
      "notes",
      "qrTagId",
      "length",
      "width",
      "lanes",
      "speedLimit",
    ];

    const args: Partial<CreateRoadArgs> = {
      name: String(draft.fields.name),
      condition: draft.fields.condition as CreateRoadArgs["condition"],
      surfaceType: draft.fields.surfaceType as CreateRoadArgs["surfaceType"],
      trafficVolume: draft.fields.trafficVolume as CreateRoadArgs["trafficVolume"],
    };

    optionalKeys.forEach((key) => {
      const value = draft.fields[key];
      if (value !== undefined && value !== null && value !== "") {
        (args as any)[key] = value;
      }
    });

    setProposal({
      type: "tool_proposal",
      summary: "Auto-generated create_road proposal",
      toolCall: {
        name: "create_road",
        arguments: args as CreateRoadArgs,
      },
    });
  }, [draft, proposal]);

  // Derive a dynamic placeholder from assistant prompt or next missing field
  const assistantPrompt = (() => {
    if (messages.length === 0) return "";
    const last = messages[messages.length - 1] ?? "";
    const withoutDraft = last.split("DRAFT_JSON:")[0].trim();
    return withoutDraft;
  })();
  const dynamicPlaceholder =
    assistantPrompt || "Describe what you want to do (e.g., create, update, or find an asset...)";

  const hasDraftData = Object.keys(draft.fields).length > 0;
  const inferAssetType = (value?: string): string | undefined => {
    if (!value) return undefined;
    const normalized = value.toLowerCase();
    if (normalized.includes("road")) return "road";
    if (normalized.includes("vehicle")) return "vehicle";
    return undefined;
  };
  const draftTitle = draft.assetType
    ? `Draft ${draft.assetType.toLowerCase()} details`
    : "Draft details";

  const prettyLabel = (key: string) =>
    key
      .replace(/_/g, " ")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <ScrollView contentContainerStyle={[layoutStyles.p3]}>
      <View style={[layoutStyles.section]}>
        <View row spaceBetween style={{ marginBottom: spacing.xs }}>
          <Text variant="h3">AI Assistant</Text>
          {(onClose || navigation?.canGoBack?.()) && (
            <Button variant="secondary" onPress={handleClose}>
              Close
            </Button>
          )}
        </View>
        <View row style={{ marginBottom: spacing.xs }}>
          <Button
            variant="secondary"
            onPress={() => {
              setPrompt("");
              setMessages([]);
              setProposal(null);
              setHistory([]);
              setDraft({ fields: {} });
            }}
          >
            Reset
          </Button>
        </View>
        <Input
          placeholder={dynamicPlaceholder}
          value={prompt}
          onChangeText={setPrompt}
          fullWidth
          style={{ marginBottom: spacing.sm }}
        />
        <Button onPress={handleSend} disabled={loading || !AI_PROXY_BASE_URL}>
          {loading ? "Working..." : !AI_PROXY_BASE_URL ? "Configure AI proxy" : "Send"}
        </Button>
      </View>

      {messages.length === 0 && (
        <View card style={{ marginTop: spacing.md }}>
          <Text variant="h4" style={{ marginBottom: spacing.xs }}>
            What can I do?
          </Text>
          <Text style={{ color: colors.text.secondary, marginBottom: spacing.xs }}>
            Ask me to create, update, or find any asset (road, vehicle, bridge, etc.). I'll guide
            you step by step and only ask for details I need.
          </Text>
          <Text style={{ color: colors.text.secondary }}>
            Example: “Create a road for Greenway Avenue”, “Update the vehicle ABC-123”, or “Find the
            bridge with QR tag AB-12”.
          </Text>
        </View>
      )}

      {messages.length > 0 && (
        <View card style={{ marginTop: spacing.md }}>
          {messages.map((m, i) => (
            <Text key={i} style={{ marginBottom: i < messages.length - 1 ? spacing.xs : 0 }}>
              {m}
            </Text>
          ))}
        </View>
      )}

      {proposal && (
        <View card style={{ marginTop: spacing.md }}>
          <Text variant="h4" style={{ marginBottom: spacing.sm }}>
            Proposed action
          </Text>
          <Text style={{ color: colors.text.secondary, marginBottom: spacing.sm }}>
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
              {JSON.stringify(proposal.toolCall.arguments, null, 2)}
            </Text>
          </View>
          <View row spaceBetween>
            <Button variant="secondary" onPress={() => setProposal(null)}>
              Cancel
            </Button>
            <Button onPress={handleApply}>Apply</Button>
          </View>
        </View>
      )}

      {hasDraftData && (
        <View card style={{ marginTop: spacing.md }}>
          <Text variant="h4" style={{ marginBottom: spacing.sm }}>
            {draftTitle}
          </Text>
          {draft.assetType && (
            <Text style={{ marginBottom: spacing.xs }}>
              <Text style={{ fontWeight: "600" }}>Asset type:</Text> {draft.assetType}
            </Text>
          )}
          {draft.intent && (
            <Text style={{ marginBottom: spacing.xs }}>
              <Text style={{ fontWeight: "600" }}>Intent:</Text> {draft.intent}
            </Text>
          )}
          {Object.keys(draft.fields).length === 0 && (
            <Text style={{ color: colors.text.secondary }}>No details yet.</Text>
          )}
          {Object.entries(draft.fields).map(([key, value]) => (
            <Text key={key} style={{ marginBottom: spacing.xs }}>
              <Text style={{ fontWeight: "600" }}>{prettyLabel(key)}:</Text>{" "}
              {value === undefined || value === null || value === ""
                ? "—"
                : typeof value === "object"
                ? JSON.stringify(value)
                : String(value)}
            </Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
