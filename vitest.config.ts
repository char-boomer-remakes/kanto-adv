import { defineConfig } from "vitest/config";

// Pure game logic (stats, XP, type math, spawn tables, save helpers) needs no
// browser, canvas, or WebGL — see the note in tests/unit. Running it in plain
// Node makes these tests finish in milliseconds instead of minutes. Vitest
// shares Vite's resolver, so the app's `./data.js` / `./world.js` import
// specifiers resolve to the same files they do at runtime.
export default defineConfig({
  test: {
    include: ["tests/unit/**/*.test.ts"],
    environment: "node",
    setupFiles: ["tests/setup.ts"],
  },
});
