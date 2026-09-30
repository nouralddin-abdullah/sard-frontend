/* global process, Buffer */
import { test, expect } from "@playwright/test";

// The reader page's published-time tags (backend #39): article:published_time and the Article JSON-LD's datePublished
// say when the chapter came out, its publishedAt. They read a createdAt the chapter endpoint never sent, so they were
// empty. Against today's API, which sends no publishedAt, the chapter's entry in the novel's chapter list gives the date
// (its createdAt, read as UTC). A draft the author previews hasn't come out: no date. Runs against a production build
// (playwright.config.js: the dev server drops Helmet's tags), at 390 and 1440 px. The API is mocked.
// CHAPTER_DATES_SCREENS_DIR=<dir> also saves screenshots.

const API = "https://api-sareed.runasp.net";
const SCREENS_DIR = process.env.CHAPTER_DATES_SCREENS_DIR;

const AUTHOR = { id: "6f1c2a4e-0000-4000-8000-000000000002", userName: "author1", displayName: "كاتبة الرواية", profilePhoto: null };
const NOVEL = {
  id: "7a1c0e2b-1111-4111-8111-000000000001",
  slug: "7a1c0-ظل-الأمير",
  title: "ظل الأمير",
  genresList: [{ id: 1, name: "Fantasy", slug: "fantasy" }],
  coverImageUrl: "https://images.test/cover.png",
  summary: "رواية تجريبية عن أمير يعيش في الظل.",
  status: "Ongoing",
  totalViews: 1200,
  lastUpdatedAt: "2026-09-20T22:30:00Z",
  createdAt: "2026-08-01T10:00:00Z",
  totalAverageScore: 0,
  reviewCount: 0,
  chapterCount: 2,
  author: AUTHOR,
};

const FIRST = { id: "c0000000-0000-4000-8000-000000000001", title: "الفصل الأول: البداية", createdAt: "2026-09-01T08:00:00", publishedAt: "2026-09-01T08:00:00Z" };
// Written on 2 Sep as a draft, published on 20 Sep.
const SECOND = { id: "c0000000-0000-4000-8000-000000000002", title: "الفصل الثاني: عودة الظل", createdAt: "2026-09-02T09:15:00", publishedAt: "2026-09-20T22:30:00Z" };
const DRAFT = { id: "c0000000-0000-4000-8000-000000000003", title: "الفصل الثالث (مسودة)", createdAt: "2026-09-25T18:00:00", publishedAt: null };

const listItem = (c, withPublishedAt) => ({
  id: c.id,
  novelId: NOVEL.id,
  title: c.title,
  status: "Published",
  paragraphsCount: 1,
  totalCommentsCount: 0,
  viewsCount: 5,
  createdAt: c.createdAt,
  ...(withPublishedAt ? { publishedAt: c.publishedAt } : {}),
  isLocked: false,
});
// The reader payload has no createdAt, today or after #39.
const readerChapter = (c, withPublishedAt) => ({
  id: c.id,
  novelId: NOVEL.id,
  title: c.title,
  author: AUTHOR,
  commentsCount: 0,
  totalCommentsCount: 0,
  ...(withPublishedAt ? { publishedAt: c.publishedAt } : {}),
  nextChapterSlug: null,
  paragraphs: [{ id: `p-${c.id}`, content: "<p>كان الليل ساكنًا حين عاد الظل إلى القصر.</p>", orderIndex: 0, contentType: "text", commentsCount: 0 }],
  isLocked: false,
  lockMessage: null,
});

const PIXEL = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkaGj4DwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");

/** Mocks the API the reader page reads: the #39 API (withPublishedAt) or today's. */
const mockApi = async (page, { withPublishedAt, published = [FIRST, SECOND], chapters = [FIRST, SECOND, DRAFT] }) => {
  const json = (route, body, status = 200) =>
    route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
  await page.route(/^https:\/\/(images\.test|ui-avatars\.com)\//, (route) =>
    route.fulfill({ status: 200, contentType: "image/png", body: PIXEL })
  );
  await page.route(`${API}/**`, (route) => {
    const path = decodeURIComponent(new URL(route.request().url()).pathname);
    if (path === `/api/novel/${NOVEL.slug}`) return json(route, NOVEL);
    if (path === `/api/novel/${NOVEL.id}/chapter`) return json(route, published.map((c) => listItem(c, withPublishedAt)));
    const match = path.match(/^\/api\/novel\/[^/]+\/chapter\/([^/]+)$/);
    const chapter = match && chapters.find((c) => c.id === match[1]);
    if (chapter) return json(route, readerChapter(chapter, withPublishedAt));
    return json(route, {}, 404);
  });
};

const publishedTime = (page) => page.locator('meta[property="article:published_time"]');

/** The chapter's Article JSON-LD. */
const article = async (page) => {
  const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
  return scripts.map((text) => JSON.parse(text)).find((data) => data["@type"] === "Article");
};

const screenshot = async (page, name) => {
  if (!SCREENS_DIR) return;
  await page.screenshot({ path: `${SCREENS_DIR}/${name}-${page.viewportSize().width}.png`, fullPage: false });
};

for (const width of [390, 1440]) {
  test.describe(`Reader published-time tags at ${width}px`, () => {
    test.use({ viewport: { width, height: width < 600 ? 844 : 900 } });

    test("say when the chapter came out, not when it was written", async ({ page }) => {
      await mockApi(page, { withPublishedAt: true });
      await page.goto(`/novel/${NOVEL.slug}/chapter/${SECOND.id}`);
      await expect(page.getByText("كان الليل ساكنًا حين عاد الظل إلى القصر.")).toBeVisible();

      await expect(publishedTime(page)).toHaveAttribute("content", "2026-09-20T22:30:00.000Z");
      await expect.poll(async () => (await article(page))?.datePublished).toBe("2026-09-20T22:30:00.000Z");
      await expect(page).toHaveTitle(`${SECOND.title} - ${NOVEL.title} | سرد`);
      await screenshot(page, "reader");
    });

    test("against today's API say when it was written, from the chapter list, read as UTC", async ({ page }) => {
      await mockApi(page, { withPublishedAt: false });
      await page.goto(`/novel/${NOVEL.slug}/chapter/${SECOND.id}`);
      await expect(page.getByText("كان الليل ساكنًا حين عاد الظل إلى القصر.")).toBeVisible();

      await expect(publishedTime(page)).toHaveAttribute("content", "2026-09-02T09:15:00.000Z");
      await expect.poll(async () => (await article(page))?.datePublished).toBe("2026-09-02T09:15:00.000Z");
    });

    test("are left out for a draft, which hasn't come out", async ({ page }) => {
      await mockApi(page, { withPublishedAt: true });
      await page.goto(`/novel/${NOVEL.slug}/chapter/${DRAFT.id}`);
      await expect(page.getByText("كان الليل ساكنًا حين عاد الظل إلى القصر.")).toBeVisible();
      await expect.poll(async () => (await article(page))?.headline).toBe(DRAFT.title);

      await expect(publishedTime(page)).toHaveCount(0);
      expect(await article(page)).not.toHaveProperty("datePublished");
    });
  });
}
