// Trace the two failing e2e catch scenarios: quick-throw at a perched
// Caterpie and an aimed throw at an airborne Pidgey. Logs ball lifecycle.
import { chromium } from "playwright-core";

const URL = process.env.KANTO_URL || "http://localhost:5178";
const browser = await chromium.launch({ channel: "chrome", headless: true, args: ["--use-gl=swiftshader"] });
const page = await browser.newPage({ viewport: { width: 960, height: 600 } });
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));
await page.goto(URL, { waitUntil: "domcontentloaded" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "load" });
await page.waitForFunction(() => window.DEBUG?.game?.state, null, { timeout: 30000 });
await page.evaluate(() => DEBUG.newGame("Probe", "Blue"));
await page.locator(".startercard").nth(1).click();
await page.evaluate(() => DEBUG.cheat("tp", "route1"));
await page.waitForTimeout(800);

async function until(pred, timeout = 30, label = "") {
  try { await page.waitForFunction(pred, null, { timeout: timeout * 1000 }); return true; }
  catch { console.log(`TIMEOUT waiting: ${label}`); return false; }
}

// ---------- scenario 1: quick-throw at perched caterpie ----------
const s1 = await page.evaluate(() => {
  const g = DEBUG.game;
  if (g.battle) g.battle.end("fled");
  g.cheat("toggle", "catchall");
  g.playerYaw = 0;
  const w = DEBUG.spawn(10, 3);
  w.life = 99999;
  window.__w1 = w;
  const o = g.throwOrigin();
  const before = { thrown0: g.thrown.length, balls: g.state.items.pokeball };
  g.throwBallAt(w);
  return {
    ...before, thrown1: g.thrown.length,
    habitat: w.habitat, perched: w.perched, hopping: w.hopping,
    wpos: w.pos().toArray().map((n) => +n.toFixed(2)),
    dist: +o.distanceTo(w.pos()).toFixed(2),
    ground: +g.world.height(w.base.x, w.base.z).toFixed(2),
  };
});
console.log("S1 spawn+throw:", JSON.stringify(s1));

// sample the ball every 300ms until it's gone
for (let i = 0; i < 40; i++) {
  const t = await page.evaluate(() => {
    const g = DEBUG.game, w = window.__w1, b = g.thrown[0];
    return {
      ball: b ? { p: b.p.toArray().map((n) => +n.toFixed(2)), rest: +b.resting.toFixed(2), t: +b.t.toFixed(2) } : null,
      w: { pos: w.pos().toArray().map((n) => +n.toFixed(2)), perched: w.perched, hopping: w.hopping, lock: w.captureLock, dead: w.dead, state: w.state },
      caught: g.dexCaught.has(10), party: g.state.party.length,
    };
  });
  console.log("S1", i, JSON.stringify(t));
  if (!t.ball && (t.caught || (!t.w.lock && i > 3))) break;
  await page.waitForTimeout(300);
}
const s1done = await until(() => DEBUG.game.dexCaught.has(10) && !DEBUG.game.ui.modalOpen, 25, "caterpie caught");
console.log("S1 caught:", s1done, await page.evaluate(() => ({ party: DEBUG.game.state.party.length, modal: DEBUG.game.ui.modalOpen })));
await page.evaluate(() => { let n = 0; while (DEBUG.game.ui.modalOpen && n++ < 8) DEBUG.game.ui.closeTop(); });

// ---------- scenario 2: aimed throw at airborne pidgey ----------
const s2 = await page.evaluate(async () => {
  const g = DEBUG.game;
  if (g.battle) g.battle.end("fled");
  g.playerYaw = 0;
  const w = DEBUG.spawn(16, 4);
  w.life = 99999;
  w.species = Object.assign({}, w.species, { temper: "calm" });
  w.state = "idle"; w.fleeT = 0;
  window.__w2 = w;
  // aim up at the bird like the e2e now does
  const o0 = g.throwOrigin(), tp = w.pos();
  const dx = tp.x - o0.x, dy = tp.y - o0.y, dz = tp.z - o0.z;
  DEBUG.look(Math.atan2(-dx, -dz), Math.atan2(dy, Math.hypot(dx, dz)) + 0.08);
  g.updateTarget();
  if (!g.target) g.target = w;
  const started = g.startAim();
  await new Promise((r) => setTimeout(r, 500));
  g.aim.charge = 0.85;
  g.releaseAim(0.8);
  const o = g.throwOrigin();
  return {
    started, air: w.air, alt: +w.alt.toFixed(2),
    wpos: w.pos().toArray().map((n) => +n.toFixed(2)),
    opos: o.toArray().map((n) => +n.toFixed(2)),
    target: g.target === w,
    v: g.thrown[0] ? g.thrown[0].v.toArray().map((n) => +n.toFixed(2)) : null,
  };
});
console.log("S2 spawn+aim:", JSON.stringify(s2));
for (let i = 0; i < 40; i++) {
  const t = await page.evaluate(() => {
    const g = DEBUG.game, w = window.__w2, b = g.thrown[0];
    return {
      ball: b ? { p: b.p.toArray().map((n) => +n.toFixed(2)), rest: +b.resting.toFixed(2), t: +b.t.toFixed(2) } : null,
      w: { pos: w.pos().toArray().map((n) => +n.toFixed(2)), air: w.air, alt: +w.alt.toFixed(2), lock: w.captureLock, dead: w.dead, state: w.state },
      caught: g.dexCaught.has(16),
    };
  });
  console.log("S2", i, JSON.stringify(t));
  if (!t.ball && (t.caught || (!t.w.lock && i > 3))) break;
  await page.waitForTimeout(300);
}
const s2done = await until(() => DEBUG.game.dexCaught.has(16), 25, "pidgey caught");
console.log("S2 caught:", s2done);

await browser.close();
