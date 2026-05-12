import { authRouter } from "./auth-router";
import { localAuthRouter } from "./local-auth-router";
import { dreamRouter } from "./dream-router";
import { logRouter } from "./log-router";
import { exploreRouter } from "./explore-router";
import { likeRouter } from "./like-router";
import { followRouter } from "./follow-router";
import { commentRouter } from "./comment-router";
import { userRouter } from "./user-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  localAuth: localAuthRouter,
  dream: dreamRouter,
  log: logRouter,
  explore: exploreRouter,
  like: likeRouter,
  follow: followRouter,
  comment: commentRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
