/* global process, Buffer */
import { test, expect } from "@playwright/test";

// Chapter format v1 on the web (backend #74, #75, #86): the reader shows every paragraph kind as the app does (a picture
// as a picture with its caption, never its address; centered and quoted paragraphs; scene breaks), and the author's
// editor loads, edits and saves them without loss: Enter makes a paragraph, pictures are uploaded and kept, a save sends
// baseRevision, warns before deleting readers' comments, and stops on a conflict. At 390 and 1440 px. The API is mocked.
// CHAPTER_FORMAT_SCREENS_DIR=<dir> also saves screenshots.

const API = "https://api-sareed.runasp.net";
const SCREENS_DIR = process.env.CHAPTER_FORMAT_SCREENS_DIR;

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
  totalViews: 10,
  lastUpdatedAt: "2026-09-20T22:30:00Z",
  createdAt: "2026-08-01T10:00:00Z",
  totalAverageScore: 0,
  reviewCount: 0,
  chapterCount: 1,
  isDraft: false,
  author: AUTHOR,
};

const MAP_URL = "https://images.test/chapter-images/map.webp";
const NEW_PICTURE_URL = "https://images.test/chapter-images/new.webp";

const PARAGRAPHS = [
  { id: "p0", orderIndex: 0, contentType: "text", content: "كان <strong>الليل</strong> طويلاً<br>والريح تعوي.", caption: null, commentsCount: 2 },
  { id: "p1", orderIndex: 1, contentType: "center", content: "بيتٌ من الشعر في المنتصف", caption: null, commentsCount: 0 },
  { id: "p2", orderIndex: 2, contentType: "quote", content: "عزيزي أحمد،<br>لا تنتظرني.", caption: null, commentsCount: 1 },
  { id: "p3", orderIndex: 3, contentType: "break", content: "* * *", caption: null, commentsCount: 0 },
  { id: "p4", orderIndex: 4, contentType: "image", content: MAP_URL, caption: "خريطة <b>المدينة</b>", commentsCount: 0 },
  { id: "p5", orderIndex: 5, contentType: "poster", content: "نوع جديد يُعرض نصًا", caption: null, commentsCount: 0 },
];

const CHAPTER = {
  id: "c0000000-0000-4000-8000-000000000001",
  novelId: NOVEL.id,
  title: "الفصل 1: البداية",
  status: "Published",
  paragraphs: PARAGRAPHS,
  paragraphsCount: PARAGRAPHS.length,
  totalCommentsCount: 3,
  createdAt: "2026-09-01T08:00:00Z",
  publishedAt: "2026-09-01T08:00:00Z",
  updatedAt: "2026-09-01T08:00:00Z",
  revision: 7,
  isLocked: false,
};

const PIXEL = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkaGj4DwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");
// A chapter picture large enough to see in the screenshots: a small "map".
const MAP_PICTURE = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400">
  <rect width="640" height="400" fill="#e9dcc0"/>
  <path d="M40 320 C160 200 260 360 380 220 S560 120 600 80" stroke="#4A9EFF" stroke-width="14" fill="none"/>
  <circle cx="190" cy="140" r="46" fill="#7a9e57"/><circle cx="470" cy="300" r="60" fill="#7a9e57"/>
  <rect x="300" y="90" width="70" height="70" fill="#8b5a2b"/><polygon points="290,90 335,50 380,90" fill="#b5442c"/>
