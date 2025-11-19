"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { CubeLoader } from "@/components/ui/cube-loader";

interface TestGeneratingSkeletonProps {
  questionCount: number;
  testMode: "multiple_choice" | "flashcard";
}

export function TestGeneratingSkeleton({
  questionCount,
  testMode,
}: TestGeneratingSkeletonProps) {
  if (testMode === "flashcard") {
    return (
      <div className="space-y-8">
        {/* Cube Loader at Top */}
        <div className="flex justify-center pt-8">
          <CubeLoader size="md" variant="primary" speed="normal" />
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-medium mb-2">Generating Flashcards...</h2>
          <p className="text-sm text-muted-foreground">
            Creating {questionCount} flashcards for you
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-4xl mx-auto">
          {Array.from({ length: Math.min(questionCount, 6) }).map((_, index) => (
            <div
              key={index}
              className="relative overflow-hidden rounded-lg border border-border bg-card p-6 h-[200px]"
            >
              <div className="space-y-4">
                <Skeleton className="h-6 w-3/4 animate-pulse" />
                <Skeleton className="h-4 w-full animate-pulse delay-75" />
                <Skeleton className="h-4 w-5/6 animate-pulse delay-150" />
                <Skeleton className="h-4 w-4/5 animate-pulse delay-300" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Multiple Choice skeleton
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Cube Loader at Top */}
      <div className="flex justify-center pt-8">
        <CubeLoader size="md" variant="primary" speed="normal" />
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-medium mb-2">Generating Test...</h2>
        <p className="text-sm text-muted-foreground">
          Creating {questionCount} questions for you
        </p>
      </div>

      <div className="space-y-6">
        {Array.from({ length: Math.min(questionCount, 5) }).map((_, qIndex) => (
          <div
            key={qIndex}
            className="relative overflow-hidden p-6 rounded-lg border border-border bg-card"
          >
            <div className="space-y-4">
              {/* Question number */}
              <Skeleton className="h-4 w-32 animate-pulse" />

              {/* Question text */}
              <Skeleton className="h-6 w-full animate-pulse delay-75" />
              <Skeleton className="h-6 w-3/4 animate-pulse delay-150" />

              {/* Options */}
              <div className="space-y-3 mt-6">
                {Array.from({ length: 4 }).map((_, oIndex) => (
                  <div
                    key={oIndex}
                    className="flex items-center gap-3 p-3 rounded-md border border-border/40"
                  >
                    <Skeleton className="h-4 w-4 rounded-full animate-pulse" />
                    <Skeleton
                      className={`h-4 flex-1 animate-pulse`}
                      style={{ animationDelay: `${oIndex * 100}ms` }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
          </div>
        ))}
      </div>

      {questionCount > 5 && (
        <div className="text-center text-sm text-muted-foreground">
          And {questionCount - 5} more questions...
        </div>
      )}
    </div>
  );
}
