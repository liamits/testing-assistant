import { chromium } from "playwright";

export async function runActionsWithPlaywright(actions, io, sessionId) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const results = [];

  for (const action of actions) {
    const log = { action, status: "running", timestamp: new Date().toISOString() };
    io?.to(sessionId).emit("runner:log", log);

    try {
      switch (action.action) {
        case "navigate":
          await page.goto(action.value, { waitUntil: "networkidle" });
          break;
        case "fill":
          await page.fill(action.selector, action.value);
          break;
        case "click":
          await page.click(action.selector);
          break;
        case "wait":
          await page.waitForTimeout(action.ms || 1000);
          break;
        case "screenshot": {
          const buffer = await page.screenshot({ fullPage: true });
          const base64 = buffer.toString("base64");
          log.screenshot = `data:image/png;base64,${base64}`;
          break;
        }
        case "expect_url": {
          const currentUrl = page.url();
          const pass = currentUrl.includes(action.value);
          if (!pass) throw new Error(`URL mismatch: expected "${action.value}", got "${currentUrl}"`);
          break;
        }
        case "expect_text": {
          const el = page.locator(action.selector);
          await el.waitFor({ timeout: 5000 });
          const text = await el.innerText();
          if (!text.includes(action.value)) {
            throw new Error(`Text mismatch: expected "${action.value}", got "${text}"`);
          }
          break;
        }
        case "expect_visible": {
          await page.locator(action.selector).waitFor({ state: "visible", timeout: 5000 });
          break;
        }
        default:
          log.warning = `Unknown action: ${action.action}`;
      }

      log.status = "passed";
      results.push({ ...log });
      io?.to(sessionId).emit("runner:log", { ...log });
    } catch (err) {
      log.status = "failed";
      log.error = err.message;
      // Screenshot on failure
      try {
        const buf = await page.screenshot();
        log.screenshot = `data:image/png;base64,${buf.toString("base64")}`;
      } catch {}
      results.push({ ...log });
      io?.to(sessionId).emit("runner:log", { ...log });
      break; // stop on first failure
    }
  }

  await browser.close();
  io?.to(sessionId).emit("runner:done", { results });
  return results;
}
