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

// SPA fallback: serve index.html for non-API, non-file routes
const distPath = path.resolve(import.meta.dirname, "../dist/public");
const indexPath = path.resolve(distPath, "index.html");

app.use("*", async (c, next) => {
  const reqPath = new URL(c.req.url).pathname;

  // Static files (have extension): let serveStatic handle
  if (/\.[^/]+$/.test(reqPath)) {
    const { serveStatic } = await import("@hono/node-server/serve-static");
    return serveStatic({ root: "./dist/public" })(c, next);
  }

  // SPA routes (no extension): return index.html
  const accept = c.req.header("accept") ?? "";
  if (accept.includes("text/html") || accept === "*/*") {
    const content = fs.readFileSync(indexPath, "utf-8");
    return c.html(content);
  }

  return c.json({ error: "Not Found" }, 404);
});

export default app;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
