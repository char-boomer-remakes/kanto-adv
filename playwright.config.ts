import { defineConfig, devices } from "@playwright/test";

// The game renders with WebGL via Three.js, so the e2e specs need a real GPU
// path. We use the system Chrome channel with SwiftShader (software GL) and the
// same flags the old tools/e2e-test.mjs relied on. Each spec boots the app and
// jumps straight to the state under test via window.DEBUG, so they parallelize
// cleanly across workers instead of replaying the whole game in one session.
// Dedicated port for the e2e suite. We deliberately avoid Vite's default 5173
// (which a manual `npm run dev` — or another project entirely — may occupy with
// a different app) so the suite always boots and tests THIS game.
const PORT = Number(process.env.KANTO_PORT || 5319);
const BASE_URL = process.env.KANTO_URL || `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "tests/e2e",
  globalSetup: "./tests/e2e/global-setup.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chrome",
      use: {
        ...devices["Desktop Chrome"],
        channel: "chrome",
        viewport: { width: 1280, height: 800 },
        launchOptions: {
          args: [
            "--use-angle=swiftshader",
            "--enable-unsafe-swiftshader",
            "--mute-audio",
          ],
        },
      },
    },
  ],
  // Auto-start (and reuse) the Vite dev server. No --open so it stays headless.
  webServer: {
    command: `npx vite --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
