import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow } from "./lib/auth";

// Update test response (for saving progress or completing)
export const updateResponse = mutation({
  args: {
    testId: v.id("tests"),
    answers: v.string(), // JSON stringified Record<questionId, answer>
    isCompleted: v.optional(v.boolean()),
    lastQuestionIndex: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const test = await ctx.db.get(args.testId);

    if (!test) throw new Error("Test not found");
    if (test.userId !== user._id) {
      throw new Error("Unauthorized access to test");
    }

    // Find the testResponse for this test
    const response = await ctx.db
      .query("testResponses")
      .withIndex("by_test", (q) => q.eq("testId", args.testId))
      .first();

    if (!response) {
      throw new Error("Test response not found. Test may not have been created properly.");
    }

    if (response.userId !== user._id) {
      throw new Error("Unauthorized access to test response");
    }

    // Update the response
    await ctx.db.patch(response._id, {
      answers: args.answers,
      submittedAt: Date.now(),
      ...(args.isCompleted !== undefined && { isCompleted: args.isCompleted }),
      ...(args.lastQuestionIndex !== undefined && { lastQuestionIndex: args.lastQuestionIndex }),
    });

    return { responseId: response._id };
  },
});

// Submit a test response and calculate score
export const submit = mutation({
  args: {
    testId: v.id("tests"),
    conversationId: v.id("conversations"),
    answers: v.string(), // JSON stringified Record<questionId, answer>
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    // Get the test to score answers
    const test = await ctx.db.get(args.testId);
    if (!test) throw new Error("Test not found");
    if (test.userId !== user._id) {
      throw new Error("Unauthorized access to test");
    }

    // Verify conversation ownership
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");
    if (conversation.userId !== user._id) {
      throw new Error("Unauthorized access to conversation");
    }

    // Find the existing testResponse
    const response = await ctx.db
      .query("testResponses")
      .withIndex("by_test", (q) => q.eq("testId", args.testId))
      .first();

    if (!response) throw new Error("Test response not found");
    if (response.userId !== user._id) {
      throw new Error("Unauthorized access to test response");
    }

    // Parse answers
    const userAnswers = JSON.parse(args.answers);

    // Calculate score
    let correctCount = 0;
    const totalQuestions = test.questions.length;

    for (const question of test.questions) {
      const userAnswer = userAnswers[question.id];

      // Skip scoring for written answers and flashcards
      if (question.type === "written" || question.type === "flashcard") {
        continue;
      }

      // Score multiple choice and fill in the blank
      if (question.type === "multiple_choice") {
        if (userAnswer === question.correctAnswer) {
          correctCount++;
        }
      } else if (question.type === "fill_blank") {
        // Case-insensitive comparison for fill in the blank
        const userAnswerNormalized = String(userAnswer || "")
          .toLowerCase()
          .trim();
        const correctAnswerNormalized = String(question.correctAnswer)
          .toLowerCase()
          .trim();

        if (userAnswerNormalized === correctAnswerNormalized) {
          correctCount++;
        }
      }
    }

    // Update the response record
    await ctx.db.patch(response._id, {
      answers: args.answers,
      score: correctCount,
      isCompleted: true,
      submittedAt: Date.now(),
    });

    return {
      responseId: response._id,
      score: correctCount,
      totalQuestions,
    };
  },
});

// Get a single test response
export const get = query({
  args: { responseId: v.id("testResponses") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const response = await ctx.db.get(args.responseId);

    if (!response) return null;
    if (response.userId !== user._id) {
      throw new Error("Unauthorized access to test response");
    }

    return response;
  },
});

// Get all responses for a test
export const getByTest = query({
  args: { testId: v.id("tests") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const test = await ctx.db.get(args.testId);

    if (!test) throw new Error("Test not found");
    if (test.userId !== user._id) {
      throw new Error("Unauthorized access to test");
    }

    return await ctx.db
      .query("testResponses")
      .withIndex("by_test", (q) => q.eq("testId", args.testId))
      .order("desc")
      .take(50);
  },
});

// Get all responses for a conversation
export const getByConversation = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const conversation = await ctx.db.get(args.conversationId);

    if (!conversation) throw new Error("Conversation not found");
    if (conversation.userId !== user._id) {
      throw new Error("Unauthorized access to conversation");
    }

    return await ctx.db
      .query("testResponses")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("desc")
      .take(50);
  },
});

// Get partial save for a test (if exists)
export const getPartialSave = query({
  args: { testId: v.id("tests") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const test = await ctx.db.get(args.testId);

    if (!test) throw new Error("Test not found");
    if (test.userId !== user._id) {
      throw new Error("Unauthorized access to test");
    }

    return await ctx.db
      .query("testResponses")
      .withIndex("by_test", (q) => q.eq("testId", args.testId))
      .filter((q) => q.eq(q.field("isCompleted"), false))
      .first();
  },
});

// Delete a test response
export const remove = mutation({
  args: { responseId: v.id("testResponses") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const response = await ctx.db.get(args.responseId);

    if (!response) throw new Error("Test response not found");
    if (response.userId !== user._id) {
      throw new Error("Unauthorized access to test response");
    }

    await ctx.db.delete(args.responseId);
  },
});
