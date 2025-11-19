import { useMemo, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { HelpCircle } from "lucide-react";

interface TokenProgressCircleProps {
  totalTokens: number;
  limit: number;
  className?: string;
}

export function TokenProgressCircle({ totalTokens, limit, className = "" }: TokenProgressCircleProps) {
  const [open, setOpen] = useState(false);

  const percentage = useMemo(() => {
    return Math.min((totalTokens / limit) * 100, 100);
  }, [totalTokens, limit]);

  // Determine color based on usage
  const color = useMemo(() => {
    if (percentage >= 90) return "#ef4444"; // red-500
    if (percentage >= 75) return "#f59e0b"; // amber-500
    return "hsl(var(--primary))";
  }, [percentage]);

  const bgColor = "hsl(var(--muted-foreground) / 0.1)";

  // Calculate the end angle for the pie slice
  const angle = (percentage / 100) * 360;

  // Create pie path using conic gradient simulation via path
  const createPiePath = (percentage: number) => {
    const radius = 9;
    const centerX = 11;
    const centerY = 11;

    if (percentage === 0) return "";
    if (percentage >= 100) {
      // Full circle
      return `M ${centerX},${centerY} m -${radius},0 a ${radius},${radius} 0 1,0 ${radius * 2},0 a ${radius},${radius} 0 1,0 -${radius * 2},0`;
    }

    // Convert percentage to angle (0-360 degrees)
    const angle = (percentage / 100) * 360;
    const radians = (angle - 90) * (Math.PI / 180); // -90 to start from top

    // Calculate end point
    const endX = centerX + radius * Math.cos(radians);
    const endY = centerY + radius * Math.sin(radians);

    // Determine if we need the large arc flag
    const largeArcFlag = angle > 180 ? 1 : 0;

    // Create pie slice path
    return `M ${centerX},${centerY} L ${centerX},${centerY - radius} A ${radius},${radius} 0 ${largeArcFlag},1 ${endX},${endY} Z`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip delayDuration={500}>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button className={`flex items-center justify-center cursor-pointer ${className}`}>
              <svg
                width="22"
                height="22"
                viewBox="0 0 22 22"
              >
                {/* Background circle */}
                <circle
                  cx="11"
                  cy="11"
                  r="9"
                  fill={bgColor}
                />
                {/* Progress pie fill */}
                {percentage > 0 && (
                  <path
                    d={createPiePath(percentage)}
                    fill={color}
                    className="transition-all duration-300"
                  />
                )}
              </svg>
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">Click for token details</p>
        </TooltipContent>
      </Tooltip>
      <PopoverContent className="w-48 p-2" align="start" side="top">
        <div className="space-y-1.5">
          <div className="flex items-center justify-center gap-1">
            <span className="text-[10px] font-medium text-muted-foreground">Context Usage</span>
            <Tooltip delayDuration={500}>
              <TooltipTrigger asChild>
                <HelpCircle className="w-3 h-3 text-muted-foreground/60 cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="text-xs">
                  Each message includes your full conversation history so the AI remembers context. This usage limit prevents conversations from consuming your quota too quickly.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center justify-center">
            <span className="text-xl font-bold">{percentage.toFixed(1)}%</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
