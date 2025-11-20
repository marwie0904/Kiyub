import { useEffect, useState, useRef, useCallback } from "react";

export function useSmoothStreaming(content: string, isStreaming: boolean) {
  const [displayedContent, setDisplayedContent] = useState("");
  const lastContentLengthRef = useRef(0);
  const bufferRef = useRef<string[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const flushIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isStreamingRef = useRef(isStreaming);

  // Update streaming ref
  useEffect(() => {
    isStreamingRef.current = isStreaming;
  }, [isStreaming]);

  // Detect new content and add to buffer
  useEffect(() => {
    if (content.length > lastContentLengthRef.current) {
      const newChars = content.slice(lastContentLengthRef.current).split("");
      bufferRef.current.push(...newChars);
      lastContentLengthRef.current = content.length;

      // Start the display interval if not already running
      if (!intervalRef.current) {
        intervalRef.current = setInterval(() => {
          if (bufferRef.current.length > 0) {
            // Display 15 characters at a time for smooth effect (increased from 6)
            const charsToAdd = bufferRef.current.splice(0, 15);
            setDisplayedContent((prev) => prev + charsToAdd.join(""));
          } else if (!isStreamingRef.current) {
            // Done streaming and buffer is empty
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
          }
        }, 50); // Reduced update frequency from 20ms to 50ms (from ~50 renders/sec to ~20 renders/sec)
      }
    }
  }, [content]);

  // When streaming stops, flush remaining buffer smoothly
  useEffect(() => {
    if (!isStreaming && bufferRef.current.length > 0) {
      // Clear existing flush interval if any
      if (flushIntervalRef.current) {
        clearInterval(flushIntervalRef.current);
      }

      // Flush remaining buffer smoothly instead of instantly
      flushIntervalRef.current = setInterval(() => {
        if (bufferRef.current.length > 0) {
          // Display all remaining characters in chunks
          const charsToAdd = bufferRef.current.splice(0, 30);
          setDisplayedContent((prev) => prev + charsToAdd.join(""));
        } else {
          // Buffer is empty, we're done
          if (flushIntervalRef.current) {
            clearInterval(flushIntervalRef.current);
            flushIntervalRef.current = null;
          }
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      }, 16); // ~60fps for smooth finish
    } else if (!isStreaming && bufferRef.current.length === 0) {
      // No buffer, ensure content is displayed
      setDisplayedContent(content);
      lastContentLengthRef.current = content.length;

      // Clear intervals
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (flushIntervalRef.current) {
        clearInterval(flushIntervalRef.current);
        flushIntervalRef.current = null;
      }
    }
  }, [isStreaming, content]);

  // Reset when message changes (detect by content getting shorter)
  useEffect(() => {
    if (content.length < lastContentLengthRef.current || content === "") {
      setDisplayedContent("");
      bufferRef.current = [];
      lastContentLengthRef.current = 0;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (flushIntervalRef.current) {
        clearInterval(flushIntervalRef.current);
        flushIntervalRef.current = null;
      }
    }
  }, [content]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (flushIntervalRef.current) {
        clearInterval(flushIntervalRef.current);
      }
    };
  }, []);

  return displayedContent;
}
