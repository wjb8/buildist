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
            messages: [
              "What is the road name?",
              'DRAFT_JSON: {"condition":"good","surfaceType":"asphalt"}',
            ],
          };
        }
        if (mockCall === 2) {
          return {
            type: "text",
            messages: [
              "What is the traffic volume?",
              'DRAFT_JSON: {"name":"Main St","condition":"good","surfaceType":"asphalt"}',
            ],
          };
        }
        return {
          type: "text",
          messages: [
            "Thanks.",
            'DRAFT_JSON: {"name":"Main St","condition":"good","surfaceType":"asphalt","trafficVolume":"low"}',
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
    const { getByPlaceholderText, getByText, queryByDisplayValue, findByText } = render(<AIAssistant />);
    const input = getByPlaceholderText(
      "Describe what you want to do (e.g., create, update, or find an asset...)"
    );
    fireEvent.changeText(input, "create a road");
    fireEvent.press(getByText("Send"));

    await waitFor(() => expect(queryByDisplayValue("create a road")).toBeNull());
    await findByText("Draft road details");
  });

  it("auto-proposes when required fields are complete", async () => {
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

    // Third send -> add trafficVolume; auto-proposal should appear
    fireEvent.changeText(input, "traffic is low");
    fireEvent.press(getByText("Send"));

    await findByText("Proposed action");
    await findByText("create_road");
  });

  it("resets state with Reset button", async () => {
    const { getByText, queryByText, getByPlaceholderText } = render(<AIAssistant />);
    const input = getByPlaceholderText(
      "Describe what you want to do (e.g., create, update, or find an asset...)"
    );
    fireEvent.changeText(input, "hello");
    fireEvent.press(getByText("Send"));
    await waitFor(() => expect(queryByText("Draft road details")).not.toBeNull());

    fireEvent.press(getByText("Reset"));
    await waitFor(() => expect(queryByText("Draft road details")).toBeNull());
  });
});



