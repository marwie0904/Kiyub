import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all canvases (ordered by most recently updated)
export const list = query({
  handler: async (ctx) => {
    const canvases = await ctx.db
      .query("canvases")
      .withIndex("by_updated", (q) => q)
      .order("desc")
      .collect();

    return canvases;
  },
});

// Get a single canvas by ID
export const get = query({
  args: { id: v.id("canvases") },
  handler: async (ctx, args) => {
    const canvas = await ctx.db.get(args.id);
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
    const now = Date.now();

    const canvasId = await ctx.db.insert("canvases", {
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
    const { id, ...updates } = args;

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
    const canvas = await ctx.db.get(args.id);
    if (!canvas) throw new Error("Canvas not found");

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
    // In the future, we'll need to delete associated canvas cards here
    await ctx.db.delete(args.id);
  },
});
