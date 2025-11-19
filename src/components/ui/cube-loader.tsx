import { cn } from "@/lib/utils";

interface CubeLoaderProps {
  size?: "xs" | "sm" | "md" | "lg";
  variant?: "primary" | "muted" | "accent";
  speed?: "slow" | "normal" | "fast";
  className?: string;
}

export function CubeLoader({
  size = "md",
  variant = "primary",
  speed = "normal",
  className,
}: CubeLoaderProps) {
  const sizeConfig = {
    xs: {
      container: "w-7 h-7",
      cube: "w-3.5 h-3.5",
      depth: "7px",
    },
    sm: {
      container: "w-8 h-8",
      cube: "w-4 h-4",
      depth: "8px",
    },
    md: {
      container: "w-12 h-12",
      cube: "w-8 h-8",
      depth: "16px",
    },
    lg: {
      container: "w-16 h-16",
      cube: "w-10 h-10",
      depth: "20px",
    },
  };

  // Base colors for each variant
  const variantColors = {
    primary: "hsl(219, 67%, 48%)",
    muted: "hsl(215, 20.2%, 65.1%)",
    accent: "hsl(240, 5.9%, 10%)",
  };

  const baseColor = variantColors[variant];

  const speedClass = speed === "slow"
    ? "animate-cube-rotate-slow"
    : speed === "fast"
    ? "animate-cube-rotate-fast"
    : "animate-cube-rotate";

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden flex-shrink-0",
        sizeConfig[size].container,
        className
      )}
      style={{
        perspective: "400px",
        isolation: "isolate",
        contain: "layout style paint"
      }}
    >
      <div
        className={cn(
          "relative",
          sizeConfig[size].cube,
          speedClass
        )}
        style={{
          transformStyle: "preserve-3d",
          backfaceVisibility: "hidden",
          willChange: "transform"
        }}
      >
        {/* Front face - 100% brightness */}
        <div
          className="absolute inset-0 border-2"
          style={{
            backgroundColor: baseColor,
            borderColor: baseColor,
            transform: `translateZ(${sizeConfig[size].depth})`,
            opacity: 1,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        />

        {/* Back face - 40% brightness */}
        <div
          className="absolute inset-0 border-2"
          style={{
            backgroundColor: baseColor,
            borderColor: baseColor,
            transform: `translateZ(-${sizeConfig[size].depth}) rotateY(180deg)`,
            opacity: 0.4,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        />

        {/* Right face - 70% brightness */}
        <div
          className="absolute inset-0 border-2"
          style={{
            backgroundColor: baseColor,
            borderColor: baseColor,
            transform: `rotateY(90deg) translateZ(${sizeConfig[size].depth})`,
            opacity: 0.7,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        />

        {/* Left face - 60% brightness */}
        <div
          className="absolute inset-0 border-2"
          style={{
            backgroundColor: baseColor,
            borderColor: baseColor,
            transform: `rotateY(-90deg) translateZ(${sizeConfig[size].depth})`,
            opacity: 0.6,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        />

        {/* Top face - 85% brightness */}
        <div
          className="absolute inset-0 border-2"
          style={{
            backgroundColor: baseColor,
            borderColor: baseColor,
            transform: `rotateX(90deg) translateZ(${sizeConfig[size].depth})`,
            opacity: 0.85,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        />

        {/* Bottom face - 50% brightness */}
        <div
          className="absolute inset-0 border-2"
          style={{
            backgroundColor: baseColor,
            borderColor: baseColor,
            transform: `rotateX(-90deg) translateZ(${sizeConfig[size].depth})`,
            opacity: 0.5,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        />
      </div>
    </div>
  );
}
