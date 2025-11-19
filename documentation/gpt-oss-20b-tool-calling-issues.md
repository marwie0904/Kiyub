# GPT-OSS-20B Tool Calling Issues

## Overview

GPT-OSS-20B (FREIRE LITE) has been temporarily disabled due to documented tool calling problems that make it unreliable for web search and function calling features.

**Status:** Disabled as of 2025-01-19
**Affected Model:** `openai/gpt-oss-20b` (DeepInfra)
**Reference:** [HuggingFace Discussion #80](https://huggingface.co/openai/gpt-oss-20b/discussions/80)

---

## Known Issues

### 1. Tool Call Hallucination
- **Problem:** Model returns `tool_calls` even when tools are not offered in the API request
- **Impact:** After reaching the maximum tool call limit, the model continues requesting tools instead of providing a final text response
- **Behavior:** At iteration 2+, model hallucinates tool calls despite `tools: undefined` in API request

### 2. Inconsistent Output Format
- **Problem:** Produces reasoning text mentioning which function to use instead of proper structured tool calls
- **Example:** Returns "reasoning_content" with floating text like "I should use the webSearch function" without executing it
- **Impact:** Makes parsing and handling responses unreliable

### 3. Poor Reliability vs Alternatives
- **Problem:** Community reports indicate GPT-OSS-20B performs worse than smaller models for tool calling
- **Comparison:** Users report better results with Qwen3-4b despite it being a smaller model
- **Impact:** Not suitable for production use cases requiring reliable tool/function calling

---

## Technical Details

### Our Implementation (Correct)
Our implementation follows OpenAI's standard format correctly:

```typescript
// API Configuration
const openai = new OpenAI({
  apiKey: process.env.DEEPINFRA_API_KEY,
  baseURL: 'https://api.deepinfra.com/v1/openai',
});

// Request Format
await openai.chat.completions.create({
  messages: conversationMessages,
  model: 'openai/gpt-oss-20b',
  tools: shouldOfferTools ? [webSearchTool] : undefined,
  tool_choice: shouldOfferTools ? 'auto' : undefined,
  max_tokens: 2000,
  temperature: 0.3,  // Lower temp recommended for tool calling
  stream: false
});
```

### Error Manifestation
```
🔄 [DeepInfra Web Search] Iteration 1/4
🔍 [DeepInfra Web Search] Executing search 1/1
✅ [DeepInfra Web Search] Search completed successfully

🔄 [DeepInfra Web Search] Iteration 2/4
🛠️  [DeepInfra Web Search] Model requested 1 tool call(s)
⚠️  [DeepInfra Web Search] Tool limit reached or tools not offered
Error: Model finished without providing content
```

---

## Attempted Solutions

### What We Tried
1. ✅ Setting `temperature: 0.3` (lower temps recommended for tool calling)
2. ✅ Proper tool definition with OpenAI-compatible format
3. ✅ Removing tools from API after max calls reached
4. ✅ Adding system messages to force final text response
5. ✅ Consolidated hallucination detection logic

### What Didn't Work
- Model continues to hallucinate tool calls even when `tools: undefined`
- Strong system messages like "STOP. The webSearch tool is NO LONGER AVAILABLE" are ignored
- Setting `tool_choice: 'auto'` doesn't prevent hallucination

---

## Potential Future Solutions

### To Try Next
1. **Set `tool_choice: 'required'` instead of `'auto'`**
   - Forces tool selection on first call
   - May prevent hallucination on subsequent calls
   - Requires testing

2. **Explicitly list tools in system prompt**
   - Include schema definitions in system message
   - May improve model's understanding of tool availability

3. **Switch to alternative DeepInfra model**
   - Try `meta-llama/Meta-Llama-3.1-70B-Instruct` (confirmed working)
   - DeepInfra docs explicitly show Llama 3.1 70B supporting function calling
   - Better reliability reported by community

4. **Use completion API through Ollama**
   - Some users report success with Ollama's completions API
   - May require different configuration

---

## Current Workaround

**Action Taken:** Disabled FREIRE LITE (GPT-OSS-20B) in model selector

### Code Changes
- **File:** `src/lib/models.ts` (line 28)
  ```typescript
  {
    value: ACTUAL_MODELS.GPT_OSS_20B,
    label: "FREIRE LITE",
    description: "Temporarily Unavailable - Tool Calling Issues",
    disabled: true,
  }
  ```

- **File:** `src/lib/deepinfra-web-search.ts` (lines 3-27)
  - Added comprehensive documentation header
  - Improved hallucination detection logic
  - Added debug logging

- **Default Model Changed:**
  - From: `ACTUAL_MODELS.GPT_OSS_20B`
  - To: `ACTUAL_MODELS.GPT_OSS_120B_FAST` (Cerebras GPT-OSS-120B)

---

## Resources

### Documentation
- [DeepInfra Function Calling Guide](https://deepinfra.com/docs/advanced/function_calling)
- [DeepInfra OpenAI-Compatible API](https://deepinfra.com/docs/openai_api)
- [GPT-OSS-20B Model Card](https://deepinfra.com/openai/gpt-oss-20b)

### Community Reports
- [HuggingFace Discussion: Tool calling not working as expected](https://huggingface.co/openai/gpt-oss-20b/discussions/80)
- [NVIDIA Forum: Tool Calling GPT-OSS-20b and 120b](https://forums.developer.nvidia.com/t/tool-calling-gpt-oss-20b-and-120b/341611)

### Related Files
- `src/lib/deepinfra-web-search.ts` - DeepInfra web search implementation
- `src/lib/cerebras-web-search.ts` - Working Cerebras implementation (for comparison)
- `src/lib/models.ts` - Model configuration
- `src/app/api/chat-v2/route.ts` - Chat API route with provider selection

---

## Timeline

- **2025-01-19:** Issue discovered during web search implementation
- **2025-01-19:** Research conducted on DeepInfra documentation and community forums
- **2025-01-19:** Model disabled, documentation added, changes pushed to GitHub

---

## Next Steps

1. Monitor HuggingFace/DeepInfra for updates on GPT-OSS-20B tool calling
2. Test alternative models (Llama 3.1 70B) for cost-effective option
3. Consider re-enabling if model updates fix tool calling issues
4. Test `tool_choice: 'required'` approach when time permits
