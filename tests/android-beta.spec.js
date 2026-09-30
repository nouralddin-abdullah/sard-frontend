/* global Buffer */
import { test, expect } from "@playwright/test";

// The Android beta: the banner above every page but the join page, and the join page at /android. The texts below are
// the owner's (the issue «جرّب تطبيق سرد لأندرويد»), typed here rather than imported, so a changed text or link fails.
// The API is mocked, so this runs without a backend. The page's meta tags and layout shifts are checked against a
// production build (android-beta.build.spec.js).

const API = "https://api-sareed.runasp.net";

const BANNER_TEXT = "تطبيق سرد لأندرويد في مرحلة التجربة — انضم إلى المختبِرين";
const CLOSED_KEY = "sard-android-beta-banner-closed-at";
const DAY = 24 * 60 * 60 * 1000;

const WHATSAPP_MESSAGE = "مرحبًا، أريد الانضمام لتجربة تطبيق سرد لأندرويد. بريدي على Google Play هو: ";
const WHATSAPP_HREF = `https://wa.me/201044216091?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
const EMAIL_HREF = `mailto:support@sardnovels.com?subject=${encodeURIComponent("الانضمام لتجربة تطبيق سرد")}`;

const FEATURES = [
  "قراءة مريحة: خط عربي واضح، وحجم وتباعد تختاره، وخلفية فاتحة أو ورقية أو داكنة، وتكمل من حيث توقفت.",
  "القراءة بلا إنترنت: نزّل الفصول واقرأها في أي مكان.",
  "«أكمل القراءة» على الشاشة الرئيسية للهاتف (ويدجت).",
  "شارك اقتباسًا كصورة جميلة مع أصدقائك، بتصميمات وخلفيات تختارها.",
  "إشعارات الفصول الجديدة والردود والهدايا، وتذكير يومي بالقراءة إن أردت.",
  "مكتبتك وقوائم قراءتك، والتعليقات والمراجعات، والهدايا مع رسالة للكاتب.",
];
const TESTERS = [
  "ابقَ مشتركًا في التجربة واحتفظ بالتطبيق مثبّتًا لمدة 14 يومًا على الأقل.",
  "استخدمه كعادتك: اقرأ، وجرّب المكتبة والتعليقات ومشاركة الاقتباسات.",
  "أخبرنا بما أعجبك وما لم يعجبك من داخل Google Play أو عبر البريد.",
];
const FAQ = [
  ["هل التطبيق مجاني؟", "نعم."],
  ["هل يوجد لآيفون؟", "ليس بعد، قريبًا."],
  ["هل حسابي هو نفسه؟", "نعم، نفس حسابك على الموقع."],
  ["متى يصبح متاحًا للجميع؟", "بعد انتهاء فترة التجربة ومراجعة Google."],
];
const SCREENSHOTS = ["01-home", "02-novel", "03-reader", "04-quote", "05-library", "06-gifts"];

// A novel and a chapter, for the chapter reader.
const NOVEL = {
  id: "7a1c0e2b-1111-4111-8111-000000000001",
  slug: "7a1c0-ظل-الأمير",
  title: "ظل الأمير",
  genresList: [{ id: 1, name: "Fantasy", slug: "fantasy" }],
  coverImageUrl: "https://images.test/cover.png",
  summary: "رواية تجريبية عن أمير يعيش في الظل.",
  status: "Ongoing",
  chapterCount: 1,
  isDraft: false,
  author: { id: "6f1c2a4e-0000-4000-8000-000000000002", userName: "author1", displayName: "كاتبة الرواية", profilePhoto: null },
};
const CHAPTER = {
  id: "c0000000-0000-4000-8000-000000000001",
  novelId: NOVEL.id,
  title: "الفصل الأول: البداية",
  status: "Published",
  createdAt: "2026-09-01T08:00:00",
  publishedAt: "2026-09-01T08:00:00Z",
  isLocked: false,
  commentsCount: 0,
  paragraphs: Array.from({ length: 30 }, (_, i) => ({ id: `p${i}`, content: `فقرة ${i + 1}: كان الليل طويلاً، والمطر يطرق النوافذ بإصرار.`, commentsCount: 0 })),
};
const CHAPTER_PATH = `/novel/${NOVEL.slug}/chapter/${CHAPTER.id}`;

const PIXEL = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkaGj4DwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");

const mockApi = async (page) => {
  const json = (route, body, status = 200) =>
    route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
  await page.route(/^https:\/\/images\.test\//, (route) => route.fulfill({ status: 200, contentType: "image/png", body: PIXEL }));
  await page.route(`${API}/**`, (route) => {
    const path = decodeURIComponent(new URL(route.request().url()).pathname);
    if (path === "/api/competition") return json(route, []);
    if (path === `/api/novel/${NOVEL.slug}`) return json(route, NOVEL);
    if (path === `/api/novel/${NOVEL.id}/chapter`) return json(route, [CHAPTER]);
    if (path === `/api/novel/${NOVEL.id}/chapter/${CHAPTER.id}`) return json(route, CHAPTER);
    return json(route, {}, 404);
  });
};

/** Fails the test on any uncaught error in the page. */
const watchErrors = (page) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
};

