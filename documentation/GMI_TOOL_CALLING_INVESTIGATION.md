# GMI Cloud Tool Calling Investigation

## Document Information
- **Date**: November 19, 2025
- **Issue**: GMI Cloud web search tool calling reaches max iterations without completion
- **Status**: Under Investigation
- **Provider**: GMI Cloud (Direct API, not via OpenRouter)
- **Model**: `openai/gpt-oss-120b`

---

## Overview

This document details the investigation into GMI Cloud's tool calling implementation for web search functionality. The implementation follows the working example from `CEREBRAS_GMI_WEB_SEARCH_IMPLEMENTATION.md` but encounters an issue where the model makes multiple consecutive tool calls without ever returning a final answer.

---

## Architecture

### Approach: Single-Model Multi-Turn Conversation

We use a **single AI model** in a **multi-turn conversation loop**:

```
Iteration 1: User Question → Model decides to call tool
Iteration 2: Tool results added → Model generates final answer
```

This is **NOT** a two-AI approach. It's one model that:
1. First decides if it needs to search
2. Then receives search results and synthesizes an answer

### Provider Details

| Aspect | Details |
|--------|---------|
| **Provider** | GMI Cloud (Direct) |
| **API Endpoint** | `https://api.gmi-serving.com/v1/chat/completions` |
| **Model** | `openai/gpt-oss-120b` |
| **API Type** | OpenAI-compatible |
| **Streaming** | No (non-streaming) |
| **Search API** | Serper (`https://google.serper.dev/search`) |

---

## Request Structure

### API Request Format

```typescript
const requestBody = {
  model: "openai/gpt-oss-120b",
  messages: conversationMessages, // Full conversation history
  tools: [webSearchToolDef],      // Tool definition
  tool_choice: 'auto',             // Let model decide
  max_tokens: 2000,
  temperature: 0.2,                // Low temperature for consistency
  // NO stream parameter = non-streaming
};

const response = await fetch("https://api.gmi-serving.com/v1/chat/completions", {
  method: "POST",
  headers: {
    'Authorization': `Bearer ${process.env.GMI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(requestBody),
});
```

### Tool Definition Structure

```typescript
const webSearchToolDef = {
  type: 'function',
  function: {
    name: 'webSearch',
    description: 'Search the web for current information, recent events, news, or data. Use this when you need up-to-date information that may not be in your training data.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search query - be specific and include relevant keywords'
        },
        numResults: {
          type: 'number',
          description: 'Number of search results to return (3-10). Use 3-5 for simple queries, 7-10 for complex research.',
          minimum: 3,
          maximum: 10
        }
      },
      required: ['query']
    }
  }
};
```

### Search Result Format (Sent to Model)

Following the documentation, we send **structured JSON**:

```typescript
const searchResults = {
  organic: [
    {
      title: "Article title",
      snippet: "Article snippet...",
      link: "https://example.com"
    },
    // ... more results
  ],
  answerBox: {
    // Direct answer if available
  } || null
};

// Add to conversation
conversationMessages.push({
  role: 'tool',
  tool_call_id: toolCall.id,
  content: JSON.stringify(searchResults) // Send as JSON string
});
```

---

## Implementation Flow

### Multi-Turn Conversation Loop

```typescript
const conversationMessages = [...finalMessages];
let iteration = 0;
const maxIterations = 5;
let finalResponse = '';
let finalUsage = null;

while (iteration < maxIterations) {
  iteration++;

  // 1. Make API request (with tools always available)
  const gmiResponse = await fetch(/* ... */);
  const completion = await gmiResponse.json();
  const assistantMessage = completion.choices[0].message;

  // 2. Add assistant message to conversation
  conversationMessages.push(assistantMessage);

  // 3. Check for tool calls
  if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
    // Execute each tool call
    for (const toolCall of assistantMessage.tool_calls) {
      if (toolCall.function.name === 'webSearch') {
        const args = JSON.parse(toolCall.function.arguments);

        // Execute search via Serper
        const serperResponse = await fetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: {
            'X-API-KEY': process.env.SERPER_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ q: args.query, num: args.numResults || 5 }),
        });

        const serperData = await serperResponse.json();

        // Format results
        const searchResults = {
          organic: serperData.organic?.slice(0, 5).map(r => ({
            title: r.title,
            snippet: r.snippet,
            link: r.link,
          })) || [],
          answerBox: serperData.answerBox || null,
        };

        // Add tool result to conversation
        conversationMessages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(searchResults)
        });
      }
    }

    // Continue to next iteration
    continue;
  }

  // 4. Check for final response
  if (assistantMessage.content) {
    finalResponse = assistantMessage.content;
    finalUsage = completion.usage;
    break;
  }

  // 5. Model stopped without response
  throw new Error('Model finished without providing content or tool calls');
}