</svg>`;

/** Mocks the API; `onPatch(request, { dryRun, body })` answers chapter saves. Returns the requests it saw. */
const mockApi = async (page, { signedIn = false, onPatch } = {}) => {
  const seen = { patches: [], uploads: 0 };
  const json = (route, body, status = 200) =>
    route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });

  await page.route(/^https:\/\/(images\.test|ui-avatars\.com)\//, (route) =>
    route.request().url().includes("/chapter-images/")
      ? route.fulfill({ status: 200, contentType: "image/svg+xml", body: MAP_PICTURE })
      : route.fulfill({ status: 200, contentType: "image/png", body: PIXEL })
  );
  await page.route(`${API}/**`, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = decodeURIComponent(url.pathname);
    const method = request.method();

    if (path === "/api/User/my-profile") return signedIn ? json(route, { ...AUTHOR, email: "author1@example.test" }) : json(route, {}, 401);
    if (path === `/api/novel/${NOVEL.slug}` || path === `/api/novel/by-id/${NOVEL.id}`) return json(route, NOVEL);
    if (path === `/api/novel/${NOVEL.id}/chapter` && method === "GET") return json(route, [{ ...CHAPTER, paragraphs: undefined }]);
    if (path === `/api/novel/${NOVEL.id}/chapter/${CHAPTER.id}` && method === "GET") return json(route, CHAPTER);
    if (path === `/api/novel/${NOVEL.id}/chapter/${CHAPTER.id}` && method === "PATCH") {
      const body = JSON.parse(request.postData() || "{}");
      const dryRun = url.searchParams.get("dryRun") === "true";
      seen.patches.push({ dryRun, body });
      return onPatch ? onPatch(route, { dryRun, body, json }) : json(route, { success: true, revision: 8, status: body.status ?? "Published" });
    }
    if (path === `/api/novel/${NOVEL.id}/chapter-images` && method === "POST") {
      seen.uploads++;
      return json(route, { url: NEW_PICTURE_URL });
    }
    if (path === `/api/novel/${NOVEL.id}/privilege`) return json(route, { isEnabled: false });
    if (path === `/api/myworks/${NOVEL.id}`) return json(route, NOVEL);
    if (path === `/api/myworks/${NOVEL.id}/chapters`) return json(route, [{ ...CHAPTER, paragraphs: undefined }]);
    if (path === `/api/myworks/${NOVEL.id}/chapters/${CHAPTER.id}`) return json(route, CHAPTER);
    if (path === "/api/genre") return json(route, [{ id: 1, name: "Fantasy", slug: "fantasy" }]);
    if (path === "/api/notifications/unread-count") return json(route, { unreadCount: 0 });
    if (method === "POST") return json(route, {});
    return json(route, {}, 404);
  });
  return seen;
};

const signIn = (context) =>
  context.addCookies([{ name: "sard-auth-token", value: "test-token", url: "http://127.0.0.1:5173" }]);

const screenshot = async (page, name, locator) => {
  if (!SCREENS_DIR) return;
  const path = `${SCREENS_DIR}/${name}-${page.viewportSize().width}.png`;
  await (locator ? locator.screenshot({ path }) : page.screenshot({ path, fullPage: true }));
};

const editorUrl = `/dashboard/works/${NOVEL.id}/chapters/${CHAPTER.id}/edit`;

for (const width of [390, 1440]) {
  test.describe(`Chapter formatting at ${width}px`, () => {
    test.use({ viewport: { width, height: width < 600 ? 844 : 900 }, locale: "ar" });

    test("the reader shows each paragraph by its kind, as the app does", async ({ page }) => {
      await mockApi(page);
      await page.goto(`/novel/${NOVEL.slug}/chapter/${CHAPTER.id}`);

      // The picture is a picture, with its caption as plain text; its address is never shown as text.
      const picture = page.locator('figure[data-paragraph-kind="image"] img');
      await expect(picture).toHaveAttribute("src", MAP_URL);
      await expect(page.locator('figure[data-paragraph-kind="image"] figcaption')).toHaveText("خريطة <b>المدينة</b>");
      await expect(page.getByText(MAP_URL)).toHaveCount(0);

      await expect(page.locator('p[data-paragraph-kind="center"]')).toHaveCSS("text-align", "center");
      await expect(page.locator('blockquote[data-paragraph-kind="quote"]')).toContainText("لا تنتظرني.");
      await expect(page.locator('blockquote[data-paragraph-kind="quote"] br')).toHaveCount(1);
      await expect(page.locator('[data-paragraph-kind="break"]')).toHaveText("* * *");
      await expect(page.locator('p[data-paragraph-kind="text"] strong')).toHaveText("الليل");
      // A kind this web doesn't know yet is shown as text.
      await expect(page.getByText("نوع جديد يُعرض نصًا")).toBeVisible();

      await screenshot(page, "reader");

      // Commenting on the picture quotes its caption, never its address.
      const pictureRow = page.locator("div.group").filter({ has: page.locator('figure[data-paragraph-kind="image"]') });
      await pictureRow.hover();
      await pictureRow.getByRole("button", { name: "تعليق على الفقرة" }).click({ force: true });
      await expect(page.getByText("خريطة <b>المدينة</b>").nth(1)).toBeVisible();
      await expect(page.getByText(MAP_URL)).toHaveCount(0);
    });

    test("the editor loads every kind without changing it, and a save keeps them", async ({ page, context }) => {
      const seen = await mockApi(page, { signedIn: true });
      await signIn(context);
      await page.goto(editorUrl);

      const editor = page.locator(".ProseMirror");
      await expect(editor.locator('img[src="' + MAP_URL + '"]')).toBeVisible();
      await expect(editor).not.toContainText(MAP_URL);
      await expect(editor.locator('p[data-kind="center"]')).toHaveText("بيتٌ من الشعر في المنتصف");
      await expect(editor.locator('p[data-kind="quote"]')).toContainText("عزيزي أحمد،");
      await expect(editor.locator("hr")).toHaveCount(1);
      // Loading is not an edit.
      await expect(page.getByTestId("save-status")).not.toContainText("تغييرات غير محفوظة");

      // Enter starts a new paragraph (each is what readers comment on); Shift+Enter breaks the line inside one. The cursor
      // goes to the end of the centered paragraph itself (End only reaches the end of a wrapped line on a phone).
      await editor.locator('p[data-kind="center"]').click();
      await editor.locator('p[data-kind="center"]').evaluate((p) => {
        const range = document.createRange();
        range.selectNodeContents(p);
        range.collapse(false);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      });
      await page.keyboard.press("Enter");
      await page.getByRole("button", { name: /^فقرة في الوسط/ }).click();
      await page.keyboard.type("فقرة جديدة");
      await page.keyboard.press("Shift+Enter");
      await page.keyboard.type("وسطر ثانٍ");
      await expect(editor.locator("p", { hasText: "فقرة جديدة" })).toHaveCount(1);
      await expect(editor.locator("p", { hasText: "فقرة جديدة" }).locator("br")).toHaveCount(1);

      await page.getByRole("button", { name: /^حفظ/ }).first().click();
      await expect.poll(() => seen.patches.filter((p) => !p.dryRun).length).toBe(1);

      const dryRun = seen.patches.find((p) => p.dryRun);
      expect(dryRun).toBeTruthy();
      const saved = seen.patches.find((p) => !p.dryRun).body;
      expect(saved.baseRevision).toBe(7);
      expect(saved.content).toContain(`<p data-kind="image"><img src="${MAP_URL}">خريطة &lt;b&gt;المدينة&lt;/b&gt;</p>`);
      expect(saved.content).toContain('<p data-kind="center">بيتٌ من الشعر في المنتصف</p>');
      expect(saved.content).toContain('<p data-kind="quote">عزيزي أحمد،<br>لا تنتظرني.</p>');
      expect(saved.content).toMatch(/<hr[^>]*>/);
      expect(saved.content).toContain("<p>فقرة جديدة<br>وسطر ثانٍ</p>");
      expect(saved.content).not.toContain(">" + MAP_URL + "<");

      await screenshot(page, "editor");
    });

    test("a picture is uploaded and inserted where the cursor is", async ({ page, context }) => {
      const seen = await mockApi(page, { signedIn: true });
      await signIn(context);
      await page.goto(editorUrl);

      const editor = page.locator(".ProseMirror");
      await editor.locator("p", { hasText: "والريح تعوي" }).click();
      await page.locator('input[type="file"][accept*="image/webp"]').setInputFiles({
        name: "art.png",
        mimeType: "image/png",
        buffer: PIXEL,
      });
      await expect(editor.locator(`img[src="${NEW_PICTURE_URL}"]`)).toBeVisible();
      expect(seen.uploads).toBe(1);

      await editor.locator(".sard-chapter-image").filter({ has: page.locator(`img[src="${NEW_PICTURE_URL}"]`) })
        .getByLabel("التعليق التوضيحي للصورة").fill("رسم البطلة");
      await page.getByTestId("save-status").click();
      await page.getByRole("button", { name: /^حفظ/ }).first().click();
      await expect.poll(() => seen.patches.filter((p) => !p.dryRun).length).toBe(1);
      const saved = seen.patches.find((p) => !p.dryRun).body;
      expect(saved.content).toContain(`<p data-kind="image"><img src="${NEW_PICTURE_URL}">رسم البطلة</p>`);
    });

    test("a save that would delete comments asks first; a conflict saves nothing", async ({ page, context }) => {
      let conflict = false;
      const seen = await mockApi(page, {
        signedIn: true,
        onPatch: (route, { dryRun, json }) => {
          if (dryRun) return json(route, { paragraphsRemoved: 1, commentsDeleted: 3, removed: [{ paragraphId: "p0", commentsCount: 3 }] });
          if (conflict) {
            return json(route, { code: "ChapterChanged", message: "حُفظ هذا الفصل من مكان آخر بعد أن فتحته. حمّل آخر نسخة منه قبل أن تحفظ.", revision: 9 }, 409);
          }
          return json(route, { success: true, revision: 8, status: "Published" });
        },
      });
      await signIn(context);
      await page.goto(editorUrl);

      const editor = page.locator(".ProseMirror");
      await editor.locator("p", { hasText: "والريح تعوي" }).click();
      await page.keyboard.press("End");
      await page.keyboard.type(" بشدة");

      await page.getByRole("button", { name: /^حفظ/ }).first().click();
      const warning = page.getByTestId("comment-loss-modal");
      await expect(warning).toContainText("سيُحذف 3 تعليقات");
      expect(seen.patches.filter((p) => !p.dryRun)).toHaveLength(0);
      await screenshot(page, "comment-warning");

      // Back to editing: nothing saved. Then the save, confirmed, meets a newer copy saved elsewhere.
      await warning.getByRole("button", { name: "عُد إلى التحرير" }).click();
      expect(seen.patches.filter((p) => !p.dryRun)).toHaveLength(0);

      conflict = true;
      await page.getByRole("button", { name: /^حفظ/ }).first().click();
      await warning.getByRole("button", { name: "احفظ واحذف التعليقات" }).click();
      await expect(page.getByTestId("chapter-conflict-modal")).toBeVisible();
      await expect(page.getByTestId("save-status")).toContainText("تغييرات غير محفوظة");
      await screenshot(page, "conflict");
    });
  });
}
