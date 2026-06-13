// quick boot probe: load the page, print console + page errors
import { chromium } from "playwright-core";
const URL = process.env.KANTO_URL || "http://localhost:5175";
const browser = await chromium.launch({ channel: "chrome", headless: true, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--mute-audio"] });
const page = await browser.newPage();
page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") console.log("[console]", m.type(), m.text().slice(0, 400)); });
page.on("pageerror", (e) => console.log("[pageerror]", (e.stack || String(e)).slice(0, 1200)));
await page.goto(URL, { waitUntil: "load" });
await page.waitForTimeout(6000);
console.log("DEBUG defined:", await page.evaluate(() => typeof window.DEBUG));
await browser.close();