// After loop
if (!finalResponse) {
  throw new Error('Reached max iterations without completion');
}
```

### Message Flow Example

#### Simple Query (Works in Documentation)

```
Iteration 1:
  Request: [{ role: 'user', content: 'What is the weather in SF?' }]
  Response: { tool_calls: [{ function: { name: 'webSearch', arguments: '{"query":"weather San Francisco"}' }}] }

Iteration 2:
  Request: [
    { role: 'user', content: 'What is the weather in SF?' },
    { role: 'assistant', tool_calls: [...] },
    { role: 'tool', content: '{"organic":[...],"answerBox":null}' }
  ]
  Response: { content: 'The current weather in San Francisco is 57°F...' }

✅ Completes in 2 iterations
```

#### Complex Query (Our Issue)

```
Iteration 1:
  Request: [{ role: 'user', content: 'What are the latest findings on GLP-1 agonists...' }]
  Response: { tool_calls: [{ function: { name: 'webSearch', arguments: '{"query":"GLP-1 agonists findings 2024"}' }}] }

Iteration 2:
  Request: [user, assistant, tool_result_1]
  Response: { tool_calls: [{ function: { name: 'webSearch', arguments: '{"query":"GLP-1 Alzheimer Parkinson NAFLD"}' }}] }

Iteration 3:
  Request: [user, assistant, tool_result_1, assistant, tool_result_2]
  Response: { tool_calls: [{ function: { name: 'webSearch', arguments: '{"query":"GLP-1 Alzheimer clinical trial 2024"}' }}] }

Iteration 4:
  Request: [user, assistant, tool_result_1, assistant, tool_result_2, assistant, tool_result_3]
  Response: { tool_calls: [{ function: { name: 'webSearch', arguments: '{"query":"GLP-1 NAFLD clinical trial 2024"}' }}] }

Iteration 5:
  Request: [user, assistant, tool_result_1, ..., tool_result_4]
  Response: { tool_calls: [{ function: { name: 'webSearch', arguments: '{"query":"GLP-1 Parkinson clinical trial 2024"}' }}] }

❌ Max iterations reached - never returns final answer
```

---

## The Problem

### Issue Summary

**The model makes 5 consecutive tool calls and never returns a final answer**, causing the loop to hit `maxIterations` and throw an error: `"Reached max iterations without completion"`.

### Root Cause Analysis

1. **Complex Questions Trigger Multiple Searches**
   - Simple question: "What is the weather?" → 1 search → answer
   - Complex question: "What are the latest findings on GLP-1 agonists for conditions other than diabetes?" → Model thinks it needs 5+ searches

2. **Model Behavior**
   - Model is being **thorough** (good intent)
   - Searching for: general findings, then Alzheimer's, then Parkinson's, then NAFLD, etc.
   - Each search adds more context, model thinks it needs MORE data
   - Never reaches the "I have enough information to answer" state

3. **System Prompt Lacks Guidance**
   - Current prompt: "Use webSearch when you need up-to-date information"
   - Missing: "Limit searches to 1-2 calls, then synthesize an answer"
   - Missing: "Use the information from your first search to provide an answer"

### Why Documentation Example Works

The documentation uses a **simple, single-search question**:

```
Question: "What is the current weather in San Francisco?"
→ 1 search for "weather San Francisco"
→ Gets results
→ Returns answer
✅ Works perfectly
```

Our questions are **complex, multi-faceted**:

```
Question: "What are the latest peer-reviewed findings on the efficacy of GLP-1 agonists
          for conditions other than diabetes and obesity? Are there emerging safety concerns?"

