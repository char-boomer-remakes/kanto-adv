// probe: what does pressing "1" do in battle with the new key map?
import { chromium } from "playwright-core";
const browser = await chromium.launch({ channel: "chrome", headless: true,
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--mute-audio"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto("http://localhost:5175", { waitUntil: "load" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "load" });
await page.waitForFunction(() => typeof window.DEBUG !== "undefined", null, { timeout: 15000 });
await new Promise(r => setTimeout(r, 2000));
await page.evaluate(() => DEBUG.newGame("Red", "Gary"));
await page.locator(".startercard").nth(1).click();
await new Promise(r => setTimeout(r, 600));
await page.evaluate(async () => {
  const g = DEBUG.game;
  g.trainers.forEach((t) => (t.engaging = true));
  if (g.ui.dialogActive) g.ui.endDialog(null);
  await new Promise((r) => setTimeout(r, 100));
  g.cheat("tp", "pallet");
  const w = DEBUG.spawn(1, 4);
  w.life = 99999;
  g.startWildBattle(w);
  const b = g.battle;
  window.__calls = [];
  const orig = b.useMove.bind(b);
  b.useMove = (s, i) => { window.__calls.push({ s, i, stack: new Error().stack.split("\n")[2]?.trim() }); return orig(s, i); };
});
await new Promise(r => setTimeout(r, 500));
for (let i = 0; i < 6; i++) { await page.keyboard.press("1"); await new Promise(r => setTimeout(r, 250)); }
const out = await page.evaluate(() => ({
  calls: window.__calls,
  style: DEBUG.game.battle?.style,
  possessed: DEBUG.game.battle?.possessed,
  pp: DEBUG.game.state.party[0].pp,
  battle: !!DEBUG.game.battle,
}));
console.log(JSON.stringify(out, null, 2));
await browser.close();
