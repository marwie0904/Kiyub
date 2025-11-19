// Next.js App Router API Route Example with Reasoning Tokens
// File: app/api/chat-reasoning/route.ts

import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText } from 'ai';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openrouter('deepseek/deepseek-r1'), // Use a reasoning model
    messages,
  });

  // The result will include reasoning tokens in the stream
  // They'll be accessible via result.experimental_reasoning or in the response
  return result.toTextStreamResponse();
}
