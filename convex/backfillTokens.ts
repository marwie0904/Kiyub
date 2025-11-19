import { mutation } from "./_generated/server";

export const backfill = mutation({
  handler: async (ctx) => {
    // Get all messages with tokenUsage where completionTokens is 0
    const messages = await ctx.db.query("messages").collect();

    let updated = 0;
    let skipped = 0;

    for (const message of messages) {
      if (message.tokenUsage) {
        const { promptTokens, completionTokens, totalTokens } = message.tokenUsage;

        // If completionTokens is 0 but totalTokens exists, calculate it
        if (completionTokens === 0 && totalTokens > 0) {
          const calculatedCompletionTokens = totalTokens - (promptTokens || 0);

          await ctx.db.patch(message._id, {
            tokenUsage: {
              promptTokens: promptTokens || 0,
              completionTokens: calculatedCompletionTokens,
              totalTokens,
            },
          });

          updated++;
        } else {
          skipped++;
        }
      }
    }

    return {
      success: true,
      updated,
      skipped,
      total: messages.length,
    };
  },
});
