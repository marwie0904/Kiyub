import { tool } from "ai";
import { z } from "zod";

// Web search tool using Serper API
// @ts-ignore - AI SDK v5 type issue with execute property
export const webSearchTool = tool({
  description:
    "Search the web for current information, recent events, or real-time data. Use this when the user asks to search for something or when you need up-to-date information.",
  parameters: z.object({
    query: z.string().describe("The search query to look up"),
    numResults: z.number().min(3).max(10).optional().describe(
      "Number of search results to return (3-10). Choose based on query complexity:\n" +
      "- 3: Simple, straightforward queries (e.g., 'capital of France')\n" +
      "- 5-6: Medium complexity or general research (e.g., 'current events in tech')\n" +
      "- 7: Complex topics requiring multiple perspectives (e.g., 'climate change solutions')\n" +
      "- 10: Very complex research or when user requests extended/thorough results\n" +
      "Default: 5 if not specified"
    ),
  }),
  // @ts-expect-error - AI SDK v5 type incompatibility with execute property
  execute: async ({ query, numResults }) => {
    const resultsToFetch = numResults || 5; // Default to 5 if not specified
    console.log("🔍 [Web Search] Starting search for:", query);
    console.log("📊 [Web Search] Requested results:", resultsToFetch);

    // Handle undefined or empty query
    if (!query || query.trim() === "") {
      console.error("❌ [Web Search] Error: Query is undefined or empty");
      return "Error: Search query is required but was not provided.";
    }

    try {
      const response = await fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: {
          "X-API-KEY": process.env.SERPER_API_KEY || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q: query,
          num: resultsToFetch, // Dynamic based on complexity
        }),
      });

      if (!response.ok) {
        throw new Error(`Serper API error: ${response.statusText}`);
      }

      const data = await response.json();

      console.log("✅ [Web Search] Search completed successfully");
      console.log(`📊 [Web Search] Found ${data.organic?.length || 0} organic results`);

      // Extract sources for display
      const sources = data.organic?.slice(0, 10).map((result: any) => ({
        title: result.title,
        url: result.link,
        snippet: result.snippet,
      })) || [];

      // Format results for the model
      let formattedResults = `Web search results for "${query}":\n\n`;

      // Add answer box if available (direct answer)
      if (data.answerBox) {
        formattedResults += `Direct Answer: ${data.answerBox.answer || data.answerBox.snippet}\n\n`;
      }

      // Add knowledge graph if available
      if (data.knowledgeGraph) {
        const kg = data.knowledgeGraph;
        formattedResults += `Knowledge Graph:\n`;
        formattedResults += `Title: ${kg.title}\n`;
        if (kg.description) formattedResults += `Description: ${kg.description}\n`;
        formattedResults += `\n`;
      }

      // Add organic search results
      if (data.organic && data.organic.length > 0) {
        formattedResults += `Search Results:\n`;
        data.organic.slice(0, resultsToFetch).forEach((result: any, index: number) => {
          formattedResults += `${index + 1}. ${result.title}\n`;
          formattedResults += `   ${result.snippet}\n`;
          formattedResults += `   URL: ${result.link}\n\n`;
        });
      }

      // Return structured data with sources metadata
      return JSON.stringify({
        text: formattedResults,
        sources: sources,
        query: query,
      });
    } catch (error) {
      console.error("❌ [Web Search] Error:", error);
      return `Error performing web search: ${error instanceof Error ? error.message : "Unknown error"}`;
    }
  },
});
