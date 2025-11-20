"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Question } from "./test-display-modal";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import "katex/dist/katex.min.css";

interface QuestionRendererProps {
  question: Question;
  answer?: string | string[];
  onAnswerChange: (answer: string | string[]) => void;
  showCorrectAnswer?: boolean;
}

export function QuestionRenderer({
  question,
  answer,
  onAnswerChange,
  showCorrectAnswer = false,
}: QuestionRendererProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const renderMultipleChoice = () => (
    <div className="space-y-4">
      <div className="text-lg font-medium select-text prose prose-invert max-w-none prose-sm">
        <ReactMarkdown
          remarkPlugins={[[remarkMath, { singleDollarTextMath: true }], remarkGfm]}
          rehypePlugins={[
            [rehypeKatex, {
              strict: false,
              trust: true,
              throwOnError: false
            }]
          ]}
        >
          {question.question || ""}
        </ReactMarkdown>
      </div>

      <RadioGroup
        value={typeof answer === "string" ? answer : ""}
        onValueChange={onAnswerChange}
        disabled={showCorrectAnswer}
      >
        <div className="space-y-3">
          {question.options?.map((option, index) => {
            const isCorrect = showCorrectAnswer && option === question.correctAnswer;
            const isSelected = answer === option;
            const isWrong = showCorrectAnswer && isSelected && !isCorrect;

            return (
              <div
                key={index}
                className={`flex items-center space-x-3 p-3 rounded-md border ${
                  isCorrect
                    ? "bg-green-500/10 border-green-500"
                    : isWrong
                    ? "bg-red-500/10 border-red-500"
                    : "border-border"
                }`}
              >
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label
                  htmlFor={`option-${index}`}
                  className="flex-1 cursor-pointer font-normal select-text prose prose-invert max-w-none prose-sm"
                >
                  <ReactMarkdown
                    remarkPlugins={[[remarkMath, { singleDollarTextMath: true }], remarkGfm]}
                    rehypePlugins={[
                      [rehypeKatex, {
                        strict: false,
                        trust: true,
                        throwOnError: false
                      }]
                    ]}
                  >
                    {option}
                  </ReactMarkdown>
                </Label>
                {isCorrect && (
                  <span className="text-sm text-green-500 font-medium">✓ Correct</span>
                )}
                {isWrong && (
                  <span className="text-sm text-red-500 font-medium">✗</span>
                )}
              </div>
            );
          })}
        </div>
      </RadioGroup>

      {showCorrectAnswer && question.explanation && (
        <div className="mt-4 p-4 bg-muted/50 rounded-md">
          <p className="text-sm font-medium mb-1">Explanation:</p>
          <div className="text-sm text-muted-foreground select-text prose prose-invert max-w-none prose-sm">
            <ReactMarkdown
              remarkPlugins={[[remarkMath, { singleDollarTextMath: true }], remarkGfm]}
              rehypePlugins={[
                [rehypeKatex, {
                  strict: false,
                  trust: true,
                  throwOnError: false
                }]
              ]}
            >
              {question.explanation}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );

  const renderWrittenAnswer = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{question.question}</h3>

      <Textarea
        placeholder="Type your answer here..."
        value={typeof answer === "string" ? answer : ""}
        onChange={(e) => onAnswerChange(e.target.value)}
        disabled={showCorrectAnswer}
        className="min-h-[150px]"
      />

      {showCorrectAnswer && (
        <div className="space-y-3">
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-md">
            <p className="text-sm font-medium mb-2 text-blue-600">Sample Answer:</p>
            <p className="text-sm">{question.correctAnswer}</p>
          </div>

          {question.explanation && (
            <div className="p-4 bg-muted/50 rounded-md">
              <p className="text-sm font-medium mb-1">Explanation:</p>
              <p className="text-sm text-muted-foreground">{question.explanation}</p>
            </div>
          )}

          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
            <p className="text-sm text-yellow-700">
              <strong>Note:</strong> Written answers require manual review.
            </p>
          </div>
        </div>
      )}
    </div>
  );

  const renderFillInTheBlank = () => {
    // Replace ____ or _____ with an input field
    const parts = question.question.split(/____+/);

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium mb-4">Fill in the blank:</h3>

        <div className="flex flex-wrap items-center gap-2 text-lg">
          {parts.map((part, index) => (
            <span key={index} className="inline-flex items-center gap-2">
              <span>{part}</span>
              {index < parts.length - 1 && (
                <Input
                  type="text"
                  value={typeof answer === "string" ? answer : ""}
                  onChange={(e) => onAnswerChange(e.target.value)}
                  disabled={showCorrectAnswer}
                  className={`inline-block w-48 h-10 ${
                    showCorrectAnswer
                      ? answer?.toString().toLowerCase().trim() ===
                        question.correctAnswer.toString().toLowerCase().trim()
                        ? "bg-green-500/10 border-green-500"
                        : "bg-red-500/10 border-red-500"
                      : ""
                  }`}
                />
              )}
            </span>
          ))}
        </div>

        {showCorrectAnswer && (
          <div className="space-y-3 mt-6">
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-md">
              <p className="text-sm font-medium mb-1 text-green-600">
                Correct Answer:
              </p>
              <p className="text-base font-medium">{question.correctAnswer}</p>
            </div>

            {question.explanation && (
              <div className="p-4 bg-muted/50 rounded-md">
                <p className="text-sm font-medium mb-1">Explanation:</p>
                <p className="text-sm text-muted-foreground">{question.explanation}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderFlashcard = () => {
    const handleCardClick = (e: React.MouseEvent) => {
      // Only flip if there's no text selection
      const selection = window.getSelection();
      const hasSelection = selection && selection.toString().trim().length > 0;

      if (!hasSelection) {
        setIsFlipped(!isFlipped);
      }
    };

    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div
          className={`relative w-full max-w-lg h-64 cursor-pointer perspective-1000`}
          onClick={handleCardClick}
        >
          <div
            className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
              isFlipped ? "rotate-y-180" : ""
            }`}
            style={{
              transformStyle: "preserve-3d",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* Front of card */}
            <div
              className="absolute w-full h-full backface-hidden flex items-center justify-center p-8 bg-card border-2 border-border rounded-xl shadow-lg select-text"
              style={{ backfaceVisibility: "hidden" }}
            >
              <div className="text-xl text-center prose prose-invert max-w-none prose-sm w-full">
                <ReactMarkdown
                  remarkPlugins={[[remarkMath, { singleDollarTextMath: true }], remarkGfm]}
                  rehypePlugins={[
                    [rehypeKatex, {
                      strict: false,
                      trust: true,
                      throwOnError: false
                    }]
                  ]}
                >
                  {question.front || question.question || ""}
                </ReactMarkdown>
              </div>
            </div>

            {/* Back of card */}
            <div
              className="absolute w-full h-full backface-hidden flex items-center justify-center p-8 bg-primary/5 border-2 border-primary rounded-xl shadow-lg select-text"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <div className="text-xl text-center prose prose-invert max-w-none prose-sm w-full">
                <ReactMarkdown
                  remarkPlugins={[[remarkMath, { singleDollarTextMath: true }], remarkGfm]}
                  rehypePlugins={[
                    [rehypeKatex, {
                      strict: false,
                      trust: true,
                      throwOnError: false
                    }]
                  ]}
                >
                  {question.back || question.correctAnswer || ""}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          Click the card to flip
        </p>
      </div>
    );
  };

  switch (question.type) {
    case "multiple_choice":
      return renderMultipleChoice();
    case "written":
      return renderWrittenAnswer();
    case "fill_blank":
      return renderFillInTheBlank();
    case "flashcard":
      return renderFlashcard();
    default:
      return <div>Unknown question type</div>;
  }
}
