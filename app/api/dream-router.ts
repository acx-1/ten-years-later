import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { dreams, dreamLogs } from "@db/schema";
import { TRPCError } from "@trpc/server";

export const dreamRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(dreams).orderBy(desc(dreams.createdAt));
  }),

  listByUser: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.unifiedUser!.id;
    return db
      .select()
      .from(dreams)
      .where(eq(dreams.userId, userId))
      .orderBy(desc(dreams.createdAt));
  }),

  create: authedQuery
    .input(
      z.object({
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        category: z.string().optional(),
        deadline: z.string().optional(),
        color: z.string().default("#1abc9c"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const userId = ctx.unifiedUser!.id;
      const deadline = input.deadline?.trim() || undefined;
      const category = input.category?.trim() || undefined;
      const description = input.description?.trim() || undefined;
      const result = await db.insert(dreams).values({
        userId,
        userType: "local",
        title: input.title.trim(),
        description,
        category,
        deadline,
        color: input.color?.trim() || "#1abc9c",
      });
      return { id: Number(result[0].insertId), success: true };
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        category: z.string().optional(),
        deadline: z.string().optional(),
        color: z.string().optional(),
        isPublic: z.number().min(0).max(1).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const userId = ctx.unifiedUser!.id;

      // Verify ownership
      const existing = await db.select().from(dreams).where(eq(dreams.id, input.id)).limit(1);
      if (existing.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "梦想不存在" });
      }
      if (existing[0].userId !== userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "只能修改自己的梦想" });
      }

      const updateData: Record<string, unknown> = {};
      if (input.title !== undefined) updateData.title = input.title.trim();
      if (input.description !== undefined) updateData.description = input.description?.trim() || null;
      if (input.category !== undefined) updateData.category = input.category?.trim() || null;
      if (input.deadline !== undefined) updateData.deadline = input.deadline?.trim() || null;
      if (input.color !== undefined) updateData.color = input.color;
      if (input.isPublic !== undefined) updateData.isPublic = input.isPublic;

      await db.update(dreams).set(updateData).where(eq(dreams.id, input.id));
      return { success: true };
    }),

  updateProgress: authedQuery
    .input(z.object({ id: z.number(), progress: z.number().min(0).max(100) }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const userId = ctx.unifiedUser!.id;

      // Verify ownership
      const existing = await db.select().from(dreams).where(eq(dreams.id, input.id)).limit(1);
      if (existing.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "梦想不存在" });
      }
      if (existing[0].userId !== userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "只能修改自己的梦想" });
      }

      await db
        .update(dreams)
        .set({ progress: input.progress })
        .where(eq(dreams.id, input.id));
      return { success: true };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const userId = ctx.unifiedUser!.id;

      // Verify ownership
      const existing = await db.select().from(dreams).where(eq(dreams.id, input.id)).limit(1);
      if (existing.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "梦想不存在" });
      }
      if (existing[0].userId !== userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "只能删除自己的梦想" });
      }

      // Cascade delete: remove associated logs first
      await db.delete(dreamLogs).where(eq(dreamLogs.dreamId, input.id));
      await db.delete(dreams).where(eq(dreams.id, input.id));
      return { success: true };
    }),
});
