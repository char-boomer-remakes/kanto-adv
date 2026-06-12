// Diagnostic probe: possession mode. Boots the game, starts a battle,
// takes over the ally, moves/dashes/fires, and screenshots each beat.
//   node tools/possess-shot.mjs [port]
import { chromium } from "playwright-core";

const PORT = process.argv[2] || "5176";
const URL = `http://localhost:${PORT}/`;
const browser = await chromium.launch({ channel: "chrome", headless: true, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--mute-audio"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 760 } });
page.on("pageerror", (e) => console.log("PAGE ERROR:", e.message));

await page.goto(URL, { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "networkidle" });
await page.waitForFunction(() => typeof window.DEBUG !== "undefined", null, { timeout: 15000 });
await page.addStyleTag({ content: "#lockmsg{display:none!important}" });

// starter: Charmander (skip the title screen + Oak intro)
await page.waitForTimeout(1500);
await page.evaluate(() => window.DEBUG.newGame("Red", "Blue"));
await page.locator(".startercard").nth(1).click();
await page.waitForTimeout(700);

// start a wild battle vs a Squirtle at lv 8 in First-Person style
await page.evaluate(() => { window.DEBUG.style("fp"); window.DEBUG.battle(7, 8); });
await page.waitForTimeout(1200);
await page.screenshot({ path: "shots/possess-0-trainerview.png" });

// fp style auto-possesses after the send-out; make sure we're in
const s1 = await page.evaluate(() => {
  const b = window.DEBUG.game.battle;
  if (!b.possessed) { b.wantPossess = true; b.setPossessed(true); }
  return { possessed: b.possessed, style: b.style };
});
console.log("possess:", JSON.stringify(s1));
await page.waitForTimeout(900);   // camera blend
await page.screenshot({ path: "shots/possess-1-inside.png" });

// check camera actually moved into the mon + rig hidden
const s2 = await page.evaluate(() => {
  const g = window.DEBUG.game, b = g.battle;
  const eye = b.allyEnt.eye();
  return {
    camDist: g.camera.position.distanceTo(eye).toFixed(2),
    rigVisible: b.allyEnt.rig.group.visible,
    forceYaw: b.allyEnt.forceYaw?.toFixed(2),
  };
});
console.log("camera:", JSON.stringify(s2));

// strafe for a moment
await page.evaluate(() => { window.DEBUG.game.battle.possessInput.x = 1; window.DEBUG.game.battle.possessInput.z = 0; });
await page.waitForTimeout(700);
const s3 = await page.evaluate(() => {
  const b = window.DEBUG.game.battle;
  b.possessInput.x = 0;
  return { moved: b.allyEnt.base.distanceTo(b.midPoint).toFixed(2) };
});
console.log("strafe:", JSON.stringify(s3));

// dash
await page.evaluate(() => window.DEBUG.game.battle.possessDash());
await page.waitForTimeout(350);
await page.screenshot({ path: "shots/possess-2-dash.png" });

// teach Ember in slot 0 (lv8 Charmander only knows Scratch/Growl), aim, FIRE.
// Freeze the enemy first — moving targets are the point in real play, but the
// probe wants a deterministic hit.
const s4 = await page.evaluate(() => {
  const g = window.DEBUG.game, b = g.battle;
  b.allyMon.moves[0] = 52;          // Ember — a real ranged shot
  b.allyMon.pp[0] = 25;
  b.cds.ally[0] = 0; b.lock.ally = 0;
  b.lock.enemy = 99;                // statue mode: no brain, no attacks
  // aim the camera dead at the enemy
  const to = b.enemyEnt.pos().clone().sub(b.allyEnt.eye());
  const yaw = Math.atan2(-to.x, -to.z);
  const pitch = Math.atan2(to.y, Math.hypot(to.x, to.z));
  window.DEBUG.look(yaw, pitch);
  return { dist: to.length().toFixed(1), enemyHp0: b.enemy().hp, enemyMoves: b.enemy().moves.slice() };
});
console.log("aim:", JSON.stringify(s4));
await page.waitForTimeout(150);   // one frame so the camera adopts the yaw
await page.evaluate(() => {
  const b = window.DEBUG.game.battle;
  const to = b.enemyEnt.pos().clone().sub(b.allyEnt.eye());
  window.DEBUG.look(Math.atan2(-to.x, -to.z), Math.atan2(to.y, Math.hypot(to.x, to.z)));
  b.useMove("ally", 0);
});
const s5 = await page.evaluate(() => {
  const b = window.DEBUG.game.battle;
  return { projectiles: b.projectiles.length, kinds: b.projectiles.map((p) => p.move.name) };
});
console.log("fired:", JSON.stringify(s5));
await page.screenshot({ path: "shots/possess-3-attack.png" });
// wait for the bolt to land
await page.waitForFunction(() => {
  const b = window.DEBUG.game.battle;
  return !b || b.enemy().hp < b.enemy().maxhp;
}, null, { timeout: 4000 }).catch(() => {});
const s5b = await page.evaluate(() => {
  const b = window.DEBUG.game.battle;
  return b ? { enemyHpAfterEmber: b.enemy().hp } : { battle: "over" };
});
console.log("ember landed:", JSON.stringify(s5b));

// melee range gate: from far away, Scratch must refuse and spend nothing
const s5c = await page.evaluate(() => {
  const b = window.DEBUG.game.battle;
  if (!b) return { battle: "over" };
  b.allyMon.moves[1] = 10; b.allyMon.pp[1] = 30;
  b.cds.ally[1] = 0; b.lock.ally = 0;
  // drag the ally 12m away from the enemy
  const dir = b.allyEnt.base.clone().sub(b.enemyEnt.base).setY(0).normalize();
  b.allyEnt.base.copy(b.enemyEnt.base).addScaledVector(dir, 12);
  b.allyEnt.snapGround();
  const pp0 = b.allyMon.pp[1];
  b.useMove("ally", 1);
  return { ppBefore: pp0, ppAfter: b.allyMon.pp[1], gated: pp0 === b.allyMon.pp[1] };
});
console.log("melee gate:", JSON.stringify(s5c));

// then step in and actually scratch
const s5d = await page.evaluate(() => {
  const b = window.DEBUG.game.battle;
  if (!b) return { battle: "over" };
  const dir = b.allyEnt.base.clone().sub(b.enemyEnt.base).setY(0).normalize();
  b.allyEnt.base.copy(b.enemyEnt.base).addScaledVector(dir, 2.0);
  b.allyEnt.snapGround();
  b.cds.ally[1] = 0; b.lock.ally = 0;
  const hp0 = b.enemy().hp;
  b.useMove("ally", 1);
  return { hp0 };
});
await page.waitForFunction((hp0) => {
  const b = window.DEBUG.game.battle;
  return !b || b.enemy().hp < hp0;
}, s5d.hp0, { timeout: 4000 }).catch(() => {});
const s5e = await page.evaluate(() => {
  const b = window.DEBUG.game.battle;
  return b ? { enemyHpAfterScratch: b.enemy().hp } : { battle: "over" };
});
console.log("melee strike:", JSON.stringify(s5d), JSON.stringify(s5e));

// unfreeze, let the enemy fight back; count its projectiles as they fly
await page.evaluate(() => { const b = window.DEBUG.game.battle; if (b) b.lock.enemy = 0; });
let enemyShots = 0;
for (let i = 0; i < 20; i++) {
  await page.waitForTimeout(200);
  const n = await page.evaluate(() => {
    const b = window.DEBUG.game.battle;
    return b ? b.projectiles.filter((p) => p.side === "enemy").length : -1;
  });
  if (n < 0) break;
  enemyShots = Math.max(enemyShots, n);
}
const s6 = await page.evaluate(() => {
  const b = window.DEBUG.game.battle;
  if (!b) return { battle: "over" };
  return {
    allyHp: b.allyMon.hp, enemyHp: b.enemy().hp,
    enemyMoved: b.enemyEnt.base.distanceTo(b.enemyAnchor).toFixed(2),
    possessed: b.possessed,
  };
});
console.log("after enemy phase:", JSON.stringify(s6), "maxEnemyProjectilesSeen:", enemyShots);
await page.screenshot({ path: "shots/possess-4-combat.png" });

// eject (deliberate T-out: switch off auto-resume too)
await page.evaluate(() => { const b = window.DEBUG.game.battle; if (b) { b.wantPossess = false; b.setPossessed(false); } });
await page.waitForTimeout(800);
await page.screenshot({ path: "shots/possess-5-back.png" });
const s7 = await page.evaluate(() => {
  const b = window.DEBUG.game.battle;
  return b ? { rigVisible: b.allyEnt.rig.group.visible, possessed: b.possessed } : { battle: "over" };
});
console.log("eject:", JSON.stringify(s7));

await browser.close();
console.log("done — see shots/possess-*.png");
