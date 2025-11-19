import { cn } from "@/lib/utils";

interface FlowerLoaderProps {
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "muted" | "accent";
  speed?: "slow" | "normal" | "fast";
  className?: string;
}

export function FlowerLoader({
  size = "md",
  variant = "primary",
  speed = "normal",
  className,
}: FlowerLoaderProps) {
  const sizeConfig = {
    sm: {
      container: "w-8 h-8",
      flower: "w-8 h-8",
    },
    md: {
      container: "w-12 h-12",
      flower: "w-12 h-12",
    },
    lg: {
      container: "w-16 h-16",
      flower: "w-16 h-16",
    },
  };

  const variantConfig = {
    primary: "bg-primary",
    muted: "bg-muted-foreground",
    accent: "bg-accent-foreground",
  };

  const speedClass = speed === "slow"
    ? "animate-flower-bloom-slow"
    : speed === "fast"
    ? "animate-flower-bloom-fast"
    : "animate-flower-bloom";

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
          sizeConfig[size].flower,
          variantConfig[variant],
          speedClass
        )}
      />
    </div>
  );
}
