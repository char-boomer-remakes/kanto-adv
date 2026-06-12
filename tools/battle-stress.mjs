// Battle stress probe — hammers all three battle styles looking for stuck
// states, crashes, and rule leaks. Run with the dev server up:
//   KANTO_URL=http://localhost:5178 node tools/battle-stress.mjs
// NOTE: headless rendering is slow — the game clock can run far behind real
// time, so every step waits on game STATE, never on wall-clock guesses.
import { chromium } from "playwright-core";

const URL = process.env.KANTO_URL || "http://localhost:5173";
const issues = [];
const note = (s) => console.log("  " + s);
const flag = (s) => { issues.push(s); console.log("  ISSUE: " + s); };

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on("pageerror", (e) => flag(`pageerror: ${e.message}`));
page.on("console", (m) => { if (m.type() === "error") flag(`console.error: ${m.text().slice(0, 200)}`); });

// wait for an in-game condition; returns false instead of throwing
const until = async (fn, timeout = 45000) => {
  try { await page.waitForFunction(fn, null, { timeout, polling: 250 }); return true; }
  catch { return false; }
};

await page.goto(URL);
await page.waitForFunction(() => window.DEBUG, null, { timeout: 30000 });
await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
await page.reload();
await page.waitForFunction(() => window.DEBUG, null, { timeout: 30000 });
await page.evaluate(() => window.DEBUG.newGame("Red", "Blue"));
await page.waitForSelector(".startercard", { timeout: 10000 });
await page.click(".startercard");
await until(() => window.DEBUG.game.state.party.length > 0);
await page.evaluate(() => {
  const D = window.DEBUG;
  D.give("pokeball", 50); D.give("potion", 20);
  D.xp(2200); D.heal();
});

// ---------------------------------------------------------------- classic
console.log("== classic: missed throw must return the turn (was: soft-lock)");
await page.evaluate(() => { window.DEBUG.style("classic"); window.DEBUG.battle(19, 3); });
await until(() => !!window.DEBUG.game.battle);
{
  await page.evaluate(() => {
    const g = window.DEBUG.game;
    const v = g.launchVelocity().multiplyScalar(0); v.set(-6, 9, -6);
    g.launchBall(v, 0, false, null);   // deliberate miss
  });
  const thrownGone = await until(() => window.DEBUG.game.thrown.length === 0);
  const backToPlayer = thrownGone && await until(() => window.DEBUG.game.battle?.turnPhase === "player");
  note(`ball resolved=${thrownGone} turn returned=${backToPlayer}`);
  if (!thrownGone) flag("classic: missed ball never despawned");
  else if (!backToPlayer) flag("classic: turnPhase stuck 'busy' after a missed ball (soft-lock)");
}

console.log("== classic: bag/switch during the resolving round must be refused");
{
  const r = await page.evaluate(() => {
    const g = window.DEBUG.game, b = g.battle;
    if (!b) return null;
    b.allyMon.hp = Math.floor(b.allyMon.maxhp / 2);   // potion is meaningful
    b.classicMove(0);                                  // our move -> round resolving
    const n0 = g.state.items.potion;
    const used = g.useItem("potion", 0, true);         // must be denied
    b.doSwitch(1);                                     // must be denied (silent ok)
    return { used, n0, n1: g.state.items.potion, phase: b.turnPhase };
  });
  if (r) {
    note(`item during busy: used=${r.used} potions ${r.n0}->${r.n1}`);
    if (r.used || r.n1 < r.n0) flag("classic: bag item consumed during the enemy's turn");
  }
  const ok = await until(() => window.DEBUG.game.battle?.turnPhase === "player" || !window.DEBUG.game.battle);
  if (!ok) flag("classic: round never returned to the player");
  // item should work ON the player's turn
  const r2 = await page.evaluate(() => {
    const g = window.DEBUG.game, b = g.battle;
    if (!b) return null;
    const n0 = g.state.items.potion;
    const used = g.useItem("potion", 0, true);
    return { used, n0, n1: g.state.items.potion };
  });
  if (r2 && (!r2.used || r2.n1 !== r2.n0 - 1)) flag("classic: item refused on the player's own turn");
  // ...and that free turn must also hand the turn back
  const ok2 = await until(() => window.DEBUG.game.battle?.turnPhase === "player" || !window.DEBUG.game.battle);
  if (!ok2) flag("classic: free turn after item never came back to player");
  // finish the fight
  await page.evaluate(() => { const b = window.DEBUG.game.battle; if (b) { b.enemy().hp = 1; b.classicMove(0); } });
  const ended = await until(() => !window.DEBUG.game.battle);
  note(`classic battle ended=${ended}`);
  if (!ended) flag("classic: battle did not end after enemy KO");
}

