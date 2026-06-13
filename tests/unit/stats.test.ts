import { describe, it, expect } from "vitest";
import {
  calcStats,
  xpForLevel,
  movesAtLevel,
  addXp,
  evolveMon,
  makeMon,
} from "../../src/game";
import { DEX } from "../../src/data.js";

// Bulbasaur(1), Charmander(4), Caterpie(10), Pidgey(16), Pikachu(25) cover the
// growth groups and evolution shapes referenced below.

describe("calcStats — Gen 1 formula with stat experience", () => {
  const maxDV = { hp: 15, atk: 15, def: 15, spe: 15, spc: 15 };

  it("computes a known stat line (Charmander Lv50, max DVs, no stat-exp)", () => {
    // core(base,dv) = floor(((base+dv)*2 + 0) * L / 100)
    // hp = core(39,15) + L + 10 ; atk/def/spe/spc = core + 5
    const s = calcStats(4, 50, maxDV);
    expect(s.maxhp).toBe(Math.floor((39 + 15) * 2 * 50 / 100) + 50 + 10);
    expect(s.atk).toBe(Math.floor((52 + 15) * 2 * 50 / 100) + 5);
    expect(s.def).toBe(Math.floor((43 + 15) * 2 * 50 / 100) + 5);
    expect(s.spe).toBe(Math.floor((65 + 15) * 2 * 50 / 100) + 5);
    expect(s.spc).toBe(Math.floor((50 + 15) * 2 * 50 / 100) + 5);
  });

  it("adds the stat-experience term: floor(ceil(sqrt(statExp))/4)", () => {
    const dv = { hp: 0, atk: 0, def: 0, spe: 0, spc: 0 };
    const base = calcStats(4, 50, dv);
    const withExp = calcStats(4, 50, dv, { hp: 0, atk: 65025, def: 0, spe: 0, spc: 0 });
    // sqrt(65025) = 255 -> floor(255/4) = 63 extra stat points, * L/100
    const ev = Math.floor(Math.ceil(Math.sqrt(65025)) / 4);
    const expectedAtk = Math.floor(((52 + 0) * 2 + ev) * 50 / 100) + 5;
    expect(withExp.atk).toBe(expectedAtk);
    expect(withExp.atk).toBeGreaterThan(base.atk);
  });

  it("HP gets the +L+10 bonus while other stats get +5", () => {
    const s = calcStats(1, 100, maxDV);
    const core = (b: number) => Math.floor((b + 15) * 2 * 100 / 100);
    expect(s.maxhp).toBe(core(45) + 100 + 10);
    expect(s.atk).toBe(core(49) + 5);
  });
});

describe("xpForLevel — the four growth groups", () => {
  const speciesByGrowth = {
    fast: 35,        // Clefairy
    mediumfast: 10,  // Caterpie
    mediumslow: 1,   // Bulbasaur
    slow: 58,        // Growlithe
  };

  it("matches each authentic growth curve at level 50", () => {
    const n = 50;
    expect(xpForLevel(speciesByGrowth.fast, n)).toBe(Math.floor((4 * n ** 3) / 5));
    expect(xpForLevel(speciesByGrowth.mediumfast, n)).toBe(n ** 3);
    expect(xpForLevel(speciesByGrowth.mediumslow, n)).toBe(
      Math.max(0, Math.floor((6 / 5) * n ** 3) - 15 * n * n + 100 * n - 140),
    );
    expect(xpForLevel(speciesByGrowth.slow, n)).toBe(Math.floor((5 * n ** 3) / 4));
  });

  it("is monotonically non-decreasing across levels", () => {
    for (const sp of Object.values(speciesByGrowth)) {
      let prev = -1;
      for (let l = 1; l <= 100; l++) {
        const x = xpForLevel(sp, l);
        expect(x).toBeGreaterThanOrEqual(prev);
        prev = x;
      }
    }
  });
});

describe("movesAtLevel", () => {
  it("returns at most four moves, the latest learned", () => {
    const moves = movesAtLevel(1, 100);
    expect(moves.length).toBeLessThanOrEqual(4);
    // Bulbasaur knows Tackle(33)/Growl(45) at level 1
    expect(movesAtLevel(1, 1)).toContain(33);
  });

  it("only includes moves at or below the given level", () => {
    const early = movesAtLevel(4, 1); // Charmander: Scratch(10), Growl(45)
    expect(early).toEqual([10, 45]);
  });
});

describe("addXp — level/learn/evolve events", () => {
  it("levels up and reports a level event", () => {
    const mon = makeMon(4, 5);
    const startLv = mon.lv;
    const events = addXp(mon, xpForLevel(4, 6) - mon.xp);
    expect(mon.lv).toBeGreaterThan(startLv);
    expect(events.some((e) => e.type === "level")).toBe(true);
  });

  it("emits an evolve event at the authentic level (Charmander -> 16)", () => {
    const mon = makeMon(4, 15);
    const events = addXp(mon, xpForLevel(4, 16) - mon.xp);
    const evo = events.find((e) => e.type === "evolve");
    expect(evo).toBeTruthy();
    expect((evo as any).to).toBe(5); // Charmeleon
  });

  it("emits learn events for moves gained on level-up", () => {
    const mon = makeMon(4, 8);
    const events = addXp(mon, xpForLevel(4, 9) - mon.xp);
    // Charmander learns Ember(52) at level 9
    expect(events.some((e) => e.type === "learn" && (e as any).move === 52)).toBe(true);
  });

  it("never exceeds level 100", () => {
    const mon = makeMon(1, 99);
    addXp(mon, 10 ** 9);
    expect(mon.lv).toBe(100);
  });
});

describe("evolveMon", () => {
  it("switches species, recomputes stats, and carries HP forward", () => {
    const mon = makeMon(4, 30);
    mon.hp = 1;
    const beforeMax = mon.maxhp;
    evolveMon(mon, 5);
    expect(mon.sp).toBe(5);
    expect(mon.maxhp).toBe(calcStats(5, 30, mon.ivs, mon.sexp).maxhp);
    // HP gain from the evolution carries over, clamped to >= 1
    expect(mon.hp).toBe(Math.min(1 + (mon.maxhp - beforeMax), mon.maxhp));
    expect(mon.hp).toBeGreaterThanOrEqual(1);
  });
});

describe("makeMon", () => {
  it("produces a fully-formed mon with PP per move and full HP", () => {
    const mon = makeMon(25, 12);
    expect(mon.sp).toBe(25);
    expect(mon.lv).toBe(12);
    expect(mon.hp).toBe(mon.maxhp);
    expect(mon.pp.length).toBe(mon.moves.length);
    expect(mon.moves.length).toBeGreaterThan(0);
    expect(DEX[mon.sp]).toBeTruthy();
  });
});
