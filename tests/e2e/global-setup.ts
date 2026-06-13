import { chromium } from "@playwright/test";

// Warm Vite's dependency optimization before the worker fleet starts. On a cold
// dev server the first request for /src modules triggers an esbuild pre-bundle
// of Three.js, and Vite then fires a full-page reload — which, if it lands in
// the middle of a parallel test, resets the game state and flakes the run. We
// load the whole app once here (importing the heavy modules) so that reload
// happens now, against nobody.
const PORT = Number(process.env.KANTO_PORT || 5319);
const BASE_URL = process.env.KANTO_URL || `http://localhost:${PORT}`;

export default async function globalSetup() {
  const browser = await chromium.launch({
    channel: "chrome",
    args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--mute-audio"],
  });
  try {
    const page = await browser.newPage();
    await page.goto(BASE_URL, { waitUntil: "load" });
    await page.waitForFunction(() => typeof window.DEBUG !== "undefined", null, { timeout: 60000 });
    await page.evaluate(async () => {
      await import("/src/data.js");
      await import("/src/world.ts");
    });
  } finally {
    await browser.close();
  }
}
