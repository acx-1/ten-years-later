import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { dreamLogs, dreams } from "@db/schema";
import { TRPCError } from "@trpc/server";

export const logRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(dreamLogs).orderBy(desc(dreamLogs.createdAt));
  }),

  listByUser: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.unifiedUser!.id;
    // Join with dreams to get dream title
    const logs = await db
      .select()
      .from(dreamLogs)
      .where(eq(dreamLogs.userId, userId))
      .orderBy(desc(dreamLogs.createdAt));

    // Enrich with dream titles
    const dreamIds = [...new Set(logs.map((l) => l.dreamId))];

    // Fetch all related dreams
    const allDreams = await Promise.all(
      dreamIds.map((id) => db.select().from(dreams).where(eq(dreams.id, id)).limit(1))
    );
    const dreamMap = new Map(allDreams.filter((d) => d.length > 0).map((d) => [d[0].id, d[0]]));

    return logs.map((log) => ({
      ...log,
      dreamTitle: dreamMap.get(log.dreamId)?.title || "未知梦想",
    }));
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

  create: authedQuery
    .input(
      z.object({
        dreamId: z.number(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const userId = ctx.unifiedUser!.id;

      // Verify the dream exists and belongs to the user
      const dream = await db.select().from(dreams).where(eq(dreams.id, input.dreamId)).limit(1);
      if (dream.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "梦想不存在" });
      }
      if (dream[0].userId !== userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "只能为自己的梦想写日志" });
      }

      const result = await db.insert(dreamLogs).values({
        dreamId: input.dreamId,
        userId,
        userType: "local",
        content: input.content.trim(),
      });
      return { id: Number(result[0].insertId), success: true };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const userId = ctx.unifiedUser!.id;

      // Verify ownership
      const existing = await db.select().from(dreamLogs).where(eq(dreamLogs.id, input.id)).limit(1);
      if (existing.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "日志不存在" });
      }
      if (existing[0].userId !== userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "只能删除自己的日志" });
      }

      await db.delete(dreamLogs).where(eq(dreamLogs.id, input.id));
      return { success: true };
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
