import { Doc } from "../../../convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { User, Calendar, Mail, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface FeatureRequestDetailModalProps {
  feature: Doc<"featureRequests"> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function FeatureRequestDetailModal({ feature, open, onOpenChange }: FeatureRequestDetailModalProps) {
  const [notesValue, setNotesValue] = useState("");
  const updateNotes = useMutation(api.featureRequests.updateNotes);

  // Initialize notes value when modal opens or feature changes
  useEffect(() => {
    if (feature && open) {
      setNotesValue(feature.notes || "");
    }
  }, [feature, open]);

  if (!feature) return null;

  const statusInfo = statusConfig[feature.status as keyof typeof statusConfig];

  const handleSaveNotes = async () => {
    await updateNotes({
      featureRequestId: feature._id,
      notes: notesValue,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold pr-8">{feature.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Status
            </label>
            <Badge className={cn("text-sm font-medium border", statusInfo.className)}>
              {statusInfo.label}
            </Badge>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Description
            </label>
            <p className="text-sm text-foreground leading-relaxed bg-muted/50 p-4 rounded-md">
              {feature.description}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-muted-foreground">
                Notes
              </label>
              <Button
                size="sm"
                onClick={handleSaveNotes}
                className="h-8"
              >
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
            <Textarea
              value={notesValue}
              onChange={(e) => setNotesValue(e.target.value)}
              placeholder="Add notes here... Use '-' or '*' for bullet points"
              className="min-h-[120px] text-sm"
            />
          </div>

          <div className="space-y-3 pt-2 border-t">
            <h3 className="text-sm font-semibold text-foreground">User Information</h3>

            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="text-sm text-foreground font-medium">{feature.userName || "Anonymous"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm text-foreground font-medium">{feature.userEmail || "Not provided"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Requested on</p>
                <p className="text-sm text-foreground font-medium">
                  {new Date(feature.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
