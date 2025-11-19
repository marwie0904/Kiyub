"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { HelpCircle } from "lucide-react";

const DAILY_LIMIT_USD = 0.067;

export function DailyUsageCircle() {
  const [open, setOpen] = useState(false);
  const dailyUsage = useQuery(api.aiTracking.getDailyUsage, {});

  const { totalCostUsd, percentage, color } = useMemo(() => {
    const cost = dailyUsage?.totalCostUsd ?? 0;
    const pct = Math.min((cost / DAILY_LIMIT_USD) * 100, 100);

    let barColor = "hsl(var(--primary))";
    if (pct >= 90) barColor = "#ef4444"; // red-500
    else if (pct >= 75) barColor = "#f59e0b"; // amber-500

    return {
      totalCostUsd: cost,
      percentage: pct,
      color: barColor,
    };
  }, [dailyUsage]);

  const bgColor = "hsl(var(--muted-foreground) / 0.1)";

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
    <TooltipProvider>
      <Popover open={open} onOpenChange={setOpen}>
        <Tooltip delayDuration={500}>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <button className="flex items-center justify-center cursor-pointer">
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
            <p className="text-xs">Click for daily usage details</p>
          </TooltipContent>
        </Tooltip>
        <PopoverContent className="w-48 p-2" align="start" side="top">
          <div className="space-y-1.5">
            <div className="flex items-center justify-center gap-1">
              <span className="text-[10px] font-medium text-muted-foreground">Daily Usage</span>
              <Tooltip delayDuration={500}>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-3 h-3 text-muted-foreground/60 cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p className="text-xs">
                    Daily AI usage limit to ensure fair access for all users. Resets at midnight.
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
    </TooltipProvider>
  );
}
