import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import AIAssistant from "@/components/AIAssistant";

// Mock config so the component enables Send button
jest.mock("@/config/ai", () => ({
  AI_PROXY_BASE_URL: "https://example.com/api/assistantProxy",
  OPENAI_ASSISTANT_ID: undefined,
}));

// Mock AIService with controllable behavior
let mockCall = 0;
jest.mock("@/services/AIService", () => {
  return {
    AIService: class {
      constructor(_: any) {}
      checkOnline = jest.fn().mockResolvedValue(true);
      sendPromptAndPropose = jest.fn().mockImplementation(async () => {
        mockCall += 1;
        if (mockCall === 1) {
          return {
            type: "text",
            messages: ["What is the road name?", 'DRAFT_JSON: {"condition":"good"}'],
          };
        }
        if (mockCall === 2) {
          return {
            type: "text",
            messages: [
              "Any notes to include?",
              'DRAFT_JSON: {"name":"Main St","condition":"good"}',
            ],
          };
        }
        return {
          type: "text",
          messages: [
            "Thanks.",
            'DRAFT_JSON: {"name":"Main St","condition":"good","notes":"Near the downtown core"}',
          ],
        };
      });
      applyToolCall = jest.fn().mockResolvedValue({ success: true, message: "Road created" });
    },
  };
});

describe("AIAssistant", () => {
  beforeEach(() => {
    mockCall = 0;
  });

  it("clears input after send and shows draft card", async () => {
    const { getByPlaceholderText, getByText, queryByDisplayValue, findByText } = render(
      <AIAssistant />
    );
    const input = getByPlaceholderText(
      "Describe what you want to do (e.g., create, update, or find an asset...)"
    );
    fireEvent.changeText(input, "create a road");
    fireEvent.press(getByText("Send"));

    await waitFor(() => expect(queryByDisplayValue("create a road")).toBeNull());
    await findByText("Draft road details");
  });

  it("creates a proposal via the draft form when required fields are complete", async () => {
    const { getByPlaceholderText, getByText, findByText } = render(<AIAssistant />);
    const input = getByPlaceholderText(
      "Describe what you want to do (e.g., create, update, or find an asset...)"
    );

    // First send -> collect some fields
    fireEvent.changeText(input, "create a road");
    fireEvent.press(getByText("Send"));
    await findByText("Draft road details");

    // Second send -> add name
    fireEvent.changeText(input, "name is Main St");
    fireEvent.press(getByText("Send"));
    await findByText("Draft road details");

    // Third send -> add notes; create should now be possible
    fireEvent.changeText(input, "notes are Near the downtown core");
    fireEvent.press(getByText("Send"));

    // Wait for assistant response + draft merge to complete
    await findByText("Thanks.");

    // Draft is hidden by default; open it to create from the draft values.
    fireEvent.press(getByText("Review details"));
    await findByText("Draft road details");

    fireEvent.press(getByText("Create from draft"));
    await findByText("Proposed action");
    await findByText("Create road");
  });

  it("resets state with Reset button", async () => {
    const { getByText, queryByText, getByPlaceholderText } = render(<AIAssistant />);
    const input = getByPlaceholderText(
      "Describe what you want to do (e.g., create, update, or find an asset...)"
    );
    fireEvent.changeText(input, "hello");
    fireEvent.press(getByText("Send"));
    await waitFor(() => expect(queryByText("Review details")).not.toBeNull());
    fireEvent.press(getByText("Review details"));
    await waitFor(() => expect(queryByText("Draft road details")).not.toBeNull());

    fireEvent.press(getByText("Reset"));
    await waitFor(() => expect(queryByText("Review details")).not.toBeNull());
    await waitFor(() => expect(queryByText("Draft road details")).toBeNull());
    fireEvent.press(getByText("Review details"));
    const roadName = getByPlaceholderText("e.g., Cedar Lane");
    await waitFor(() => expect(roadName.props.value).toBe(""));
  });
});
