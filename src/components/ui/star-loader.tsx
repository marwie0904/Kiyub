import { cn } from "@/lib/utils";

interface StarLoaderProps {
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "muted" | "accent";
  speed?: "slow" | "normal" | "fast";
  rings?: number;
  className?: string;
}

export function StarLoader({
  size = "md",
  variant = "primary",
  speed = "normal",
  rings = 2,
  className,
}: StarLoaderProps) {
  const sizeConfig = {
    sm: {
      container: "w-10 h-10",
      star: "w-4 h-4",
    },
    md: {
      container: "w-14 h-14",
      star: "w-5 h-5",
    },
    lg: {
      container: "w-20 h-20",
      star: "w-7 h-7",
    },
  };

  const variantConfig = {
    primary: "text-primary",
    muted: "text-muted-foreground",
    accent: "text-accent-foreground",
  };

  const speedClass = speed === "slow"
    ? "animate-star-pulse-slow"
    : speed === "fast"
    ? "animate-star-pulse-fast"
    : "animate-star-pulse";

  const ringSpeedClass = speed === "slow"
    ? "animate-star-ring-slow"
    : speed === "fast"
    ? "animate-star-ring-fast"
    : "animate-star-ring";

  const getDelay = (index: number) => {
    const delayPerRing = speed === "slow" ? 0.6 : speed === "fast" ? 0.3 : 0.4;
    return `${index * delayPerRing}s`;
  };

  const clampedRings = Math.max(0, Math.min(3, rings));

  return (
    <div
      className={cn(
        "relative flex items-center justify-center",
        sizeConfig[size].container,
        className
      )}
    >
      {/* Expanding rings */}
      {Array.from({ length: clampedRings }).map((_, index) => (
        <svg
          key={`ring-${index}`}
          className={cn(
            "absolute",
            sizeConfig[size].star,
            variantConfig[variant],
            ringSpeedClass
          )}
          style={{
            animationDelay: getDelay(index),
          }}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 2L15 9L22 10L17 15L18.5 22L12 18.5L5.5 22L7 15L2 10L9 9Z" />
        </svg>
      ))}

      {/* Center pulsing star */}
      <svg
        className={cn(
          sizeConfig[size].star,
          variantConfig[variant],
          speedClass
        )}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 2L15 9L22 10L17 15L18.5 22L12 18.5L5.5 22L7 15L2 10L9 9Z" />
      </svg>
    </div>
  );
}
