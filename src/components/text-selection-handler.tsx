"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Send } from "lucide-react";
import { HighlightChatPopup } from "./highlight-chat-popup";

interface TextSelectionHandlerProps {
  children: ReactNode;
  conversationContext: any[];
  model: string;
}

export function TextSelectionHandler({
  children,
  conversationContext,
  model,
}: TextSelectionHandlerProps) {
  const [selectedText, setSelectedText] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [inputPosition, setInputPosition] = useState({ x: 0, y: 0 });
  const [question, setQuestion] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [submittedQuestion, setSubmittedQuestion] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleMouseUp = () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();

    if (text && text.length > 0) {
      // Check if the selection is within our container
      const range = selection?.getRangeAt(0);
      if (range && containerRef.current?.contains(range.commonAncestorContainer)) {
        setSelectedText(text);

        // Get selection position
        const rect = range.getBoundingClientRect();
        setInputPosition({
          x: rect.left + window.scrollX,
          y: rect.bottom + window.scrollY + 5,
        });

        setShowInput(true);

        // Focus input after a short delay
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    } else {
      // Only hide input if we're not clicking on the input itself
      const target = document.activeElement;
      if (target !== inputRef.current && !showPopup) {
        setShowInput(false);
        setQuestion("");
      }
    }
  };

  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && selectedText) {
      setSubmittedQuestion(question);

      // Position popup near the input
      setPopupPosition({
        x: Math.min(inputPosition.x, window.innerWidth - 520), // 500px width + 20px margin
        y: Math.min(inputPosition.y + 50, window.innerHeight - 650), // Ensure it fits
      });

      setShowPopup(true);
      setShowInput(false);
      setQuestion("");

      // Clear selection
      window.getSelection()?.removeAllRanges();
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedText("");
    setSubmittedQuestion("");
  };

  // Close input when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showInput &&
        !showPopup &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowInput(false);
        setQuestion("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showInput, showPopup]);

  return (
    <>
      <div ref={containerRef} onMouseUp={handleMouseUp}>
        {children}
      </div>

      {/* Question Input */}
      {showInput && !showPopup && (
        <div
          className="fixed z-40 rounded-lg border border-border bg-background shadow-lg"
          style={{
            top: `${inputPosition.y}px`,
            left: `${inputPosition.x}px`,
            maxWidth: '400px',
          }}
        >
          {/* Selected text preview */}
          <div className="border-b border-border bg-muted/30 px-3 py-2">
            <p className="text-xs text-muted-foreground line-clamp-2 italic">
              "{selectedText}"
            </p>
          </div>

          {/* Input form */}
          <form
            onSubmit={handleSubmitQuestion}
            className="flex gap-2 p-2"
          >
            <Input
              ref={inputRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about this text..."
              className="flex-1 text-sm"
              autoFocus
            />
            <Button
              type="submit"
              size="icon"
              disabled={!question.trim()}
              className="h-9 w-9"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}

      {/* Popup Chat */}
      {showPopup && (
        <HighlightChatPopup
          selectedText={selectedText}
          conversationContext={conversationContext}
          model={model}
          initialQuestion={submittedQuestion}
          onClose={handleClosePopup}
          position={popupPosition}
        />
      )}
    </>
  );
}
