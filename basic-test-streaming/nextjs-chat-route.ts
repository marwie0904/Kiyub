// Next.js App Router API Route Example
// File: app/api/chat/route.ts

import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText } from 'ai';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openrouter('openai/gpt-oss-120b'),
    messages,
  });

  // Return the stream in the format useChat expects
  return result.toTextStreamResponse();
}
