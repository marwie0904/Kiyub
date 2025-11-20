import { Doc } from "convex/_generated/dataModel";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

interface BugReportCardProps {
  bug: Doc<"bugReports">;
  onClick: () => void;
  onDelete?: (id: Doc<"bugReports">["_id"]) => void;
}

const statusConfig = {
  pending: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-300 dark:border-yellow-600",
  },
  "in-progress": {
    label: "In Progress",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-blue-300 dark:border-blue-600",
  },
  "for-review": {
    label: "For Review",
    className: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 border-purple-300 dark:border-purple-600",
  },
  resolved: {
    label: "Resolved",
    className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-green-300 dark:border-green-600",
  },
} as const;

export function BugReportCard({ bug, onClick, onDelete }: BugReportCardProps) {
  const statusInfo = statusConfig[bug.status as keyof typeof statusConfig];
  const [showTooltip, setShowTooltip] = useState(false);
  const [hoverTimer, setHoverTimer] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (bug.notes) {
      const timer = setTimeout(() => {
        setShowTooltip(true);
      }, 1000);
      setHoverTimer(timer);
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimer) {
      clearTimeout(hoverTimer);
      setHoverTimer(null);
    }
    setShowTooltip(false);
  };

  useEffect(() => {
    return () => {
      if (hoverTimer) {
        clearTimeout(hoverTimer);
      }
    };
  }, [hoverTimer]);

  const cardContent = (
    <ContextMenu>
      <ContextMenuTrigger>
        <Card
          className="p-4 cursor-pointer hover:shadow-md transition-shadow bg-card border"
          onClick={onClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <Badge className={cn("text-xs font-medium border", statusInfo.className)}>
                {statusInfo.label}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Priority: <span className="text-foreground">Medium</span>
              </span>
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-1.5 line-clamp-2 text-foreground">
                {bug.title}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-3">
                {bug.description}
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
              <span className="truncate">{bug.userId || "Anonymous"}</span>
              <span>{new Date(bug.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </Card>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(bug._id);
          }}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );

  if (bug.notes && showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip open={showTooltip}>
          <TooltipTrigger asChild>
            {cardContent}
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-md p-3">
            <div className="space-y-1">
              <p className="font-semibold text-sm">Notes:</p>
              <div
                className="text-sm whitespace-pre-wrap"
                dangerouslySetInnerHTML={{
                  __html: bug.notes
                    .replace(/\n/g, '<br/>')
                    .replace(/^- (.+)$/gm, '• $1')
                    .replace(/^\* (.+)$/gm, '• $1')
                }}
              />
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return cardContent;
}
