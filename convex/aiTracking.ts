import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Track AI usage in Convex database
 */
export const track = mutation({
  args: {
    // Token usage
    inputTokens: v.number(),
    outputTokens: v.number(),
    reasoningTokens: v.optional(v.number()),
    totalTokens: v.number(),

    // Model and usage type
    model: v.string(),
    provider: v.optional(v.string()),
    usageType: v.union(
      v.literal("conversation"),
      v.literal("project"),
      v.literal("quick_question"),
      v.literal("canvas"),
      v.literal("title_generation"),
      v.literal("file_analysis"),
      v.literal("test_creation")
    ),

    // User tracking
    userId: v.optional(v.string()),

    // Cost tracking
    costUsd: v.number(),
    costPhp: v.number(),

    // Optional metadata
    conversationId: v.optional(v.id("conversations")),
    projectId: v.optional(v.id("projects")),
    canvasId: v.optional(v.id("canvases")),
    messageId: v.optional(v.id("messages")),

    // Performance metrics
    latencyMs: v.optional(v.number()),

    // Success tracking
    success: v.boolean(),
    errorMessage: v.optional(v.string()),

    // Retry tracking
    totalRetryAttempts: v.optional(v.number()),
    failedRetryAttempts: v.optional(v.number()),
    successfulRetryAttempts: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const trackingId = await ctx.db.insert("aiTracking", {
      inputTokens: args.inputTokens,
      outputTokens: args.outputTokens,
      reasoningTokens: args.reasoningTokens,
      totalTokens: args.totalTokens,
      model: args.model,
      provider: args.provider,
      usageType: args.usageType,
      userId: args.userId,
      costUsd: args.costUsd,
      costPhp: args.costPhp,
      conversationId: args.conversationId,
      projectId: args.projectId,
      canvasId: args.canvasId,
      messageId: args.messageId,
      latencyMs: args.latencyMs,
      success: args.success,
      errorMessage: args.errorMessage,
      totalRetryAttempts: args.totalRetryAttempts,
      failedRetryAttempts: args.failedRetryAttempts,
      successfulRetryAttempts: args.successfulRetryAttempts,
      createdAt: Date.now(),
    });

    console.log("AI tracking recorded:", trackingId);
    return trackingId;
  },
});

/**
 * Get AI tracking stats for a specific time range
 */
export const getStats = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    userId: v.optional(v.string()),
    model: v.optional(v.string()),
    usageType: v.optional(v.union(
      v.literal("conversation"),
      v.literal("project"),
      v.literal("quick_question"),
      v.literal("canvas"),
      v.literal("title_generation"),
      v.literal("file_analysis"),
      v.literal("test_creation")
    )),
  },
  handler: async (ctx, args) => {
    // Apply filters
    let records;
    if (args.userId) {
      records = await ctx.db
        .query("aiTracking")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .collect();
    } else if (args.model !== undefined) {
      records = await ctx.db
        .query("aiTracking")
        .withIndex("by_model", (q) => q.eq("model", args.model!))
        .collect();
    } else if (args.usageType !== undefined) {
      records = await ctx.db
        .query("aiTracking")
        .withIndex("by_usage_type", (q) => q.eq("usageType", args.usageType!))
        .collect();
    } else {
      records = await ctx.db
        .query("aiTracking")
        .withIndex("by_created")
        .collect();
    }

    // Filter by date range
    if (args.startDate) {
      records = records.filter(r => r.createdAt >= args.startDate!);
    }
    if (args.endDate) {
      records = records.filter(r => r.createdAt <= args.endDate!);
    }

    // Calculate aggregated stats
    const totalInputTokens = records.reduce((sum, r) => sum + r.inputTokens, 0);
    const totalOutputTokens = records.reduce((sum, r) => sum + r.outputTokens, 0);
    const totalReasoningTokens = records.reduce((sum, r) => sum + (r.reasoningTokens || 0), 0);
    const totalTokens = records.reduce((sum, r) => sum + r.totalTokens, 0);
    const totalCostUsd = records.reduce((sum, r) => sum + r.costUsd, 0);
    const totalCostPhp = records.reduce((sum, r) => sum + r.costPhp, 0);
    const totalRequests = records.length;
    const successfulRequests = records.filter(r => r.success).length;
    const failedRequests = totalRequests - successfulRequests;

    // Average latency (excluding null values)
    const latencies = records.filter(r => r.latencyMs !== undefined).map(r => r.latencyMs!);
    const avgLatencyMs = latencies.length > 0
      ? latencies.reduce((sum, l) => sum + l, 0) / latencies.length
      : 0;

    // Group by model with detailed token breakdown
    const byModel = records.reduce((acc, r) => {
      if (!acc[r.model]) {
        acc[r.model] = {
          requests: 0,
          inputTokens: 0,
          outputTokens: 0,
          reasoningTokens: 0,
          totalTokens: 0,
          costUsd: 0,
          costPhp: 0,
        };
      }
      acc[r.model].requests++;
      acc[r.model].inputTokens += r.inputTokens;
      acc[r.model].outputTokens += r.outputTokens;
      acc[r.model].reasoningTokens += r.reasoningTokens || 0;
      acc[r.model].totalTokens += r.totalTokens;
      acc[r.model].costUsd += r.costUsd;
      acc[r.model].costPhp += r.costPhp;
      return acc;
    }, {} as Record<string, {
      requests: number;
      inputTokens: number;
      outputTokens: number;
      reasoningTokens: number;
      totalTokens: number;
      costUsd: number;
      costPhp: number
    }>);

    // Group by usage type
    const byUsageType = records.reduce((acc, r) => {
      if (!acc[r.usageType]) {
        acc[r.usageType] = {
          requests: 0,
          totalTokens: 0,
          costUsd: 0,
          costPhp: 0,
        };
      }
      acc[r.usageType].requests++;
      acc[r.usageType].totalTokens += r.totalTokens;
      acc[r.usageType].costUsd += r.costUsd;
      acc[r.usageType].costPhp += r.costPhp;
      return acc;
    }, {} as Record<string, { requests: number; totalTokens: number; costUsd: number; costPhp: number }>);

    return {
      summary: {
        totalInputTokens,
        totalOutputTokens,
        totalReasoningTokens,
        totalTokens,
        totalCostUsd,
        totalCostPhp,
        totalRequests,
        successfulRequests,
        failedRequests,
        avgLatencyMs,
      },
      byModel,
      byUsageType,
    };
  },
});

