import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all projects (ordered by most recently updated)
export const list = query({
  handler: async (ctx) => {
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_updated", (q) => q)
      .order("desc")
      .collect();

    return projects;
  },
});

// Get a single project by ID
export const get = query({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.id);
    return project;
  },
});

// Create a new project
export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    instructions: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const projectId = await ctx.db.insert("projects", {
      title: args.title,
      description: args.description,
      instructions: args.instructions || "",
      tokensUsed: 0,
      tokenLimit: 100000, // Default token limit (mock)
      createdAt: now,
      updatedAt: now,
    });

    return projectId;
  },
});

// Update project details
export const update = mutation({
  args: {
    id: v.id("projects"),
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

// Rename project
export const rename = mutation({
  args: {
    id: v.id("projects"),
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
    id: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.id);
    if (!project) throw new Error("Project not found");

    await ctx.db.patch(args.id, {
      isPinned: !project.isPinned,
      updatedAt: Date.now(),
    });
  },
});

// Update project instructions
export const updateInstructions = mutation({
  args: {
    id: v.id("projects"),
    instructions: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      instructions: args.instructions,
      updatedAt: Date.now(),
    });
  },
});

// Delete a project and all its files and conversations
export const remove = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    // Delete all project files
    const files = await ctx.db
      .query("projectFiles")
      .withIndex("by_project", (q) => q.eq("projectId", args.id))
      .collect();

    for (const file of files) {
      await ctx.storage.delete(file.storageId);
      await ctx.db.delete(file._id);
    }

    // Delete all conversations in this project
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_project", (q) => q.eq("projectId", args.id))
      .collect();

    for (const conversation of conversations) {
      // Delete messages
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_conversation", (q) =>
          q.eq("conversationId", conversation._id)
        )
        .collect();

      for (const message of messages) {
        await ctx.db.delete(message._id);
      }

      // Delete conversation
      await ctx.db.delete(conversation._id);
    }

    // Delete the project
    await ctx.db.delete(args.id);
  },
});

// Update token usage (for mock capacity tracking)
export const updateTokenUsage = mutation({
  args: {
    id: v.id("projects"),
    tokensUsed: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      tokensUsed: args.tokensUsed,
      updatedAt: Date.now(),
    });
  },
});
