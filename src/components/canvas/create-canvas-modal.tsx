"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface CreateCanvasModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCanvasModal({
  open,
  onOpenChange,
}: CreateCanvasModalProps) {
  const router = useRouter();
  const createCanvas = useMutation(api.canvases.create);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) return;

    setIsCreating(true);
    try {
      const canvasId = await createCanvas({
        title: title.trim(),
        description: description.trim() || undefined,
      });
      onOpenChange(false);
      setTitle("");
      setDescription("");
      router.push(`/canvas/${canvasId}`);
    } catch (error) {
      console.error("Failed to create canvas:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-normal text-center mb-6">
            Create a new canvas
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-sm text-muted-foreground">
              What's this canvas for?
            </label>
            <Input
              placeholder="Name your canvas"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-12"
              autoFocus
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-muted-foreground">
              Description (optional)
            </label>
            <Textarea
              placeholder="Describe what you'll use this canvas for..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[120px] resize-none"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!title.trim() || isCreating}
              className="bg-white text-black hover:bg-white/90"
            >
              {isCreating ? "Creating..." : "Create canvas"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
