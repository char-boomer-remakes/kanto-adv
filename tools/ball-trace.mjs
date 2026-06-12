// trace one deliberately-missed ball through its lifecycle
import { chromium } from "playwright-core";
const URL = process.env.KANTO_URL || "http://localhost:5178";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 600 } });
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));
await page.goto(URL);
await page.waitForFunction(() => window.DEBUG, null, { timeout: 30000 });
await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
await page.reload();
await page.waitForFunction(() => window.DEBUG, null, { timeout: 30000 });
await page.evaluate(() => window.DEBUG.newGame("Red", "Blue"));
await page.waitForSelector(".startercard", { timeout: 10000 });
await page.click(".startercard");
await page.waitForTimeout(600);
await page.evaluate(() => { window.DEBUG.give("pokeball", 20); window.DEBUG.style("classic"); window.DEBUG.battle(19, 3); });
await page.waitForTimeout(900);
await page.evaluate(() => {
  const g = window.DEBUG.game;
  const v = g.launchVelocity().multiplyScalar(0); v.set(-6, 9, -6);
  g.launchBall(v, 0, false, null);
});
for (let i = 0; i < 60; i++) {
  const s = await page.evaluate(() => {
    const g = window.DEBUG.game, b = g.thrown[0];
    const blocking = g.ui.blocking, modal = g.ui.modalOpen;
    if (!b) return { gone: true, phase: g.battle?.turnPhase, blocking, modal };
    const h = g.world.height(b.p.x, b.p.z);
    return {
      t: +b.t.toFixed(2), y: +b.p.y.toFixed(3), h: +h.toFixed(3),
      resting: +b.resting.toFixed(3), vy: +b.v.y.toFixed(1),
      vlen: +b.v.length().toFixed(2), bounced: b.bounced, phase: g.battle?.turnPhase,
    };
  });
  console.log(JSON.stringify(s));
  if (s.gone) break;
  await page.waitForTimeout(500);
}
await browser.close();
