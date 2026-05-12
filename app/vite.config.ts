import devServer from "@hono/vite-dev-server"
import path from "path"
const __dirname = import.meta.dirname
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // Strategy: All non-API requests go directly to Vite (excluded from Hono).
    // Vite handles them with its built-in SPA fallback (appType: 'spa'),
    // which automatically injects React preamble and @vite/client.
    // Only API routes (/api/*) go through Hono.
    devServer({
      entry: "api/boot.ts",
      // Exclude ALL non-API paths — Vite handles them directly.
      // This is a negative lookahead: match paths NOT starting with /api/
      exclude: [
        /^(?!\/api\/)/,
      ],
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
