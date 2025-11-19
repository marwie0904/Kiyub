"use client";

import { useState } from "react";
import { useTypingAnimation } from "@/hooks/use-typing-animation";
import { ChevronDown, ChevronRight } from "lucide-react";

interface Step2ReasoningDisplayProps {
  reasoning: string;
}

export function Step2ReasoningDisplay({ reasoning }: Step2ReasoningDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Animate the reasoning text at 100 chars/sec (0.1 chars per ms)
  const displayedText = useTypingAnimation(reasoning, 0.1, true);

  if (!reasoning) return null;

  return (
    <div className="border border-violet-500/20 rounded-lg overflow-hidden bg-violet-500/5 mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-2 bg-violet-500/10 border-b border-violet-500/20 flex items-center justify-between hover:bg-violet-500/15 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-violet-600 dark:text-violet-400">
            💭 Step 2: Chain of Thought
          </span>
          <span className="text-xs text-muted-foreground">
            ({reasoning.length} chars)
          </span>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-violet-600 dark:text-violet-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-violet-600 dark:text-violet-400" />
        )}
      </button>

      {isExpanded && (
        <div className="p-4 max-h-96 overflow-y-auto">
          <div className="text-xs text-foreground/70 whitespace-pre-wrap leading-relaxed font-mono">
            {displayedText}
            {displayedText.length < reasoning.length && (
              <span className="inline-block w-1 h-3 bg-violet-500/50 ml-0.5 animate-pulse" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
