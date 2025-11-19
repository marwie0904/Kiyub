import { useState, useEffect } from "react";

/**
 * Hook to animate text with a typing effect
 * @param text - The full text to animate
 * @param speed - Characters per millisecond (default: 10 chars per 100ms = 0.1 chars/ms)
 * @param enabled - Whether animation is enabled
 */
export function useTypingAnimation(
  text: string,
  speed: number = 0.1,
  enabled: boolean = true
): string {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    if (!enabled || !text) {
      setDisplayedText(text);
      return;
    }

    setDisplayedText("");
    let currentIndex = 0;

    const intervalTime = 100; // Run every 100ms
    const charsPerInterval = Math.max(1, Math.floor(speed * intervalTime)); // 10 chars per 100ms

    const interval = setInterval(() => {
      if (currentIndex >= text.length) {
        clearInterval(interval);
        setDisplayedText(text);
        return;
      }

      currentIndex += charsPerInterval;
      setDisplayedText(text.substring(0, currentIndex));
    }, intervalTime);

    return () => clearInterval(interval);
  }, [text, speed, enabled]);

  return displayedText;
}
