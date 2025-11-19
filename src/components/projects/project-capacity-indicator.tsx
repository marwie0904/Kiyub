"use client";

interface ProjectCapacityIndicatorProps {
  tokensUsed: number;
  tokenLimit: number;
}

export function ProjectCapacityIndicator({
  tokensUsed,
  tokenLimit,
}: ProjectCapacityIndicatorProps) {
  const percentage = Math.min((tokensUsed / tokenLimit) * 100, 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {Math.round(percentage)}% of project capacity used
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
