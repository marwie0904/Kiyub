import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUserOrThrow } from "./lib/auth";

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
    const user = await getCurrentUserOrThrow(ctx);
    const now = Date.now();

    const featureRequestId = await ctx.db.insert("featureRequests", {
      userId: user._id,
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
    const user = await getCurrentUserOrThrow(ctx);
    const featureRequest = await ctx.db.get(args.featureRequestId);

    if (!featureRequest) throw new Error("Feature request not found");
    if (featureRequest.userId !== user._id) {
      throw new Error("Unauthorized access to feature request");
    }

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
    const user = await getCurrentUserOrThrow(ctx);
    const featureRequest = await ctx.db.get(args.featureRequestId);

    if (!featureRequest) throw new Error("Feature request not found");
    if (featureRequest.userId !== user._id) {
      throw new Error("Unauthorized access to feature request");
    }

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
    const user = await getCurrentUserOrThrow(ctx);

    const featureRequests = await ctx.db
      .query("featureRequests")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
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
    const user = await getCurrentUserOrThrow(ctx);

    const featureRequests = await ctx.db
      .query("featureRequests")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    // Filter by status in-memory since we need both userId and status filtering
    return featureRequests.filter((request) => request.status === args.status);
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
    const user = await getCurrentUserOrThrow(ctx);
    const featureRequest = await ctx.db.get(args.featureRequestId);

    if (!featureRequest) return null;
    if (featureRequest.userId !== user._id) {
      throw new Error("Unauthorized access to feature request");
    }

    return featureRequest;
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
    const user = await getCurrentUserOrThrow(ctx);
    const featureRequest = await ctx.db.get(args.featureRequestId);

    if (!featureRequest) throw new Error("Feature request not found");
    if (featureRequest.userId !== user._id) {
      throw new Error("Unauthorized access to feature request");
    }

    await ctx.db.delete(args.featureRequestId);
  },
});
