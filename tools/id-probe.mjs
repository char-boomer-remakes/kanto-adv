// which $("...") IDs referenced by ui.ts are missing from the served DOM?
import { chromium } from "playwright-core";
import fs from "fs";
const URL = process.env.KANTO_URL || "http://localhost:5175";
const src = fs.readFileSync(new globalThis.URL("../src/ui.ts", import.meta.url), "utf8");
const ids = [...new Set([...src.matchAll(/\$\("([a-zA-Z0-9_-]+)"\)/g)].map((m) => m[1]))];
const browser = await chromium.launch({ channel: "chrome", headless: true, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--mute-audio"] });
const page = await browser.newPage();
await page.goto(URL, { waitUntil: "load" });
await page.waitForTimeout(1500);
const missing = await page.evaluate((list) => list.filter((id) => !document.getElementById(id)), ids);
console.log("missing ids:", JSON.stringify(missing));
await browser.close();
