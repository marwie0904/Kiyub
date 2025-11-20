import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { auth } from "../auth";

/**
 * Get the current authenticated user or throw an error
 * Use this in mutations and queries that require authentication
 */
export async function getCurrentUserOrThrow(
  ctx: QueryCtx | MutationCtx
) {
  const userId = await auth.getUserId(ctx);

  if (!userId) {
    throw new Error("Unauthenticated - please sign in");
  }

  const user = await ctx.db.get(userId);

  if (!user) {
    throw new Error("User not found in database");
  }

  return user;
}

/**
 * Get the current authenticated user or return null
 * Use this for optional authentication scenarios
 */
export async function getCurrentUser(
  ctx: QueryCtx | MutationCtx
) {
  const userId = await auth.getUserId(ctx);

  if (!userId) {
    return null;
  }

  const user = await ctx.db.get(userId);

  return user;
}
