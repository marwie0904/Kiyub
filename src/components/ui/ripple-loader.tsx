import { cn } from "@/lib/utils";

interface RippleLoaderProps {
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "muted" | "accent";
  speed?: "slow" | "normal" | "fast";
  rings?: number;
  className?: string;
}

export function RippleLoader({
  size = "md",
  variant = "primary",
  speed = "normal",
  rings = 3,
  className,
}: RippleLoaderProps) {
  // Size configurations
  const sizeConfig = {
    sm: {
      container: "w-8 h-8",
      ring: "w-3 h-3",
    },
    md: {
      container: "w-12 h-12",
      ring: "w-4 h-4",
    },
    lg: {
      container: "w-16 h-16",
      ring: "w-5 h-5",
    },
  };

  // Color variants
  const variantConfig = {
    primary: "border-primary",
    muted: "border-muted-foreground",
    accent: "border-accent-foreground",
  };

  // Animation speed
  const speedConfig = {
    slow: "animate-ripple-slow",
    normal: "animate-ripple",
    fast: "animate-ripple-fast",
  };

  // Calculate delay for each ring
  const getDelay = (index: number) => {
    const delayPerRing = speed === "slow" ? 0.6 : speed === "fast" ? 0.3 : 0.4;
    return `${index * delayPerRing}s`;
  };

  // Ensure rings is between 2 and 5
  const clampedRings = Math.max(2, Math.min(5, rings));

  return (
    <div
      className={cn(
        "relative flex items-center justify-center",
        sizeConfig[size].container,
        className
      )}
    >
      {Array.from({ length: clampedRings }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "absolute rounded-full border-2",
            sizeConfig[size].ring,
            variantConfig[variant],
            speedConfig[speed]
          )}
          style={{
            animationDelay: getDelay(index),
          }}
        />
      ))}
    </div>
  );
}
