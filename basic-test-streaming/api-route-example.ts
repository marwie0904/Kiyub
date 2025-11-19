import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText } from 'ai';
import 'dotenv/config';

// This example shows how to create an API route that works with Vercel AI SDK's useChat hook
// In Next.js, this would be in app/api/chat/route.ts

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Simulating a POST request with messages
async function handleChatRequest() {
  const messages = [
    { role: 'user' as const, content: 'How would you build the tallest building ever?' }
  ];

  const result = streamText({
    model: openrouter('openai/gpt-oss-120b'),
    messages,
  });

  // Stream the response
  console.log('Streaming response:\n');
  for await (const chunk of result.textStream) {
    process.stdout.write(chunk);
  }

  console.log('\n\nDone!');
}

handleChatRequest();
