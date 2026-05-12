import type { Hono } from "hono";
import type { HttpBindings } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import fs from "fs";
import path from "path";

type App = Hono<{ Bindings: HttpBindings }>;

export function serveStaticFiles(app: App) {
  const distPath = path.resolve(import.meta.dirname, "../dist/public");
  const indexPath = path.resolve(distPath, "index.html");

  app.use("*", async (c, next) => {
    const pathname = new URL(c.req.url).pathname;
    // SPA routes: paths without a file extension get index.html
    const hasFileExt = /\.[^/]+$/.test(pathname);

    if (hasFileExt) {
      // Request for a static file (e.g. .js .css .jpg) — let serveStatic handle it
      return serveStatic({ root: "./dist/public" })(c, next);
    }

    // No file extension — this is an SPA route, return index.html
    const accept = c.req.header("accept") ?? "";
    if (accept.includes("text/html")) {
      const content = fs.readFileSync(indexPath, "utf-8");
      return c.html(content);
    }

    // Non-HTML request without file extension
    return c.json({ error: "Not Found" }, 404);
  });
}
