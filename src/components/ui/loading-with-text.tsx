"use client";

import { useState, useEffect } from "react";
import { CubeLoader } from "./cube-loader";
import { getRandomLoadingWord, getNextLoadingWord } from "@/lib/loading-words";

interface LoadingWithTextProps {
  size?: "sm" | "md" | "lg";
  speed?: "slow" | "normal" | "fast";
  variant?: "primary" | "muted" | "accent";
  className?: string;
}

export function LoadingWithText({
  size = "sm",
  speed = "fast",
  variant = "primary",
  className,
}: LoadingWithTextProps) {
  const [currentWord, setCurrentWord] = useState(() => getRandomLoadingWord());

  useEffect(() => {
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
  }, []);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <CubeLoader size={size} speed={speed} variant={variant} />
      <span className="text-sm text-primary font-medium animate-in fade-in duration-300">
        {currentWord}...
      </span>
    </div>
  );
}
