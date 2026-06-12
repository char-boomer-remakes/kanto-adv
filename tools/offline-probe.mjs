// proves the game runs with zero internet: every non-localhost request is blocked
import { chromium } from "playwright-core";

const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--mute-audio"],
});
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const blocked = [];
await ctx.route("**/*", (route) => {
  const url = route.request().url();
  if (url.startsWith("http://localhost") || url.startsWith("http://127.0.0.1")) return route.continue();
  blocked.push(url);
  return route.abort();
});
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(process.env.KANTO_URL || "http://localhost:5175", { waitUntil: "load" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "load" });
await page.waitForFunction(() => typeof window.DEBUG !== "undefined", null, { timeout: 15000 });
await new Promise((r) => setTimeout(r, 2000));
await page.evaluate(() => window.DEBUG.newGame("Red", "Blue"));   // past the title screen
await page.locator(".startercard").nth(1).click();
await new Promise((r) => setTimeout(r, 2500));

const check = await page.evaluate(() => {
  const imgs = [...document.querySelectorAll("#partyStrip img, .startercard img")];
  return {
    partySprites: imgs.map((i) => ({ src: i.getAttribute("src"), loaded: i.complete && i.naturalWidth > 0 })),
    started: DEBUG.game.state.started,
    follower: !!DEBUG.game.follower,
  };
});
await page.screenshot({ path: "screenshots/offline-check.png" });
console.log(JSON.stringify({ check, blockedExternalRequests: blocked, pageErrors: errors }, null, 2));
await browser.close();
process.exit(check.started && check.partySprites.every((s) => s.loaded) ? 0 : 1);
