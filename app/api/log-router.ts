import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { dreamLogs } from "@db/schema";

export const logRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(dreamLogs).orderBy(desc(dreamLogs.createdAt));
  }),

  listByUser: publicQuery
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(dreamLogs)
        .where(eq(dreamLogs.userId, input.userId))
        .orderBy(desc(dreamLogs.createdAt));
    }),

  listByDream: publicQuery
    .input(z.object({ dreamId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(dreamLogs)
        .where(eq(dreamLogs.dreamId, input.dreamId))
        .orderBy(desc(dreamLogs.createdAt));
    }),

  create: publicQuery
    .input(
      z.object({
        dreamId: z.number(),
        userId: z.number(),
        userType: z.enum(["oauth", "local"]).default("local"),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(dreamLogs).values({
        dreamId: input.dreamId,
        userId: input.userId,
        userType: input.userType,
        content: input.content,
      });
      return { id: Number(result[0].insertId), success: true };
    }),

  like: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db
        .select()
        .from(dreamLogs)
        .where(eq(dreamLogs.id, input.id))
        .limit(1);
      if (existing.length > 0) {
        await db
          .update(dreamLogs)
          .set({ likes: existing[0].likes + 1 })
          .where(eq(dreamLogs.id, input.id));
      }
      return { success: true };
    }),
});
