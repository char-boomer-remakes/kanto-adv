import { describe, it, expect } from "vitest";
import { typeMult, DEX } from "../../src/data.js";

// typeMult(attackingType, [defendingType, ...]) multiplies the Gen 1 type chart
// across every defending type.

describe("typeMult — single-type matchups", () => {
  it("applies super-effective (2x) and not-very-effective (0.5x)", () => {
    expect(typeMult("fire", ["grass"])).toBe(2);
    expect(typeMult("water", ["fire"])).toBe(2);
    expect(typeMult("fire", ["water"])).toBe(0.5);
  });

  it("returns 1x for neutral matchups", () => {
    expect(typeMult("normal", ["water"])).toBe(1);
    expect(typeMult("fire", ["electric"])).toBe(1);
  });
});

describe("typeMult — immunities (0x)", () => {
  it("ground does nothing to flying", () => {
    expect(typeMult("ground", ["flying"])).toBe(0);
  });

  it("ghost and normal are mutually immune", () => {
    expect(typeMult("ghost", ["normal"])).toBe(0);
    expect(typeMult("normal", ["ghost"])).toBe(0);
  });

  it("electric does nothing to ground", () => {
    expect(typeMult("electric", ["ground"])).toBe(0);
  });
});

describe("typeMult — dual-type stacking", () => {
  it("stacks two weaknesses to 4x (rock vs Charizard fire/flying)", () => {
    const charizard = DEX[6].types; // ["fire","flying"]
    expect(typeMult("rock", charizard)).toBe(4);
  });

  it("stacks resistance and weakness back to neutral", () => {
    // water vs Charizard: water>fire = 2, water vs flying = 1 -> 2x
    expect(typeMult("water", DEX[6].types)).toBe(2);
  });

  it("collapses to 0x when any defending type is immune", () => {
    // ground vs Gyarados (water/flying): ground>water = 2, ground vs flying = 0
    expect(typeMult("ground", DEX[130].types)).toBe(0);
  });

  it("electric hits Gyarados (water/flying) for 4x", () => {
    expect(typeMult("electric", DEX[130].types)).toBe(4);
  });
});
