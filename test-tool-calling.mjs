import { config } from "dotenv";
config({ path: ".env.local" });

import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";
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
    return `Here is information about ${topic}: It is a very interesting topic!`;
  },
});

async function testModel(modelName) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Testing: ${modelName}`);
  console.log("=".repeat(60));

  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
  });

  const model = openrouter(modelName);

  try {
    const result = streamText({
      model,
      messages: [
        {
          role: "system",
          content:
            "You have access to tools. When asked for information, use the available tools.",
        },
        {
          role: "user",
          content: "Can you get information about JavaScript?",
        },
      ],
      tools: {
        getInfo: testTool,
      },
      maxSteps: 5,
      onStepFinish({ text, toolCalls, toolResults, finishReason, stepIndex }) {
        console.log(`\n--- Step ${(stepIndex ?? 0) + 1} Finished ---`);
        console.log("Finish reason:", finishReason);
        console.log("Text:", text || "(empty)");
        console.log("Tool calls:", toolCalls?.length || 0);
        console.log("Tool results:", toolResults?.length || 0);

        if (toolCalls && toolCalls.length > 0) {
          console.log(
            "Tool called:",
            toolCalls.map((tc) => tc.toolName).join(", ")
          );
        }
      },
    });

    // Consume the stream
    let fullText = "";
    for await (const textPart of result.textStream) {
      fullText += textPart;
      process.stdout.write(textPart);
    }

    console.log("\n\n--- Final Result ---");
    console.log("Full text length:", fullText.length);
    console.log("Full text:", fullText || "(no text generated)");

    // Get final result
    const finalResult = await result;
    console.log("\n--- Steps Summary ---");
    console.log("Total steps:", finalResult.steps?.length || "unknown");
    console.log("Final finish reason:", finalResult.finishReason);
    console.log("Usage:", finalResult.usage);
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error);
  }
}

// Run tests
async function runTests() {
  console.log("Starting tool calling tests...\n");

  // Test GPT-4o-mini
  await testModel("openai/gpt-4o-mini");

  // Wait a bit between tests
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Test GPT-OSS-120B
  await testModel("openai/gpt-oss-120b");

  console.log("\n\n✅ Tests complete!");
}

runTests().catch(console.error);
