import { OpenRouter } from '@openrouter/sdk';
import 'dotenv/config';

const openRouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const question = 'How would you build the tallest building ever?';

console.log('Question:', question);
console.log('\n--- REASONING ---\n');

const stream = await openRouter.chat.send({
  model: 'openai/gpt-oss-120b',
  messages: [{ role: 'user', content: question }],
  stream: true
});

let isReasoning = true;

for await (const chunk of stream) {
  // Type assertion to handle reasoning field (not yet in SDK types)
  const delta = chunk.choices[0]?.delta as any;

  // Handle reasoning tokens
  const reasoning = delta?.reasoning;
  if (reasoning) {
    process.stdout.write(reasoning);
  }

  // Handle regular response content
  const content = delta?.content;
  if (content) {
    if (isReasoning) {
      console.log('\n\n--- RESPONSE ---\n');
      isReasoning = false;
    }
    process.stdout.write(content);
  }
}
