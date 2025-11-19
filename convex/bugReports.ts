import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Create a new bug report
 */
export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const bugReportId = await ctx.db.insert("bugReports", {
      title: args.title,
      description: args.description,
      status: "pending",
      userId: args.userId,
      createdAt: now,
      updatedAt: now,
    });

    return bugReportId;
  },
});

/**
 * Update bug report with session recording information
 */
export const updateSessionRecording = mutation({
  args: {
    bugReportId: v.id("bugReports"),
    sessionRecordingUrl: v.string(),
    posthogSessionId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.bugReportId, {
      sessionRecordingUrl: args.sessionRecordingUrl,
      posthogSessionId: args.posthogSessionId,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Update bug report status
 */
export const updateStatus = mutation({
  args: {
    bugReportId: v.id("bugReports"),
    status: v.union(
      v.literal("pending"),
      v.literal("in-progress"),
      v.literal("for-review"),
      v.literal("resolved")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.bugReportId, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Update bug report notes
 */
export const updateNotes = mutation({
  args: {
    bugReportId: v.id("bugReports"),
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.bugReportId, {
      notes: args.notes,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Get all bug reports
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const bugReports = await ctx.db
      .query("bugReports")
      .order("desc")
      .collect();

    return bugReports;
  },
});

/**
 * Get bug reports by status
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
    const bugReports = await ctx.db
      .query("bugReports")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .order("desc")
      .collect();

    return bugReports;
  },
});

/**
 * Get a single bug report
 */
export const get = query({
  args: {
    bugReportId: v.id("bugReports"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.bugReportId);
  },
});

/**
 * Delete a bug report
 */
export const remove = mutation({
  args: {
    bugReportId: v.id("bugReports"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.bugReportId);
  },
});