/**
 * Get recent AI tracking records
 */
export const getRecent = query({
  args: {
    limit: v.optional(v.number()),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    const records = args.userId
      ? await ctx.db
          .query("aiTracking")
          .withIndex("by_user", (q) => q.eq("userId", args.userId))
          .order("desc")
          .take(limit)
      : await ctx.db
          .query("aiTracking")
          .withIndex("by_created")
          .order("desc")
          .take(limit);

    return records;
  },
});

/**
 * Get AI tracking for a specific conversation
 */
export const getByConversation = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query("aiTracking")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .collect();

    const totalTokens = records.reduce((sum, r) => sum + r.totalTokens, 0);
    const totalCostUsd = records.reduce((sum, r) => sum + r.costUsd, 0);
    const totalCostPhp = records.reduce((sum, r) => sum + r.costPhp, 0);

    return {
      records,
      summary: {
        totalTokens,
        totalCostUsd,
        totalCostPhp,
        requestCount: records.length,
      },
    };
  },
});

/**
 * Get AI tracking for a specific canvas
 */
export const getByCanvas = query({
  args: {
    canvasId: v.id("canvases"),
  },
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query("aiTracking")
      .withIndex("by_canvas", (q) => q.eq("canvasId", args.canvasId))
      .collect();

    const inputTokens = records.reduce((sum, r) => sum + r.inputTokens, 0);
    const outputTokens = records.reduce((sum, r) => sum + r.outputTokens, 0);
    const totalTokens = records.reduce((sum, r) => sum + r.totalTokens, 0);
    const totalCostUsd = records.reduce((sum, r) => sum + r.costUsd, 0);
    const totalCostPhp = records.reduce((sum, r) => sum + r.costPhp, 0);

    return {
      records,
      summary: {
        inputTokens,
        outputTokens,
        totalTokens,
        totalCostUsd,
        totalCostPhp,
        requestCount: records.length,
      },
    };
  },
});

/**
 * Get daily usage in USD for today
 */
export const getDailyUsage = query({
  args: {
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get start of today (midnight)
    const now = Date.now();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const startOfDay = today.getTime();

    // Query all tracking records from today
    let records;
    if (args.userId) {
      records = await ctx.db
        .query("aiTracking")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .collect();
    } else {
      records = await ctx.db
        .query("aiTracking")
        .withIndex("by_created")
        .collect();
    }

    // Filter for today only
    const todayRecords = records.filter(r => r.createdAt >= startOfDay);

    // Calculate total cost in USD
    const totalCostUsd = todayRecords.reduce((sum, r) => sum + r.costUsd, 0);

    return {
      totalCostUsd,
      recordCount: todayRecords.length,
    };
  },
});

/**
 * Delete all AI tracking data (for resetting analytics)
 */
export const deleteAll = mutation({
  args: {},
  handler: async (ctx) => {
    const records = await ctx.db.query("aiTracking").collect();

    let deletedCount = 0;
    for (const record of records) {
      await ctx.db.delete(record._id);
      deletedCount++;
    }

    console.log(`Deleted ${deletedCount} AI tracking records`);
    return { deletedCount };
  },
});
