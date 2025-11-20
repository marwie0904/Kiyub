"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { QuestionRenderer } from "./question-renderer";
import { Test } from "./test-display-modal";
import { TextSelectionHandler } from "../text-selection-handler";

interface TestResult {
  score: number;
  totalQuestions: number;
  answers: Record<string, string | string[]>;
  isCompleted?: boolean;
}

interface TestResultsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  test: Test | null;
  result: TestResult | null;
  onRetake?: () => void;
  conversationContext?: any[];
  model?: string;
}

export function TestResultsModal({
  open,
  onOpenChange,
  test,
  result,
  onRetake,
  conversationContext = [],
  model = "openai/gpt-oss-120b",
}: TestResultsModalProps) {
  if (!test || !result) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>No Results Available</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  const percentage = Math.round((result.score / result.totalQuestions) * 100);
  const passed = percentage >= 70;
  const isIncomplete = result.isCompleted === false;

  const handleRetake = () => {
    onOpenChange(false);
    onRetake?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-normal text-center">
            {isIncomplete ? "Test Progress (Incomplete)" : "Test Results"}
          </DialogTitle>
        </DialogHeader>

        {/* Score Summary - Only show for completed tests */}
        {!isIncomplete && (
          <div className="px-6 py-3 bg-card border rounded-lg">
            <div className="flex items-center justify-center gap-3 text-center">
              <span
                className={`text-3xl font-bold ${
                  passed ? "text-green-500" : "text-yellow-500"
                }`}
              >
                {percentage}%
              </span>
              <span className="text-muted-foreground">-</span>
              <span className="text-muted-foreground">
                {result.score} out of {result.totalQuestions} correct
              </span>
            </div>
          </div>
        )}

        {/* Incomplete message */}
        {isIncomplete && (
          <div className="px-6 py-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-center text-sm text-yellow-600 dark:text-yellow-400">
              This test was not completed. Your progress has been saved. Complete the test to see your score and correct answers.
            </p>
          </div>
        )}

        {/* Question-by-Question Breakdown */}
        {!isIncomplete ? (
          <ScrollArea className="flex-1 overflow-auto px-6">
            <TextSelectionHandler
              conversationContext={conversationContext}
              model={model}
            >
              <div className="space-y-6 py-4">
                <h3 className="text-lg font-medium">Review Your Answers</h3>

                {test.questions.map((question, index) => {
                  const userAnswer = result.answers[question.id];
                  let isCorrect = false;

                  // Check if answer is correct
                  if (question.type === "multiple_choice") {
                    isCorrect = userAnswer === question.correctAnswer;
                  } else if (question.type === "fill_blank") {
                    isCorrect =
                      userAnswer?.toString().toLowerCase().trim() ===
                      question.correctAnswer?.toString().toLowerCase().trim();
                  } else if (question.type === "written") {
                    // Written answers are not auto-graded
                    isCorrect = false;
                  }

                  return (
                    <div key={question.id} className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">
                          Question {index + 1}
                        </span>
                        {question.type !== "written" && question.type !== "flashcard" && (
                          <span
                            className={`text-sm font-medium ${
                              isCorrect ? "text-green-500" : "text-red-500"
                            }`}
                          >
                            {isCorrect ? "✓ Correct" : "✗ Incorrect"}
                          </span>
                        )}
                        {question.type === "written" && (
                          <span className="text-sm font-medium text-yellow-500">
                            ⚠ Requires manual review
                          </span>
                        )}
                      </div>

                      <div className="p-4 bg-muted/30 rounded-lg">
                        <QuestionRenderer
                          question={question}
                          answer={userAnswer}
                          onAnswerChange={() => {}}
                          showCorrectAnswer={true}
                        />
                      </div>

                      {index < test.questions.length - 1 && (
                        <Separator className="my-4" />
                      )}
                    </div>
                  );
                })}
              </div>
            </TextSelectionHandler>
          </ScrollArea>
        ) : (
          <ScrollArea className="flex-1 overflow-auto px-6">
            <div className="space-y-6 py-4">
              <h3 className="text-lg font-medium">Review Your Answers</h3>

              {test.questions.map((question, index) => {
                const userAnswer = result.answers[question.id];

                return (
                  <div key={question.id} className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        Question {index + 1}
                      </span>
                    </div>

                    <div className="p-4 bg-muted/30 rounded-lg">
                      <QuestionRenderer
                        question={question}
                        answer={userAnswer}
                        onAnswerChange={() => {}}
                        showCorrectAnswer={false}
                      />
                    </div>

                    {index < test.questions.length - 1 && (
                      <Separator className="my-4" />
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t mt-4">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>

          <div className="flex gap-2">
            <Button
              onClick={handleRetake}
              className="bg-white text-black hover:bg-white/90"
            >
              {isIncomplete ? "Continue Test" : "Retake Test"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
