import { useEffect, useState, useRef, useCallback } from "react";

export function useSmoothStreaming(content: string, isStreaming: boolean) {
  const [displayedContent, setDisplayedContent] = useState("");
  const lastContentLengthRef = useRef(0);
  const bufferRef = useRef<string[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const flushIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isStreamingRef = useRef(isStreaming);

  console.log(`🟣 [useSmoothStreaming] Hook called - isStreaming: ${isStreaming}, content length: ${content.length}, buffer length: ${bufferRef.current.length}`);

  // Update streaming ref
  useEffect(() => {
    console.log(`🟣 [useSmoothStreaming] isStreaming changed: ${isStreamingRef.current} -> ${isStreaming}`);
    isStreamingRef.current = isStreaming;
  }, [isStreaming]);

  // Detect new content and add to buffer
  useEffect(() => {
    if (content.length > lastContentLengthRef.current) {
      const newChars = content.slice(lastContentLengthRef.current).split("");
      console.log(`🟣 [useSmoothStreaming] New content detected, adding ${newChars.length} chars to buffer`);
      bufferRef.current.push(...newChars);
      lastContentLengthRef.current = content.length;

      // Start the display interval if not already running
      if (!intervalRef.current) {
        console.log(`🟣 [useSmoothStreaming] Starting display interval`);
        intervalRef.current = setInterval(() => {
          if (bufferRef.current.length > 0) {
            // Display 15 characters at a time for smooth effect (increased from 6)
            const charsToAdd = bufferRef.current.splice(0, 15);
            console.log(`🟣 [useSmoothStreaming] [Interval] Displaying ${charsToAdd.length} chars, buffer remaining: ${bufferRef.current.length}`);
            setDisplayedContent((prev) => prev + charsToAdd.join(""));
          } else if (!isStreamingRef.current) {
            // Done streaming and buffer is empty
            console.log(`🟣 [useSmoothStreaming] [Interval] Buffer empty and not streaming, stopping interval`);
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
    console.log(`🟣 [useSmoothStreaming] [Flush Effect] isStreaming: ${isStreaming}, buffer length: ${bufferRef.current.length}`);

    if (!isStreaming && bufferRef.current.length > 0) {
      console.log(`🟣 [useSmoothStreaming] Stream ended with ${bufferRef.current.length} chars in buffer, starting flush interval`);

      // Clear existing flush interval if any
      if (flushIntervalRef.current) {
        console.log(`🟣 [useSmoothStreaming] Clearing existing flush interval`);
        clearInterval(flushIntervalRef.current);
      }

      // Flush remaining buffer smoothly instead of instantly
      flushIntervalRef.current = setInterval(() => {
        if (bufferRef.current.length > 0) {
          // Display all remaining characters in chunks
          const charsToAdd = bufferRef.current.splice(0, 30);
          console.log(`🟣 [useSmoothStreaming] [Flush] Displaying ${charsToAdd.length} chars, ${bufferRef.current.length} remaining`);
          setDisplayedContent((prev) => prev + charsToAdd.join(""));
        } else {
          // Buffer is empty, we're done
          console.log(`🟣 [useSmoothStreaming] [Flush] Buffer empty, clearing all intervals`);
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
      console.log(`🟣 [useSmoothStreaming] Stream ended with empty buffer, setting final content`);
      // No buffer, ensure content is displayed
      setDisplayedContent(content);
      lastContentLengthRef.current = content.length;

      // Clear intervals
      if (intervalRef.current) {
        console.log(`🟣 [useSmoothStreaming] Clearing main interval`);
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (flushIntervalRef.current) {
        console.log(`🟣 [useSmoothStreaming] Clearing flush interval`);
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