// ---------------------------------------------------------------- arena
console.log("== arena: spam moves/dodge/items through a full fight");
await page.evaluate(() => { window.DEBUG.style("arena"); window.DEBUG.heal(); window.DEBUG.battle(16, 6); });
await until(() => !!window.DEBUG.game.battle);
for (let i = 0; i < 24; i++) {
  const over = await page.evaluate((i) => {
    const g = window.DEBUG.game, b = g.battle;
    if (!b || b.over) return true;
    b.useMove("ally", i % 2);
    if (i % 5 === 0) b.tryDodge();
    if (i % 7 === 0) g.useItem("potion", 0, true);
    return false;
  }, i);
  if (over) break;
  await page.waitForTimeout(400);
}
{
  // wait out cooldowns, then land the finisher
  await page.evaluate(() => { const b = window.DEBUG.game.battle; if (b) b.enemy().hp = 1; });
  for (let k = 0; k < 14; k++) {
    const done = await page.evaluate(() => {
      const b = window.DEBUG.game.battle;
      if (!b) return true;
      if (b.cds.ally[0] <= 0 && b.lock.ally <= 0) b.useMove("ally", 0);
      return false;
    });
    if (done) break;
    await page.waitForTimeout(700);
  }
  const ended = await until(() => !window.DEBUG.game.battle);
  note(`arena battle ended=${ended}`);
  if (!ended) flag("arena: battle stuck after KO attempts");
}

// ---------------------------------------------------------------- fp
console.log("== fp: auto-possess, dash, aim mid-possession, win");
await page.evaluate(() => { window.DEBUG.style("fp"); window.DEBUG.heal(); window.DEBUG.battle(19, 4); });
await until(() => !!window.DEBUG.game.battle);
{
  const possessed = await until(() => window.DEBUG.game.battle?.possessed === true, 30000);
  note(`auto-possessed=${possessed}`);
  if (!possessed) flag("fp: did not auto-possess after battle start");
}
for (let i = 0; i < 10; i++) {
  const over = await page.evaluate((i) => {
    const g = window.DEBUG.game, b = g.battle;
    if (!b || b.over) return true;
    if (i === 4) { g.startAim(); }          // auto-eject + aim
    if (i === 5) { g.cancelAim(); }
    b.useMove("ally", i % 2);
    if (i % 3 === 0) b.possessDash();
    return false;
  }, i);
  if (over) break;
  await page.waitForTimeout(450);
}
{
  // after the aim interruption it should dive back in
  const rePossessed = await until(() => window.DEBUG.game.battle == null || window.DEBUG.game.battle.possessed === true, 30000);
  if (!rePossessed) flag("fp: never re-possessed after aim interruption");
  await page.evaluate(() => { const b = window.DEBUG.game.battle; if (b) { b.enemy().hp = 0; b.faint("enemy"); } });
  const ended = await until(() => !window.DEBUG.game.battle);
  note(`fp battle ended=${ended}`);
  if (!ended) flag("fp: battle stuck after enemy faint");
  const ptr = await page.evaluate(() => document.pointerLockElement != null && !window.DEBUG.game.battle);
  void ptr; // pointer lock isn't grabbed headless; possession flag checked via battle null
}

