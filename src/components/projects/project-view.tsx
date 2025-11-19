"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { ProjectCapacityIndicator } from "./project-capacity-indicator";
import { ProjectInstructions } from "./project-instructions";
import { ProjectFiles } from "./project-files";
import { ProjectConversationsList } from "./project-conversations-list";
import { Separator } from "../ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

interface ProjectViewProps {
  projectId: Id<"projects">;
}

export function ProjectView({ projectId }: ProjectViewProps) {
  const project = useQuery(api.projects.get, { id: projectId });

  if (!project) {
    return (
      <div className="flex h-full flex-col">
        {/* Header Skeleton */}
        <div className="border-b p-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Content - Split into two columns */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left side Skeleton */}
          <div className="flex flex-1 flex-col p-6">
            <div className="mb-4">
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-80" />
            </div>
            <Skeleton className="flex-1 rounded-lg" />
          </div>

          {/* Right sidebar - Actual Content */}
          <div className="w-[400px] overflow-y-auto border-l bg-muted/30 p-6">
            <div className="space-y-6">
              {/* Capacity Indicator Skeleton */}
              <div className="space-y-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-2 w-full rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>

              <Separator />

              {/* Instructions Skeleton */}
              <div className="space-y-3">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-24 w-full" />
              </div>

              <Separator />

              {/* Files Skeleton */}
              <div className="space-y-3">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-12 w-full" />
              </div>

              <Separator />

              {/* Conversations Skeleton */}
              <div className="space-y-3">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b p-6">
        <h1 className="text-2xl font-semibold">{project.title}</h1>
        {project.description && (
          <p className="mt-2 text-sm text-muted-foreground">
            {project.description}
          </p>
        )}
      </div>

      {/* Content - Split into two columns */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left side - Textbox area */}
        <div className="flex flex-1 flex-col p-6">
          <div className="mb-4">
            <h2 className="mb-2 text-lg font-medium">Ask a question</h2>
            <p className="text-sm text-muted-foreground">
              Ask questions about this project&apos;s knowledge base
            </p>
          </div>

          {/* TODO: Integrate chat area here */}
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed">
            <p className="text-sm text-muted-foreground">
              Chat interface coming soon...
            </p>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="w-[400px] overflow-y-auto border-l bg-muted/30 p-6">
          <div className="space-y-6">
            {/* Capacity Indicator */}
            <ProjectCapacityIndicator
              tokensUsed={project.tokensUsed}
              tokenLimit={project.tokenLimit}
            />

            <Separator />

            {/* Instructions */}
            <ProjectInstructions
              projectId={projectId}
              instructions={project.instructions}
            />

            <Separator />

            {/* Files */}
            <ProjectFiles projectId={projectId} />

            <Separator />

            {/* Conversations */}
            <ProjectConversationsList projectId={projectId} />
          </div>
        </div>
      </div>
    </div>
  );
}
