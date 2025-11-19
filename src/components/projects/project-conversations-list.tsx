"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "../ui/button";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface ProjectConversationsListProps {
  projectId: Id<"projects">;
  activeConversationId?: Id<"conversations"> | null;
  onSelectConversation?: (id: Id<"conversations">) => void;
}

export function ProjectConversationsList({
  projectId,
  activeConversationId,
  onSelectConversation,
}: ProjectConversationsListProps) {
  const router = useRouter();
  const allConversations = useQuery(api.conversations.list);

  // Filter conversations for this project
  const projectConversations = allConversations?.filter(
    (conv) => conv.projectId === projectId
  );

  const handleConversationClick = (conversationId: Id<"conversations">) => {
    if (onSelectConversation) {
      onSelectConversation(conversationId);
    }
    router.push(`/projects/${projectId}?conversation=${conversationId}`);
  };

  return (
    <div>
      <h3 className="mb-2 text-sm font-medium">Conversations</h3>

      <div className="space-y-1">
        {projectConversations && projectConversations.length > 0 ? (
          projectConversations.map((conversation) => (
            <Button
              key={conversation._id}
              variant="ghost"
              className={cn(
                "w-full justify-start font-normal text-left h-auto py-2 px-2",
                activeConversationId === conversation._id && "bg-white/10"
              )}
              size="sm"
              onClick={() => handleConversationClick(conversation._id)}
            >
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="truncate text-sm">
                  {conversation.title || "New conversation"}
                </p>
                {conversation.lastMessagePreview && (
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {conversation.lastMessagePreview}
                  </p>
                )}
                {conversation.lastMessageAt && (
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(conversation.lastMessageAt, {
                      addSuffix: true,
                    })}
                  </p>
                )}
              </div>
            </Button>
          ))
        ) : (
          <p className="py-4 text-xs text-muted-foreground text-center">
            No conversations yet
          </p>
        )}
      </div>
    </div>
  );
}
