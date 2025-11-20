import { query } from "./_generated/server";
import { getCurrentUser } from "./lib/auth";

/**
 * Get the current authenticated user
 */
export const current = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});
