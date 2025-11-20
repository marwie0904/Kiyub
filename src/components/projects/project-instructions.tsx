"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Pencil } from "lucide-react";

interface ProjectInstructionsProps {
  projectId: Id<"projects">;
  instructions: string;
}

export function ProjectInstructions({
  projectId,
  instructions,
}: ProjectInstructionsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(instructions);
  const updateInstructions = useMutation(api.projects.updateInstructions);

  const handleSave = async () => {
    await updateInstructions({
      id: projectId,
      instructions: value,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setValue(instructions);
    setIsEditing(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Instructions</h3>
        {!isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="h-8 gap-2"
          >
            <Pencil className="h-3 w-3" />
            Edit
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Add instructions for using this project's knowledge base..."
            className="min-h-[120px] resize-none"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">
          {instructions || "No instructions added yet."}
        </div>
      )}
    </div>
  );
}