// ---------------------------------------------------------------- trainer (classic)
console.log("== trainer battle (classic): ball ban, no-run, full multi-mon fight");
await page.evaluate(() => { window.DEBUG.style("classic"); window.DEBUG.heal(); });
// leftover learn/evolve prompts from earlier fights block ambushes — clear them
await page.evaluate(() => { const u = window.DEBUG.game.ui; for (let i = 0; i < 8 && u.modalOpen; i++) u.closeTop(); });
const fired = await page.evaluate(() => window.DEBUG.rocket());
note(`ambush fired=${fired}`);
let started = false;
for (let i = 0; i < 50 && !started; i++) {
  started = await page.evaluate(() => {
    const g = window.DEBUG.game;
    if (g.battle) return true;
    if (g.ui.dialogActive) g.ui.dialogAdvance();
    return false;
  });
  if (!started) await page.waitForTimeout(400);
}
{
  note(`rocket battle started=${started}`);
  if (!started) flag("trainer: rocket battle failed to start");
  else {
    const r = await page.evaluate(() => {
      const g = window.DEBUG.game, b = g.battle;
      const can = g.canThrowNow(false);
      b.tryRun();
      return { can, over: b.over };
    });
    if (r.can) flag("trainer: canThrowNow allowed a ball in a trainer battle");
    if (r.over) flag("trainer: tryRun escaped a trainer battle");
    let last = "";
    for (let i = 0; i < 140; i++) {
      const st = await page.evaluate(() => {
        const b = window.DEBUG.game.battle;
        if (!b) return { done: true };
        if (b.turnPhase === "player" && !b.over) { b.enemy().hp = Math.min(b.enemy().hp, 10); b.classicMove(0); }
        return { done: false, idx: b.trainerPartyIdx, foeHp: Math.round(b.enemy()?.hp ?? -1), phase: b.turnPhase };
      });
      if (st.done) { last = "done"; break; }
      const cur = `mon#${st.idx} hp=${st.foeHp} ${st.phase}`;
      if (cur !== last) { note("  ... " + cur); last = cur; }
      await page.waitForTimeout(700);
    }
    const ended = await until(() => !window.DEBUG.game.battle, 60000);
    note(`trainer fight ended=${ended}`);
    if (!ended) flag("trainer: classic trainer battle never finished");
  }
}

// ---------------------------------------------------------------- faint -> forced switch
console.log("== classic: your mon faints -> forced switch modal -> battle continues");
await page.evaluate(() => {
  const D = window.DEBUG; D.style("classic"); D.heal();
  if (D.game.state.party.length < 2) D.addmon(19, 12);
  D.battle(65, 30);   // fast Alakazam: it moves first and finishes our 1hp lead
});
await until(() => !!window.DEBUG.game.battle);
{
  // pin our lead to 1hp and keep poking until the (much faster, much stronger)
  // enemy lands its reply — the lead must faint and the switch modal must open
  for (let i = 0; i < 30; i++) {
    const st = await page.evaluate(() => {
      const g = window.DEBUG.game, b = g.battle;
      if (!b) return "gone";
      if (b.allyMon.hp <= 0) return "fainted";
      b.allyMon.hp = 1;
      if (b.turnPhase === "player") b.classicMove(1);   // weak move: don't KO it first
      return "alive";
    });
    if (st !== "alive") break;
    await page.waitForTimeout(800);
  }
  const modal = await until(() => !document.querySelector("#m-switch")?.classList.contains("hidden"), 40000);
  note(`forced-switch modal=${modal}`);
  if (!modal) {
    const hp = await page.evaluate(() => window.DEBUG.game.battle?.allyMon?.hp);
    if (hp != null && hp <= 0) flag("classic: ally at 0hp but no forced-switch modal");
    else note("(ally survived the round — skipping modal leg)");
    await page.evaluate(() => window.DEBUG.game.battle?.end("fled"));
  } else {
    await page.evaluate(() => {
      document.querySelector("#switchlist .moncard")?.click();   // already filtered to healthy mons
    });
    const swapped = await until(() => {
      const b = window.DEBUG.game.battle;
      return !b || (b.allyMon.hp > 0 && b.turnPhase === "player");
    }, 30000);
    note(`fielded healthy mon=${swapped}`);
    if (!swapped) flag("classic: forced switch did not field a healthy mon");
    await page.evaluate(() => window.DEBUG.game.battle?.end("fled"));
  }
}

console.log(issues.length ? `\n${issues.length} ISSUE(S):\n - ` + issues.join("\n - ") : "\nNo issues caught by the probe.");
await browser.close();
process.exit(issues.length ? 1 : 0);