→ Search 1: "GLP-1 agonists findings 2024"
→ Search 2: "GLP-1 Alzheimer Parkinson NAFLD"
→ Search 3: "GLP-1 Alzheimer clinical trial 2024"
→ Search 4: "GLP-1 NAFLD clinical trial 2024"
→ Search 5: "GLP-1 Parkinson clinical trial 2024"
→ ... would continue if max iterations allowed
❌ Never synthesizes final answer
```

---

## Comparison: Our Implementation vs Documentation

### Similarities ✅

| Aspect | Our Implementation | Documentation |
|--------|-------------------|---------------|
| **Provider** | GMI Cloud Direct | GMI Cloud Direct |
| **Endpoint** | `api.gmi-serving.com/v1/chat/completions` | `api.gmi-serving.com/v1/chat/completions` |
| **Model** | `openai/gpt-oss-120b` | `openai/gpt-oss-120b` |
| **Streaming** | Non-streaming | Non-streaming |
| **Tools** | Always available in request | Always available in request |
| **Tool Choice** | `'auto'` | `'auto'` |
| **Temperature** | `0.2` | `0.2` |
| **Search Format** | `JSON.stringify({organic, answerBox})` | `JSON.stringify({organic, answerBox})` |
| **Search API** | Serper | Serper |
| **Loop Logic** | Multi-turn conversation | Multi-turn conversation |

### Differences ⚠️

| Aspect | Our Implementation | Documentation |
|--------|-------------------|---------------|
| **Question Type** | Complex, multi-faceted | Simple, single-answer |
| **Expected Searches** | Could need multiple | Always needs 1 |
| **System Prompt** | Basic tool description | Simple example |
| **Handling Multi-Search** | Loops indefinitely | Not demonstrated |

---

## Attempted Solutions

### 1. ❌ Remove Tools After First Execution (Failed)

**Approach**: Remove `tools` parameter after first tool call to force final answer

```typescript
let toolExecuted = false;

const requestBody: any = {
  model: "openai/gpt-oss-120b",
  messages: conversationMessages,
  max_tokens: 2000,
  temperature: 0.2,
};

if (!toolExecuted) {
  requestBody.tools = [webSearchToolDef];
  requestBody.tool_choice = 'auto';
}
```

**Result**: Model returned garbage (`{"cursor": 2, "id": 2}`) instead of answer

**Why it failed**: Model still tried to make tool calls even without tools available, resulting in malformed responses

### 2. ❌ Filter Internal Format (Partial)

**Approach**: Detect and filter internal model format from responses

```typescript
if (cleanContent.includes('<|start|>') || cleanContent.includes('<|channel|>')) {
  const contentMatch = cleanContent.match(/<\|message\|>(.*?)(?:<\|call\|>|$)/s);
  if (contentMatch) {
    cleanContent = contentMatch[1].trim();
  }
}
```

**Result**: Filtered out internal format but still got garbage text

**Why it failed**: Root issue is model behavior, not response format

### 3. ✅ Match Documentation Exactly (Current)

**Approach**: Keep tools available in all iterations, let model decide

```typescript
// Always send tools
const requestBody = {
  model: "openai/gpt-oss-120b",
  messages: conversationMessages,
  tools: [webSearchToolDef],
  tool_choice: 'auto',
  max_tokens: 2000,
  temperature: 0.2,
};
```

**Result**: Works for simple questions, loops indefinitely for complex questions

**Status**: Matches documentation but doesn't handle complex queries

---

## Possible Solutions

### Option 1: Improve System Prompt (Recommended)

Add guidance to limit searches and synthesize answers:

```typescript
const systemMessage = {
  role: "system",
  content: `You are a helpful AI assistant with access to web search capabilities.

IMPORTANT SEARCH GUIDELINES:
- Limit yourself to 1-2 web searches maximum per question
- After searching, synthesize a comprehensive answer from the results
- Do NOT make additional searches unless absolutely critical information is missing
- If your first search provides relevant results, use them to answer - don't search again

When you need current information, use the webSearch tool.
After searching, provide a well-organized answer citing your sources.`
};
```

**Pros**:
- Natural behavior modification
- Maintains flexibility for truly complex questions
- Follows AI best practices

**Cons**:
- Not guaranteed to work 100% of the time
- Model might ignore instructions occasionally

### Option 2: Limit Tool Calls with Counter

Track tool call count and remove tools after limit:

```typescript
let toolCallCount = 0;
const maxToolCalls = 2;

