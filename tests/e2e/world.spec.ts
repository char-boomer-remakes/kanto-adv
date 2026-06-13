import { test, expect, startNewGame } from "./fixtures";

// Ported from section 2 ("Kanto zones") of tools/e2e-test.mjs. Landmark
// coordinates are authored in design space; the world is expanded by MAP_SCALE
// (window.WS), so we scale them on the way into world.zoneAt.
test.describe("world / Kanto layout", () => {
  test.beforeEach(async ({ bootedPage: page }) => {
    await startNewGame(page);
  });

  test("zones resolve at their real RBY landmarks", async ({ bootedPage: page }) => {
    const zones = await page.evaluate(() => {
      const w = window.DEBUG.game.world;
      const z = (x: number, zz: number) => w.zoneAt(x * window.WS, zz * window.WS);
      return {
        pallet: z(-95, 130), forest: z(-100, -55), mtmoon: z(-15, -175),
        ceruleancave: z(40, -200), seafoam: z(-30, 245), powerplant: z(247, -90),
        victory: z(-200, -100), lavender: z(205, -25), saffron: z(75, -25),
        celadon: z(-30, -25), fuchsia: z(-30, 175), cinnabar: z(-95, 262),
        rocktunnel: z(195, -125), cycling: z(-30, 80), indigo: z(-212, -198),
        causeway: z(214, 50),
      };
    });
    expect(zones).toMatchObject({
      pallet: "pallet", forest: "viridian-forest", mtmoon: "mtmoon-cave",
      ceruleancave: "cerulean-cave", seafoam: "seafoam", powerplant: "power-plant",
      victory: "victory-road", lavender: "lavender", saffron: "saffron",
      celadon: "celadon", fuchsia: "fuchsia", cinnabar: "cinnabar",
      rocktunnel: "rock-tunnel", cycling: "cycling-road", causeway: "route-12",
      indigo: "indigo",
    });
  });

  test("all 8 gyms and the full trainer roster are placed; cave gate starts sealed", async ({ bootedPage: page }) => {
    const layout = await page.evaluate(() => {
      const w = window.DEBUG.game.world;
      return {
        gyms: Object.keys(w.gymPos).length,
        trainers: window.DEBUG.game.trainers.length,
        gateClosed: !!w.caveGateBox,
      };
    });
    expect(layout.gyms).toBe(8);
    expect(layout.trainers).toBeGreaterThanOrEqual(28);
    expect(layout.gateClosed).toBe(true);
  });

  test("zone-authentic wild spawns: Viridian Forest pulls from its table", async ({ bootedPage: page }) => {
    // drive spawnTick directly so the check is decoupled from the slow headless clock
    const spawnCheck = await page.evaluate(() => {
      const g = window.DEBUG.game;
      g.cheat("tp", "forest");
      g.wilds.forEach((w: any) => (w.life = 0));
      for (let i = 0; i < 120 && g.wilds.length < 26; i++) g.spawnTick();
      const FOREST_POOL = [10, 11, 13, 14, 25, 17, 16, 19, 29, 32, 122];
      const inForest = g.wilds
        .map((w: any) => ({ sp: w.mon.sp, zone: g.world.zoneAt(w.pos().x, w.pos().z) }))
        .filter((w: any) => w.zone === "viridian-forest");
      return {
        total: g.wilds.length,
        inForest: inForest.length,
        legal: inForest.every((w: any) => FOREST_POOL.includes(w.sp)),
      };
    });
    expect(spawnCheck.total).toBeGreaterThan(3);
    expect(spawnCheck.inForest).toBeGreaterThan(0);
    expect(spawnCheck.legal).toBe(true);
  });
});
