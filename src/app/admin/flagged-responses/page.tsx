"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Doc } from "../../../../convex/_generated/dataModel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flag, MessageSquare, User, Mail, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function FlaggedResponsesPage() {
  const feedbacks = useQuery(api.responseFeedback.list) ?? [];
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (timestamp: number) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return new Date(timestamp).toLocaleDateString();
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b bg-background px-8 py-6">
        <h1 className="text-3xl font-bold">Flagged Responses</h1>
        <p className="text-muted-foreground mt-1">
          Review AI responses that users have flagged as problematic
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-8 max-w-6xl mx-auto space-y-4">
          {feedbacks.length === 0 ? (
            <div className="text-center py-12">
              <Flag className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-semibold text-muted-foreground mb-2">
                No flagged responses yet
              </h2>
              <p className="text-sm text-muted-foreground">
                Flagged responses will appear here when users report issues
              </p>
            </div>
          ) : (
            feedbacks.map((feedback) => {
              const isExpanded = expandedId === feedback._id;

              return (
                <Card key={feedback._id} className="p-6 hover:shadow-md transition-shadow">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                        <Flag className="h-5 w-5 text-red-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">Issue Reported</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(feedback.createdAt)}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {feedback.aiModel}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(feedback._id)}
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* User Info */}
                  {(feedback.userName || feedback.userEmail) && (
                    <div className="flex items-center gap-4 mb-4 text-sm">
                      {feedback.userName && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <User className="h-3.5 w-3.5" />
                          <span>{feedback.userName}</span>
                        </div>
                      )}
                      {feedback.userEmail && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Mail className="h-3.5 w-3.5" />
                          <span>{feedback.userEmail}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Issue Description */}
                  <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium text-red-500">Issue Description</span>
                    </div>
                    <p className="text-sm text-foreground/90">{feedback.description}</p>
                  </div>

                  {/* Expandable Content */}
                  {isExpanded && (
                    <div className="space-y-4 pt-4 border-t">
                      {/* User Question */}
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-2">
                          User Question
                        </div>
                        <div className="bg-muted/50 rounded-lg p-4">
                          <p className="text-sm whitespace-pre-wrap">{feedback.userQuestion}</p>
                        </div>
                      </div>

                      {/* AI Response */}
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-2">
                          AI Response
                        </div>
                        <div className="bg-muted/50 rounded-lg p-4 max-h-[400px] overflow-y-auto">
                          <p className="text-sm whitespace-pre-wrap">{feedback.aiResponse}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
