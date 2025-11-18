import { useMemo, useState } from "react";
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
import { AI_PROXY_BASE_URL, OPENAI_ASSISTANT_ID } from "@/config/ai";

interface AIAssistantProps {
  onActionApplied?: (result: { success: boolean; message: string }) => void;
}

export default function AIAssistant({ onActionApplied }: AIAssistantProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [proposal, setProposal] = useState<AIProposedAction | null>(null);
  const [history, setHistory] = useState<ConversationTurn[]>([]);
  const ai = useMemo(
    () => new AIService({ proxyBaseUrl: AI_PROXY_BASE_URL, assistantId: OPENAI_ASSISTANT_ID }),
    [AI_PROXY_BASE_URL, OPENAI_ASSISTANT_ID]
  );

  const handleSend = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setMessages([]);
    setProposal(null);
    try {
      const nextHistory = [...history, { role: "user" as const, content: prompt.trim() }];
      const res = await ai.sendPromptAndPropose(prompt.trim(), nextHistory);
      if (res.type === "text") {
        setMessages(res.messages);
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
        if (res.summary) setMessages([res.summary]);
        if (res.summary) {
          setHistory([...nextHistory, { role: "assistant" as const, content: res.summary }]);
        } else {
          setHistory(nextHistory);
        }
      }
    } catch (e) {
      setMessages(["Failed to contact assistant."]);
      setHistory([...history, { role: "user" as const, content: prompt.trim() }]);
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

  return (
    <ScrollView contentContainerStyle={[layoutStyles.p3]}>
      <View style={[layoutStyles.section]}>
        <Text variant="h3" style={{ marginBottom: spacing.sm }}>
          AI Assistant
        </Text>
        <Input
          placeholder="Describe what you want to do (e.g., create a road...)"
          value={prompt}
          onChangeText={setPrompt}
          fullWidth
          style={{ marginBottom: spacing.sm }}
        />
        <Button onPress={handleSend} disabled={loading || !AI_PROXY_BASE_URL}>
          {loading ? "Working..." : !AI_PROXY_BASE_URL ? "Configure AI proxy" : "Send"}
        </Button>
      </View>

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
    </ScrollView>
  );
}
