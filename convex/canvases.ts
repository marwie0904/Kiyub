import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow } from "./lib/auth";

// Get all canvases (ordered by most recently updated)
export const list = query({
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);

    const canvases = await ctx.db
      .query("canvases")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    return canvases;
  },
});

// Get a single canvas by ID
export const get = query({
  args: { id: v.id("canvases") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const canvas = await ctx.db.get(args.id);

    if (!canvas) return null;
    if (canvas.userId !== user._id) {
      throw new Error("Unauthorized access to canvas");
    }

    return canvas;
  },
});

// Create a new canvas
export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const now = Date.now();

    const canvasId = await ctx.db.insert("canvases", {
      userId: user._id,
      title: args.title,
      description: args.description,
      createdAt: now,
      updatedAt: now,
    });

    return canvasId;
  },
});

// Update canvas details
export const update = mutation({
  args: {
    id: v.id("canvases"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const { id, ...updates } = args;

    const canvas = await ctx.db.get(id);
    if (!canvas) throw new Error("Canvas not found");
    if (canvas.userId !== user._id) {
      throw new Error("Unauthorized access to canvas");
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Rename canvas
export const rename = mutation({
  args: {
    id: v.id("canvases"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const canvas = await ctx.db.get(args.id);

    if (!canvas) throw new Error("Canvas not found");
    if (canvas.userId !== user._id) {
      throw new Error("Unauthorized access to canvas");
    }

    await ctx.db.patch(args.id, {
      title: args.title,
      updatedAt: Date.now(),
    });
  },
});

// Toggle pin status
export const togglePin = mutation({
  args: {
    id: v.id("canvases"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const canvas = await ctx.db.get(args.id);

    if (!canvas) throw new Error("Canvas not found");
    if (canvas.userId !== user._id) {
      throw new Error("Unauthorized access to canvas");
    }

    await ctx.db.patch(args.id, {
      isPinned: !canvas.isPinned,
      updatedAt: Date.now(),
    });
  },
});

// Delete a canvas
export const remove = mutation({
  args: { id: v.id("canvases") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const canvas = await ctx.db.get(args.id);

    if (!canvas) throw new Error("Canvas not found");
    if (canvas.userId !== user._id) {
      throw new Error("Unauthorized access to canvas");
    }

    // Delete all canvas cards
    const cards = await ctx.db
      .query("canvasCards")
      .withIndex("by_canvas", (q) => q.eq("canvasId", args.id))
      .collect();

    for (const card of cards) {
      await ctx.db.delete(card._id);
    }

    // Delete all canvas connections
    const connections = await ctx.db
      .query("canvasConnections")
      .withIndex("by_canvas", (q) => q.eq("canvasId", args.id))
      .collect();

    for (const connection of connections) {
      await ctx.db.delete(connection._id);
    }

    await ctx.db.delete(args.id);
  },
});
