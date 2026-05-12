import { z } from "zod";
import { eq, desc, sql } from "drizzle-orm";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { comments, localUsers } from "@db/schema";

export const commentRouter = createRouter({
  // List comments for a log
  list: publicQuery
    .input(z.object({ logId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const logComments = await db
        .select()
        .from(comments)
        .where(eq(comments.logId, input.logId))
        .orderBy(desc(comments.createdAt));

      // Batch fetch user names
      const userIds = [...new Set(logComments.map((c) => c.userId))];
      if (userIds.length === 0) return [];

      const users = await db
        .select({ id: localUsers.id, name: localUsers.displayName, username: localUsers.username })
        .from(localUsers)
        .where(sql`${localUsers.id} IN (${userIds.join(",")})`);
      const userMap = new Map(users.map((u) => [u.id, u.name || u.username]));

      return logComments.map((c) => ({
        ...c,
        userName: userMap.get(c.userId) || "匿名用户",
      }));
    }),

  // Create a comment
  create: authedQuery
    .input(z.object({ logId: z.number(), content: z.string().min(1).max(1000) }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const userId = ctx.unifiedUser!.id;
      const result = await db.insert(comments).values({
        logId: input.logId,
        userId,
        userType: "local",
        content: input.content.trim(),
      });
      return { id: Number(result[0].insertId), success: true };
    }),

  // Delete a comment
  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const userId = ctx.unifiedUser!.id;

      const existing = await db
        .select()
        .from(comments)
        .where(eq(comments.id, input.id))
        .limit(1);

      if (existing.length === 0) {
        return { success: false, message: "评论不存在" };
      }
      if (existing[0].userId !== userId) {
        return { success: false, message: "只能删除自己的评论" };
      }

      await db.delete(comments).where(eq(comments.id, input.id));
      return { success: true };
    }),
});
