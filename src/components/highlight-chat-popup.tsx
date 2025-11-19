"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { X, Send } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import "katex/dist/katex.min.css";

interface HighlightChatPopupProps {
  selectedText: string;
  conversationContext: any[];
  model: string;
  initialQuestion: string;
  onClose: () => void;
  position: { x: number; y: number };
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function HighlightChatPopup({
  selectedText,
  conversationContext,
  model,
  initialQuestion,
  onClose,
  position,
}: HighlightChatPopupProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "user", content: initialQuestion },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);
  const [dialogPosition, setDialogPosition] = useState(position);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dialogRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, currentResponse]);

  // Send initial question on mount
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      sendQuestion(initialQuestion);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Handle dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setDialogPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dialogRef.current) {
      const rect = dialogRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  const sendQuestion = async (question: string) => {
    setIsLoading(true);
    setCurrentResponse("");

    try {
      const response = await fetch("/api/highlight-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedText,
          conversationContext,
          model,
          userQuestion: question,
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          accumulatedText += chunk;

          // Keep loading state true until first chunk arrives
          if (accumulatedText.length > 0 && isLoading) {
            setIsLoading(false);
          }

          setCurrentResponse(accumulatedText);
        }
      }

      // Add assistant message to history and clear current response atomically
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: accumulatedText },
      ]);
      setCurrentResponse("");
      setIsLoading(false);
    } catch (error) {
      console.error("Error sending question:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, there was an error processing your request.",
        },
      ]);
      setCurrentResponse("");
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const question = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setInput("");
    sendQuestion(question);
  };

  return (
    <div
      ref={dialogRef}
      className="fixed z-50 w-[500px] rounded-lg border border-border bg-background shadow-2xl"
      style={{
        top: `${dialogPosition.y}px`,
        left: `${dialogPosition.x}px`,
        maxHeight: "600px",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between border-b border-border p-3 cursor-move select-none"
        onMouseDown={handleMouseDown}
      >
        <h3 className="text-sm font-semibold">Little Freire</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-7 w-7"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Selected Text Context */}
      <div className="border-b border-border bg-muted/30 p-3">
        <p className="text-xs text-muted-foreground mb-1">Selected text:</p>
        <p className="text-xs italic text-foreground/80 line-clamp-3">
          "{selectedText}"
        </p>
      </div>

      {/* Messages */}
      <ScrollArea className="h-[350px] p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={
                message.role === "user"
                  ? "rounded-lg bg-primary/10 p-3"
                  : "rounded-lg bg-muted/50 p-3"
              }
            >
              {message.role === "user" ? (
                <p className="text-sm text-foreground">{message.content}</p>
              ) : (
                <div className="prose prose-sm prose-invert max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[[remarkMath, { singleDollarTextMath: true }], remarkGfm]}
                    rehypePlugins={[
                      [rehypeKatex, {
                        strict: false,
                        trust: true,
                        throwOnError: false
                      }],
                      rehypeRaw
                    ]}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          ))}
          {currentResponse && (
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="prose prose-sm prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[[remarkMath, { singleDollarTextMath: true }], remarkGfm]}
                  rehypePlugins={[
                    [rehypeKatex, {
                      strict: false,
                      trust: true,
                      throwOnError: false
                    }],
                    rehypeRaw
                  ]}
                >
                  {currentResponse}
                </ReactMarkdown>
              </div>
            </div>
          )}
          {isLoading && !currentResponse && (
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-primary"></div>
                <div className="h-2 w-2 animate-pulse rounded-full bg-primary delay-75"></div>
                <div className="h-2 w-2 animate-pulse rounded-full bg-primary delay-150"></div>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-border p-3">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a follow-up question..."
            className="flex-1 text-sm"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