while (iteration < maxIterations) {
  const requestBody: any = {
    model: "openai/gpt-oss-120b",
    messages: conversationMessages,
    max_tokens: 2000,
    temperature: 0.2,
  };

  // Only add tools if we haven't hit the limit
  if (toolCallCount < maxToolCalls) {
    requestBody.tools = [webSearchToolDef];
    requestBody.tool_choice = 'auto';
  }

  // ... execute request

  if (assistantMessage.tool_calls) {
    toolCallCount += assistantMessage.tool_calls.length;
    // Execute tools...
  }
}
```

**Pros**:
- Guaranteed to stop after N searches
- Predictable behavior
- Forces model to answer

**Cons**:
- Might cut off legitimately needed searches
- Less flexible
- Model might still return poor answers if forced

### Option 3: Two-Phase Approach

Execute search, then make second request WITHOUT tools:

```typescript
// Phase 1: Allow ONE tool call
const phase1Response = await fetch(/* with tools */);
if (phase1Response.tool_calls) {
  // Execute tool
  const searchResults = await executeSearch(/* ... */);
  conversationMessages.push(/* tool result */);
}

// Phase 2: Force final answer (no tools)
const phase2Response = await fetch({
  model: "openai/gpt-oss-120b",
  messages: conversationMessages,
  // NO tools parameter
  max_tokens: 2000,
  temperature: 0.2,
});

finalResponse = phase2Response.choices[0].message.content;
```

**Pros**:
- Clean separation of search and answer phases
- Guaranteed to produce answer
- Simple logic

**Cons**:
- Loses multi-search capability entirely
- Less flexible than documentation approach
- Might produce lower quality answers for complex questions

### Option 4: Hybrid - System Prompt + Counter

Combine Option 1 and Option 2:

```typescript
// Strong system prompt guidance
const systemMessage = {
  role: "system",
  content: `Limit searches to maximum 2 calls. After searching, provide comprehensive answer.`
};

// Plus hard limit as safety net
let toolCallCount = 0;
const maxToolCalls = 3; // Slightly higher than recommended (2) as safety buffer

