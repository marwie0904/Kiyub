import Cerebras from '@cerebras/cerebras_cloud_sdk';

// Web search tool definition (OpenAI format for Cerebras)
const webSearchTool = {
  type: 'function' as const,
  function: {
    name: 'webSearch',
    strict: true,
    description: 'Search the web for current information using Google Search. Use this when you need up-to-date information, facts, news, or answers that require recent data.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search query to look up on Google'
        },
        numResults: {
          type: 'number',
          description: 'Number of search results to retrieve (2-10). Choose based on complexity: 2-4 for simple facts, 5-7 for verification needs, 8-10 for deep research.',
          minimum: 2,
          maximum: 10
        }
      },
      required: ['query', 'numResults'],
      additionalProperties: false
    }
  }
};

// Execute web search using Serper
async function executeWebSearch(query: string, numResults: number = 10) {
  console.log('🔍 [Cerebras Web Search] Executing search for:', query);
  console.log('📊 [Cerebras Web Search] Requesting', numResults, 'results');

  const response = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': process.env.SERPER_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ q: query, num: numResults }),
  });

  if (!response.ok) {
    throw new Error(`Serper API error: ${response.statusText}`);
  }

  const data = await response.json();

  console.log('✅ [Cerebras Web Search] Search completed successfully');

  return {
    organic: data.organic?.slice(0, numResults).map((result: any) => ({
      title: result.title,
      snippet: result.snippet,
      link: result.link,
    })) || [],
    answerBox: data.answerBox || null,
  };
}

export interface SearchSource {
  title: string;
  url: string;
  snippet?: string;
}

export interface SearchMetadata {
  query: string;
  sources: SearchSource[];
}

export interface CerebrasWebSearchResult {
  content: string;
  reasoning?: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  toolCalls: number;
  searchMetadata?: SearchMetadata;
}

/**
 * Chat with Cerebras using web search tool calling
 * Following the official Cerebras SDK tool calling pattern
 */
