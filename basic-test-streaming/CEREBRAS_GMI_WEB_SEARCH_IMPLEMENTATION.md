# Cerebras & GMI Cloud Web Search Implementation

## Overview

This document covers the **working implementation** of GPT OSS 120b with web search tool calling using Cerebras and GMI Cloud providers.

**Key Finding**: Both Cerebras and GMI Cloud support proper tool calling, unlike OpenRouter which has a critical bug preventing models from generating responses after receiving tool results.

---

## Summary

### What Works ✅

| Provider | Tool Calling | Response After Tool | Reasoning Support | Speed |
|----------|-------------|---------------------|-------------------|-------|
| **Cerebras** | ✅ YES | ✅ YES | ✅ YES (`reasoning` field) | Ultra-fast (~3000 tokens/sec) |
| **GMI Cloud** | ✅ YES | ✅ YES | ✅ YES (`reasoning_content` field) | Fast |
| **OpenRouter** | ✅ YES | ❌ **NO** | Partial (generates but doesn't use) | N/A |

### Architecture

**One AI Model, Two-Step Process:**

1. **Step 1 (Tool Call)**: AI decides to use web search tool
2. **Step 2 (Final Answer)**: Same AI receives search results and generates final answer

This is **NOT** a two-AI approach. It's a single model in a multi-turn conversation.

---

## Implementation Guide

### Prerequisites

```bash
npm install @cerebras/cerebras_cloud_sdk dotenv
```

### Environment Variables

Add to `.env`:

```env
CEREBRAS_API_KEY=your_cerebras_key_here
GMI_API_KEY=your_gmi_key_here
SERPER_API_KEY=your_serper_key_here
```

---

## Cerebras Implementation

### Full Code Example

```typescript
import Cerebras from '@cerebras/cerebras_cloud_sdk';
import 'dotenv/config';

// Web search tool definition (OpenAI format)
const webSearchTool = {
  type: 'function',
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
  const response = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': process.env.SERPER_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ q: query, num: 5 }),
  });

  const data = await response.json();

  return {
    organic: data.organic?.slice(0, 5).map((result: any) => ({
      title: result.title,
      snippet: result.snippet,
      link: result.link,
    })) || [],
    answerBox: data.answerBox || null,
  };
}

async function chatWithWebSearch(question: string) {
  const cerebras = new Cerebras({
    apiKey: process.env.CEREBRAS_API_KEY
  });

  const messages: any[] = [
    {
      role: 'user',
      content: question
    }
  ];

  let iteration = 0;
  const maxIterations = 5;

  while (iteration < maxIterations) {
    iteration++;

    // Call AI model
    const completion = await cerebras.chat.completions.create({
      messages,
      model: 'gpt-oss-120b',
      tools: [webSearchTool],
      tool_choice: 'auto',
      max_completion_tokens: 2000,
      temperature: 0.2,
      stream: false
    });

    const assistantMessage = completion.choices[0].message;

    // Add assistant message to conversation
    messages.push(assistantMessage);

    // Check if there are tool calls
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      // Execute each tool call
      for (const toolCall of assistantMessage.tool_calls) {
        if (toolCall.function.name === 'webSearch') {
          const args = JSON.parse(toolCall.function.arguments);
          const searchResults = await executeWebSearch(args.query);

          // Add tool result to messages
          messages.push({
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
      return {
        response: assistantMessage.content,
        reasoning: assistantMessage.reasoning,
        usage: completion.usage
      };
    }

    // Model stopped without response
    throw new Error('Model finished without providing content');
  }

  throw new Error('Reached max iterations without completion');
}

// Usage
const result = await chatWithWebSearch('What is the current weather in San Francisco?');
console.log('Response:', result.response);
console.log('Reasoning:', result.reasoning);
```

### Cerebras Response Example

```json
{
  "response": "**Current weather in San Francisco (as of the latest report on November 18 2025):**\n\n| Parameter | Value |\n|-----------|-------|\n| **Temperature** | **57 °F** (≈14 °C) |\n| **Condition** | Mostly sunny |\n| **RealFeel®** | 60 °F (≈16 °C) |\n| **Wind** | Light – from the north‑northeast at about 7 mph |\n| **Humidity** | Approximately 87 % |\n| **Sunrise / Sunset** | Sunrise ≈ 6:53 am · Sunset ≈ 4:55 pm |\n| **Pressure** | 29.91 in Hg |\n\n*Source: AccuWeather's \"San Francisco, CA Weather Forecast\" (latest observation timestamp 4:09 PM).*",
  "reasoning": "We need to provide current weather. The search results show a snippet with current weather: \"4:09 PM. 57°F. Mostly sunny. RealFeel® 60°\". That's likely current. Provide summary.",
  "usage": {
    "prompt_tokens": 585,
    "completion_tokens": 294,
    "total_tokens": 879
  }
}
```

---

## GMI Cloud Implementation

### Full Code Example

```typescript
import 'dotenv/config';

const webSearchTool = {
  type: 'function',
  function: {
    name: 'webSearch',
    description: 'Search the web for current information using Google Search. Use this when you need up-to-date information, facts, news, or answers that require recent data.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search query to look up on Google'
        }
      },
      required: ['query']
    }
  }
};

async function executeWebSearch(query: string) {
  const response = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': process.env.SERPER_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ q: query, num: 5 }),
  });

  const data = await response.json();

  return {
    organic: data.organic?.slice(0, 5).map((result: any) => ({
      title: result.title,
      snippet: result.snippet,
      link: result.link,
    })) || [],
    answerBox: data.answerBox || null,
  };
}

async function chatWithWebSearch(question: string) {
  const url = 'https://api.gmi-serving.com/v1/chat/completions';

  const messages: any[] = [
    {
      role: 'user',
      content: question
    }
  ];

  let iteration = 0;
  const maxIterations = 5;

  while (iteration < maxIterations) {
    iteration++;

    const payload = {
      model: 'openai/gpt-oss-120b',
      messages,
      tools: [webSearchTool],
      tool_choice: 'auto',
      max_tokens: 2000,
      temperature: 0.2,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GMI_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GMI API error: ${response.status} - ${errorText}`);
    }

    const completion = await response.json();
    const assistantMessage = completion.choices[0].message;

    // Add assistant message to conversation
    messages.push(assistantMessage);

    // Check if there are tool calls
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      // Execute each tool call
      for (const toolCall of assistantMessage.tool_calls) {
        if (toolCall.function.name === 'webSearch') {
          const args = JSON.parse(toolCall.function.arguments);
          const searchResults = await executeWebSearch(args.query);

          // Add tool result to messages
          messages.push({
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
      return {
        response: assistantMessage.content,
        reasoning: assistantMessage.reasoning_content,
        usage: completion.usage
      };
    }

    // Model stopped without response
    throw new Error('Model finished without providing content');
  }

  throw new Error('Reached max iterations without completion');
}

// Usage
const result = await chatWithWebSearch('What is the current weather in San Francisco?');
console.log('Response:', result.response);
console.log('Reasoning:', result.reasoning);
```

### GMI Cloud Response Example

```json
{
  "response": "**Current Weather in San Francisco (as of the latest reports on Nov 18 2024):**\n\n| Parameter | Value |\n|-----------|-------|\n| **Temperature** | **≈ 57 °F** (≈ 14 °C) |\n| **Feels‑like** | **≈ 50 °F** (≈ 10 °C) |\n| **Conditions** | Mostly sunny / clear to partly‑cloudy |\n| **Humidity** | **≈ 87 %** |\n| **Wind** | **NNE at ~7 mph** (≈ 11 km/h) |\n| **Sunrise** | **6:53 AM** (local time) |\n| **Sunset** | **4:55 PM** (local time) |\n| **Pressure** | **29.91 in Hg** |\n| **UV Index** | **2 (low)** |\n\n*Sources:* AccuWeather (current temperature and sky condition) and ABC 7 Bay Area Weather (detailed metrics such as feels‑like temperature, humidity, wind, sunrise/sunset, and pressure).\n\n**What this means:**\n- It's a mild, mostly sunny day, but the wind chill makes it feel a bit cooler than the actual temperature.\n- With high humidity and a low UV index, it's comfortable for outdoor activities, though a light jacket may be advisable, especially in the early morning or evening.\n\n*Note:* Weather can change quickly, especially along the coast. For the most up‑to‑date minute‑by‑minute information, you can check a live weather service (e.g., weather.com, AccuWeather, or a local news station).",
  "reasoning": "We need to provide current weather. The search results show some data: AccuWeather snippet says \"Current Weather. 4:09 PM. 57°F. Mostly sunny.\" Also ABC7 snippet shows details: Feels Like 50°, Sunrise 6:53 AM, Humidity 87%, Sunset 4:55 PM, Windspeed NNE 7 mph. That seems like current. Provide summary. Also note time zone. Provide disclaimer.",
  "usage": {
    "prompt_tokens": 661,
    "completion_tokens": 453,
    "total_tokens": 1114
  }
}
```

---

## How It Works

### Two-Step Process (Same AI Model)

#### Iteration 1: Tool Call Decision
```
User Question → GPT OSS 120b
↓
AI Response: {
  "reasoning": "Need current weather data, will use web search",
  "tool_calls": [{
    "function": "webSearch",
    "arguments": '{"query": "current weather San Francisco"}'
  }]
}
```

#### Iteration 2: Final Answer with Tool Results
```
Conversation Sent to GPT OSS 120b:
- User: "What is the weather?"
- Assistant: tool_call(webSearch)
- Tool: [search results from Serper]
↓
AI Response: {
  "content": "Based on the search results, the weather is 57°F...",
  "reasoning": "Extracted temperature from search results..."
}
```

### Message Flow

```typescript
// Iteration 1
messages = [
  { role: 'user', content: 'What is the weather in SF?' }
]
// AI returns tool_call

// Iteration 2
messages = [
  { role: 'user', content: 'What is the weather in SF?' },
  { role: 'assistant', tool_calls: [...] },
  { role: 'tool', tool_call_id: 'xxx', content: '{search results}' }
]
// AI returns final answer
```

---

## Key Differences: Cerebras vs GMI Cloud

### Cerebras

**Pros:**
- Ultra-fast inference (~3000 tokens/sec)
- Official SDK with TypeScript support
- Supports `strict: true` mode for tools
- Clean API responses
- Reasoning included as `reasoning` field

**Cons:**
- Requires SDK installation
- Slightly more verbose setup

**Best for:**
- Production applications requiring speed
- Applications with official SDK preference
- High-volume requests

### GMI Cloud

**Pros:**
- OpenAI-compatible API (easy migration)
- More detailed responses (more tokens)
- Reasoning included as `reasoning_content` field
- No SDK required (pure fetch)
- Excellent response quality with analysis

**Cons:**
- Slower than Cerebras
- No official SDK
- Some models timeout (e.g., Kimi K2 Thinking)

**Best for:**
- Applications requiring detailed, analytical responses
- OpenAI API compatibility
- Flexibility without SDK dependency

---

## Comparison with OpenRouter (Broken)

### Why OpenRouter Doesn't Work

OpenRouter has a critical bug in tool calling:

1. ✅ Model calls tools successfully
2. ✅ Tools execute and return results
3. ❌ **Model receives results but generates NO response**

**Evidence:**
- Finish reason: "stop" with empty content
- Multiple models affected (GPT OSS 120b, Claude 3.5, GPT-4o-mini)
- Both `:online` suffix and custom tool calling fail

### Workaround for OpenRouter

If you must use OpenRouter, use manual context injection instead:

```typescript
// Don't use tool calling
const searchResults = await serperSearch(query);
const context = formatResults(searchResults);

streamText({
  model: openrouter('openai/gpt-oss-120b'),
  messages: [{
    role: 'user',
    content: `${question}\n\nSearch results:\n${context}`
  }]
  // No tools - just inject context directly
});
```

---

## Performance Comparison

### Token Usage

| Provider | Prompt Tokens | Completion Tokens | Total | Response Quality |
|----------|---------------|-------------------|-------|------------------|
| Cerebras | 585 | 294 | 879 | Excellent |
| GMI Cloud | 661 | 453 | 1,114 | Excellent+ (more detailed) |

### Speed

- **Cerebras**: ~0.16s total time, ~1,840 tokens/sec
- **GMI Cloud**: Slower but still fast, exact speed varies

### Response Quality

**Both providers generate:**
- Well-formatted markdown tables
- Proper source citations
- Reasoning explanations
- Natural language summaries

**GMI Cloud additionally provides:**
- More detailed analysis sections
- "What this means" interpretations
- Helpful disclaimers and notes

---

## Test Files

Run tests with:

```bash
# Cerebras
npm run test-cerebras

# GMI Cloud
npm run test-gmi

# GMI Cloud basic (no tools)
npm run test-gmi-basic
```

Test files:
- `src/test-cerebras-web-search.ts` - Cerebras with web search
- `src/test-gmi-web-search.ts` - GMI Cloud with web search
- `src/test-gmi-basic.ts` - GMI Cloud basic test

---

## Conclusion

### Recommendations

**For Production:**
1. **Use Cerebras** if you need ultra-fast inference and official SDK support
2. **Use GMI Cloud** if you need OpenAI compatibility and detailed responses
3. **Avoid OpenRouter** for tool calling (use manual context injection instead)

### Why This Approach is Correct

The "one AI + tool calling" approach is:
- ✅ **More efficient**: Only one model, two API calls
- ✅ **More reliable**: Direct provider access works properly
- ✅ **Better reasoning**: Model has full context of tool usage
- ✅ **Industry standard**: This is how OpenAI's tool calling works

### Final Verdict

| Aspect | Winner |
|--------|--------|
| **Speed** | Cerebras 🏆 |
| **Response Quality** | GMI Cloud 🏆 |
| **Ease of Use** | GMI Cloud 🏆 (no SDK needed) |
| **Reliability** | Both 🏆 (OpenRouter ❌) |
| **Production Ready** | Both 🏆 |

**Both Cerebras and GMI Cloud are excellent choices.** Choose based on your priorities: speed (Cerebras) or detailed responses (GMI Cloud).
