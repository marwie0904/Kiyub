"use client";

import { useState, useEffect } from "react";
import { CubeLoader } from "./cube-loader";
import { getRandomLoadingWord, getNextLoadingWord } from "@/lib/loading-words";

interface LoadingWithTextProps {
  size?: "sm" | "md" | "lg";
  speed?: "slow" | "normal" | "fast";
  variant?: "primary" | "muted" | "accent" | "error" | "yellow" | "blue";
  className?: string;
  customText?: string; // Override the rotating word with custom text
}

export function LoadingWithText({
  size = "sm",
  speed = "fast",
  variant = "primary",
  className,
  customText,
}: LoadingWithTextProps) {
  const [currentWord, setCurrentWord] = useState(() => getRandomLoadingWord());
  const [dotCount, setDotCount] = useState(0);

  useEffect(() => {
    // Skip word rotation if custom text is provided
    if (customText) return;

    // Random interval between 3-5 seconds (3000-5000ms)
    const getRandomInterval = () => Math.floor(Math.random() * 2000) + 3000;

    const rotateWord = () => {
      setCurrentWord((prev) => getNextLoadingWord(prev));
    };

    // Set initial timeout
    let timeoutId = setTimeout(function tick() {
      rotateWord();
      timeoutId = setTimeout(tick, getRandomInterval());
    }, getRandomInterval());

    return () => clearTimeout(timeoutId);
  }, [customText]);

  // Animate dots (1, 2, 3, repeat)
  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount((prev) => (prev + 1) % 4);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const displayText = customText || currentWord;
  const dots = '.'.repeat(dotCount);
  const textColorClass =
    variant === "error" ? "text-red-600 dark:text-red-500" :
    variant === "yellow" ? "text-yellow-600 dark:text-yellow-500" :
    variant === "blue" ? "text-blue-600 dark:text-blue-500" :
    "text-primary";

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <CubeLoader size={size} speed={speed} variant={variant} />
      <span className={`text-sm font-medium ${textColorClass}`}>
        {displayText}{dots}
      </span>
    </div>
  );
}
