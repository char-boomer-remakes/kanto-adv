import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  // prefers 5173 but hops to the next free port (other dev servers welcome)
  server: { port: 5173, strictPort: false },
  preview: { port: 4173, strictPort: false },
  build: { outDir: "dist", chunkSizeWarningLimit: 1500 },
});
