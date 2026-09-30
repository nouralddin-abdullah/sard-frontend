import { test, expect } from "@playwright/test";

// The Android beta against a production build (playwright.config.js: the dev server drops react-helmet-async's tags):
// the join page's title, description, canonical and share tags; its pictures, WebP at the sizes the page asks for and a
// JPEG share image for link previews; and no layout shift from the banner. The API is mocked.

const API = "https://api-sareed.runasp.net";
const SITE = "https://www.sardnovels.com";
const TITLE = "تطبيق سرد لأندرويد — انضم إلى التجربة";

test.beforeEach(async ({ page }) => {
  await page.route(`${API}/**`, (route) => {
    const path = new URL(route.request().url()).pathname;
    const body = path === "/api/competition" ? "[]" : "{}";
    return route.fulfill({ status: path === "/api/competition" ? 200 : 404, contentType: "application/json", body });
  });
});

/** A JPEG's width and height, from its frame header. */
const jpegSize = (bytes) => {
  for (let i = 2; i + 9 < bytes.length; ) {
    if (bytes[i] !== 0xff) return null;
    const marker = bytes[i + 1];
    if (marker >= 0xc0 && marker <= 0xc2) return { width: bytes.readUInt16BE(i + 7), height: bytes.readUInt16BE(i + 5) };
    i += 2 + bytes.readUInt16BE(i + 2);
  }
  return null;
};

test("/android: its own title, description, canonical and share tags", async ({ page }) => {
  const response = await page.goto("/android");
  expect(response.status()).toBe(200);
  await expect(page.locator("main h1")).toHaveText("سرد على هاتفك");

  await expect(page).toHaveTitle(TITLE);
  const canonical = page.locator('link[rel="canonical"]');
  await expect(canonical).toHaveCount(1);
  await expect(canonical).toHaveAttribute("href", `${SITE}/android`);

  const meta = (attribute, name) => page.locator(`meta[${attribute}="${name}"]`);
  // Each tag once: the page's own replace index.html's defaults.
  for (const [attribute, name] of [
    ["name", "description"],
    ["property", "og:title"],
    ["property", "og:description"],
    ["property", "og:url"],
    ["property", "og:image"],
    ["name", "twitter:card"],
    ["name", "twitter:title"],
    ["name", "twitter:description"],
    ["name", "twitter:image"],
  ]) {
    await expect(meta(attribute, name), `${name} once`).toHaveCount(1);
  }
  const description = await meta("name", "description").getAttribute("content");
  expect(description.length).toBeGreaterThan(100);
  expect(description.length).toBeLessThanOrEqual(160);
  await expect(meta("property", "og:title")).toHaveAttribute("content", TITLE);
  await expect(meta("property", "og:description")).toHaveAttribute("content", description);
  await expect(meta("property", "og:url")).toHaveAttribute("content", `${SITE}/android`);
  await expect(meta("property", "og:image")).toHaveAttribute("content", `${SITE}/og-android.jpg`);
  await expect(meta("name", "twitter:card")).toHaveAttribute("content", "summary_large_image");
  await expect(meta("name", "twitter:title")).toHaveAttribute("content", TITLE);
  await expect(meta("name", "twitter:image")).toHaveAttribute("content", `${SITE}/og-android.jpg`);
});

