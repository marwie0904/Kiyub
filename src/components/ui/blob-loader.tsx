import { cn } from "@/lib/utils";

interface BlobLoaderProps {
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "muted" | "accent";
  speed?: "slow" | "normal" | "fast";
  rings?: number;
  className?: string;
}

export function BlobLoader({
  size = "md",
  variant = "primary",
  speed = "normal",
  rings = 3,
  className,
}: BlobLoaderProps) {
  // Size configurations
  const sizeConfig = {
    sm: {
      container: "w-10 h-10",
      ring: "w-5 h-5",
    },
    md: {
      container: "w-14 h-14",
      ring: "w-6 h-6",
    },
    lg: {
      container: "w-20 h-20",
      ring: "w-8 h-8",
    },
  };

  // Color variants - border only for outline effect
  const variantConfig = {
    primary: "border-2 border-primary",
    muted: "border-2 border-muted-foreground",
    accent: "border-2 border-accent-foreground",
  };

  // Get blob animation class for each ring
  const getBlobAnimation = (index: number) => {
    const ringNumber = (index % 4) + 1; // Cycle through 1-4
    const speedSuffix = speed === "slow" ? "-slow" : speed === "fast" ? "-fast" : "";
    return `animate-blob-ring-${ringNumber}${speedSuffix}`;
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
            "absolute",
            sizeConfig[size].ring,
            variantConfig[variant],
            getBlobAnimation(index)
          )}
          style={{
            animationDelay: getDelay(index),
          }}
        />
      ))}
    </div>
  );
}
