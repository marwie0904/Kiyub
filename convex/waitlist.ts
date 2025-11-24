import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Join the waitlist
 */
export const joinWaitlist = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    gradeLevel: v.optional(v.string()),
    interestedFeature: v.optional(v.string()),
    joinBetaTesting: v.optional(v.boolean()),
    operatingSystems: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Normalize email to lowercase and trim whitespace
    const normalizedEmail = args.email.toLowerCase().trim();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      throw new Error("Please provide a valid email address");
    }

    // Validate name (no empty strings, must be at least 2 characters)
    const trimmedName = args.name.trim();
    if (trimmedName.length < 2) {
      throw new Error("Name must be at least 2 characters long");
    }

    // Check if email already exists in waitlist (case-insensitive)
    const existingEntry = await ctx.db
      .query("waitlist")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .first();

    if (existingEntry) {
      throw new Error("This email is already on the waitlist");
    }

    // Rate limiting: Check for recent submissions from similar patterns
    const recentEntries = await ctx.db
      .query("waitlist")
      .withIndex("by_created")
      .order("desc")
      .take(10);

    // Check if there are too many similar names in recent submissions (potential spam)
    const similarNameCount = recentEntries.filter(
      (entry) => entry.name.toLowerCase() === trimmedName.toLowerCase()
    ).length;

    if (similarNameCount >= 3) {
      throw new Error("Too many similar entries. Please try again later");
    }

    // Check if too many submissions in the last minute from any source
    const oneMinuteAgo = now - 60 * 1000;
    const recentSubmissions = recentEntries.filter(
      (entry) => entry.createdAt > oneMinuteAgo
    ).length;

    if (recentSubmissions >= 5) {
      throw new Error("Too many waitlist submissions. Please try again in a moment");
    }

    const waitlistId = await ctx.db.insert("waitlist", {
      name: trimmedName,
      email: normalizedEmail,
      gradeLevel: args.gradeLevel,
      interestedFeature: args.interestedFeature,
      joinBetaTesting: args.joinBetaTesting,
      operatingSystems: args.operatingSystems,
      createdAt: now,
    });

    return waitlistId;
  },
});

/**
 * Get all waitlist entries (admin only)
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const waitlistEntries = await ctx.db
      .query("waitlist")
      .withIndex("by_created")
      .order("desc")
      .collect();

    return waitlistEntries;
  },
});

/**
 * Get waitlist count
 */
export const getCount = query({
  args: {},
  handler: async (ctx) => {
    const waitlistEntries = await ctx.db.query("waitlist").collect();
    return waitlistEntries.length;
  },
});
