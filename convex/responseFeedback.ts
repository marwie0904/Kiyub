import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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
    const now = Date.now();

    const feedbackId = await ctx.db.insert("responseFeedback", {
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
    const feedback = await ctx.db
      .query("responseFeedback")
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
    const feedback = await ctx.db
      .query("responseFeedback")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
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
    return await ctx.db.get(args.feedbackId);
  },
});
