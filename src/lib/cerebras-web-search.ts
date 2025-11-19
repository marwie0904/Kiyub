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
        }
      },
      required: ['query'],
      additionalProperties: false
    }
  }
};

// Execute web search using Serper
async function executeWebSearch(query: string) {
  console.log('🔍 [Cerebras Web Search] Executing search for:', query);

  const response = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': process.env.SERPER_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ q: query, num: 5 }),
  });

  if (!response.ok) {
    throw new Error(`Serper API error: ${response.statusText}`);
  }

  const data = await response.json();

  console.log('✅ [Cerebras Web Search] Search completed successfully');

  return {
    organic: data.organic?.slice(0, 5).map((result: any) => ({
      title: result.title,
      snippet: result.snippet,
      link: result.link,
    })) || [],
    answerBox: data.answerBox || null,
  };
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
  }
): Promise<CerebrasWebSearchResult> {
  const cerebras = new Cerebras({
    apiKey: process.env.CEREBRAS_API_KEY
  });

  const conversationMessages: any[] = [...messages];
  let iteration = 0;
  const maxIterations = options?.maxIterations || 5;
  let toolCallsCount = 0;
  let totalUsage = {
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0
  };

  console.log('🚀 [Cerebras Web Search] Starting conversation');

  while (iteration < maxIterations) {
    iteration++;
    console.log(`🔄 [Cerebras Web Search] Iteration ${iteration}/${maxIterations}`);

    // Call Cerebras model
    const completion = await cerebras.chat.completions.create({
      messages: conversationMessages,
      model: 'gpt-oss-120b',
      tools: [webSearchTool],
      tool_choice: 'auto',
      max_completion_tokens: options?.maxTokens || 2000,
      temperature: options?.temperature ?? 0.7,
      stream: false
    });

    const assistantMessage = completion.choices[0].message;

    // Accumulate token usage
    if (completion.usage) {
      totalUsage.promptTokens += completion.usage.prompt_tokens || 0;
      totalUsage.completionTokens += completion.usage.completion_tokens || 0;
      totalUsage.totalTokens += completion.usage.total_tokens || 0;
    }

    // Add assistant message to conversation
    conversationMessages.push(assistantMessage);

    // Check if there are tool calls
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      console.log(`🛠️  [Cerebras Web Search] Model requested ${assistantMessage.tool_calls.length} tool call(s)`);
      toolCallsCount += assistantMessage.tool_calls.length;

      // Execute each tool call
      for (const toolCall of assistantMessage.tool_calls) {
        if (toolCall.function.name === 'webSearch') {
          const args = JSON.parse(toolCall.function.arguments);
          console.log('🔍 [Cerebras Web Search] Search query:', args.query);

          const searchResults = await executeWebSearch(args.query);

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
      console.log(`📊 [Cerebras Web Search] Total usage: ${totalUsage.totalTokens} tokens (${totalUsage.promptTokens} prompt + ${totalUsage.completionTokens} completion)`);
      console.log(`🛠️  [Cerebras Web Search] Tool calls made: ${toolCallsCount}`);

      return {
        content: assistantMessage.content,
        reasoning: (assistantMessage as any).reasoning,
        usage: totalUsage,
        toolCalls: toolCallsCount
      };
    }

    // Model stopped without response
    throw new Error('Model finished without providing content');
  }

  throw new Error('Reached max iterations without completion');
}