test("the pictures: WebP at the sizes the page asks for, and a small JPEG for link previews", async ({ page, request }) => {
  await page.goto("/android");
  await expect(page.locator("main h1")).toBeVisible();
  const candidates = await page
    .locator("main img")
    .evaluateAll((images) => images.flatMap((img) => img.srcset.split(",").map((candidate) => candidate.trim().split(/\s+/))));
  expect(candidates).toHaveLength(3 + 6 * 2);

  for (const [url] of candidates) {
    const res = await request.get(url);
    expect(res.status(), url).toBe(200);
    expect(res.headers()["content-type"], url).toBe("image/webp");
    expect((await res.body()).length, `${url} is small`).toBeLessThan(100 * 1024);
  }
  // Each file is as wide as its srcset says.
  const widths = await page.evaluate(
    (urls) =>
      Promise.all(
        urls.map(
          (url) =>
            new Promise((resolve, reject) => {
              const img = new Image();
              img.onload = () => resolve(`${img.naturalWidth}w`);
              img.onerror = () => reject(new Error(`${url} did not load`));
              img.src = url;
            })
        )
      ),
    candidates.map(([url]) => url)
  );
  expect(widths).toEqual(candidates.map(([, descriptor]) => descriptor));

  const share = await request.get("/og-android.jpg");
  expect(share.status()).toBe(200);
  expect(share.headers()["content-type"]).toBe("image/jpeg");
  const bytes = await share.body();
  expect(bytes.length).toBeLessThan(300 * 1024);
  expect(jpegSize(bytes)).toEqual({ width: 1200, height: 630 });
});

for (const width of [390, 1440]) {
  const phone = width < 600;
  const bannerHeight = phone ? 56 : 44;

  test.describe(`No layout shift from the banner at ${width}px`, () => {
    test.use({ viewport: { width, height: phone ? 844 : 900 }, isMobile: phone, hasTouch: phone });

    test.beforeEach(async ({ page }) => {
      // From the first byte: every layout shift (and whether anything in the banner moved), where the banner was when
      // the app first rendered, and every size it had after that.
      await page.addInitScript(() => {
        window.__shifts = [];
        window.__bannerSizes = [];
        new PerformanceObserver((list) => {
          const banner = document.getElementById("site-banner");
          for (const entry of list.getEntries()) {
            window.__shifts.push({
              value: entry.value,
              afterInput: entry.hadRecentInput,
              inBanner: entry.sources.some((source) => source.node && banner?.contains(source.node)),
            });
          }
        }).observe({ type: "layout-shift", buffered: true });
        new MutationObserver((records, observer) => {
          if (!document.getElementById("root")?.firstElementChild) return;
          observer.disconnect();
          const banner = document.getElementById("site-banner");
          if (!banner) {
            window.__bannerAtFirstRender = null;
            return;
          }
          const { top, height } = banner.getBoundingClientRect();
          window.__bannerAtFirstRender = { top, height };
          new ResizeObserver(() => window.__bannerSizes.push(banner.getBoundingClientRect().height)).observe(banner);
        }).observe(document, { childList: true, subtree: true });
      });
    });

    for (const path of ["/", "/home", "/privacy"]) {
      test(`${path}: the banner is there from the first render at its full height, and moves nothing`, async ({ page }) => {
        await page.goto(path);
        await expect(page.locator("header").first()).toBeAttached();
        await page.waitForLoadState("networkidle");
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(500);

        // In the first render, at the top, at its full height, and the same size ever since: it never pushes the page.
        expect(await page.evaluate(() => window.__bannerAtFirstRender)).toEqual({ top: 0, height: bannerHeight });
        const sizes = await page.evaluate(() => window.__bannerSizes);
        expect(sizes.length).toBeGreaterThan(0);
        expect(new Set(sizes)).toEqual(new Set([bannerHeight]));
        const box = await page.locator("#site-banner").boundingBox();
        expect({ top: box.y, height: box.height }).toEqual({ top: 0, height: bannerHeight });
        // And nothing inside it moves when the fonts arrive. (Shifts of the page's own content are its own business.)
        const shifts = await page.evaluate(() => window.__shifts);
        expect(shifts.filter((shift) => shift.inBanner)).toEqual([]);

        // Closing it moves the page up, as the reader asked: every shift from then on follows the click.
        const before = shifts.length;
        await page.getByRole("button", { name: "إخفاء الإعلان" }).click();
        await expect(page.locator("#site-banner")).toHaveCount(0);
        await page.waitForTimeout(300);
        const afterClosing = (await page.evaluate(() => window.__shifts)).slice(before);
        expect(afterClosing.length).toBeGreaterThan(0);
        expect(afterClosing.filter((shift) => !shift.afterInput)).toEqual([]);
      });
    }
  });
}
