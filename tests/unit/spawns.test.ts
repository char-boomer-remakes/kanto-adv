import { describe, it, expect } from "vitest";
import { SPAWNS, SPECIES_ZONES } from "../../src/game";
import { DEX } from "../../src/data.js";

// Each SPAWNS zone is { pool, water }, where every entry is
// [species, weight, minLv, maxLv, flag?].

const entries = (zone: any) => [...(zone.pool || []), ...(zone.water || [])];

describe("SPAWNS table integrity", () => {
  it("references only valid species ids (1..151)", () => {
    for (const [name, zone] of Object.entries(SPAWNS)) {
      for (const e of entries(zone)) {
        const sp = e[0];
        expect(DEX[sp], `${name}: species ${sp}`).toBeTruthy();
        expect(sp).toBeGreaterThanOrEqual(1);
        expect(sp).toBeLessThanOrEqual(151);
      }
    }
  });

  it("uses positive weights and sane, ordered level ranges", () => {
    for (const [name, zone] of Object.entries(SPAWNS)) {
      for (const e of entries(zone)) {
        const [, weight, minLv, maxLv] = e;
        expect(weight, `${name}: weight`).toBeGreaterThan(0);
        expect(minLv, `${name}: minLv`).toBeGreaterThanOrEqual(1);
        expect(maxLv, `${name}: maxLv`).toBeLessThanOrEqual(100);
        expect(minLv, `${name}: minLv<=maxLv`).toBeLessThanOrEqual(maxLv);
      }
    }
  });

  it("uses only recognized rarity flags", () => {
    const ok = new Set(["N", "D", "n"]);
    for (const [name, zone] of Object.entries(SPAWNS)) {
      for (const e of entries(zone)) {
        if (e.length > 4 && e[4] != null) {
          expect(ok.has(e[4]), `${name}: flag ${e[4]}`).toBe(true);
        }
      }
    }
  });
});

describe("SPECIES_ZONES reverse index", () => {
  it("contains every (species, zone) pair found in SPAWNS", () => {
    for (const [name, zone] of Object.entries(SPAWNS)) {
      for (const e of entries(zone)) {
        const sp = e[0];
        expect(SPECIES_ZONES[sp], `species ${sp} indexed`).toBeTruthy();
        expect(SPECIES_ZONES[sp].has(name), `${sp} -> ${name}`).toBe(true);
      }
    }
  });

  it("places the legendaries at their fixed shrines", () => {
    expect(SPECIES_ZONES[144].has("seafoam")).toBe(true);       // Articuno
    expect(SPECIES_ZONES[145].has("power-plant")).toBe(true);   // Zapdos
    expect(SPECIES_ZONES[146].has("victory-road")).toBe(true);  // Moltres
    expect(SPECIES_ZONES[150].has("cerulean-cave")).toBe(true); // Mewtwo
    expect(SPECIES_ZONES[151].has("vermilion")).toBe(true);     // Mew
  });
});
