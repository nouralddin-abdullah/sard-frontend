/* global process, Buffer */
import { test, expect } from "@playwright/test";

// Chapter dates (backend #39): a chapter is dated by when it came out, its publishedAt (UTC with "Z"), not by its
// createdAt, which for a draft published later is when it was written. Against today's API, which sends no publishedAt,
// createdAt is shown, read as UTC. The novel page's chapter list and the author's chapter list, at 390 and 1440 px, in
// Riyadh time (UTC+3), so a date read as local time instead of UTC shows. The API is mocked.
// CHAPTER_DATES_SCREENS_DIR=<dir> also saves screenshots.

const API = "https://api-sareed.runasp.net";
const SCREENS_DIR = process.env.CHAPTER_DATES_SCREENS_DIR;
const NOW = new Date("2026-09-30T12:00:00Z");

const AUTHOR = { id: "6f1c2a4e-0000-4000-8000-000000000002", userName: "author1", displayName: "كاتبة الرواية", profilePhoto: null };
const NOVEL = {
  id: "7a1c0e2b-1111-4111-8111-000000000001",
  slug: "7a1c0-ظل-الأمير",
  title: "ظل الأمير",
  genresList: [{ id: 1, name: "Fantasy", slug: "fantasy" }],
  genreIds: [1],
  coverImageUrl: "https://images.test/cover.png",
  summary: "رواية تجريبية عن أمير يعيش في الظل.",
  status: "Ongoing",
  totalViews: 1200,
  lastUpdatedAt: "2026-09-20T22:30:00Z",
  createdAt: "2026-08-01T10:00:00Z",
  totalAverageScore: 0,
  reviewCount: 0,
  chapterCount: 3,
  isDraft: false,
  author: AUTHOR,
};

const chapter = (n, title, { createdAt, publishedAt, status = "Published", isLocked = false }) => ({
  id: `c0000000-0000-4000-8000-00000000000${n}`,
  novelId: NOVEL.id,
  title,
  status,
  paragraphsCount: 12,
  totalCommentsCount: 0,
  viewsCount: 40 - n,
  createdAt,
  ...(publishedAt !== undefined ? { publishedAt } : {}),
  isLocked,
});

// Written and out on 1 Sep; written on 2 Sep as a draft and published on 20 Sep at 22:30 UTC (21 Sep in Riyadh); out
// on 25 Sep, locked for subscribers.
const FIRST = chapter(1, "الفصل الأول: البداية", { createdAt: "2026-09-01T08:00:00", publishedAt: "2026-09-01T08:00:00Z" });
const PUBLISHED_LATER = chapter(2, "الفصل الثاني: عودة الظل", {
  createdAt: "2026-09-02T09:15:00",
  publishedAt: "2026-09-20T22:30:00Z",
});
const LOCKED = chapter(3, "الفصل الثالث: السر", {
  createdAt: "2026-09-25T18:00:00",
  publishedAt: "2026-09-25T18:00:00Z",
  isLocked: true,
});
// The author's list also has a draft never published (written 10 Sep) and a chapter out on 5 Sep, unpublished since.
const DRAFT = chapter(4, "الفصل الرابع (مسودة)", { createdAt: "2026-09-10T21:30:00", publishedAt: null, status: "Draft" });
const UNPUBLISHED = chapter(5, "فصل جانبي", { createdAt: "2026-09-04T10:00:00", publishedAt: "2026-09-05T23:00:00Z", status: "Draft" });
// Published without a publish date, as only code from before publishedAt could leave one: dated, but not labelled.
const UNDATED = chapter(6, "فصل بلا تاريخ نشر", { createdAt: "2026-09-03T10:00:00", publishedAt: null });

/** A list as today's API sends it: no publishedAt. */
const withoutPublishedAt = (chapters) => chapters.map(({ publishedAt, ...rest }) => (void publishedAt, rest));

const PIXEL = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkaGj4DwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");

