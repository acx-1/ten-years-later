import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { dreamLogs, userLikes } from "@db/schema";
import { TRPCError } from "@trpc/server";

export const likeRouter = createRouter({
  // Toggle like on a log (authenticated, prevents duplicates)
  toggle: authedQuery
    .input(z.object({ logId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const userId = ctx.unifiedUser!.id;

      // Check if already liked
      const existing = await db
        .select()
        .from(userLikes)
        .where(and(eq(userLikes.userId, userId), eq(userLikes.logId, input.logId)))
        .limit(1);

      if (existing.length > 0) {
        // Unlike: remove the like record and decrement count
        await db
          .delete(userLikes)
          .where(and(eq(userLikes.userId, userId), eq(userLikes.logId, input.logId)));

        const log = await db.select().from(dreamLogs).where(eq(dreamLogs.id, input.logId)).limit(1);
        if (log.length > 0 && log[0].likes > 0) {
          await db
            .update(dreamLogs)
            .set({ likes: log[0].likes - 1 })
            .where(eq(dreamLogs.id, input.logId));
        }
        return { liked: false, likes: Math.max(0, (log[0]?.likes || 1) - 1) };
      } else {
        // Like: add the like record and increment count
        await db.insert(userLikes).values({ userId, logId: input.logId });

        const log = await db.select().from(dreamLogs).where(eq(dreamLogs.id, input.logId)).limit(1);
        if (log.length > 0) {
          await db
            .update(dreamLogs)
            .set({ likes: log[0].likes + 1 })
            .where(eq(dreamLogs.id, input.logId));
        }
        return { liked: true, likes: (log[0]?.likes || 0) + 1 };
      }
    }),

  // Check if user has liked a log
  check: authedQuery
    .input(z.object({ logId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const userId = ctx.unifiedUser!.id;
      const existing = await db
        .select()
        .from(userLikes)
        .where(and(eq(userLikes.userId, userId), eq(userLikes.logId, input.logId)))
        .limit(1);
      return { liked: existing.length > 0 };
    }),
});
