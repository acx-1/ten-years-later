import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { User } from "@db/schema";
import { authenticateRequest } from "./kimi/auth";
import { verifyLocalToken } from "./local-auth-router";
import { getDb } from "./queries/connection";
import { localUsers } from "@db/schema";
import { eq } from "drizzle-orm";

export type UnifiedUser = {
  id: number;
  name: string;
  email?: string | null;
  avatar?: string | null;
  role: string;
  authType: "oauth" | "local";
};

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: User;
  unifiedUser?: UnifiedUser;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders };

  // Try OAuth authentication first
  try {
    const oauthUser = await authenticateRequest(opts.req.headers);
    if (oauthUser) {
      ctx.user = oauthUser;
      ctx.unifiedUser = {
        id: oauthUser.id,
        name: oauthUser.name || "用户",
        email: oauthUser.email,
        avatar: oauthUser.avatar,
        role: oauthUser.role,
        authType: "oauth",
      };
      return ctx;
    }
  } catch {
    // OAuth auth failed, try local
  }

  // Try local authentication
  try {
    const cookieHeader = opts.req.headers.get("cookie") || "";
    const cookies = Object.fromEntries(
      cookieHeader.split(";").map((c) => {
        const [key, ...rest] = c.trim().split("=");
        return [key, rest.join("=")];
      })
    );
    const token = cookies["kimi_sid"];
    if (token) {
      const payload = await verifyLocalToken(token);
      if (payload) {
        const db = getDb();
        const users = await db
          .select()
          .from(localUsers)
          .where(eq(localUsers.id, payload.userId))
          .limit(1);
        if (users.length > 0) {
          const user = users[0];
          ctx.unifiedUser = {
            id: user.id,
            name: user.displayName || user.username,
            email: user.email,
            avatar: null,
            role: user.role,
            authType: "local",
          };
          // Also set ctx.user for backward compatibility
          ctx.user = {
            id: user.id,
            unionId: `local_${user.id}`,
            name: user.displayName || user.username,
            email: user.email,
            avatar: null,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            lastSignInAt: user.createdAt,
          };
        }
      }
    }
  } catch {
    // Local auth failed
  }

  return ctx;
}
