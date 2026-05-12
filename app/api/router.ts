import { authRouter } from "./auth-router";
import { localAuthRouter } from "./local-auth-router";
import { dreamRouter } from "./dream-router";
import { logRouter } from "./log-router";
import { exploreRouter } from "./explore-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  localAuth: localAuthRouter,
  dream: dreamRouter,
  log: logRouter,
  explore: exploreRouter,
});

export type AppRouter = typeof appRouter;