export async function chatWithCerebrasWebSearch(
  messages: Array<{ role: string; content: string }>,
  options?: {
    temperature?: number;
    maxTokens?: number;
    maxIterations?: number;
    maxToolCalls?: number;
    reasoning?: "low" | "high";
  }
): Promise<CerebrasWebSearchResult> {
  const cerebras = new Cerebras({
    apiKey: process.env.CEREBRAS_API_KEY
  });

  const reasoningLevel = options?.reasoning || "high";
  const maxToolCalls = options?.maxToolCalls || 1;

  // Add system prompt based on reasoning level
  const systemPromptContent = reasoningLevel === "high"
    ? `CRITICAL INSTRUCTIONS - You have ONLY 4 iterations maximum. By iteration 3, you MUST provide a final response.

EXTENDED THINKING MODE ENABLED - You have ${maxToolCalls} search${maxToolCalls > 1 ? 'es' : ''} available for thorough research.

SEARCH STRATEGY:
- Use BROAD searches instead of narrow, specific ones
- ONE comprehensive search is better than multiple narrow searches
- Example: Instead of searching "IMF 2025 India GDP", "IMF 2025 Bangladesh GDP", "IMF 2025 Vietnam GDP" separately, use ONE search: "IMF 2025 GDP forecast emerging markets Asia India Bangladesh Vietnam"

CHOOSE THE RIGHT NUMBER OF SOURCES (numResults parameter):

**2-4 Sources** - Simple/Factual Requests:
- Weather forecasts, sports scores, stock prices, exchange rates
- Product specifications (phone specs, car features)
- Celebrity facts, release dates, business hours
- Flight status, simple "what is X" definitions
- Current time in different time zones

**5-7 Sources** - Information Requiring Verification:
- Political statements or claims (fact-checking)
- Health and medical advice
- Legal interpretations or regulations
- Breaking news events (to verify accuracy)
- Product reviews and comparisons
- Historical events with contested details
- Scientific findings or studies
- Investment advice or financial analysis
- Educational explanations (how things work)
- Travel recommendations and safety information
- Nutritional information and diet advice
- Technology troubleshooting guides

**8-10 Sources** - Deep Research/Complex Analysis:
- Academic research topics
- Market analysis and trend forecasting
- Comparative industry analysis
- Policy impact assessments
- Multi-faceted historical analysis
- Complex technical implementations
- Career path and salary research across industries
- Real estate market analysis by region
- Strategic business decisions
- Geopolitical situation analysis
- Long-form investigative questions

MAXIMIZE INSIGHT WITH MULTIPLE SEARCHES:
- With ${maxToolCalls} searches available, you can cross-verify information
- Use your first search for broad context, subsequent searches for specific details or verification
- ONLY use webSearch when absolutely necessary for current/recent information
- Prefer answering from existing knowledge when possible`
    : `QUICK MODE - You have ONLY 4 iterations maximum. By iteration 3, you MUST provide a final response.

FAST SEARCH STRATEGY:
- You have ONLY ${maxToolCalls} search available - make it count
- Use BROAD, comprehensive searches to gather all needed information at once
- Example: Instead of multiple narrow searches, use ONE comprehensive query

CHOOSE THE RIGHT NUMBER OF SOURCES (numResults parameter):
- **2-4 Sources**: Simple facts (weather, scores, prices, definitions)
- **5-7 Sources**: Verification needs (news, reviews, health/legal info)
- **8-10 Sources**: Deep research (academic, market analysis, complex topics)

MINIMIZE TOOL CALLS:
- ONLY use webSearch when absolutely necessary for current/recent information
- Prefer answering from existing knowledge when possible
- Make your single search comprehensive and thorough`;

  const systemPrompt = {
    role: 'system' as const,
    content: systemPromptContent
  };

  console.log('📋 [Cerebras Web Search] System Prompt:', systemPrompt.content);

  const conversationMessages: any[] = [systemPrompt, ...messages];
  let iteration = 0;
  const maxIterations = options?.maxIterations || 4;
  let toolCallsCount = 0;
  let totalUsage = {
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0
  };
  let allSources: SearchSource[] = [];
  let searchQueries: string[] = [];

  console.log('🚀 [Cerebras Web Search] Starting conversation with max iterations:', maxIterations);
  console.log('🧠 [Cerebras Web Search] Reasoning level:', reasoningLevel);
  console.log('🔒 [Cerebras Web Search] Max tool calls allowed:', maxToolCalls);

  while (iteration < maxIterations) {
    iteration++;
    console.log(`🔄 [Cerebras Web Search] Iteration ${iteration}/${maxIterations}`);

    // If max tool calls reached, don't offer tools anymore - force final answer
    const shouldOfferTools = toolCallsCount < maxToolCalls;

    // If we've hit the tool call limit, add a strong directive to answer now
    if (!shouldOfferTools && iteration > 1) {
      conversationMessages.push({
        role: 'system',
        content: `You have completed ${maxToolCalls} searches and gathered sufficient information. You MUST now provide a comprehensive final answer to the user's question using ONLY the search results you have already received. DO NOT request any more searches. DO NOT say you need to search. Provide a complete answer NOW based on the information you have.`
      });
    }

    // Call Cerebras model with streaming
    const stream = await cerebras.chat.completions.create({
      messages: conversationMessages,
      model: 'gpt-oss-120b',
      tools: shouldOfferTools ? [webSearchTool] : undefined,
      tool_choice: shouldOfferTools ? 'auto' : undefined,
      max_completion_tokens: options?.maxTokens || 2000,
      temperature: options?.temperature ?? 0.7,
      stream: true
    });

    // Initialize assistant message
    let assistantMessage: any = {
      role: 'assistant',
      content: '',
      tool_calls: []
    };

    // Process stream chunks
    let chunkCount = 0;
    for await (const chunk of stream) {
      chunkCount++;
      console.log(`📦 [Cerebras Web Search] Chunk ${chunkCount} received`);

      const delta = chunk.choices[0]?.delta;

      if (!delta) {
        console.log(`⚠️ [Cerebras Web Search] Chunk ${chunkCount}: No delta`);
        continue;
      }

      console.log(`📦 [Cerebras Web Search] Chunk ${chunkCount} delta:`, JSON.stringify(delta));

      // Handle tool calls in stream
      if (delta.tool_calls) {
        console.log(`🛠️ [Cerebras Web Search] Chunk ${chunkCount}: Tool call delta detected`);
        for (const toolCallDelta of delta.tool_calls) {
          const index = toolCallDelta.index;

          // Initialize tool call if new
          if (!assistantMessage.tool_calls[index]) {
            console.log(`🆕 [Cerebras Web Search] Chunk ${chunkCount}: Initializing tool call ${index}`);
            assistantMessage.tool_calls[index] = {
              id: toolCallDelta.id || '',
              type: 'function',
              function: {
                name: toolCallDelta.function?.name || '',
                arguments: ''
              }
            };
          }

          // Accumulate function arguments
          if (toolCallDelta.function?.arguments) {
            console.log(`📝 [Cerebras Web Search] Chunk ${chunkCount}: Tool ${index} arguments: "${toolCallDelta.function.arguments}"`);
            assistantMessage.tool_calls[index].function.arguments +=
              toolCallDelta.function.arguments;
          }
        }
      }

      // Handle content streaming
      if (delta.content) {
        console.log(`📝 [Cerebras Web Search] Chunk ${chunkCount}: Content: "${delta.content}"`);
        assistantMessage.content += delta.content;
      }

      // Handle reasoning (if available)
      if ((delta as any).reasoning) {
        console.log(`🧠 [Cerebras Web Search] Chunk ${chunkCount}: Reasoning detected`);
        if (!assistantMessage.reasoning) assistantMessage.reasoning = '';
        assistantMessage.reasoning += (delta as any).reasoning;
      }

      // Accumulate usage from final chunk
      if (chunk.usage) {
        console.log(`📊 [Cerebras Web Search] Chunk ${chunkCount}: Usage info received`);
        totalUsage.promptTokens = chunk.usage.prompt_tokens || 0;
        totalUsage.completionTokens = chunk.usage.completion_tokens || 0;
        totalUsage.totalTokens = chunk.usage.total_tokens || 0;
      }
    }

    console.log(`✅ [Cerebras Web Search] Stream complete - Total chunks processed: ${chunkCount}`);

    console.log('🔍 [Cerebras Web Search] Stream complete');
    console.log('🔍 [Cerebras Web Search] Content length:', assistantMessage.content.length);
    console.log('🔍 [Cerebras Web Search] Tool calls:', assistantMessage.tool_calls.length);

    // Add assistant message to conversation
    conversationMessages.push(assistantMessage);

    // Check if there are tool calls
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      console.log(`🛠️  [Cerebras Web Search] Model requested ${assistantMessage.tool_calls.length} tool call(s)`);

      // Check if we've already hit the max tool calls limit
      if (toolCallsCount >= maxToolCalls) {
        console.log(`⚠️  [Cerebras Web Search] Max tool calls (${maxToolCalls}) reached. Forcing final response.`);

        // Add a system message to force the model to respond without more tool calls
        conversationMessages.push({
          role: 'system',
          content: `You have reached the maximum number of searches allowed (${maxToolCalls}). You MUST provide a final answer now using the information you have gathered. DO NOT request any more tool calls.`
        });

        // Continue to next iteration to force a response
        continue;
      }

      // Execute tool calls only if under the limit
      for (const toolCall of assistantMessage.tool_calls) {
        if (toolCall.function.name === 'webSearch') {
          // Check before each tool call
          if (toolCallsCount >= maxToolCalls) {
            console.log(`⚠️  [Cerebras Web Search] Skipping tool call - max limit reached`);
            break;
          }

          toolCallsCount++;
          console.log(`🔍 [Cerebras Web Search] Executing search ${toolCallsCount}/${maxToolCalls}`);

          const args = JSON.parse(toolCall.function.arguments);
          console.log('🔍 [Cerebras Web Search] Search query:', args.query);
          console.log('🔍 [Cerebras Web Search] Num results requested:', args.numResults || 10);

          const searchResults = await executeWebSearch(args.query, args.numResults || 10);

          // Track search query
          searchQueries.push(args.query);

          // Collect sources from search results
          if (searchResults.organic && searchResults.organic.length > 0) {
            searchResults.organic.forEach((result: any) => {
              allSources.push({
                title: result.title,
                url: result.link,
                snippet: result.snippet
              });
            });
          }

          // Add tool result to messages
          conversationMessages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(searchResults)
          });
        }
      }

      // Continue to next iteration to get response using tool results
      continue;
    }

    // No tool calls, we have final response
    if (assistantMessage.content) {
      console.log('✅ [Cerebras Web Search] Final response generated');
      console.log('📝 [Cerebras Web Search] Content type:', typeof assistantMessage.content);
      console.log('📝 [Cerebras Web Search] Content preview:', assistantMessage.content.substring(0, 200));
      console.log(`📊 [Cerebras Web Search] Total usage: ${totalUsage.totalTokens} tokens (${totalUsage.promptTokens} prompt + ${totalUsage.completionTokens} completion)`);
      console.log(`🛠️  [Cerebras Web Search] Tool calls made: ${toolCallsCount}`);
      console.log(`📚 [Cerebras Web Search] Sources collected: ${allSources.length}`);

      // Build search metadata if sources were found
      const searchMetadata: SearchMetadata | undefined = allSources.length > 0
        ? {
            query: searchQueries.join(', '),
            sources: allSources
          }
        : undefined;

      return {
        content: assistantMessage.content,
        reasoning: (assistantMessage as any).reasoning,
        usage: totalUsage,
        toolCalls: toolCallsCount,
        searchMetadata
      };
    }

    // Model stopped without response
    throw new Error('Model finished without providing content');
  }

  throw new Error('Reached max iterations without completion');
}

