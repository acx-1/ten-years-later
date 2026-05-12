import { z } from "zod";
import { eq, and, sql } from "drizzle-orm";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { follows, localUsers } from "@db/schema";

export const followRouter = createRouter({
  // Toggle follow a user
  toggle: authedQuery
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const followerId = ctx.unifiedUser!.id;
      if (followerId === input.userId) {
        return { following: false };
      }

      const existing = await db
        .select()
        .from(follows)
        .where(and(eq(follows.followerId, followerId), eq(follows.followingId, input.userId)))
        .limit(1);

      if (existing.length > 0) {
        await db
          .delete(follows)
          .where(and(eq(follows.followerId, followerId), eq(follows.followingId, input.userId)));
        return { following: false };
      } else {
        await db.insert(follows).values({ followerId, followingId: input.userId });
        return { following: true };
      }
    }),

  // Check if following a user
  check: authedQuery
    .input(z.object({ userId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const followerId = ctx.unifiedUser!.id;
      const existing = await db
        .select()
        .from(follows)
        .where(and(eq(follows.followerId, followerId), eq(follows.followingId, input.userId)))
        .limit(1);
      return { following: existing.length > 0 };
    }),

  // Get followers count for a user
  followersCount: authedQuery
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(follows)
        .where(eq(follows.followingId, input.userId));
      return result[0]?.count || 0;
    }),

  // Get following count for a user
  followingCount: authedQuery
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(follows)
        .where(eq(follows.followerId, input.userId));
      return result[0]?.count || 0;
    }),

  // Get followers list
  followers: authedQuery
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const followRecords = await db
        .select()
        .from(follows)
        .where(eq(follows.followingId, input.userId));

      const followerIds = followRecords.map((f) => f.followerId);
      if (followerIds.length === 0) return [];

      const users = await db
        .select({ id: localUsers.id, name: localUsers.displayName, username: localUsers.username })
        .from(localUsers)
        .where(sql`${localUsers.id} IN (${followerIds.join(",")})`);

      return users;
    }),

  // Get following list
  following: authedQuery
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const followRecords = await db
        .select()
        .from(follows)
        .where(eq(follows.followerId, input.userId));

      const followingIds = followRecords.map((f) => f.followingId);
      if (followingIds.length === 0) return [];

      const users = await db
        .select({ id: localUsers.id, name: localUsers.displayName, username: localUsers.username })
        .from(localUsers)
        .where(sql`${localUsers.id} IN (${followingIds.join(",")})`);

      return users;
    }),
});
