import { test, expect, startNewGame } from "./fixtures";

// Thin end-to-end guarantee: the app boots, the title screen is sane, a new
// game reaches the live world, and nothing throws along the way. This replaces
// the "no console/page errors during run" check from the old monolithic suite.
test.describe("smoke", () => {
  test("boots to a clean title screen and into the world without errors", async ({ bootedPage: page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
    page.on("console", (m) => {
      if (m.type() === "error" && !m.text().includes("GL Driver Message")) {
        errors.push("console: " + m.text());
      }
    });

    const title = await page.evaluate(() => ({
      visible: !document.getElementById("title")!.classList.contains("hidden"),
      slots: document.querySelectorAll("#slots .slotcard").length,
      empty: document.querySelectorAll("#slots .slotcard.empty").length,
      blocking: window.DEBUG.game.ui.blocking,
    }));
    expect(title.visible).toBe(true);
    expect(title.slots).toBe(3);
    expect(title.empty).toBe(3);
    expect(title.blocking).toBe(true);

    await startNewGame(page);

    const inWorld = await page.evaluate(() => ({
      titleHidden: document.getElementById("title")!.classList.contains("hidden"),
      started: window.DEBUG.game.state.started,
      party: window.DEBUG.game.state.party.length,
    }));
    expect(inWorld.titleHidden).toBe(true);
    expect(inWorld.started).toBe(true);
    expect(inWorld.party).toBe(1);

    // give the loop a few frames to run, then assert it stayed clean
    await page.waitForTimeout(1000);
    expect(errors, errors.slice(0, 5).join(" | ")).toEqual([]);
  });
});
