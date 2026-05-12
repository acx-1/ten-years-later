import devServer from "@hono/vite-dev-server"
import path from "path"
import fs from "fs"
const __dirname = import.meta.dirname
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // SPA fallback: serve index.html for frontend routes
    // This must run before devServer so Vite can inject React preamble
    {
      name: "spa-fallback",
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          const url = req.url ?? "/"

          // Skip API routes, static files, and Vite internals
          const isApi = url.startsWith("/api/")
          const isVite = url.startsWith("/@") || url.startsWith("/__")
          const isStaticFile = /\.[^/]+$/.test(url)

          if (isApi || isVite || isStaticFile) {
            return next()
          }

          try {
            const indexPath = path.resolve(__dirname, "./index.html")
            const template = fs.readFileSync(indexPath, "utf-8")
            const html = await server.transformIndexHtml(url, template)
            res.setHeader("content-type", "text/html")
            res.statusCode = 200
            res.end(html)
          } catch (e) {
            next(e)
          }
        })
      },
    },
    devServer({
      entry: "api/boot.ts",
      exclude: [
        // Vite internals (Vite handles these directly)
        /^\/[@$]/,
        /^\/node_modules\//,
        /^\/__/,
        // Source files and public assets (Vite serves these)
        /^\/src\//,
        /^\/public\//,
        /^\/assets\//,
        // NOTE: Do NOT add /\.[^/]+$/ here — API paths like
        // /api/trpc/localAuth.login match this and get excluded!
        // Static files are handled by Vite's built-in static middleware.
      ],
      injectClientScript: false,
    }),
    inspectAttr(),
    react(),
  ],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@contracts": path.resolve(__dirname, "./contracts"),
      "@db": path.resolve(__dirname, "./db"),
      "db": path.resolve(__dirname, "./db"),
    },
  },
  envDir: path.resolve(__dirname),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
})
