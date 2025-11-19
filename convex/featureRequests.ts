import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Create a new feature request
 */
export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    userName: v.optional(v.string()),
    userEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const featureRequestId = await ctx.db.insert("featureRequests", {
      title: args.title,
      description: args.description,
      status: "pending",
      userName: args.userName,
      userEmail: args.userEmail,
      createdAt: now,
      updatedAt: now,
    });

    return featureRequestId;
  },
});

/**
 * Update feature request status
 */
export const updateStatus = mutation({
  args: {
    featureRequestId: v.id("featureRequests"),
    status: v.union(
      v.literal("pending"),
      v.literal("in-progress"),
      v.literal("for-review"),
      v.literal("resolved")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.featureRequestId, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Update feature request notes
 */
export const updateNotes = mutation({
  args: {
    featureRequestId: v.id("featureRequests"),
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.featureRequestId, {
      notes: args.notes,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Get all feature requests
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const featureRequests = await ctx.db
      .query("featureRequests")
      .order("desc")
      .collect();

    return featureRequests;
  },
});

/**
 * Get feature requests by status
 */
export const listByStatus = query({
  args: {
    status: v.union(
      v.literal("pending"),
      v.literal("in-progress"),
      v.literal("for-review"),
      v.literal("resolved")
    ),
  },
  handler: async (ctx, args) => {
    const featureRequests = await ctx.db
      .query("featureRequests")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .order("desc")
      .collect();

    return featureRequests;
  },
});

/**
 * Get a single feature request
 */
export const get = query({
  args: {
    featureRequestId: v.id("featureRequests"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.featureRequestId);
  },
});

/**
 * Delete a feature request
 */
export const remove = mutation({
  args: {
    featureRequestId: v.id("featureRequests"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.featureRequestId);
  },
});
