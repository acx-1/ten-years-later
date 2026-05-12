import { z } from "zod";
import { desc, sql } from "drizzle-orm";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { dreams, dreamLogs, localUsers } from "@db/schema";

export const exploreRouter = createRouter({
  // Get public dreams feed
  feed: publicQuery.query(async () => {
    const db = getDb();
    const allDreams = await db
      .select()
      .from(dreams)
      .where(sql`${dreams.isPublic} = 1`)
      .orderBy(desc(dreams.createdAt))
      .limit(20);

    // Get user info for each dream
    const enriched = await Promise.all(
      allDreams.map(async (dream) => {
        let userName = "匿名用户";
        if (dream.userType === "local") {
          const users = await db
            .select()
            .from(localUsers)
            .where(sql`${localUsers.id} = ${dream.userId}`)
            .limit(1);
          if (users.length > 0) {
            userName = users[0].displayName || users[0].username;
          }
        }
        return { ...dream, userName };
      })
    );

    return enriched;
  }),

  // Get recent log entries for feed
  recentLogs: publicQuery.query(async () => {
    const db = getDb();
    const logs = await db
      .select()
      .from(dreamLogs)
      .orderBy(desc(dreamLogs.createdAt))
      .limit(20);

    const enriched = await Promise.all(
      logs.map(async (log) => {
        let userName = "匿名用户";
        if (log.userType === "local") {
          const users = await db
            .select()
            .from(localUsers)
            .where(sql`${localUsers.id} = ${log.userId}`)
            .limit(1);
          if (users.length > 0) {
            userName = users[0].displayName || users[0].username;
          }
        }

        // Get dream title
        const dreamData = await db
          .select()
          .from(dreams)
          .where(sql`${dreams.id} = ${log.dreamId}`)
          .limit(1);
        const dreamTitle = dreamData.length > 0 ? dreamData[0].title : "未知梦想";

        return { ...log, userName, dreamTitle };
      })
    );

    return enriched;
  }),

  // Search dreams
  search: publicQuery
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(dreams)
        .where(sql`(${dreams.title} LIKE ${`%${input.query}%`} OR ${dreams.description} LIKE ${`%${input.query}%`}) AND ${dreams.isPublic} = 1`)
        .orderBy(desc(dreams.createdAt))
        .limit(20);
    }),

  // Get stats
  stats: publicQuery.query(async () => {
    const db = getDb();
    const dreamCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(dreams);
    const logCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(dreamLogs);
    const userCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(localUsers);

    return {
      totalDreams: dreamCount[0]?.count || 0,
      totalLogs: logCount[0]?.count || 0,
      totalUsers: userCount[0]?.count || 0,
    };
  }),
});
