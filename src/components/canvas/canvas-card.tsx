"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Doc } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { LayoutTemplate, Trash2 } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface CanvasCardProps {
  canvas: Doc<"canvases">;
}

export function CanvasCard({ canvas }: CanvasCardProps) {
  const router = useRouter();
  const removeCanvas = useMutation(api.canvases.remove);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [dialogPosition, setDialogPosition] = useState({ x: 0, y: 0 });

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDialogPosition({ x: e.clientX, y: e.clientY });
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    await removeCanvas({ id: canvas._id });
    setShowDeleteDialog(false);
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / 86400000);

    if (days === 0) return "Updated today";
    if (days === 1) return "Updated 1 day ago";
    if (days < 7) return `Updated ${days} days ago`;
    if (days < 30) {
      const weeks = Math.floor(days / 7);
      return `Updated ${weeks} week${weeks > 1 ? "s" : ""} ago`;
    }
    const months = Math.floor(days / 30);
    return `Updated ${months} month${months > 1 ? "s" : ""} ago`;
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-auto w-full flex-col items-start gap-2 rounded-lg border border-border bg-card p-6 text-left hover:bg-accent/5 hover:border-border/80 transition-colors"
            onClick={() => router.push(`/canvas/${canvas._id}`)}
          >
            <div className="w-full flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold mb-2">{canvas.title}</h3>
                {canvas.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {canvas.description}
                  </p>
                )}
              </div>
              <LayoutTemplate className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            </div>
            <span className="text-xs text-muted-foreground">
              {formatTimestamp(canvas.updatedAt)}
            </span>
          </Button>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem
            onClick={handleDeleteClick}
            className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete canvas
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent
          className="max-w-xs p-4 gap-3"
          style={{
            position: 'fixed',
            top: `${dialogPosition.y}px`,
            left: `${dialogPosition.x}px`,
            transform: 'translate(-50%, -100%) translateY(-10px)',
          }}
        >
          <AlertDialogHeader className="space-y-1">
            <AlertDialogTitle className="text-base">Delete canvas?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Delete &quot;{canvas.title}&quot;?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel className="mt-0 h-8 text-sm">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="h-8 text-sm bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