/**
 * Streaming version that yields text chunks in real-time
 * This allows the API route to forward chunks to the frontend immediately
 */
export async function* streamCerebrasWebSearch(
  messages: Array<{ role: string; content: string }>,
  options?: {
    temperature?: number;
    maxTokens?: number;
    maxIterations?: number;
    maxToolCalls?: number;
    reasoning?: "low" | "high";
  }
): AsyncGenerator<{ type: 'content' | 'metadata', data: string | { usage: any; searchMetadata?: SearchMetadata; toolCalls: number } }> {
  const cerebras = new Cerebras({
    apiKey: process.env.CEREBRAS_API_KEY
  });

  const reasoningLevel = options?.reasoning || "high";
  const maxToolCalls = options?.maxToolCalls || 1;

  // Add system prompt based on reasoning level
  const systemPromptContent = reasoningLevel === "high"
    ? `CRITICAL INSTRUCTIONS - You have ONLY 4 iterations maximum. By iteration 3, you MUST provide a final response.

EXTENDED THINKING MODE ENABLED - You have ${maxToolCalls} search${maxToolCalls > 1 ? 'es' : ''} available for thorough research.

SEARCH STRATEGY:
- Use BROAD searches instead of narrow, specific ones
- ONE comprehensive search is better than multiple narrow searches
- Example: Instead of searching "IMF 2025 India GDP", "IMF 2025 Bangladesh GDP", "IMF 2025 Vietnam GDP" separately, use ONE search: "IMF 2025 GDP forecast emerging markets Asia India Bangladesh Vietnam"

CHOOSE THE RIGHT NUMBER OF SOURCES (numResults parameter):

**2-4 Sources** - Simple/Factual Requests:
- Weather forecasts, sports scores, stock prices, exchange rates
- Product specifications (phone specs, car features)
- Celebrity facts, release dates, business hours
- Flight status, simple "what is X" definitions
- Current time in different time zones

**5-7 Sources** - Information Requiring Verification:
- Political statements or claims (fact-checking)
- Health and medical advice
- Legal interpretations or regulations
- Breaking news events (to verify accuracy)
- Product reviews and comparisons
- Historical events with contested details
- Scientific findings or studies
- Investment advice or financial analysis
- Educational explanations (how things work)
- Travel recommendations and safety information
- Nutritional information and diet advice
- Technology troubleshooting guides

**8-10 Sources** - Deep Research/Complex Analysis:
- Academic research topics
- Market analysis and trend forecasting
- Comparative industry analysis
- Policy impact assessments
- Multi-faceted historical analysis
- Complex technical implementations
- Career path and salary research across industries
- Real estate market analysis by region
- Strategic business decisions
- Geopolitical situation analysis
- Long-form investigative questions

MAXIMIZE INSIGHT WITH MULTIPLE SEARCHES:
- With ${maxToolCalls} searches available, you can cross-verify information
- Use your first search for broad context, subsequent searches for specific details or verification
- ONLY use webSearch when absolutely necessary for current/recent information
- Prefer answering from existing knowledge when possible`
    : `QUICK MODE - You have ONLY 4 iterations maximum. By iteration 3, you MUST provide a final response.

FAST SEARCH STRATEGY:
- You have ONLY ${maxToolCalls} search available - make it count
- Use BROAD, comprehensive searches to gather all needed information at once
- Example: Instead of multiple narrow searches, use ONE comprehensive query

CHOOSE THE RIGHT NUMBER OF SOURCES (numResults parameter):
- **2-4 Sources**: Simple facts (weather, scores, prices, definitions)
- **5-7 Sources**: Verification needs (news, reviews, health/legal info)
- **8-10 Sources**: Deep research (academic, market analysis, complex topics)

MINIMIZE TOOL CALLS:
- ONLY use webSearch when absolutely necessary for current/recent information
- Prefer answering from existing knowledge when possible
- Make your single search comprehensive and thorough`;

  const systemPrompt = {
    role: 'system' as const,
    content: systemPromptContent
  };

  console.log('📋 [Cerebras Stream] System Prompt:', systemPrompt.content);

  const conversationMessages: any[] = [systemPrompt, ...messages];
  let iteration = 0;
  const maxIterations = options?.maxIterations || 4;
  let toolCallsCount = 0;
  let totalUsage = {
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0
  };
  let allSources: SearchSource[] = [];
  let searchQueries: string[] = [];

  console.log('🚀 [Cerebras Stream] Starting conversation with max iterations:', maxIterations);
  console.log('🧠 [Cerebras Stream] Reasoning level:', reasoningLevel);
  console.log('🔒 [Cerebras Stream] Max tool calls allowed:', maxToolCalls);

  while (iteration < maxIterations) {
    iteration++;
    console.log(`🔄 [Cerebras Stream] Iteration ${iteration}/${maxIterations}`);

    // If max tool calls reached, don't offer tools anymore - force final answer
    const shouldOfferTools = toolCallsCount < maxToolCalls;

    // If we've hit the tool call limit, add a strong directive to answer now
    if (!shouldOfferTools && iteration > 1) {
      conversationMessages.push({
        role: 'system',
        content: `You have completed ${maxToolCalls} searches and gathered sufficient information. You MUST now provide a comprehensive final answer to the user's question using ONLY the search results you have already received. DO NOT request any more searches. DO NOT say you need to search. Provide a complete answer NOW based on the information you have.`
      });
    }

    // Call Cerebras model with streaming
    const stream = await cerebras.chat.completions.create({
      messages: conversationMessages,
      model: 'gpt-oss-120b',
      tools: shouldOfferTools ? [webSearchTool] : undefined,
      tool_choice: shouldOfferTools ? 'auto' : undefined,
      max_completion_tokens: options?.maxTokens || 2000,
      temperature: options?.temperature ?? 0.7,
      stream: true
    });

    // Initialize assistant message
    let assistantMessage: any = {
      role: 'assistant',
      content: '',
      tool_calls: []
    };

    // Process stream chunks - forward content immediately
    let chunkCount = 0;
    console.log(`🔵 [Cerebras Stream] Starting to read from Cerebras API stream...`);

    for await (const chunk of stream) {
      chunkCount++;
      console.log(`🔵 [Cerebras Stream] Chunk #${chunkCount} received from API`);

      const delta = chunk.choices[0]?.delta;

      if (!delta) {
        console.log(`⚠️ [Cerebras Stream] Chunk #${chunkCount} has no delta, skipping`);
        continue;
      }

      // Handle tool calls in stream (accumulate, don't forward)
      if (delta.tool_calls) {
        console.log(`🔵 [Cerebras Stream] Chunk #${chunkCount} contains tool calls`);
        for (const toolCallDelta of delta.tool_calls) {
          const index = toolCallDelta.index;

          if (!assistantMessage.tool_calls[index]) {
            assistantMessage.tool_calls[index] = {
              id: toolCallDelta.id || '',
              type: 'function',
              function: {
                name: toolCallDelta.function?.name || '',
                arguments: ''
              }
            };
          }

          if (toolCallDelta.function?.arguments) {
            assistantMessage.tool_calls[index].function.arguments +=
              toolCallDelta.function.arguments;
          }
        }
      }

      // Handle content streaming - YIELD immediately to frontend
      if (delta.content) {
        console.log(`🟢 [Cerebras Stream] Chunk #${chunkCount} contains content, yielding to API route`);
        yield { type: 'content', data: delta.content };
        assistantMessage.content += delta.content;
        console.log(`✅ [Cerebras Stream] Chunk #${chunkCount} yielded successfully`);
      }

      // Handle reasoning (if available) - accumulate but don't forward
      if ((delta as any).reasoning) {
        console.log(`🔵 [Cerebras Stream] Chunk #${chunkCount} contains reasoning`);
        if (!assistantMessage.reasoning) assistantMessage.reasoning = '';
        assistantMessage.reasoning += (delta as any).reasoning;
      }

      // Accumulate usage from final chunk
      if (chunk.usage) {
        console.log(`🔵 [Cerebras Stream] Chunk #${chunkCount} contains usage data`);
        totalUsage.promptTokens = chunk.usage.prompt_tokens || 0;
        totalUsage.completionTokens = chunk.usage.completion_tokens || 0;
        totalUsage.totalTokens = chunk.usage.total_tokens || 0;
      }
    }

    console.log(`🏁 [Cerebras Stream] Stream iteration complete - Total chunks: ${chunkCount}`);

    // Add assistant message to conversation
    conversationMessages.push(assistantMessage);

    // Check if there are tool calls
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      console.log(`🛠️  [Cerebras Stream] Model requested ${assistantMessage.tool_calls.length} tool call(s)`);

      // Check if we've already hit the max tool calls limit
      if (toolCallsCount >= maxToolCalls) {
        console.log(`⚠️  [Cerebras Stream] Max tool calls (${maxToolCalls}) reached. Forcing final response.`);

        // Add a system message to force the model to respond without more tool calls
        conversationMessages.push({
          role: 'system',
          content: `You have reached the maximum number of searches allowed (${maxToolCalls}). You MUST provide a final answer now using the information you have gathered. DO NOT request any more tool calls.`
        });

        // Continue to next iteration to force a response
        continue;
      }

      // Execute tool calls only if under the limit
      for (const toolCall of assistantMessage.tool_calls) {
        if (toolCall.function.name === 'webSearch') {
          // Check before each tool call
          if (toolCallsCount >= maxToolCalls) {
            console.log(`⚠️  [Cerebras Stream] Skipping tool call - max limit reached`);
            break;
          }

          toolCallsCount++;
          console.log(`🔍 [Cerebras Stream] Executing search ${toolCallsCount}/${maxToolCalls}`);

          const args = JSON.parse(toolCall.function.arguments);
          console.log('🔍 [Cerebras Stream] Search query:', args.query);

          const searchResults = await executeWebSearch(args.query, args.numResults || 10);

          // Track search query
          searchQueries.push(args.query);

          // Collect sources from search results
          if (searchResults.organic && searchResults.organic.length > 0) {
            searchResults.organic.forEach((result: any) => {
              allSources.push({
                title: result.title,
                url: result.link,
                snippet: result.snippet
              });
            });
          }

          // Add tool result to messages
          conversationMessages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(searchResults)
          });
        }
      }

      // Continue to next iteration to get response using tool results
      continue;
    }

    // No tool calls, we have final response - yield metadata and finish
    if (assistantMessage.content) {
      console.log('✅ [Cerebras Stream] Final response complete');
      console.log(`📊 [Cerebras Stream] Total usage: ${totalUsage.totalTokens} tokens`);
      console.log(`🛠️  [Cerebras Stream] Tool calls made: ${toolCallsCount}`);
      console.log(`📚 [Cerebras Stream] Sources collected: ${allSources.length}`);

      // Build search metadata if sources were found
      const searchMetadata: SearchMetadata | undefined = allSources.length > 0
        ? {
            query: searchQueries.join(', '),
            sources: allSources
          }
        : undefined;

      // Yield final metadata
      yield {
        type: 'metadata',
        data: {
          usage: totalUsage,
          searchMetadata,
          toolCalls: toolCallsCount
        }
      };

      return;
    }

    // Model stopped without response
    throw new Error('Model finished without providing content');
  }

  throw new Error('Reached max iterations without completion');
}