const mockApi = async (page, { chapters, workChapters = [], signedIn = false }) => {
  const json = (route, body, status = 200) =>
    route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });

  await page.route(/^https:\/\/(images\.test|ui-avatars\.com)\//, (route) =>
    route.fulfill({ status: 200, contentType: "image/png", body: PIXEL })
  );
  await page.route(`${API}/**`, async (route) => {
    const path = decodeURIComponent(new URL(route.request().url()).pathname);

    if (path === "/api/User/my-profile") return signedIn ? json(route, { ...AUTHOR, email: "author1@example.test" }) : json(route, {}, 401);
    if (path === `/api/novel/${NOVEL.slug}` || path === `/api/novel/by-id/${NOVEL.id}`) return json(route, NOVEL);
    if (path === `/api/novel/${NOVEL.id}/chapter`) return json(route, chapters);
    if (path === `/api/novel/${NOVEL.id}/privilege`)
      return json(route, { isEnabled: true, lockedChaptersCount: 1, isSubscribed: false, price: 500, maxLockedChapters: 20 });
    if (path === `/api/myworks/${NOVEL.id}`) return json(route, NOVEL);
    if (path === `/api/myworks/${NOVEL.id}/chapters`) return json(route, workChapters);
    if (path === "/api/genre") return json(route, [{ id: 1, name: "Fantasy", slug: "fantasy" }]);
    if (path === "/api/notifications/unread-count") return json(route, { unreadCount: 0 });
    return json(route, {}, 404);
  });
};

const signIn = (context) =>
  context.addCookies([{ name: "sard-auth-token", value: "test-token", url: "http://127.0.0.1:5173" }]);

const screenshot = async (page, name, locator) => {
  if (!SCREENS_DIR) return;
  const path = `${SCREENS_DIR}/${name}-${page.viewportSize().width}.png`;
  await (locator ? locator.screenshot({ path }) : page.screenshot({ path, fullPage: false }));
};

/** The date the novel page shows for an instant, as its chapter list formats it, in the browser's time zone. */
const shownDate = (page, iso) =>
  page.evaluate(
    (at) => new Date(at).toLocaleDateString("ar-EG", { year: "numeric", month: "2-digit", day: "2-digit", calendar: "gregory" }),
    iso
  );

/** The row of the novel page's chapter list for this chapter (a locked one links nowhere until one subscribes). */
const row = (page, c) => page.locator("a").filter({ has: page.locator(`span[title="${c.title}"]`) });

/** A chapter's card in the author's chapter list. */
const card = (page, c) => page.getByTestId(`chapter-card-${c.id}-container`);

/** The novel page's panel with the chapters tab. */
const chaptersPanel = (page) =>
  page.locator("div.rounded-xl").filter({ has: page.getByRole("button", { name: "الفصول", exact: true }) }).last();

