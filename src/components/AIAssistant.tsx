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

type DraftRoad = {
  name?: string;
  location?: string;
  condition?: string;
  notes?: string;
  qrTagId?: string;
  surfaceType?: string;
  trafficVolume?: string;
  length?: number;
  width?: number;
  lanes?: number;
  speedLimit?: number;
};

export default function AIAssistant({ onActionApplied }: AIAssistantProps) {
	const [prompt, setPrompt] = useState("");
	const [loading, setLoading] = useState(false);
	const [messages, setMessages] = useState<string[]>([]);
	const [proposal, setProposal] = useState<AIProposedAction | null>(null);
  const [history, setHistory] = useState<ConversationTurn[]>([]);
  const [draft, setDraft] = useState<DraftRoad>({});
	const ai = useMemo(
		() => new AIService({ proxyBaseUrl: AI_PROXY_BASE_URL, assistantId: OPENAI_ASSISTANT_ID }),
		[AI_PROXY_BASE_URL, OPENAI_ASSISTANT_ID]
	);

  const isDraftComplete = (d: DraftRoad) =>
    !!d &&
    !!d.condition &&
    !!d.surfaceType &&
    !!d.trafficVolume &&
    !!(d.name && d.name.trim().length > 0);

  function tryExtractDraft(lines: string[]): DraftRoad | null {
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();
      const idx = line.indexOf("DRAFT_JSON:");
      if (idx >= 0) {
        const jsonPart = line.slice(idx + "DRAFT_JSON:".length).trim();
        try {
          const parsed = JSON.parse(jsonPart);
          if (parsed && typeof parsed === "object") return parsed as DraftRoad;
        } catch {}
      }
    }
    return null;
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
				setMessages(res.messages);
        const d = tryExtractDraft(res.messages);
        if (d) setDraft((prev) => ({ ...prev, ...d }));
        if (res.messages.length > 0) {
          setHistory([
            ...nextHistory,
            { role: "assistant" as const, content: res.messages.join("\n") },
          ]);
        } else {
          setHistory(nextHistory);
        }
        // Auto-propose if the draft is complete and no proposal exists
        setTimeout(() => {
          setProposal((p) => {
            if (!p) {
              const current = d ? { ...draft, ...d } : draft;
              if (isDraftComplete(current)) {
                return {
                  type: "tool_proposal",
                  summary: "Proposed create_road with collected fields.",
                  toolCall: { name: "create_road", arguments: current } as any,
                };
              }
            }
            return p;
          });
        }, 0);
			} else if (res.type === "tool_proposal") {
				setProposal(res);
				if (res.summary) setMessages([res.summary]);
        const d = tryExtractDraft(res.summary ? [res.summary] : []);
        if (d) setDraft((prev) => ({ ...prev, ...d }));
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

	return (
		<ScrollView contentContainerStyle={[layoutStyles.p3]}>
			<View style={[layoutStyles.section]}>
				<Text variant="h3" style={{ marginBottom: spacing.sm }}>
					AI Assistant
				</Text>
        <View row style={{ marginBottom: spacing.xs }}>
          <Button variant="secondary" onPress={() => {
            setPrompt("");
            setMessages([]);
            setProposal(null);
            setHistory([]);
            setDraft({});
          }}>
            Reset
          </Button>
        </View>
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

      {Object.keys(draft).length > 0 && (
        <View card style={{ marginTop: spacing.md }}>
          <Text variant="h4" style={{ marginBottom: spacing.sm }}>
            Draft road details
          </Text>
          <Text style={{ color: colors.text.secondary, marginBottom: spacing.xs }}>
            Required fields checklist:
          </Text>
          <View style={[layoutStyles.mb1]}>
            <Text>
              {(draft.name ? "✓" : "○") + " name"}
            </Text>
            <Text>
              {(draft.condition ? "✓" : "○") + " condition"}
            </Text>
            <Text>
              {(draft.surfaceType ? "✓" : "○") + " surfaceType"}
            </Text>
            <Text>
              {(draft.trafficVolume ? "✓" : "○") + " trafficVolume"}
            </Text>
          </View>
          <View
            style={[
              layoutStyles.border1,
              layoutStyles.borderLight,
              layoutStyles.roundedMd,
              layoutStyles.p2,
            ]}
          >
            <Text variant="bodySmall" style={{ color: colors.text.secondary }}>
              {JSON.stringify(draft, null, 2)}
            </Text>
					</View>
				</View>
			)}
		</ScrollView>
	);
}
