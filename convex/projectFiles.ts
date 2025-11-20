import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow } from "./lib/auth";

// Get all files for a project
export const list = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const project = await ctx.db.get(args.projectId);

    if (!project) throw new Error("Project not found");
    if (project.userId !== user._id) {
      throw new Error("Unauthorized access to project");
    }

    const files = await ctx.db
      .query("projectFiles")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();

    return files;
  },
});

// Get a single file
export const get = query({
  args: { id: v.id("projectFiles") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const file = await ctx.db.get(args.id);

    if (!file) return null;
    if (file.userId !== user._id) {
      throw new Error("Unauthorized access to file");
    }

    return file;
  },
});

// Generate upload URL for file
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    await getCurrentUserOrThrow(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

// Save file metadata after upload
export const saveFile = mutation({
  args: {
    projectId: v.id("projects"),
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileSize: v.number(),
    fileType: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const project = await ctx.db.get(args.projectId);

    if (!project) throw new Error("Project not found");
    if (project.userId !== user._id) {
      throw new Error("Unauthorized access to project");
    }

    const fileId = await ctx.db.insert("projectFiles", {
      userId: user._id,
      projectId: args.projectId,
      storageId: args.storageId,
      fileName: args.fileName,
      fileSize: args.fileSize,
      fileType: args.fileType,
      uploadedAt: Date.now(),
    });

    // Update project's updatedAt timestamp
    await ctx.db.patch(args.projectId, {
      updatedAt: Date.now(),
    });

    return fileId;
  },
});

// Delete a file
export const remove = mutation({
  args: { id: v.id("projectFiles") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const file = await ctx.db.get(args.id);

    if (!file) throw new Error("File not found");
    if (file.userId !== user._id) {
      throw new Error("Unauthorized access to file");
    }

    // Delete from storage
    await ctx.storage.delete(file.storageId);

    // Delete metadata
    await ctx.db.delete(args.id);

    // Update project's updatedAt timestamp
    await ctx.db.patch(file.projectId, {
      updatedAt: Date.now(),
    });
  },
});

// Get file URL for download/viewing
export const getUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    await getCurrentUserOrThrow(ctx);
    return await ctx.storage.getUrl(args.storageId);
  },
});