for (const width of [390, 1440]) {
  test.describe(`Chapter dates at ${width}px`, () => {
    test.use({ viewport: { width, height: width < 600 ? 844 : 900 }, timezoneId: "Asia/Riyadh", locale: "ar" });

    test.beforeEach(async ({ page }) => {
      await page.clock.setFixedTime(NOW);
    });

    test("the novel page dates each chapter by when it came out", async ({ page }) => {
      await mockApi(page, { chapters: [FIRST, PUBLISHED_LATER, LOCKED] });
      await page.goto(`/novel/${NOVEL.slug}`);

      for (const c of [FIRST, PUBLISHED_LATER, LOCKED]) {
        const date = row(page, c).locator("time");
        await expect(date).toHaveAttribute("datetime", new Date(c.publishedAt).toISOString());
        await expect(date).toHaveText(await shownDate(page, c.publishedAt));
      }
      // Written on 2 Sep, out on 20 Sep 22:30 UTC: 21 Sep in Riyadh, not the day it was written.
      await expect(row(page, PUBLISHED_LATER).locator("time")).toHaveText(await shownDate(page, "2026-09-21T12:00:00Z"));
      await expect(row(page, PUBLISHED_LATER).locator("time")).not.toHaveText(await shownDate(page, "2026-09-02T12:00:00Z"));
      await expect(row(page, PUBLISHED_LATER)).toHaveCSS("direction", "rtl");

      await row(page, LOCKED).scrollIntoViewIfNeeded();
      await screenshot(page, "novel-chapters", chaptersPanel(page));
    });

    test("against today's API the novel page shows when the chapter was written, read as UTC", async ({ page }) => {
      const lateEvening = { ...PUBLISHED_LATER, createdAt: "2026-09-02T22:15:00" }; // 3 Sep in Riyadh
      await mockApi(page, { chapters: withoutPublishedAt([FIRST, lateEvening]) });
      await page.goto(`/novel/${NOVEL.slug}`);

      const date = row(page, lateEvening).locator("time");
      await expect(date).toHaveAttribute("datetime", "2026-09-02T22:15:00.000Z");
      await expect(date).toHaveText(await shownDate(page, "2026-09-03T12:00:00Z"));
      await row(page, lateEvening).scrollIntoViewIfNeeded();
      await screenshot(page, "novel-chapters-todays-api", chaptersPanel(page));
    });

    test("the author's list dates chapters by when they came out, drafts by when they were written", async ({ page, context }) => {
      const workChapters = [FIRST, PUBLISHED_LATER, UNPUBLISHED, DRAFT, UNDATED];
      await mockApi(page, { chapters: [FIRST, PUBLISHED_LATER], workChapters, signedIn: true });
      await signIn(context);
      await page.goto(`/dashboard/works/${NOVEL.id}/edit`);
      await page.getByRole("button", { name: "الفصول والإيقاع" }).click();

      // Out on 20 Sep at 22:30 UTC, 21 Sep 01:30 in Riyadh; the draft created on 10 Sep 21:30 UTC, 11 Sep in Riyadh; the
      // chapter out on 5 Sep and a draft again since says when it came out.
      await expect(card(page, PUBLISHED_LATER)).toContainText("نُشر 21 سبتمبر 2026");
      await expect(card(page, DRAFT)).toContainText("أُنشئ 11 سبتمبر 2026");
      await expect(card(page, UNPUBLISHED)).toContainText("نُشر 6 سبتمبر 2026");
      await expect(card(page, FIRST)).toContainText("نُشر 1 سبتمبر 2026");
      await expect(card(page, UNDATED)).toContainText("3 سبتمبر 2026");
      await expect(card(page, UNDATED)).not.toContainText("نُشر");
      await expect(card(page, UNDATED)).not.toContainText("أُنشئ");
      await card(page, FIRST).scrollIntoViewIfNeeded();
      await screenshot(page, "author-chapters", page.locator("ul.chapter-scroll"));

      // «الأحدث»: newest first by those dates.
      await page.getByTestId("chapter-sort-recent").click();
      const order = await page.locator('[data-testid^="chapter-card-"][data-testid$="-container"]').evaluateAll((cards) =>
        cards.map((c) => c.getAttribute("data-testid"))
      );
      expect(order).toEqual(
        [PUBLISHED_LATER, DRAFT, UNPUBLISHED, UNDATED, FIRST].map((c) => `chapter-card-${c.id}-container`)
      );
      await screenshot(page, "author-chapters-newest", page.locator("ul.chapter-scroll"));
    });

    test("against today's API the author's list shows when each chapter was created, unlabelled", async ({ page, context }) => {
      await mockApi(page, { chapters: [], workChapters: withoutPublishedAt([FIRST, PUBLISHED_LATER, DRAFT]), signedIn: true });
      await signIn(context);
      await page.goto(`/dashboard/works/${NOVEL.id}/edit`);
      await page.getByRole("button", { name: "الفصول والإيقاع" }).click();

      // It can't tell when a chapter came out, so it doesn't say "published" for a creation date.
      await expect(card(page, PUBLISHED_LATER)).toContainText("2 سبتمبر 2026");
      await expect(card(page, DRAFT)).toContainText("11 سبتمبر 2026");
      for (const c of [FIRST, PUBLISHED_LATER, DRAFT]) {
        await expect(card(page, c)).not.toContainText("نُشر");
        await expect(card(page, c)).not.toContainText("أُنشئ");
      }
      await screenshot(page, "author-chapters-todays-api", page.locator("ul.chapter-scroll"));
    });
  });
}
