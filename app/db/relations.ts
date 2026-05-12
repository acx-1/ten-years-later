import { relations } from "drizzle-orm";
import { dreams, dreamLogs, localUsers } from "./schema";

export const localUsersRelations = relations(localUsers, ({ many }) => ({
  dreams: many(dreams),
}));

export const dreamsRelations = relations(dreams, ({ many }) => ({
  logs: many(dreamLogs),
}));