const banner = (page) => page.getByRole("complementary", { name: "تطبيق سرد لأندرويد" });

const sidewaysOverflow = (page) =>
  page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

for (const width of [390, 1440]) {
  const phone = width < 600;

  test.describe(`Android beta at ${width}px`, () => {
    test.use({ viewport: { width, height: phone ? 844 : 900 }, isMobile: phone, hasTouch: phone });

    test.beforeEach(async ({ page }) => {
      await mockApi(page);
    });

    test("the banner is above every page but /android, links there, and stays closed after a reload", async ({ page }) => {
      const errors = watchErrors(page);
      await page.goto("/home");
      const bar = banner(page);
      await expect(bar).toBeVisible();
      await expect(bar.getByRole("link")).toHaveAttribute("href", "/android");
      await expect(bar.getByRole("link")).toHaveText(`${BANNER_TEXT}انضم الآن`);
      await expect(bar).toHaveAttribute("data-nosnippet", "");
      // Not a heading, and holding none: it must not be the first heading text a crawler reads.
      await expect(bar.locator("h1, h2, h3, h4, h5, h6")).toHaveCount(0);
      await expect(bar.locator("xpath=ancestor::*[self::h1 or self::h2 or self::h3 or self::h4 or self::h5 or self::h6]")).toHaveCount(0);
      // At the very top, as tall as it was made (two lines on a phone), and nothing wider than the screen.
      const box = await bar.boundingBox();
      expect(box.y).toBe(0);
      expect(box.height).toBe(phone ? 56 : 44);
      expect(await sidewaysOverflow(page)).toBe(0);
      // The phone's bottom navigation stays clear of it.
      if (phone) {
        const nav = await page.locator("nav.fixed.bottom-0").boundingBox();
        expect(nav.y).toBeGreaterThan(box.y + box.height);
      }

      await page.goto("/privacy");
      await expect(banner(page)).toBeVisible();

      // The whole banner is the link to the join page, which has no banner.
      await banner(page).getByText(BANNER_TEXT).click();
      await expect(page).toHaveURL("/android");
      await expect(page.getByRole("heading", { level: 1, name: "سرد على هاتفك" })).toBeVisible();
      await expect(page.locator("#site-banner")).toHaveCount(0);
      for (const path of ["/android", "/android/", "/Android"]) {
        await page.goto(path);
        await expect(page.getByRole("heading", { level: 1, name: "سرد على هاتفك" })).toBeVisible();
        await expect(page.locator("#site-banner")).toHaveCount(0);
      }

      // Closing it hides it at once, remembers when, and it stays closed on the next load and on other pages.
      await page.goto("/home");
      const before = Date.now();
      await banner(page).getByRole("button", { name: "إخفاء الإعلان" }).click();
      await expect(page.locator("#site-banner")).toHaveCount(0);
      const closedAt = Number(await page.evaluate((key) => localStorage.getItem(key), CLOSED_KEY));
      expect(closedAt).toBeGreaterThanOrEqual(before);
      expect(closedAt).toBeLessThanOrEqual(Date.now());

      // Records whether the banner is ever in the page, from the first byte of the next loads.
      await page.addInitScript(() => {
        window.__bannerSeen = false;
        new MutationObserver(() => {
          if (document.getElementById("site-banner")) window.__bannerSeen = true;
        }).observe(document, { childList: true, subtree: true });
      });
      await page.reload();
      await expect(page.locator("main").first()).toBeVisible();
      expect(await page.evaluate(() => window.__bannerSeen)).toBe(false);
      await page.goto("/privacy");
      await expect(page.locator("main article h1")).toBeVisible();
      expect(await page.evaluate(() => window.__bannerSeen)).toBe(false);
      expect(errors).toEqual([]);
    });

    test("closing lasts about 30 days, and a page without storage still shows and closes the banner", async ({ page, context }) => {
      await page.goto("/privacy");
      await expect(banner(page)).toBeVisible();
      const closeAgo = (days) => page.evaluate(([key, at]) => localStorage.setItem(key, String(at)), [CLOSED_KEY, Date.now() - days * DAY]);

      await closeAgo(29);
      await page.reload();
      await expect(page.locator("main article h1")).toBeVisible();
      await expect(page.locator("#site-banner")).toHaveCount(0);

      await closeAgo(31);
      await page.reload();
      await expect(banner(page)).toBeVisible();

      await page.evaluate((key) => localStorage.setItem(key, "not a time"), CLOSED_KEY);
      await page.reload();
      await expect(banner(page)).toBeVisible();

      // Storage that throws (blocked site data): the banner shows, and closing it still hides it.
      const blocked = await context.newPage();
      await mockApi(blocked);
      const errors = watchErrors(blocked);
      await blocked.addInitScript(() => {
        const refuse = () => {
          throw new DOMException("The operation is insecure.", "SecurityError");
        };
        Storage.prototype.getItem = refuse;
        Storage.prototype.setItem = refuse;
      });
      await blocked.goto("/privacy");
      await expect(banner(blocked)).toBeVisible();
      await banner(blocked).getByRole("button", { name: "إخفاء الإعلان" }).click();
      await expect(blocked.locator("#site-banner")).toHaveCount(0);
      expect(errors).toEqual([]);
    });

    test("the banner sits above the pages' own top bars, which stick once it scrolls away", async ({ page }) => {
      const bannerHeight = phone ? 56 : 44;

      // The chapter reader's bar: below the banner, then at the top of the screen.
      await page.goto(CHAPTER_PATH);
      await expect(page.getByRole("heading", { level: 1, name: CHAPTER.title })).toBeVisible();
      const readerBar = page.locator("div.sticky.top-0").first();
      expect((await readerBar.boundingBox()).y).toBe(bannerHeight);
      const title = await page.getByRole("heading", { level: 1, name: CHAPTER.title }).boundingBox();
      const bar = await readerBar.boundingBox();
      expect(title.y).toBeGreaterThanOrEqual(bar.y + bar.height);
      await page.evaluate(() => window.scrollTo(0, 600));
      await expect.poll(async () => (await readerBar.boundingBox()).y).toBe(0);
      expect((await banner(page).boundingBox()).y).toBeLessThan(-bannerHeight);

      // The author pages' bar.
      await page.goto("/authorsbenefits");
      const authorsBar = page.locator("div.sticky.top-0").first();
      await expect(authorsBar).toBeVisible();
      expect((await authorsBar.boundingBox()).y).toBe(bannerHeight);
      await page.evaluate(() => window.scrollTo(0, 600));
      await expect.poll(async () => (await authorsBar.boundingBox()).y).toBe(0);

      // The wiki guide fills the screen below the banner.
      await page.goto("/metwekpeida");
      const guide = page.locator(".scroll-snap-container");
      await expect(guide).toBeVisible();
      expect((await guide.boundingBox()).y).toBe(bannerHeight);
      await banner(page).getByRole("button", { name: "إخفاء الإعلان" }).click();
      await expect.poll(async () => (await guide.boundingBox()).y).toBe(0);
    });

    test("/android: every section, with the owner's texts, sized pictures and exact links", async ({ page }) => {
      const errors = watchErrors(page);
      await page.goto("/android");
      await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
      await expect(page.locator("html")).toHaveAttribute("lang", "ar");
      await expect(page).toHaveTitle("تطبيق سرد لأندرويد — انضم إلى التجربة");

      // Hero: the title, the line, a button to the join section, and the one picture that loads at once.
      const main = page.locator("main");
      await expect(main.locator("h1")).toHaveCount(1);
      await expect(main.locator("h1")).toHaveText("سرد على هاتفك");
      await expect(main.getByText("اقرأ رواياتك المفضلة في تطبيق سرد لأندرويد — وكن من أوائل من يجرّبه.", { exact: true })).toBeVisible();
      const hero = main.locator("img").first();
      await expect(hero).toHaveAttribute("src", "/app-screens/hero-1600.webp");
      await expect(hero).toHaveAttribute("srcset", /hero-800\.webp 800w, .*hero-1200\.webp 1200w, .*hero-1600\.webp 1600w/);
      await expect(hero).toHaveAttribute("width", "1600");
      await expect(hero).toHaveAttribute("height", "900");
      await expect(hero).toHaveAttribute("fetchpriority", "high");
      expect(await hero.getAttribute("loading")).toBeNull();
      await expect.poll(() => hero.evaluate((img) => img.complete && img.naturalWidth > 0)).toBe(true);

      // What's in the app: six items, each with its icon.
      const features = main.locator("section").filter({ has: page.getByRole("heading", { level: 2, name: "ماذا في التطبيق؟" }) });
      await expect(features.locator("li")).toHaveText(FEATURES);
      for (const item of await features.locator("li").all()) {
        await expect(item.locator("svg")).toHaveCount(1);
      }

      // The screenshots: six, lazy, each with its size and caption.
      const gallery = page.getByRole("region", { name: "صور من التطبيق" });
      await expect(gallery.locator("figure")).toHaveCount(6);
      const shots = gallery.locator("img");
      for (const [i, name] of SCREENSHOTS.entries()) {
        const shot = shots.nth(i);
        await expect(shot).toHaveAttribute("src", `/app-screens/${name}-668.webp`);
        await expect(shot).toHaveAttribute("srcset", `/app-screens/${name}-334.webp 334w, /app-screens/${name}-668.webp 668w`);
        await expect(shot).toHaveAttribute("width", "668");
        await expect(shot).toHaveAttribute("height", "1293");
        await expect(shot).toHaveAttribute("loading", "lazy");
        await expect(shot).toHaveAttribute("alt", /^تطبيق سرد لأندرويد: .+/);
      }
      await expect(gallery.locator("figcaption")).toHaveText([
        "الشاشة الرئيسية",
        "صفحة الرواية",
        "القارئ وقائمة تحديد النص",
        "مشاركة اقتباس كصورة",
        "المكتبة",
        "الداعمون ورسائل الهدايا",
      ]);

      // How to join: the text, the two buttons with the message and subject filled in, and the number and address as
      // text, left to right inside the right-to-left page.
      const join = page.locator("#join");
      await expect(join.getByRole("heading", { level: 2 })).toHaveText("كيف تنضم إلى التجربة؟");
      await expect(
        join.getByText("التجربة مفتوحة لمستخدمي أندرويد. لتنضم أرسل لنا بريد Google الذي تستخدمه على هاتفك، وسنضيفك ونرسل لك رابط التحميل من Google Play.", { exact: true })
      ).toBeVisible();
      const whatsapp = join.getByRole("link", { name: "راسلنا على واتساب" });
      expect(await whatsapp.getAttribute("href")).toBe(WHATSAPP_HREF);
      expect(WHATSAPP_HREF.startsWith("https://wa.me/201044216091?text=%D9%85%D8%B1%D8%AD%D8%A8%D9%8B%D8%A7%D8%8C%20")).toBe(true);
      expect(WHATSAPP_HREF.endsWith("Google%20Play%20%D9%87%D9%88%3A%20")).toBe(true);
      await expect(whatsapp).toHaveAttribute("target", "_blank");
      await expect(whatsapp).toHaveAttribute("rel", "noopener noreferrer");
      const email = join.getByRole("link", { name: "راسلنا بالبريد" });
      expect(await email.getAttribute("href")).toBe(EMAIL_HREF);
      expect(EMAIL_HREF).toBe(
        "mailto:support@sardnovels.com?subject=%D8%A7%D9%84%D8%A7%D9%86%D8%B6%D9%85%D8%A7%D9%85%20%D9%84%D8%AA%D8%AC%D8%B1%D8%A8%D8%A9%20%D8%AA%D8%B7%D8%A8%D9%8A%D9%82%20%D8%B3%D8%B1%D8%AF"
      );
      const number = join.getByText("+20 104 421 6091", { exact: true });
      await expect(number).toHaveAttribute("dir", "ltr");
      await expect(number).toHaveCSS("direction", "ltr");
      const address = join.getByText("support@sardnovels.com", { exact: true });
      await expect(address).toHaveAttribute("dir", "ltr");
      await expect(address).toHaveCSS("direction", "ltr");

      // What we ask of testers, and the questions.
      const testers = main.locator("section").filter({ has: page.getByRole("heading", { level: 2, name: "ما نطلبه من المختبِرين" }) });
      await expect(testers.locator("li")).toHaveText(TESTERS);
      const faq = main.locator("section").filter({ has: page.getByRole("heading", { level: 2, name: "أسئلة شائعة" }) });
      await expect(faq.locator("h3")).toHaveText(FAQ.map(([question]) => question));
      await expect(faq.locator("h3 + p")).toHaveText(FAQ.map(([, answer]) => answer));

      // The button in the hero brings the join section into view.
      await main.getByRole("link", { name: "انضم إلى التجربة" }).click();
      await expect(join.getByRole("link", { name: "راسلنا على واتساب" })).toBeInViewport();

      // The footer links here.
      const footerLink = page.getByRole("contentinfo").getByRole("link", { name: "جرّب تطبيق سرد لأندرويد" });
      await expect(footerLink).toHaveAttribute("href", "/android");
      await expect(footerLink).toHaveAttribute("aria-current", "page");
      expect(errors).toEqual([]);
    });

    test("no page scrolls sideways; the screenshots do", async ({ page }) => {
      for (const path of ["/android", "/home", "/privacy"]) {
        await page.goto(path);
        await expect(page.locator("main").first()).toBeVisible();
        expect(await sidewaysOverflow(page), `${path} scrolls sideways`).toBe(0);
      }

      await page.goto("/android");
      const gallery = page.getByRole("region", { name: "صور من التطبيق" });
      await gallery.scrollIntoViewIfNeeded();
      await expect(gallery).toHaveCSS("scroll-snap-type", "x mandatory");
      expect(await gallery.evaluate((box) => box.scrollWidth > box.clientWidth)).toBe(true);
      const scrolled = () => gallery.evaluate((box) => box.scrollLeft);
      expect(await scrolled()).toBe(0);

      if (phone) {
        // A finger swipe from left to right shows the next screenshots (right to left, scrollLeft goes negative).
        const box = await gallery.boundingBox();
        const client = await page.context().newCDPSession(page);
        const y = Math.round(box.y + box.height / 2);
        const x = Math.round(box.x + box.width * 0.3);
        await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
        for (let step = 1; step <= 8; step++) {
          await client.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x + step * 20, y }] });
        }
        await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
        await expect.poll(scrolled).toBeLessThan(-100);
      } else {
        // On a desktop the arrows move it, and turn off at either end.
        const previous = page.getByRole("button", { name: "الصور السابقة" });
        const next = page.getByRole("button", { name: "الصور التالية" });
        await expect(previous).toBeDisabled();
        await next.click();
        await expect.poll(scrolled).toBeLessThan(-100);
        await expect(previous).toBeEnabled();
        await expect(async () => {
          await next.click();
          await expect(next).toBeDisabled({ timeout: 1000 });
        }).toPass();
        await previous.click();
        await expect(next).toBeEnabled();
      }
      expect(await page.evaluate(() => window.scrollX)).toBe(0);
      expect(await sidewaysOverflow(page)).toBe(0);

      // The lazy screenshots do load inside the row: the first on sight, the last once the row is at its end.
      const loaded = (img) => img.evaluate((el) => el.complete && el.naturalWidth > 0);
      const shots = gallery.locator("img");
      await expect.poll(() => loaded(shots.first())).toBe(true);
      await gallery.evaluate((box) => box.scrollTo({ left: -box.scrollWidth }));
      await expect.poll(() => loaded(shots.last())).toBe(true);
    });
  });
}
