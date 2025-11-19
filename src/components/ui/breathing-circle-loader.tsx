import { cn } from "@/lib/utils";

interface BreathingCircleLoaderProps {
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "muted" | "accent";
  speed?: "slow" | "normal" | "fast";
  className?: string;
}

export function BreathingCircleLoader({
  size = "md",
  variant = "primary",
  speed = "normal",
  className,
}: BreathingCircleLoaderProps) {
  const sizeConfig = {
    sm: {
      container: "w-10 h-10",
      rings: ["w-3 h-3", "w-5 h-5", "w-7 h-7"],
    },
    md: {
      container: "w-14 h-14",
      rings: ["w-4 h-4", "w-7 h-7", "w-10 h-10"],
    },
    lg: {
      container: "w-20 h-20",
      rings: ["w-6 h-6", "w-10 h-10", "w-14 h-14"],
    },
  };

  const variantConfig = {
    primary: "border-primary",
    muted: "border-muted-foreground",
    accent: "border-accent-foreground",
  };

  const speedSuffix = speed === "slow" ? "-slow" : speed === "fast" ? "-fast" : "";

  return (
    <div
      className={cn(
        "relative flex items-center justify-center",
        sizeConfig[size].container,
        className
      )}
    >
      {sizeConfig[size].rings.map((ringSize, index) => (
        <div
          key={index}
          className={cn(
            "absolute rounded-full border-2",
            ringSize,
            variantConfig[variant],
            `animate-breathe-${index + 1}${speedSuffix}`
          )}
        />
      ))}
    </div>
  );
}
