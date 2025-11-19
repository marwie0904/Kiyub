import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    canvasId: v.id("canvases"),
    sourceCardId: v.id("canvasCards"),
    targetCardId: v.id("canvasCards"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const connectionId = await ctx.db.insert("canvasConnections", {
      canvasId: args.canvasId,
      sourceCardId: args.sourceCardId,
      targetCardId: args.targetCardId,
      createdAt: now,
      updatedAt: now,
    });

    return connectionId;
  },
});

export const remove = mutation({
  args: {
    id: v.id("canvasConnections"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const listByCanvas = query({
  args: {
    canvasId: v.id("canvases"),
  },
  handler: async (ctx, args) => {
    const connections = await ctx.db
      .query("canvasConnections")
      .withIndex("by_canvas", (q) => q.eq("canvasId", args.canvasId))
      .collect();

    return connections;
  },
});

export const listByCard = query({
  args: {
    cardId: v.id("canvasCards"),
  },
  handler: async (ctx, args) => {
    const outgoing = await ctx.db
      .query("canvasConnections")
      .withIndex("by_source", (q) => q.eq("sourceCardId", args.cardId))
      .collect();

    const incoming = await ctx.db
      .query("canvasConnections")
      .withIndex("by_target", (q) => q.eq("targetCardId", args.cardId))
      .collect();

    return {
      outgoing,
      incoming,
    };
  },
});
