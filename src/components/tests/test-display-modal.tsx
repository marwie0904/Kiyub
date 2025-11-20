"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { QuestionRenderer } from "./question-renderer";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";

export interface Question {
  id: string;
  type: "multiple_choice" | "written" | "fill_blank" | "flashcard";
  question?: string;
  options?: string[];
  correctAnswer?: string | string[];
  explanation?: string;
  front?: string;
  back?: string;
}

export interface Test {
  _id?: string;
  title: string;
  questions: Question[];
}

interface TestDisplayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  test: Test | null;
  onSubmit?: (answers: Record<string, string | string[]>) => void;
}

export function TestDisplayModal({
  open,
  onOpenChange,
  test,
  onSubmit,
}: TestDisplayModalProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateResponse = useMutation(api.testResponses.updateResponse);
  const testResponse = useQuery(
    api.testResponses.getPartialSave,
    test?._id ? { testId: test._id as Id<"tests"> } : "skip"
  );

  // Load saved answers and question index on mount
  useEffect(() => {
    if (testResponse && open) {
      try {
        if (testResponse.answers) {
          const savedAnswers = JSON.parse(testResponse.answers);
          setAnswers(savedAnswers);
        }
        // Restore the last question index if available
        if (testResponse.lastQuestionIndex !== undefined) {
          setCurrentQuestionIndex(testResponse.lastQuestionIndex);
        }
      } catch (error) {
        console.error("Failed to load saved state:", error);
      }
    }
  }, [testResponse, open]);

  if (!test || !test.questions || test.questions.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>No Test Available</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  const currentQuestion = test.questions[currentQuestionIndex];
  const totalQuestions = test.questions.length;
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const isFlashcardMode = test.questions.every((q) => q.type === "flashcard");

  const handleAnswerChange = (questionId: string, answer: string | string[]) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleNext = () => {
    if (!isLastQuestion) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstQuestion) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit?.(answers);
      // Reset state after successful submission
      setCurrentQuestionIndex(0);
      setAnswers({});
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to submit test:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = async () => {
    // Always save progress when closing (even if empty)
    if (test?._id) {
      try {
        await updateResponse({
          testId: test._id as Id<"tests">,
          answers: JSON.stringify(answers),
          lastQuestionIndex: currentQuestionIndex,
        });
      } catch (error) {
        console.error("Failed to save progress:", error);
      }
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-normal text-center">
            {test.title}
          </DialogTitle>
          <p className="text-center text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </p>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-6 py-4">
            <QuestionRenderer
              question={currentQuestion}
              answer={answers[currentQuestion.id]}
              onAnswerChange={(answer) =>
                handleAnswerChange(currentQuestion.id, answer)
              }
            />
          </div>
        </ScrollArea>

        {/* Navigation and Actions */}
        <div className="flex items-center justify-between px-6 pb-4 border-t pt-4">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={isFirstQuestion}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex gap-2">
            {isLastQuestion ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-white text-black hover:bg-white/90"
              >
                {isSubmitting ? "Submitting..." : "Done"}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="gap-1 bg-white text-black hover:bg-white/90"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
