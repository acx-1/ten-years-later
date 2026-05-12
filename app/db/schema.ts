import {
  mysqlTable,
  serial,
  varchar,
  text,
  timestamp,
  bigint,
  int,
  mysqlEnum,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

// OAuth users (Kimi login)
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Local users (username/password login)
export const localUsers = mysqlTable("local_users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  displayName: varchar("display_name", { length: 255 }),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  bio: text("bio"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type LocalUser = typeof localUsers.$inferSelect;
export type InsertLocalUser = typeof localUsers.$inferInsert;

// Dreams table
export const dreams = mysqlTable("dreams", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  userType: mysqlEnum("user_type", ["oauth", "local"]).default("local").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }),
  deadline: varchar("deadline", { length: 20 }),
  progress: int("progress").default(0).notNull(),
  color: varchar("color", { length: 20 }).default("#1abc9c"),
  isPublic: int("is_public").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Dream = typeof dreams.$inferSelect;

// Dream logs (journal entries)
export const dreamLogs = mysqlTable("dream_logs", {
  id: serial("id").primaryKey(),
  dreamId: bigint("dream_id", { mode: "number", unsigned: true }).notNull(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  userType: mysqlEnum("user_type", ["oauth", "local"]).default("local").notNull(),
  content: text("content").notNull(),
  likes: int("likes").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type DreamLog = typeof dreamLogs.$inferSelect;

// User likes on logs (prevents duplicate likes)
export const userLikes = mysqlTable("user_likes", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  logId: bigint("log_id", { mode: "number", unsigned: true }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("idx_user_likes_unique").on(table.userId, table.logId),
]);

export type UserLike = typeof userLikes.$inferSelect;

// Follows (user follow relationships)
export const follows = mysqlTable("follows", {
  id: serial("id").primaryKey(),
  followerId: bigint("follower_id", { mode: "number", unsigned: true }).notNull(),
  followingId: bigint("following_id", { mode: "number", unsigned: true }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("idx_follows_unique").on(table.followerId, table.followingId),
]);

export type Follow = typeof follows.$inferSelect;

// Comments on logs
export const comments = mysqlTable("comments", {
  id: serial("id").primaryKey(),
  logId: bigint("log_id", { mode: "number", unsigned: true }).notNull(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  userType: mysqlEnum("user_type", ["oauth", "local"]).default("local").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Comment = typeof comments.$inferSelect;
