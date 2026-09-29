import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { LEGAL_PAGES, legalDisplayText } from "../src/utils/legal-pages.js";

// The legal pages (/privacy, /terms, /guidelines, issue sard-app#2): readable without signing in, each with its own
// title and canonical, the whole published text, and links to the site that stay in the app. Runs against a production
// build (playwright.config.js: the dev server drops the canonical). The API is mocked; the pages don't need it.

const API = "https://api-sareed.runasp.net";
const SITE = "https://www.sardnovels.com";

const normalize = (text) => text.replace(/\s+/g, " ").trim();

/** Each line of a Markdown text as plain text: without heading and list marks, bold, link targets or table pipes. */
const textLines = (markdown) =>
  markdown
    .split("\n")
    .filter((line) => line.trim() && !/^\s*-{3,}\s*$/.test(line) && !/^\s*\|?\s*:?-{3,}/.test(line))
    .flatMap((line) => (line.trim().startsWith("|") ? line.trim().replace(/^\||\|$/g, "").split("|") : [line]))
    .map((line) => {
      const text = line.trim();
      const unmarked = /^#{1,6}\s/.test(text) ? text.replace(/^#{1,6}\s+/, "") : text.replace(/^(?:[-*+]|\d+[.)])\s+/, "");
      return normalize(unmarked.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/\*\*/g, ""));
    })
    .filter(Boolean);

const publishedText = (legal) =>
  legalDisplayText(readFileSync(new URL(`../src/content/legal/${legal.file}`, import.meta.url), "utf8"));

test.beforeEach(async ({ page }) => {
  await page.route(`${API}/**`, (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === "/api/competition") {
      return route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
    }
    return route.fulfill({ status: 404, contentType: "application/json", body: "{}" });
  });
});

for (const legal of LEGAL_PAGES) {
  test(`${legal.path}: public, its own title and canonical, the whole text`, async ({ page }) => {
    const response = await page.goto(legal.path);
    expect(response.status()).toBe(200);

    const article = page.locator("main article");
    await expect(article.locator("h1")).toBeVisible();
    // Signed out and still here: no redirect to the sign-in page.
    await expect(page).toHaveURL(`${legal.path}`);

    await expect(page).toHaveTitle(legal.title);
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveCount(1);
    await expect(canonical).toHaveAttribute("href", `${SITE}${legal.path}`);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", legal.description);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", `${SITE}${legal.path}`);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", legal.title);
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");

    // Every line of the published text is on the page, and the owner's questions section is not.
    const shown = normalize(await article.textContent());
    const missing = textLines(publishedText(legal)).filter((line) => !shown.includes(line));
    expect(missing).toEqual([]);
    expect(shown).toContain("آخر تحديث: 28 سبتمبر 2026");
    expect(shown).not.toContain("أسئلة للمالك");

    // The footer links the three pages and marks this one.
    const footerLinks = page.getByRole("contentinfo").getByRole("navigation", { name: "الشروط والسياسات" });
    for (const other of LEGAL_PAGES) {
      await expect(footerLinks.getByRole("link", { name: other.name })).toHaveAttribute("href", other.path);
    }
    await expect(footerLinks.getByRole("link", { name: legal.name })).toHaveAttribute("aria-current", "page");
  });
}

test("links to the site stay in the app; other sites open in a new tab", async ({ page }) => {
  await page.goto("/terms");
  // A full page load would drop this.
  await page.evaluate(() => {
    window.__sameDocument = true;
  });

  const terms = page.locator("main article");
  await terms.getByRole("link", { name: "إرشادات المجتمع" }).first().click();
  await expect(page).toHaveURL("/guidelines");
  await expect(page).toHaveTitle("إرشادات المجتمع | سرد");
  await expect(page.locator("main article h1")).toHaveText("إرشادات مجتمع سرد");

  await page.locator("main article").getByRole("link", { name: "شروط الاستخدام" }).first().click();
  await expect(page).toHaveURL("/terms");
  const refund = page.locator("main article").getByRole("link", { name: "سياسة الاسترداد في Google Play" });
  await expect(refund).toHaveAttribute("href", "https://support.google.com/googleplay/answer/2479637");
  await expect(refund).toHaveAttribute("target", "_blank");
  await expect(refund).toHaveAttribute("rel", "noopener noreferrer");

  await page.locator("main article").getByRole("link", { name: "سياسة الخصوصية" }).first().click();
  await expect(page).toHaveURL("/privacy");
  const privacy = page.locator("main article");
  await expect(privacy.locator('a[href="mailto:support@sardnovels.com"]').first()).toBeVisible();
  await privacy.getByRole("link", { name: "حذف الحساب" }).first().click();
  await expect(page).toHaveURL("/delete-account");

  expect(await page.evaluate(() => window.__sameDocument)).toBe(true);
});

test("the landing page and the sign-in pages link the three pages", async ({ page }) => {
  for (const path of ["/", "/login", "/register"]) {
    await page.goto(path);
    const links = page.getByRole("navigation", { name: "الشروط والسياسات" });
    for (const legal of LEGAL_PAGES) {
      await expect(links.getByRole("link", { name: legal.name })).toHaveAttribute("href", legal.path);
    }
  }
});

test.describe("on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("the page never scrolls sideways; a wide table scrolls in its own box", async ({ page }) => {
    for (const legal of LEGAL_PAGES) {
      await page.goto(legal.path);
      await expect(page.locator("main article h1")).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `${legal.path} scrolls sideways`).toBe(0);
    }

    await page.goto("/privacy");
    const boxes = page.locator("main article table").locator("xpath=..");
    await expect(boxes).toHaveCount(3);
    // The service providers' table has three columns: wider than a phone, so its box scrolls.
    const providers = await boxes.nth(1).evaluate((box) => ({ width: box.clientWidth, content: box.scrollWidth }));
    expect(providers.content).toBeGreaterThan(providers.width);
  });
});
