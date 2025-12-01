import { useEffect, useMemo, useState } from "react";
import { ScrollView, ActivityIndicator } from "react-native";
import { View } from "./View";
import { Text } from "./Text";
import { Input } from "./Input";
import { Button } from "./Button";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { layoutStyles, spacing, colors } from "@/styles";
import { AssetCondition, TrafficVolume } from "@/types";
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
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [proposal, setProposal] = useState<AIProposedAction | null>(null);
  const [history, setHistory] = useState<ConversationTurn[]>([]);
  const [draft, setDraft] = useState<DraftState>({ fields: {} });
  const [lastSearchResults, setLastSearchResults] = useState<any[]>([]);
  const ai = useMemo(
    () => new AIService({ proxyBaseUrl: AI_PROXY_BASE_URL, assistantId: OPENAI_ASSISTANT_ID }),
    [AI_PROXY_BASE_URL, OPENAI_ASSISTANT_ID]
  );
  const handleClose = () => {
    if (onClose) onClose();
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

  const inferAssetType = (value?: string): string | undefined => {
    if (!value) return undefined;
    const normalized = value.toLowerCase();
    if (normalized.includes("road")) return "road";
    if (normalized.includes("vehicle")) return "vehicle";
    return undefined;
  };

  const handleSend = async () => {
    if (!prompt.trim()) return;
    // simple online guard
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
      setPrompt("");
      const nextHistory = [...history, { role: "user" as const, content: text }];
      const res = await ai.sendPromptAndPropose(text, nextHistory);
      setLoadingMessage(null);
      if (res.type === "text") {
        console.log("[AIAssistant] Text response with", res.messages.length, "messages");
        const newMessages = cleanMessages(res.messages);
        if (newMessages.length === 0 && res.messages.length === 0) {
          console.warn("[AIAssistant] Empty response - API may have returned empty content array");
          setMessages([
            "I received your request but didn't get a response. Please check the API logs or try again.",
          ]);
        } else {
          setMessages(newMessages);
        }
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
        const toolName = res.toolCall.name.replace(/_/g, " ");
        const defaultSummary = `Ready to ${toolName}. Review the details below and click Apply to execute.`;
        const summary = res.summary || defaultSummary;
        const summaryMessages = cleanMessages([summary]);
        if (summaryMessages.length > 0) {
          setMessages(summaryMessages);
        }
        const d = tryExtractDraft([summary]);
        const summaryAssetType = inferAssetType(summary);
        if (d) {
          setDraft((prev) => ({
            assetType: d.assetType ?? prev.assetType ?? summaryAssetType,
            intent: d.intent ?? prev.intent,
            fields: { ...prev.fields, ...d.fields },
          }));
        }
        setHistory([...nextHistory, { role: "assistant" as const, content: summary }]);
      }
    } catch (e) {
      setLoadingMessage(null);
      setMessages(["Failed to contact assistant."]);
      const text = prompt.trim();
      if (text) {
        setHistory([...history, { role: "user" as const, content: text }]);
      }
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
      const result = await ai.applyToolCall(proposal.toolCall);
      const resultMessage = (result.success ? "Success: " : "Error: ") + result.message;

      if (result.data && Array.isArray(result.data) && result.data.length > 0) {
        setLastSearchResults(result.data);
        setMessages([resultMessage]);
      } else {
        setLastSearchResults([]);
        setMessages([resultMessage]);
      }

      setProposal(null);
      setHistory([
        ...history,
        {
          role: "assistant" as const,
          content: (result.success ? "Success: " : "Error: ") + result.message,
        },
      ]);

      if (onActionApplied) {
        onActionApplied(result);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      console.error("[AIAssistant] Error applying tool call:", error);
      setMessages((prev) => [...prev, `Error: ${errorMessage}`]);
    } finally {
      setLoading(false);
      setLoadingMessage(null);
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

  const placeholder = "Enter your request...";

  const hasDraftData = Object.keys(draft.fields).length > 0;
  const draftTitle = draft.assetType
    ? `Draft ${draft.assetType.toLowerCase()} details`
    : "Draft details";

  const prettyLabel = (key: string) =>
    key
      .replace(/_/g, " ")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const getConditionColor = (condition: string) => {
    if (condition === AssetCondition.GOOD || condition === "good") return "success";
    if (condition === AssetCondition.FAIR || condition === "fair") return "warning";
    if (condition === AssetCondition.POOR || condition === "poor") return "error";
    return "secondary";
  };

  const getTrafficVolumeColor = (volume: string) => {
    if (volume === TrafficVolume.LOW || volume === "low") return "success";
    if (volume === TrafficVolume.MEDIUM || volume === "medium") return "warning";
    if (volume === TrafficVolume.HIGH || volume === "high") return "warning";
    if (volume === TrafficVolume.VERY_HIGH || volume === "very_high") return "error";
    return "secondary";
  };

  const formatCondition = (condition: string) => {
    if (condition === AssetCondition.GOOD || condition === "good") return "Good";
    if (condition === AssetCondition.FAIR || condition === "fair") return "Fair";
    if (condition === AssetCondition.POOR || condition === "poor") return "Poor";
    return condition;
  };

  return (
    <ScrollView contentContainerStyle={[layoutStyles.p3]}>
      <View style={[layoutStyles.section]}>
        <View row spaceBetween style={{ marginBottom: spacing.xs }}>
          <Text variant="h3">AI Assistant</Text>
          <View row>
            <Button
              variant="secondary"
              onPress={() => {
                setPrompt("");
                setMessages([]);
                setProposal(null);
                setHistory([]);
                setDraft({ fields: {} });
                setLastSearchResults([]);
              }}
              style={{ marginRight: spacing.sm }}
            >
              Reset
            </Button>
            {onClose && (
              <Button variant="secondary" onPress={handleClose}>
                Close
              </Button>
            )}
          </View>
        </View>
        <Input
          placeholder={placeholder}
          value={prompt}
          onChangeText={setPrompt}
          fullWidth
          style={{ marginBottom: spacing.sm }}
          editable={!loading}
        />
        <Button onPress={handleSend} disabled={loading || !AI_PROXY_BASE_URL}>
          {loading ? "Working..." : !AI_PROXY_BASE_URL ? "Configure AI proxy" : "Send"}
        </Button>
      </View>

      {loading && loadingMessage && (
        <View card style={{ marginTop: spacing.md }}>
          <View row center style={{ marginBottom: spacing.xs }}>
            <ActivityIndicator
              size="small"
              color={colors.primary.main}
              style={{ marginRight: spacing.sm }}
            />
            <Text style={{ color: colors.text.secondary }}>{loadingMessage}</Text>
          </View>
        </View>
      )}

      {messages.length === 0 && !loading && (
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

      {lastSearchResults.length > 0 && (
        <View style={{ marginTop: spacing.md }}>
          <Text variant="h4" style={{ marginBottom: spacing.sm }}>
            Results ({lastSearchResults.length})
          </Text>
          {lastSearchResults.map((item: any, i: number) => {
            const isRoad = item.surfaceType !== undefined || item.trafficVolume !== undefined;
            return (
              <Card key={item._id || i} style={{ marginBottom: spacing.md }}>
                <View row style={[layoutStyles.mb2]}>
                  <View style={[layoutStyles.flex]}>
                    <Text variant="h4" style={[layoutStyles.mb1]}>
                      {item.name || item.qrTagId || item._id}
                    </Text>
                    {item.location && (
                      <Text variant="body" color="neutral" style={[layoutStyles.mb1]}>
                        📍 {item.location}
                      </Text>
                    )}
                  </View>
                  {item.condition && (
                    <View style={{ alignItems: "flex-end" }}>
                      <Badge variant={getConditionColor(item.condition)}>
                        Condition: {formatCondition(item.condition)}
                      </Badge>
                    </View>
                  )}
                </View>

                {isRoad && (
                  <>
                    <View row style={[layoutStyles.mb2]}>
                      {item.surfaceType && (
                        <View style={[layoutStyles.flex]}>
                          <Text variant="bodySmall" color="neutral">
                            Surface Type
                          </Text>
                          <Text variant="body">{item.surfaceType}</Text>
                        </View>
                      )}
                      {item.trafficVolume && (
                        <View style={[layoutStyles.flex]}>
                          <Text variant="bodySmall" color="neutral">
                            Traffic Volume
                          </Text>
                          <Badge variant={getTrafficVolumeColor(item.trafficVolume)} size="small">
                            {item.trafficVolume}
                          </Badge>
                        </View>
                      )}
                    </View>

                    {(item.length || item.width || item.lanes || item.speedLimit) && (
                      <View row style={[layoutStyles.mb2]}>
                        {item.length && (
                          <View style={[layoutStyles.flex]}>
                            <Text variant="bodySmall" color="neutral">
                              Length
                            </Text>
                            <Text variant="body">{item.length}m</Text>
                          </View>
                        )}
                        {item.width && (
                          <View style={[layoutStyles.flex]}>
                            <Text variant="bodySmall" color="neutral">
                              Width
                            </Text>
                            <Text variant="body">{item.width}m</Text>
                          </View>
                        )}
                        {item.lanes && (
                          <View style={[layoutStyles.flex]}>
                            <Text variant="bodySmall" color="neutral">
                              Lanes
                            </Text>
                            <Text variant="body">{item.lanes}</Text>
                          </View>
                        )}
                        {item.speedLimit && (
                          <View style={[layoutStyles.flex]}>
                            <Text variant="bodySmall" color="neutral">
                              Speed Limit
                            </Text>
                            <Text variant="body">{item.speedLimit} km/h</Text>
                          </View>
                        )}
                      </View>
                    )}
                  </>
                )}

                {item.notes && (
                  <View style={[layoutStyles.mb2]}>
                    <Text variant="bodySmall" color="neutral">
                      Notes
                    </Text>
                    <Text variant="body">{item.notes}</Text>
                  </View>
                )}
              </Card>
            );
          })}
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
            <Button variant="secondary" onPress={() => setProposal(null)} disabled={loading}>
              Cancel
            </Button>
            <Button onPress={handleApply} disabled={loading}>
              {loading ? "Applying..." : "Apply"}
            </Button>
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