if (toolCallCount < maxToolCalls) {
  requestBody.tools = [webSearchToolDef];
}
```

**Pros**:
- Best of both worlds
- Flexible but safe
- Should handle most cases well

**Cons**:
- More complex logic
- Still not 100% guaranteed

---

## Current Status

### What Works ✅
- Direct GMI Cloud API connection
- Serper search integration
- Tool definition and execution
- Message formatting
- Non-streaming responses
- **Simple, single-search questions** (like documentation example)

### What Doesn't Work ❌
- **Complex questions requiring synthesis** - model loops through max iterations
- Multi-search scenarios - never reaches final answer
- Question type: Research-oriented, multi-faceted queries

### Test Cases

| Query Type | Expected Behavior | Actual Behavior | Status |
|------------|------------------|-----------------|--------|
| Simple factual ("What is the weather?") | 1 search → answer | 1 search → answer | ✅ Works |
| Complex research ("Latest GLP-1 findings?") | 1-2 searches → answer | 5+ searches → timeout | ❌ Fails |
| Multi-part question | 2-3 searches → answer | 5+ searches → timeout | ❌ Fails |

---

## Next Steps

### Immediate Action Required

1. **Implement Option 4 (Hybrid Approach)**
   - Add improved system prompt with search limits
   - Add hard counter limit (max 3 tool calls)
   - Test with complex queries

2. **Test Suite**
   - Create test cases for different query types
   - Simple: "What is X?"
   - Medium: "Latest developments in Y?"
   - Complex: "Compare A and B with recent research"

3. **Monitoring**
   - Track tool call counts per request
   - Monitor which queries hit limits
   - Adjust limits based on real usage

### Long-term Considerations

1. **Model Tuning**
   - Consider if different temperature helps
   - Test with different models if available
   - Evaluate if `tool_choice: 'required'` vs `'auto'` helps

2. **Alternative Architecture**
   - Research if GMI supports streaming with tools
   - Investigate if other providers handle this better
   - Consider fallback mechanisms

3. **User Experience**
   - Show "searching..." states to user
   - Display number of searches performed
   - Allow user to set search depth preference

---

## Code References

### Main Implementation
- **File**: `/Users/macbookpro/Business/chat-app/src/app/api/chat-v2/route.ts`
- **Lines**: 266-421 (GMI Cloud section)
- **Key Functions**:
  - Multi-turn conversation loop: Lines 273-410
  - Tool execution: Lines 318-383
  - Response handling: Lines 389-410

### Documentation Reference
- **File**: `/Users/macbookpro/Business/chat-app/basic-test-streaming/CEREBRAS_GMI_WEB_SEARCH_IMPLEMENTATION.md`
- **Working Example**: Lines 244-324

### Search Tool Definition
- **File**: `/Users/macbookpro/Business/chat-app/src/lib/tools/web-search.ts`
- **Note**: Not currently used by GMI implementation (we call Serper directly to match documentation)

---

## Logs Example

### Working Example (Simple Query)
```
🔄 [GMI Cloud] Iteration 1/5
📡 [GMI Cloud] Making non-streaming API request...
📊 [GMI Cloud] Response received: { hasContent: false, hasToolCalls: true, toolCallsCount: 1 }
🔧 [GMI Cloud] Tool calls detected: 1
🔍 [GMI Cloud] Executing web search: weather San Francisco
✅ [GMI Cloud] Saved search metadata: 5 sources
🔄 [GMI Cloud] Tool executed, continuing to next iteration
🔄 [GMI Cloud] Iteration 2/5
📡 [GMI Cloud] Making non-streaming API request...
📊 [GMI Cloud] Response received: { hasContent: true, hasToolCalls: false, toolCallsCount: 0 }
✅ [GMI Cloud] Final response received
📊 [GMI Cloud] Completed after 2 iterations
```

### Failing Example (Complex Query)
```
🔄 [GMI Cloud] Iteration 1/5
🔧 [GMI Cloud] Tool calls detected: 1
🔍 [GMI Cloud] Executing web search: GLP-1 agonists findings 2024
🔄 [GMI Cloud] Iteration 2/5
🔧 [GMI Cloud] Tool calls detected: 1
🔍 [GMI Cloud] Executing web search: GLP-1 Alzheimer Parkinson NAFLD
🔄 [GMI Cloud] Iteration 3/5
🔧 [GMI Cloud] Tool calls detected: 1
🔍 [GMI Cloud] Executing web search: GLP-1 Alzheimer clinical trial 2024
🔄 [GMI Cloud] Iteration 4/5
🔧 [GMI Cloud] Tool calls detected: 1
🔍 [GMI Cloud] Executing web search: GLP-1 NAFLD clinical trial 2024
🔄 [GMI Cloud] Iteration 5/5
🔧 [GMI Cloud] Tool calls detected: 1
🔍 [GMI Cloud] Executing web search: GLP-1 Parkinson clinical trial 2024
❌ Stream error: Error: Reached max iterations without completion
```

---

## Environment

### Dependencies
```json
{
  "@cerebras/cerebras_cloud_sdk": "^1.59.0",
  "ai": "^5.0.93",
  "serper": "^1.0.6"
}
```

### Environment Variables
```
GMI_API_KEY=<key>
SERPER_API_KEY=<key>
```

### API Endpoints
- **GMI Cloud**: `https://api.gmi-serving.com/v1/chat/completions`
- **Serper**: `https://google.serper.dev/search`

---

## Conclusion

The GMI Cloud tool calling implementation **correctly follows the documentation** but reveals a limitation: **the documentation only covers simple, single-search scenarios**. For complex questions requiring research and synthesis, the model enters an infinite search loop.

**Recommended Solution**: Implement **Option 4 (Hybrid Approach)** - combine improved system prompt guidance with a hard limit counter as a safety net. This maintains flexibility while preventing infinite loops.

**Success Criteria**:
- Simple queries: 1-2 searches → answer ✅
- Complex queries: 2-3 searches → answer ✅
- No timeouts or max iteration errors ✅
- High-quality synthesized answers ✅
