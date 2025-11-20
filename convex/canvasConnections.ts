import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow } from "./lib/auth";

export const create = mutation({
  args: {
    canvasId: v.id("canvases"),
    sourceCardId: v.id("canvasCards"),
    targetCardId: v.id("canvasCards"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const canvas = await ctx.db.get(args.canvasId);

    if (!canvas) throw new Error("Canvas not found");
    if (canvas.userId !== user._id) {
      throw new Error("Unauthorized access to canvas");
    }

    const now = Date.now();

    const connectionId = await ctx.db.insert("canvasConnections", {
      userId: user._id,
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
    const user = await getCurrentUserOrThrow(ctx);
    const connection = await ctx.db.get(args.id);

    if (!connection) throw new Error("Connection not found");
    if (connection.userId !== user._id) {
      throw new Error("Unauthorized access to connection");
    }

    await ctx.db.delete(args.id);
  },
});

export const listByCanvas = query({
  args: {
    canvasId: v.id("canvases"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const canvas = await ctx.db.get(args.canvasId);

    if (!canvas) throw new Error("Canvas not found");
    if (canvas.userId !== user._id) {
      throw new Error("Unauthorized access to canvas");
    }

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
    const user = await getCurrentUserOrThrow(ctx);
    const card = await ctx.db.get(args.cardId);

    if (!card) throw new Error("Card not found");
    if (card.userId !== user._id) {
      throw new Error("Unauthorized access to card");
    }

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
