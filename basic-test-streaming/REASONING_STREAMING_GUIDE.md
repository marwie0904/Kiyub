# OpenRouter Reasoning Streaming Implementation Guide

This document explains how to implement real-time streaming with reasoning tokens using OpenRouter and the Vercel AI SDK.

## Overview

We've successfully implemented a streaming chat interface that displays both:
1. **Reasoning tokens** (the AI's thinking process)
2. **Answer tokens** (the final response)

Both stream in real-time, word-by-word, just like ChatGPT.
s
---

## Architecture

### Backend (API Route)

**File**: `app/api/chat-with-reasoning/route.ts`

The backend creates a custom stream that:
1. Fetches from OpenRouter with `include_reasoning: true`
2. Parses the Server-Sent Events (SSE) stream
3. Separates reasoning tokens from content tokens
4. Formats them with markers (`🧠 REASONING:` and `💬 ANSWER:`)
5. Returns a `StreamingTextResponse`

```typescript
import { StreamingTextResponse } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  // 1. Fetch from OpenRouter with reasoning enabled
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-120b',
      messages,
      stream: true,
      include_reasoning: true, // ← KEY: Enable reasoning tokens
    }),
  });

  // 2. Create custom stream processor
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const customStream = new ReadableStream({
    async start(controller) {
      const reader = response.body?.getReader();
      if (!reader) return;

      let reasoningPhase = true;
      let reasoningSent = false;

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(line => line.trim());

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices?.[0]?.delta;

                // 3. Extract reasoning tokens
                if (delta?.reasoning) {
                  if (reasoningPhase && !reasoningSent) {
                    controller.enqueue(encoder.encode('🧠 REASONING: '));
                    reasoningSent = true;
                  }
                  if (reasoningPhase) {
                    controller.enqueue(encoder.encode(delta.reasoning));
                  }
                }

                // 4. Extract content tokens
                if (delta?.content) {
                  if (reasoningPhase) {
                    controller.enqueue(encoder.encode('\n\n💬 ANSWER: '));
                    reasoningPhase = false;
                  }
                  controller.enqueue(encoder.encode(delta.content));
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      } finally {
        controller.close();
      }
    },
  });

  // 5. Return as StreamingTextResponse
  return new StreamingTextResponse(customStream);
}
```

**Key Points**:
- `include_reasoning: true` tells OpenRouter to include reasoning tokens
- `delta.reasoning` contains the thinking process
- `delta.content` contains the actual answer
- We add markers to separate them in the stream

---

### Frontend (React Component)

**File**: `app/custom-reasoning/page.tsx`

The frontend uses **custom stream reading** instead of `useChat` hook to have full control over parsing.

```typescript
'use client';

import { useState, FormEvent } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  reasoning?: string;
}

export default function CustomReasoningChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // 1. Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // 2. Create placeholder for assistant message
    const assistantMessageId = (Date.now() + 1).toString();
    let assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      reasoning: '',
    };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      // 3. Fetch from API
      const response = await fetch('/api/chat-with-reasoning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      // 4. Read stream manually
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      let fullText = '';
      let isReasoningPhase = true;

      // 5. Process stream chunks
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;

        // 6. Parse reasoning vs answer
        if (fullText.includes('💬 ANSWER:')) {
          const parts = fullText.split('💬 ANSWER:');
          const reasoningPart = parts[0].replace('🧠 REASONING:', '').trim();
          const answerPart = parts[1] || '';

          assistantMessage = {
            ...assistantMessage,
            reasoning: reasoningPart,
            content: answerPart,
          };
          isReasoningPhase = false;
        } else if (isReasoningPhase) {
          assistantMessage = {
            ...assistantMessage,
            reasoning: fullText.replace('🧠 REASONING:', '').trim(),
          };
        } else {
          assistantMessage = {
            ...assistantMessage,
            content: fullText.split('💬 ANSWER:')[1] || '',
          };
        }

        // 7. Update UI in real-time
        setMessages(prev =>
          prev.map(m => (m.id === assistantMessageId ? assistantMessage : m))
        );
      }
    } catch (error) {
      console.error('Streaming error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 8. Render UI with separate reasoning and answer sections
  return (
    <div>
      {messages.map((message) => (
        <div key={message.id}>
          {message.role === 'assistant' && message.reasoning && (
            <div style={{ backgroundColor: '#fff3e0' }}>
              🧠 Reasoning: {message.reasoning}
            </div>
          )}
          {message.role === 'assistant' && message.content && (
            <div style={{ backgroundColor: '#e8f5e9' }}>
              💬 Answer: {message.content}
            </div>
          )}
          {message.role === 'user' && (
            <div>{message.content}</div>
          )}
        </div>
      ))}
    </div>
  );
}
```

**Key Points**:
- **Don't use `useChat`** - it doesn't give enough control for custom parsing
- Use `response.body.getReader()` to read the stream manually
- Accumulate chunks in `fullText` and parse markers
- Update React state on every chunk for real-time UI updates
- Separate `reasoning` and `content` into different UI sections

---

## Why This Approach?

### ❌ Why Not `useChat` Hook?

The Vercel AI SDK's `useChat` hook:
- Automatically handles streaming
- But doesn't expose reasoning tokens separately
- Filters or combines them into the content
- Doesn't give control over custom parsing

### ✅ Why Custom Stream Reading?

Our custom implementation:
- Full control over parsing the stream
- Can separate reasoning from content
- Can display them in different UI sections
- Both stream in real-time (not batched)

---

## Stream Format

### What OpenRouter Sends:

```
data: {"choices":[{"delta":{"reasoning":"User asks..."}}]}
data: {"choices":[{"delta":{"reasoning":" simple math"}}]}
data: {"choices":[{"delta":{"content":"2"}}]}
data: {"choices":[{"delta":{"content":"+"}}]}
data: {"choices":[{"delta":{"content":"2"}}]}
data: [DONE]
```

### What Our API Sends to Frontend:

```
🧠 REASONING: User asks simple math. Answer: 4.

💬 ANSWER: 2+2 = 4
```

### What Frontend Displays:

Two separate boxes:
1. **Orange box**: Reasoning tokens (streaming)
2. **Green box**: Answer tokens (streaming)

---

## Testing

### 1. Basic Chat (No Reasoning)
- URL: `http://localhost:3000`
- Uses `useChat` hook
- Streams only the answer

### 2. Custom Reasoning Chat
- URL: `http://localhost:3000/custom-reasoning`
- Uses custom stream reader
- Shows both reasoning and answer in real-time

### 3. Verify Streaming is Real-Time

Run this test to see timestamps:
```bash
npm run test-realtime
```

Output shows chunks arriving at different times (e.g., 1889ms, 1962ms, 1993ms) proving real-time streaming.

---

## Key Files

```
frontend-example/
├── app/
│   ├── page.tsx                          # Basic chat (useChat)
│   ├── custom-reasoning/
│   │   └── page.tsx                      # Custom reasoning chat
│   └── api/
│       ├── chat/
│       │   └── route.ts                  # Basic streaming API
│       └── chat-with-reasoning/
│           └── route.ts                  # Reasoning streaming API
```

---

## Environment Setup

`.env.local`:
```
OPENROUTER_API_KEY=your_key_here
```

`package.json`:
```json
{
  "dependencies": {
    "ai": "^3.4.33",
    "next": "^15.1.6",
    "react": "^19.0.0"
  }
}
```

---

## Summary

| Aspect | Implementation |
|--------|---------------|
| **Backend** | Custom `ReadableStream` that parses SSE and separates reasoning/content |
| **Frontend** | Manual `fetch` + `reader.read()` loop instead of `useChat` |
| **Streaming** | Real-time, word-by-word (verified with timestamps) |
| **Display** | Separate UI sections for reasoning and answer |
| **Format** | Markers: `🧠 REASONING:` and `💬 ANSWER:` |

The key insight: **Custom stream processing gives full control over reasoning tokens**, which the standard `useChat` hook doesn't provide.
