import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUserOrThrow } from "./lib/auth";

/**
 * Submit feedback for an AI response
 */
export const submit = mutation({
  args: {
    description: v.string(),
    userQuestion: v.string(),
    aiResponse: v.string(),
    userName: v.optional(v.string()),
    userEmail: v.optional(v.string()),
    aiModel: v.string(),
    messageId: v.optional(v.id("messages")),
    conversationId: v.optional(v.id("conversations")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const now = Date.now();

    const feedbackId = await ctx.db.insert("responseFeedback", {
      userId: user._id,
      description: args.description,
      userQuestion: args.userQuestion,
      aiResponse: args.aiResponse,
      userName: args.userName,
      userEmail: args.userEmail,
      aiModel: args.aiModel,
      messageId: args.messageId,
      conversationId: args.conversationId,
      createdAt: now,
    });

    return feedbackId;
  },
});

/**
 * Get all feedback
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);

    const feedback = await ctx.db
      .query("responseFeedback")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    return feedback;
  },
});

/**
 * Get feedback for a specific conversation
 */
export const listByConversation = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const conversation = await ctx.db.get(args.conversationId);

    if (!conversation) throw new Error("Conversation not found");
    if (conversation.userId !== user._id) {
      throw new Error("Unauthorized access to conversation");
    }

    const feedback = await ctx.db
      .query("responseFeedback")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("desc")
      .collect();

    return feedback;
  },
});

/**
 * Get a single feedback
 */
export const get = query({
  args: {
    feedbackId: v.id("responseFeedback"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const feedback = await ctx.db.get(args.feedbackId);

    if (!feedback) return null;
    if (feedback.userId !== user._id) {
      throw new Error("Unauthorized access to feedback");
    }

    return feedback;
  },
});
