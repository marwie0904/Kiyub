import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";
import { webSearchTool } from "@/lib/tools/web-search";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import { trackLLMCallServer, calculateLLMCost } from "@/lib/analytics/llm-tracking";
import { usdToPhp } from "@/lib/currency";
import { getProviderForModel } from "@/lib/provider-helper";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Helper function to convert UIMessages to CoreMessages
function convertMessages(messages: any[]) {
  return messages.map((msg: any) => {
    // If message has parts (UIMessage format), extract text content
    if (msg.parts) {
      const textContent = msg.parts
        .filter((part: any) => part.type === "text" && part.text)
        .map((part: any) => part.text)
        .join("");

      return {
        role: msg.role,
        content: textContent,
      };
    }

    // Already in CoreMessage format
    return {
      role: msg.role,
      content: msg.content,
    };
  });
}

export async function POST(req: Request) {
  const startTime = Date.now();

  try {
    const { selectedText, conversationContext, userQuestion, model } =
      await req.json();

    console.log("=== Highlight Chat API Request ===");
    console.log("Model:", model);
    console.log("Selected text:", selectedText);
    console.log("User question:", userQuestion);

    // Convert conversation context to CoreMessages
    const contextMessages = convertMessages(conversationContext);

    // Build the prompt with context
    const systemPrompt = `You are an AI assistant helping to answer questions about specific text from a conversation. Here is the full conversation context for reference:

${contextMessages.map((msg) => `${msg.role}: ${msg.content}`).join("\n\n")}

---

The user has highlighted the following text and has a question about it:

HIGHLIGHTED TEXT:
"""
${selectedText}
"""

Please answer their question concisely and accurately. If you don't know something, be honest about it.`;

    // Create messages array for the AI
    const messages = [
      {
        role: "system" as const,
        content: systemPrompt,
      },
      {
        role: "user" as const,
        content: userQuestion,
      },
    ];

    console.log("Messages being sent to AI:", JSON.stringify(messages, null, 2));

    // Initialize OpenRouter with API key
    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    // Configure provider preferences based on model
    const getProviderConfig = (modelName: string) => {
      switch (modelName) {
        case "openai/gpt-oss-120b":
          return {
            providerPreferences: {
              order: ["gmicloud/fp4"],
            },
          };
        case "openai/gpt-oss-20b":
          return {
            providerPreferences: {
              order: ["hyperbolic"],
            },
          };
        case "moonshotai/kimi-k2-thinking":
          return {
            providerPreferences: {
              order: ["chutes/int4", "fireworks"],
            },
          };
        default:
          return {};
      }
    };

    // Create the model instance with the same model as main chat and enable usage tracking
    const selectedModel = openrouter(model || "openai/gpt-oss-120b", {
      usage: {
        include: true,
      },
      ...getProviderConfig(model || "openai/gpt-oss-120b"),
    });

    // Stream the response with onFinish callback for tracking
    const result = streamText({
      model: selectedModel,
      messages: messages,
      // Note: Tools disabled for highlight chat to avoid compatibility issues with some providers
      onFinish: async ({ usage, experimental_providerMetadata }) => {
        console.log("✅ Generation complete, tracking usage...");

        // OpenRouter returns usage in providerMetadata
        const openrouterUsage = (experimental_providerMetadata as any)?.openrouter?.usage;

        console.log("📊 [RAW] OpenRouter usage:", JSON.stringify(openrouterUsage, null, 2));
        console.log("📊 [RAW] AI SDK usage:", JSON.stringify(usage, null, 2));

        if (usage) {
          const usageData = usage as any;
          const promptToks = usageData?.inputTokens ?? openrouterUsage?.prompt_tokens ?? usageData?.promptTokens ?? usageData?.prompt_tokens ?? 0;
          const completionToks = usageData?.outputTokens ?? openrouterUsage?.completion_tokens ?? usageData?.completionTokens ?? usageData?.completion_tokens ?? 0;
          const reasoningToks = usageData?.reasoningTokens ?? 0;
          const totalToks = usageData?.totalTokens ?? openrouterUsage?.total_tokens ?? usageData?.total_tokens ?? (promptToks + completionToks);
          const modelName = model || "openai/gpt-oss-120b";
          const costUsd = calculateLLMCost(modelName, promptToks, completionToks);
          const costPhp = usdToPhp(costUsd);

          console.log("💰 [Cost Tracking] Model:", modelName);
          console.log("💰 [Cost Tracking] Tokens:", { promptToks, completionToks, totalToks });
          console.log("💰 [Cost Tracking] Cost USD:", costUsd);
          console.log("💰 [Cost Tracking] Cost PHP:", costPhp);

          // Track in PostHog
          await trackLLMCallServer({
            model: modelName,
            provider: "openrouter",
            promptTokens: promptToks,
            completionTokens: completionToks,
            totalTokens: totalToks,
            cost: costUsd,
            latencyMs: Date.now() - startTime,
            success: true,
          });

          // Track in Convex aiTracking table
          await convex.mutation(api.aiTracking.track, {
            inputTokens: promptToks,
            outputTokens: completionToks,
            reasoningTokens: reasoningToks > 0 ? reasoningToks : undefined,
            totalTokens: totalToks,
            model: modelName,
            provider: getProviderForModel(modelName),
            usageType: "quick_question",
            costUsd,
            costPhp,
            latencyMs: Date.now() - startTime,
            success: true,
          });

          console.log("✅ Quick question tracking successful:", {
            inputTokens: promptToks,
            outputTokens: completionToks,
            latencyMs: Date.now() - startTime,
          });
        }
      },
    });

    // Return the streaming response
    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Highlight Chat API Error:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    // Track failed LLM call in PostHog
    await trackLLMCallServer({
      model: "unknown",
      provider: "openrouter",
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      cost: 0,
      latencyMs: 0,
      success: false,
      errorMessage,
    });

    // Track failed LLM call in Convex
    try {
      await convex.mutation(api.aiTracking.track, {
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        model: "unknown",
        provider: "unknown",
        usageType: "quick_question",
        costUsd: 0,
        costPhp: 0,
        success: false,
        errorMessage,
      });
    } catch (trackError) {
      console.error("Failed to track error in Convex:", trackError);
    }

    return new Response(
      JSON.stringify({
        error: "Failed to process highlight chat request",
        details: errorMessage,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
