import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { dreams } from "@db/schema";

export const dreamRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(dreams).orderBy(desc(dreams.createdAt));
  }),

  listByUser: publicQuery
    .input(z.object({ userId: z.number(), userType: z.enum(["oauth", "local"]).default("local") }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(dreams)
        .where(eq(dreams.userId, input.userId))
        .orderBy(desc(dreams.createdAt));
    }),

  create: publicQuery
    .input(
      z.object({
        userId: z.number(),
        userType: z.enum(["oauth", "local"]).default("local"),
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        category: z.string().optional(),
        deadline: z.string().optional(),
        color: z.string().default("#1abc9c"),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      // Normalize empty strings to undefined
      const deadline = input.deadline?.trim() || undefined;
      const category = input.category?.trim() || undefined;
      const description = input.description?.trim() || undefined;
      const color = input.color?.trim() || "#1abc9c";
      const result = await db.insert(dreams).values({
        userId: input.userId,
        userType: input.userType,
        title: input.title.trim(),
        description,
        category,
        deadline,
        color,
      });
      return { id: Number(result[0].insertId), success: true };
    }),

  updateProgress: publicQuery
    .input(z.object({ id: z.number(), progress: z.number().min(0).max(100) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(dreams)
        .set({ progress: input.progress })
        .where(eq(dreams.id, input.id));
      return { success: true };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(dreams).where(eq(dreams.id, input.id));
      return { success: true };
    }),
});
