import { config } from "dotenv";
config({ path: ".env.local" });

import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { tool } from "ai";
import { z } from "zod";

// Simple test tool
const testTool = tool({
  description: "Get information about a topic",
  parameters: z.object({
    topic: z.string().describe("The topic to get info about"),
  }),
  execute: async ({ topic }) => {
    console.log("✅ Tool executed with topic:", topic);
    return `Here is information about ${topic}: It is a very interesting topic with many details!`;
  },
});

async function testManualMultiStep() {
  console.log("Testing manual multi-step tool calling...\n");

  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
  });

  const model = openrouter("openai/gpt-oss-20b");

  let currentMessages = [
    {
      role: "system",
      content: "You have access to tools. When asked for information, use the available tools.",
    },
    {
      role: "user",
      content: "Can you get information about JavaScript?",
    },
  ];

  let finalText = "";
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    attempts++;
    console.log(`\n--- Attempt ${attempts} ---`);

    const result = await generateText({
      model,
      messages: currentMessages,
      tools: {
        getInfo: testTool,
      },
      maxSteps: 1,
    });

    console.log("Finish reason:", result.finishReason);
    console.log("Text:", result.text || "(empty)");
    console.log("Tool calls:", result.toolCalls?.length || 0);
    console.log("Tool results:", result.toolResults?.length || 0);

    // If we got text, we're done
    if (result.text && result.text.trim()) {
      finalText = result.text;
      console.log("✅ Got final response!");
      break;
    }

    // If tool was called, add the results and continue
    if (result.toolCalls && result.toolCalls.length > 0) {
      console.log("🔧 Tool called, adding results and continuing...");
      console.log("Tool calls detail:", JSON.stringify(result.toolCalls, null, 2));

      // Debug: Check what properties are available
      result.toolCalls.forEach((tc, idx) => {
        console.log(`Tool call ${idx} properties:`, Object.keys(tc));
        console.log(`  - args:`, tc.args);
        console.log(`  - input:`, tc.input);
      });

      // For ModelMessage format, assistant message with tool calls should be simple
      currentMessages.push({
        role: "assistant",
        content: result.toolCalls.map((tc) => ({
          type: "tool-call",
          toolCallId: tc.toolCallId,
          toolName: tc.toolName,
          args: tc.input,
        })),
      });

      // Add tool results - each as a separate message
      if (result.toolResults && result.toolResults.length > 0) {
        console.log("Tool results detail:", JSON.stringify(result.toolResults, null, 2));

        // Add all tool results in a single message with array of tool-result contents
        const toolResultsContent = result.toolResults.map((toolResult) => {
          console.log("Adding tool result with output:", toolResult.output?.substring(0, 100));

          // Tool result format expects 'output' with type and value
          return {
            type: "tool-result",
            toolCallId: toolResult.toolCallId,
            toolName: toolResult.toolName,
            output: {
              type: "text",
              value: toolResult.output,
            },
          };
        });

        currentMessages.push({
          role: "tool",
          content: toolResultsContent,
        });

        console.log("\nCurrent messages:");
        console.log(JSON.stringify(currentMessages, null, 2));
      }

      continue;
    }

    console.log("⚠️ No text or tool calls, stopping");
    break;
  }

  console.log("\n=== Test Complete ===");
  console.log("Final text:", finalText || "(no response generated)");
  console.log("Total attempts:", attempts);
  console.log("Success:", finalText.length > 0);
}

testManualMultiStep().catch((error) => {
  console.error("\n❌ Test failed:");
  console.error(error);
  process.exit(1);
});
