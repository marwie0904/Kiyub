import { cn } from "@/lib/utils";

interface HexagonLoaderProps {
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "muted" | "accent";
  speed?: "slow" | "normal" | "fast";
  className?: string;
}

export function HexagonLoader({
  size = "md",
  variant = "primary",
  speed = "normal",
  className,
}: HexagonLoaderProps) {
  const sizeConfig = {
    sm: {
      container: "w-8 h-8",
      hexagon: "w-8 h-8",
    },
    md: {
      container: "w-12 h-12",
      hexagon: "w-12 h-12",
    },
    lg: {
      container: "w-16 h-16",
      hexagon: "w-16 h-16",
    },
  };

  const variantConfig = {
    primary: "bg-primary",
    muted: "bg-muted-foreground",
    accent: "bg-accent-foreground",
  };

  const speedClass = speed === "slow"
    ? "animate-morph-hexagon-slow"
    : speed === "fast"
    ? "animate-morph-hexagon-fast"
    : "animate-morph-hexagon";

  return (
    <div
      className={cn(
        "relative flex items-center justify-center",
        sizeConfig[size].container,
        className
      )}
    >
      <div
        className={cn(
          sizeConfig[size].hexagon,
          variantConfig[variant],
          speedClass
        )}
      />
    </div>
  );
}
