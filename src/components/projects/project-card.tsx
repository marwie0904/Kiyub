"use client";

import { useRouter } from "next/navigation";
import { Doc } from "convex/_generated/dataModel";
import { Button } from "@/components/ui/button";

interface ProjectCardProps {
  project: Doc<"projects">;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter();

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
    <Button
      variant="ghost"
      className="h-auto w-full flex-col items-start gap-2 rounded-lg border border-border bg-card p-6 text-left hover:bg-accent/5 hover:border-border/80 transition-colors"
      onClick={() => router.push(`/projects/${project._id}`)}
    >
      <div className="w-full">
        <h3 className="text-base font-semibold mb-2">{project.title}</h3>
        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {project.description}
          </p>
        )}
      </div>
      <span className="text-xs text-muted-foreground">
        {formatTimestamp(project.updatedAt)}
      </span>
    </Button>
  );
}
