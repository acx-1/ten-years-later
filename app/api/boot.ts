import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { createOAuthCallbackHandler } from "./kimi/auth";
import { Paths } from "@contracts/constants";
import fs from "fs";
import path from "path";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));
app.get(Paths.oauthCallback, createOAuthCallbackHandler());
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

// Production: SPA fallback — serve index.html for frontend routes
// Dev: handled by Vite's configureServer (spa-fallback plugin in vite.config.ts)
const indexPath = env.isProduction
  ? path.resolve(import.meta.dirname, "../dist/public/index.html")
  : path.resolve(import.meta.dirname, "../index.html");

app.use("*", async (c, next) => {
  if (!env.isProduction) {
    // Dev: let Vite handle everything
    return next();
  }

  const reqPath = new URL(c.req.url).pathname;

  // Static files (have extension): use serveStatic
  if (/\.[^/]+$/.test(reqPath)) {
    const { serveStatic } = await import("@hono/node-server/serve-static");
    return serveStatic({ root: "./dist/public" })(c, next);
  }

  // SPA routes: return index.html
  const accept = c.req.header("accept") ?? "";
  if (accept.includes("text/html") || accept === "*/*") {
    const content = fs.readFileSync(indexPath, "utf-8");
    return c.html(content);
  }

  return next();
});

export default app;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
