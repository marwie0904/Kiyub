"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

interface AnimatedTitleProps {
  title: string;
  className?: string;
  shouldAnimate: boolean; // Only animate on auto-generated titles
}

export function AnimatedTitle({ title, className = "", shouldAnimate }: AnimatedTitleProps) {
  const [displayText, setDisplayText] = useState(title);
  const previousTitleRef = useRef(title);

  useEffect(() => {
    // Check if title changed and should animate
    const titleChanged = previousTitleRef.current !== title;
    const shouldTriggerAnimation = titleChanged && shouldAnimate && title && title !== "New Conversation" && title !== "New Chat";

    if (shouldTriggerAnimation) {
      // Reset to empty for animation
      setDisplayText("");
      previousTitleRef.current = title;
    } else {
      // Just update without animation
      setDisplayText(title);
      previousTitleRef.current = title;
    }
  }, [title, shouldAnimate]);

  // If we should animate and displayText is empty but title exists, render animated version
  const isAnimating = shouldAnimate && displayText === "" && title && title !== "New Conversation" && title !== "New Chat";

  if (isAnimating) {
    return (
      <div className={className}>
        {title.split("").map((char, index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: index * 0.05, // 50ms delay between each character
              ease: "easeOut",
            }}
            style={{ display: "inline-block" }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </div>
    );
  }

  // Non-animated fallback
  return <div className={className}>{displayText}</div>;
}
