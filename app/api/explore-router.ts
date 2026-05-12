import { z } from "zod";
import { desc, sql, like, or, eq } from "drizzle-orm";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { dreams, dreamLogs, localUsers } from "@db/schema";

// Shared fields to select from dreams
const dreamFields = {
  id: dreams.id,
  userId: dreams.userId,
  title: dreams.title,
  description: dreams.description,
  category: dreams.category,
  progress: dreams.progress,
  color: dreams.color,
  deadline: dreams.deadline,
  isPublic: dreams.isPublic,
  createdAt: dreams.createdAt,
};

export const exploreRouter = createRouter({
  // Get public dreams feed with user names (single JOIN query, no N+1)
  feed: publicQuery.query(async () => {
    const db = getDb();
    const results = await db
      .select({
        ...dreamFields,
        userName: localUsers.displayName,
      })
      .from(dreams)
      .leftJoin(localUsers, eq(dreams.userId, localUsers.id))
      .where(eq(dreams.isPublic, 1))
      .orderBy(desc(dreams.createdAt))
      .limit(20);

    return results.map((r) => ({
      ...r,
      userName: r.userName || "匿名用户",
    }));
  }),

  // Get recent log entries with user names and dream titles (optimized)
  recentLogs: publicQuery.query(async () => {
    const db = getDb();
    const logs = await db
      .select()
      .from(dreamLogs)
      .orderBy(desc(dreamLogs.createdAt))
      .limit(20);

    // Batch fetch user names and dream titles
    const userIds = [...new Set(logs.map((l) => l.userId))];
    const dreamIds = [...new Set(logs.map((l) => l.dreamId))];

    // Fetch all users in one query
    const usersList = userIds.length > 0
      ? await db.select().from(localUsers).where(sql`${localUsers.id} IN (${userIds.join(",")})`)
      : [];
    const userMap = new Map(usersList.map((u) => [u.id, u.displayName || u.username]));

    // Fetch all dreams in one query
    const dreamsList = dreamIds.length > 0
      ? await db.select().from(dreams).where(sql`${dreams.id} IN (${dreamIds.join(",")})`)
      : [];
    const dreamMap = new Map(dreamsList.map((d) => [d.id, d.title]));

    return logs.map((log) => ({
      ...log,
      userName: userMap.get(log.userId) || "匿名用户",
      dreamTitle: dreamMap.get(log.dreamId) || "未知梦想",
    }));
  }),

  // Search dreams using Drizzle's type-safe like()
  search: publicQuery
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select({
          ...dreamFields,
          userName: localUsers.displayName,
        })
        .from(dreams)
        .leftJoin(localUsers, eq(dreams.userId, localUsers.id))
        .where(
          or(
            like(dreams.title, `%${input.query}%`),
            like(dreams.description, `%${input.query}%`)
          )
        )
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
