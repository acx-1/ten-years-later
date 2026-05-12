import { z } from "zod";
import { eq } from "drizzle-orm";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { localUsers } from "@db/schema";
import { TRPCError } from "@trpc/server";

export const userRouter = createRouter({
  // Get current user profile
  me: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.unifiedUser!.id;
    const users = await db
      .select()
      .from(localUsers)
      .where(eq(localUsers.id, userId))
      .limit(1);

    if (users.length === 0) {
      throw new TRPCError({ code: "NOT_FOUND", message: "用户不存在" });
    }

    const user = users[0];
    return {
      id: user.id,
      username: user.username,
      name: user.displayName || user.username,
      displayName: user.displayName,
      email: user.email,
      bio: user.bio,
      role: user.role,
      createdAt: user.createdAt,
    };
  }),

  // Update user profile
  update: authedQuery
    .input(
      z.object({
        displayName: z.string().min(1).max(255).optional(),
        email: z.string().email().max(320).optional().or(z.literal("")),
        bio: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const userId = ctx.unifiedUser!.id;

      const updateData: Record<string, unknown> = {};
      if (input.displayName !== undefined) {
        updateData.displayName = input.displayName.trim();
      }
      if (input.email !== undefined) {
        updateData.email = input.email.trim() || null;
      }
      if (input.bio !== undefined) {
        updateData.bio = input.bio.trim() || null;
      }

      await db.update(localUsers).set(updateData).where(eq(localUsers.id, userId));

      // Return updated user
      const users = await db
        .select()
        .from(localUsers)
        .where(eq(localUsers.id, userId))
        .limit(1);

      const user = users[0];
      return {
        id: user.id,
        username: user.username,
        name: user.displayName || user.username,
        displayName: user.displayName,
        email: user.email,
        bio: user.bio,
      };
    }),

  // Get public profile of a user
  profile: authedQuery
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const users = await db
        .select({
          id: localUsers.id,
          username: localUsers.username,
          displayName: localUsers.displayName,
          bio: localUsers.bio,
          createdAt: localUsers.createdAt,
        })
        .from(localUsers)
        .where(eq(localUsers.id, input.userId))
        .limit(1);

      if (users.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "用户不存在" });
      }

      return {
        id: users[0].id,
        username: users[0].username,
        name: users[0].displayName || users[0].username,
        bio: users[0].bio,
        createdAt: users[0].createdAt,
      };
    }),
});
