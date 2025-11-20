"use client";

import { useState } from "react";
import { Doc, Id } from "convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, PanelRightClose, PanelRightOpen } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { ProjectFiles } from "./project-files";
import { ProjectCapacityIndicator } from "./project-capacity-indicator";
import { Separator } from "../ui/separator";
import { ProjectConversationsList } from "./project-conversations-list";

interface ProjectSidebarProps {
  projectId: Id<"projects">;
  project: Doc<"projects">;
  onToggle?: () => void;
  isOpen?: boolean;
  activeConversationId?: Id<"conversations"> | null;
  onSelectConversation?: (id: Id<"conversations">) => void;
}

export function ProjectSidebar({ projectId, project, onToggle, isOpen = true, activeConversationId, onSelectConversation }: ProjectSidebarProps) {
  const [isEditingInstructions, setIsEditingInstructions] = useState(false);
  const [instructions, setInstructions] = useState(project?.instructions || "");
  const updateInstructions = useMutation(api.projects.updateInstructions);

  const handleSaveInstructions = async () => {
    await updateInstructions({ id: projectId, instructions });
    setIsEditingInstructions(false);
  };

  return (
    <div className="w-[320px] border-l border-border bg-background overflow-y-auto relative">
      <div className="px-4 py-4 space-y-4">
        {/* Instructions Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">Instructions</h3>
            {!isEditingInstructions && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsEditingInstructions(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
          {isEditingInstructions || project.instructions ? (
            <div>
              <Textarea
                placeholder="Add instructions to tailor responses"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="min-h-[80px] text-sm"
                disabled={!isEditingInstructions}
              />
              {isEditingInstructions && (
                <div className="mt-2 flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setInstructions(project.instructions || "");
                      setIsEditingInstructions(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveInstructions}>
                    Save
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Add instructions to tailor responses
            </p>
          )}
        </div>

        <Separator />

        {/* Capacity Indicator */}
        <ProjectCapacityIndicator
          tokensUsed={project.tokensUsed}
          tokenLimit={project.tokenLimit}
        />

        <Separator />

        {/* Files Section */}
        <ProjectFiles projectId={projectId} />

        <Separator />

        {/* Recent Conversations */}
        <ProjectConversationsList
          projectId={projectId}
          activeConversationId={activeConversationId}
          onSelectConversation={onSelectConversation}
        />
      </div>
    </div>
  );
}
