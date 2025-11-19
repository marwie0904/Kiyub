import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { webSearchTool } from "@/lib/tools/web-search";
import { trackLLMCallServer, calculateLLMCost } from "@/lib/analytics/llm-tracking";
import { usdToPhp } from "@/lib/currency";
import { getProviderForModel } from "@/lib/provider-helper";

export const maxDuration = 30;

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  const startTime = Date.now();
  let modelName = "openai/gpt-oss-20b"; // Default model

  try {
    const { message, cardId, canvasId, model } = await req.json();

    if (!message || !cardId || !canvasId) {
      return Response.json({ error: "Missing message, cardId, or canvasId" }, { status: 400 });
    }

    // Use the selected model or default to GPT-OSS-20B (FREIRE LITE)
    modelName = model || "openai/gpt-oss-20b";

    // Get all cards for this canvas
    const cards = await convex.query(api.canvasCards.list, {
      canvasId: canvasId as Id<"canvases">
    });

    const currentCard = cards?.find((c: any) => c._id === cardId);
    if (!currentCard) {
      return Response.json({ error: "Card not found" }, { status: 404 });
    }

    const conversationHistory = currentCard.conversationHistory || [];

    // Build messages for AI with system prompt
    const messages = [
      {
        role: "system" as const,
        content: "You have access to a web search tool. When the user asks you to search for information, look up current events, or get real-time data, you MUST use the webSearch tool. Always use the tool when the user explicitly mentions 'web search' or 'search for'.\n\nIMPORTANT GUIDELINES:\n- If you do not know the answer or if the question is ambiguous, use the webSearch tool to find a better understanding.\n- If the question requires recent, up-to-date, or web-based information, use the webSearch tool to get current data.\n- When uncertain about factual information, prefer searching rather than guessing or providing potentially outdated information.\n- Use web search proactively for any topic that may have changed recently or requires real-time information.",
      },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: "user" as const,
        content: message,
      },
    ];

    // Use OpenRouter to generate response
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

    // Store token usage to send at the end (captured from onFinish)
    let tokenUsageData: { promptTokens: number; completionTokens: number; totalTokens: number } | null = null;

    // Use streamText for streaming response
    const result = streamText({
      model: openrouter(modelName, {
        usage: {
          include: true,
        },
        ...getProviderConfig(modelName),
      }),
      messages,
      tools: {
        webSearch: webSearchTool,
      },
      onFinish: async ({ text, usage, experimental_providerMetadata }: any) => {
        console.log("✅ Generation complete, tracking usage...");

        // Track AI usage
        const latencyMs = Date.now() - startTime;

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
          const costUsd = calculateLLMCost(modelName, promptToks, completionToks);

          console.log("💰 Cost Calculation:", {
            modelName,
            promptToks,
            completionToks,
            costUsd,
            costPhp: usdToPhp(costUsd),
          });

          // Store token usage to send in stream
          tokenUsageData = {
            promptTokens: promptToks,
            completionTokens: completionToks,
            totalTokens: totalToks,
          };

          // Track in PostHog
          await trackLLMCallServer({
            model: modelName,
            provider: "openrouter",
            promptTokens: promptToks,
            completionTokens: completionToks,
            totalTokens: totalToks,
            cost: costUsd,
            latencyMs,
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
            usageType: "canvas",
            costUsd,
            costPhp: usdToPhp(costUsd),
            canvasId: canvasId as Id<"canvases">,
            latencyMs,
            success: true,
          });

          console.log("✅ Canvas tracking successful:", {
            inputTokens: promptToks,
            outputTokens: completionToks,
            latencyMs,
          });
        }
      },
    });

    // Use TransformStream to convert AI SDK stream to our format
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    // Stream chunks in background
    (async () => {
      try {
        for await (const chunk of result.textStream) {
          // Stream text chunks in AI SDK format: 0:"text"
          await writer.write(encoder.encode(`0:${JSON.stringify(chunk)}\n`));
        }

        // Wait for onFinish to populate tokenUsageData
        await new Promise(resolve => setTimeout(resolve, 200));

        // Send token usage as final metadata chunk (captured from onFinish)
        if (tokenUsageData) {
          console.log("📤 Sending token usage to client:", tokenUsageData);
          await writer.write(encoder.encode(`e:${JSON.stringify({ tokenUsage: tokenUsageData })}\n`));
        }

        await writer.close();
      } catch (error) {
        console.error("❌ Stream error:", error);
        await writer.abort(error);
      }
    })();

    // Return streaming response
    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Canvas chat error:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    // Track failed LLM call in PostHog
    await trackLLMCallServer({
      model: modelName || "openai/gpt-oss-20b",
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
        model: modelName || "openai/gpt-oss-20b",
        provider: getProviderForModel(modelName || "openai/gpt-oss-20b"),
        usageType: "canvas",
        costUsd: 0,
        costPhp: 0,
        success: false,
        errorMessage,
      });
    } catch (trackError) {
      console.error("Failed to track error in Convex:", trackError);
    }

    return Response.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
