import { test, expect, startNewGame } from "./fixtures";

// Ported from section 18 ("save/load") of tools/e2e-test.mjs. We build a small
// amount of state via DEBUG, persist it, reload the page, and confirm the title
// screen advertises the run and Continue restores it.
test.describe("save / load round-trip", () => {
  test("persists state, then reload + Continue restores it", async ({ bootedPage: page }) => {
    await startNewGame(page, { name: "Red", rival: "Gary", starter: 4 });

    // build a recognizable save: a second mon, all 8 badges, some playtime
    const saved = await page.evaluate(() => {
      const g = window.DEBUG.game;
      window.DEBUG.addmon(25, 10); // Pikachu joins the party
      g.cheat("badges");           // all 8 badges + opens the cave gate
      g.state.playT = 600;
      g.save();
      return JSON.parse(localStorage.getItem("kanto_adventure_save_v1")!);
    });

    expect(saved.v).toBe(5);
    expect(saved.party.length).toBeGreaterThanOrEqual(2);
    expect(saved.badges.length).toBe(8);
    expect(saved.party.every((m: any) => typeof m.hap === "number")).toBe(true);
    expect(saved.name).toBe("Red");
    expect(saved.rival).toBe("Gary");
    expect(saved.playT).toBeGreaterThan(0);

    // reload lands on the title screen; File 1 should advertise the run
    await page.reload({ waitUntil: "load" });
    await page.waitForFunction(() => typeof window.DEBUG !== "undefined", null, { timeout: 15000 });

    const cont = await page.evaluate(() => {
      const shown = !document.getElementById("title")!.classList.contains("hidden");
      const card = document.querySelector("#slots .slotcard")?.textContent || "";
      window.DEBUG.enter(); // Continue
      return { shown, card, hidden: document.getElementById("title")!.classList.contains("hidden") };
    });
    expect(cont.shown).toBe(true);
    expect(cont.card).toContain("Red");
    expect(cont.card).toContain("8"); // badge count on the slot card
    expect(cont.hidden).toBe(true);

    const reloaded = await page.evaluate(() => {
      const g = window.DEBUG.game;
      return {
        started: g.state.started,
        party: g.state.party.length,
        hasIvs: !!g.state.party[0].ivs,
        gateOpen: !g.world.caveGateBox,
        name: g.state.name,
      };
    });
    expect(reloaded.started).toBe(true);
    expect(reloaded.party).toBeGreaterThanOrEqual(2);
    expect(reloaded.hasIvs).toBe(true);
    expect(reloaded.gateOpen).toBe(true);
    expect(reloaded.name).toBe("Red");
  });
});
