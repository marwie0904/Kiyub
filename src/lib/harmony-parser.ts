/**
 * Harmony Format Parser for GPT-OSS Models
 *
 * GPT-OSS models (120b, 20b) use OpenAI's Harmony Response Format which structures
 * outputs in multiple channels:
 * - analysis: Chain-of-thought reasoning (internal)
 * - commentary: Tool-calling traces (internal)
 * - final: User-facing answer (external)
 *
 * Format structure:
 * <|start|>assistant<|channel|>analysis<|message|>
 * [REASONING CONTENT]
 * <|end|><|start|>assistant<|channel|>final<|message|>
 * [ACTUAL ANSWER]
 * <|end|>
 */

interface HarmonyChannels {
  analysis?: string;
  commentary?: string;
  final?: string;
  raw: string;
}

/**
 * Parse Harmony format response and extract specific channels
 */
export function parseHarmonyFormat(text: string): HarmonyChannels {
  const channels: HarmonyChannels = {
    raw: text,
  };

  // Extract analysis channel (reasoning/thinking)
  const analysisRegex = /<\|channel\|>analysis<\|message\|>([\s\S]*?)(?:<\|end\|>|<\|channel\|>)/;
  const analysisMatch = text.match(analysisRegex);
  if (analysisMatch && analysisMatch[1]) {
    channels.analysis = analysisMatch[1].trim();
  }

  // Extract commentary channel (tool traces)
  const commentaryRegex = /<\|channel\|>commentary<\|message\|>([\s\S]*?)(?:<\|end\|>|<\|channel\|>)/;
  const commentaryMatch = text.match(commentaryRegex);
  if (commentaryMatch && commentaryMatch[1]) {
    channels.commentary = commentaryMatch[1].trim();
  }

  // Extract final channel (user-facing answer)
  const finalRegex = /<\|channel\|>final<\|message\|>([\s\S]*?)(?:<\|end\|>|$)/;
  const finalMatch = text.match(finalRegex);
  if (finalMatch && finalMatch[1]) {
    channels.final = finalMatch[1].trim();
  }

  return channels;
}

/**
 * Get only the final user-facing answer from Harmony format
 * Falls back to raw text if no final channel is found
 */
export function extractFinalAnswer(text: string): string {
  const channels = parseHarmonyFormat(text);

  // Return final channel if available
  if (channels.final) {
    return channels.final;
  }

  // Check if text contains Harmony format markers
  const hasHarmonyMarkers = text.includes('<|channel|>') || text.includes('<|message|>');

  if (hasHarmonyMarkers) {
    console.warn('[Harmony Parser] Harmony format detected but no final channel found');

    // Check if this is just a commentary/tool-call channel with no actual user-facing content
    const hasCommentaryOnly = text.includes('<|channel|>commentary') && !text.includes('<|channel|>final');
    if (hasCommentaryOnly) {
      console.log('[Harmony Parser] Detected commentary-only response (internal tool traces), returning empty');
      return ''; // Don't show internal tool traces to user
    }

    // Try to strip all Harmony markers and return cleaned text
    return text
      .replace(/<\|start\|>/g, '')
      .replace(/<\|end\|>/g, '')
      .replace(/<\|channel\|>\w+/g, '')
      .replace(/<\|message\|>/g, '')
      .replace(/<\|constrain\|>/g, '')
      .replace(/<\|call\|>/g, '')
      .replace(/assistant/g, '')
      .replace(/to=functions\.\w+/g, '') // Remove function call syntax
      .replace(/json\{[^}]*\}/g, '') // Remove JSON parameters
      .trim();
  }

  // Check for text-only format with reasoning keywords
  // Pattern: "analysisUser asks... assistantfinalThe actual answer"
  const textOnlyReasoningPattern = /analysis.*?assistantfinal([\s\S]*)/i;
  const textOnlyMatch = text.match(textOnlyReasoningPattern);

  if (textOnlyMatch && textOnlyMatch[1]) {
    console.log('[Harmony Parser] Detected text-only reasoning format, extracting final answer');
    return textOnlyMatch[1].trim();
  }

  // Alternative pattern: Just look for "final" keyword followed by content
  if (text.toLowerCase().includes('final')) {
    const finalPattern = /final\s*([\s\S]*)/i;
    const finalMatch = text.match(finalPattern);
    if (finalMatch && finalMatch[1]) {
      console.log('[Harmony Parser] Extracted content after "final" keyword');
      return finalMatch[1].trim();
    }
  }

  // No Harmony format detected, return original text
  return text;
}

/**
 * Get the reasoning/analysis content from Harmony format
 * Useful for debugging or showing "thinking" to users optionally
 */
export function extractAnalysis(text: string): string | null {
  const channels = parseHarmonyFormat(text);
  return channels.analysis || null;
}

/**
 * Check if text uses Harmony format
 */
export function isHarmonyFormat(text: string): boolean {
  return text.includes('<|channel|>') ||
         text.includes('<|message|>') ||
         text.includes('<|start|>');
}
