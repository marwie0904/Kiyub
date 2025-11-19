import { OpenRouter } from '@openrouter/sdk';
import 'dotenv/config';

const openRouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const question = 'How would you build the tallest building ever?';

console.log('Question:', question);
console.log('\nStreaming response:\n');

const stream = await openRouter.chat.send({
  model: 'openai/gpt-oss-120b',
  messages: [{ role: 'user', content: question }],
  stream: true
});

for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content;
  if (content) {
    process.stdout.write(content);
  }
}
