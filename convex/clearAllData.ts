import { mutation } from "./_generated/server";

/**
 * DANGER: This mutation deletes ALL data from ALL tables
 * Use with extreme caution - this cannot be undone
 */
export const clearAllData = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("Starting to clear all data...");

    const tables = [
      "aiTracking",
      "bugReports",
      "canvasCards",
      "canvasConnections",
      "canvases",
      "conversations",
      "featureRequests",
      "messages",
      "projectFiles",
      "projects",
      "responseFeedback",
      "testResponses",
      "tests",
    ];

    const deletedCounts: Record<string, number> = {};

    for (const tableName of tables) {
      const records = await ctx.db.query(tableName as any).collect();
      let count = 0;

      for (const record of records) {
        await ctx.db.delete(record._id);
        count++;
      }

      deletedCounts[tableName] = count;
      console.log(`Deleted ${count} records from ${tableName}`);
    }

    console.log("All data cleared successfully");
    return {
      success: true,
      deletedCounts,
      totalDeleted: Object.values(deletedCounts).reduce((sum, count) => sum + count, 0),
    };
  },
});
