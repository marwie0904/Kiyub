"use client";

import { useState } from "react";
import { Id } from "convex/_generated/dataModel";
import { useAuthToken } from "@convex-dev/auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { TestGeneratingSkeleton } from "./test-generating-skeleton";

interface CreateTestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: Id<"conversations"> | null;
  onTestCreated?: (testData: any) => void;
}

export function CreateTestModal({
  open,
  onOpenChange,
  conversationId,
  onTestCreated,
}: CreateTestModalProps) {
  const authToken = useAuthToken();
  const [questionCount, setQuestionCount] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  // Radio state for test type selection
  const [testMode, setTestMode] = useState<"multiple_choice" | "flashcard">("multiple_choice");

  const handleGenerate = async () => {
    if (!conversationId) {
      setError("No conversation selected");
      return;
    }

    if (questionCount < 1) {
      setError("Cannot create tests less than 1 question");
      return;
    }

    if (questionCount > 20) {
      setError("Question count must be 20 or less");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      // Build test types array based on selected mode
      const testTypes: string[] = [testMode];

      const response = await fetch("/api/generate-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { "Authorization": `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          conversationId,
          testTypes,
          questionCount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate test");
      }

      // Success - call the callback with test data
      // The test is now generating in the background
      onTestCreated?.(data);

      // Reset form and close modal immediately
      setTestMode("multiple_choice");
      setQuestionCount(10);
      setIsGenerating(false);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate test");
      setIsGenerating(false);
    }
  };

  const handleTestModeChange = (mode: "multiple_choice" | "flashcard") => {
    setTestMode(mode);
    setError("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-normal text-center mb-6">
            Create Test
          </DialogTitle>
        </DialogHeader>

            <div className="space-y-6">
          {/* Test Mode Selection */}
          <div className="space-y-4">
            <label className="text-sm text-muted-foreground">
              Choose test format:
            </label>

            <RadioGroup
              value={testMode}
              onValueChange={(value) => handleTestModeChange(value as "multiple_choice" | "flashcard")}
            >
              {/* Multiple Choice Option */}
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="multiple_choice" id="multiple_choice" />
                <Label htmlFor="multiple_choice" className="font-normal cursor-pointer">
                  Multiple Choice
                </Label>
              </div>

              {/* Flashcard Option */}
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="flashcard" id="flashcard" />
                <Label htmlFor="flashcard" className="font-normal cursor-pointer">
                  Flashcard
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Question Count */}
          <div>
            <label className="mb-2 block text-sm text-muted-foreground">
              Number of questions (1-20):
            </label>
            <Input
              type="number"
              min={1}
              max={20}
              value={questionCount === 0 ? "" : questionCount}
              onChange={(e) => {
                const value = e.target.value;
                // Allow empty string for backspacing
                if (value === "") {
                  setQuestionCount(0);
                } else {
                  setQuestionCount(parseInt(value));
                }
                setError("");
              }}
              className="h-10"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-sm text-red-500 text-center">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !conversationId}
              className="bg-white text-black hover:bg-white/90"
            >
              {isGenerating ? "Generating..." : "Generate Test"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
