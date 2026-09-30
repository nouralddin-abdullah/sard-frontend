/* global process, Buffer */
import { test, expect } from "@playwright/test";

// Writing a post (#43): the composer on one's own profile mirrors the API's rules. It counts the text as the API does
// (trimmed, user-perceived characters) against posts.contentMaxLength from GET /api/app/config, takes JPEG, PNG and WebP
// pictures up to posts.imageMaxBytes and refuses others before uploading, lets a post go with only a picture, and shows
// the API's Arabic message for any refusal. The API is mocked, so this runs without a backend.
// POST_SCREENS_DIR=<dir> also saves screenshots of each state.

const API = "https://api-sareed.runasp.net";
const SCREENS_DIR = process.env.POST_SCREENS_DIR;

const ME = {
  id: "6f1c2a4e-0000-4000-8000-000000000001",
  userName: "reader1",
  displayName: "قارئ تجريبي",
  email: "reader1@example.test",
  profilePhoto: null,
  profileBanner: null,
  userBio: "أحب الروايات الطويلة.",
  followersCount: 3,
  followingCount: 5,
};
const POST_LIMITS = { contentMaxLength: 5000, imageMaxBytes: 5 * 1024 * 1024, imageTypes: ["image/jpeg", "image/png", "image/webp"] };

// A 1x1 grey PNG, for the picture and every image the page loads.
const PIXEL = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkaGj4DwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");
const PNG = { name: "صورة.png", mimeType: "image/png", buffer: PIXEL };
const GIF = { name: "animation.gif", mimeType: "image/gif", buffer: Buffer.from("GIF89a\x01\x00\x01\x00\x00\x00\x00;", "latin1") };
const HEIC = { name: "IMG_0001.heic", mimeType: "image/heic", buffer: Buffer.alloc(1024) };
const SIX_MB_PNG = { name: "large.png", mimeType: "image/png", buffer: Buffer.alloc(6 * 1024 * 1024) };

const TYPE_MESSAGE = "صيغة الصورة غير مدعومة: اختر صورة JPEG أو PNG أو WebP.";
const SIZE_MESSAGE = "الصورة كبيرة: الحد الأقصى 5 ميغابايت.";

const post = (content, imageUrl) => ({
  id: "b0000000-0000-4000-8000-000000000001",
  user: { id: ME.id, userName: ME.userName, displayName: ME.displayName, profilePhoto: null },
  content,
  imageUrl,
  novel: null,
  createdAt: new Date().toISOString(),
  likesCount: 0,
  commentsCount: 0,
  isLikedByCurrentUser: false,
});

/** Mocks the API the profile page reads; returns what the test can inspect. */
const mockApi = async (page, { posts = POST_LIMITS, createAnswer = null } = {}) => {
  const state = { creates: [], listed: [] };
  const json = (route, body, status = 200) =>
    route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });

  await page.route(/^https:\/\/(images\.test|files\.test|ui-avatars\.com)\//, (route) =>
    route.fulfill({ status: 200, contentType: "image/png", body: PIXEL })
  );
  await page.route(`${API}/**`, async (route) => {
    const request = route.request();
    const method = request.method();
    const path = decodeURIComponent(new URL(request.url()).pathname);

    if (path === "/api/User/my-profile") return json(route, ME);
    if (path === "/api/app/config")
      return json(route, {
        android: { minVersion: "1.0.0", latestVersion: "1.0.0" },
        ios: { minVersion: "1.0.0", latestVersion: "1.0.0" },
        maintenance: { enabled: false, messageAr: null },
        gifts: { messageMaxLength: 200 },
        ...(posts ? { posts } : {}),
      });
    if (path === `/api/posts/user/${ME.id}`)
      return json(route, { items: state.listed, totalPages: 1, totalItemsCount: state.listed.length, itemsFrom: 1, itemsTo: state.listed.length });
    if (path === "/api/posts" && method === "POST") {
      // The multipart body as text: its field names, file name and types are ASCII or UTF-8.
      const body = request.postDataBuffer()?.toString("utf8") ?? "";
      state.creates.push(body);
      if (createAnswer) return json(route, createAnswer.body, createAnswer.status);
      const created = post(body.includes('name="content"') ? "نص" : "", body.includes('name="image"') ? "https://files.test/post-images/p.png" : null);
      state.listed = [created];
      return json(route, { success: true, message: "نُشر منشورك", post: created });
    }
    return json(route, {}, 404);
  });
  return state;
};

const signIn = (context) =>
  context.addCookies([{ name: "sard-auth-token", value: "test-token", url: "http://127.0.0.1:5173" }]);

const screenshot = async (page, name, locator) => {
  if (!SCREENS_DIR) return;
  const width = page.viewportSize().width;
  const path = `${SCREENS_DIR}/${name}-${width}.png`;
  await (locator ? locator.screenshot({ path }) : page.screenshot({ path, fullPage: false }));
};

const characters = (text) => [...new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text)].length;

const openComposer = async (page) => {
  await page.goto(`/profile/${ME.userName}`);
  await page.getByText("أكتب شئ").click();
  const dialog = page.getByRole("dialog", { name: "ماذا يدور في ذهنك؟" });
  await expect(dialog).toBeVisible();
  return dialog;
};

const toast = (page, text) => page.locator("[data-sonner-toast]").filter({ hasText: text });

for (const width of [390, 1440]) {
  test.describe(`Writing a post at ${width}px`, () => {
    test.use({ viewport: { width, height: width < 600 ? 844 : 900 } });

    test("the composer counts characters as the API does and blocks a post over the limit", async ({ page, context }) => {
      await mockApi(page);
      await signIn(context);
      const dialog = await openComposer(page);

      // Arabic and right to left, and nothing wider than the screen.
      await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
      await expect(dialog.locator("xpath=..")).toHaveAttribute("dir", "rtl");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      const box = dialog.getByRole("textbox", { name: "نص المنشور" });
      const counter = dialog.locator("#post-content-count");
      const publish = dialog.getByRole("button", { name: "نشر" });
      await expect(counter).toHaveText("0/5000");
      await expect(publish).toBeDisabled(); // nothing to post yet
      // The counter sits at the end of the toolbar: on the left, in RTL.
      const attach = await dialog.getByRole("button", { name: "إرفاق رواية" }).boundingBox();
      const count = await counter.boundingBox();
      expect(count.x).toBeLessThan(attach.x);

      // Trimmed, and an emoji, a family emoji or a letter with its tashkeel is one character.
      await box.fill("  منشورٌ جديد 🌹👨‍👩‍👧‍👦  \n");
      await expect(counter).toHaveText(`${characters("منشورٌ جديد 🌹👨‍👩‍👧‍👦")}/5000`);
      await expect(publish).toBeEnabled();
      await screenshot(page, "composer-text", dialog);

      // 5001 emoji: 10,002 UTF-16 units, 5001 characters: over the limit, and posting is blocked.
      await box.fill("🌹".repeat(5001));
      await expect(counter).toHaveText("5001/5000");
      await expect(counter).toHaveClass(/text-red-400/);
      await expect(dialog.getByRole("alert")).toHaveText("المنشور أطول من 5000 حرف، اختصره لتتمكن من النشر.");
      await expect(box).toHaveAttribute("aria-invalid", "true");
      await expect(publish).toBeDisabled();
      await screenshot(page, "composer-over-limit", dialog);

      // 5000 letters with tashkeel (10,000 units) are fine.
      await box.fill("بَ".repeat(5000));
      await expect(counter).toHaveText("5000/5000");
      await expect(dialog.getByRole("alert")).toHaveCount(0);
      await expect(publish).toBeEnabled();
    });

    test("the picker takes JPEG, PNG and WebP up to 5 MB, refuses others before uploading, and a picture alone can be posted", async ({ page, context }) => {
      const api = await mockApi(page);
      await signIn(context);
      const dialog = await openComposer(page);
      const picker = dialog.getByLabel("إرفاق صورة");
      const publish = dialog.getByRole("button", { name: "نشر" });
      await expect(picker).toHaveAttribute("accept", "image/jpeg,image/png,image/webp");

      for (const [file, message] of [[GIF, TYPE_MESSAGE], [HEIC, TYPE_MESSAGE], [SIX_MB_PNG, SIZE_MESSAGE]]) {
        await picker.setInputFiles(file);
        // Said next to the picker (no toast piling up over the buttons), and nothing is attached or sent.
        await expect(dialog.getByRole("alert")).toHaveText(message);
        await expect(dialog.getByRole("img", { name: "الصورة المرفقة" })).toHaveCount(0);
        await expect(publish).toBeDisabled();
      }
      await expect(page.locator("[data-sonner-toast]")).toHaveCount(0);
      expect(api.creates).toHaveLength(0);
      await screenshot(page, "composer-picture-refused", dialog);

      await picker.setInputFiles(PNG);
      await expect(dialog.getByRole("img", { name: "الصورة المرفقة" })).toBeVisible();
      await expect(dialog.getByRole("alert")).toHaveCount(0);
      // No text: a picture is enough.
      await expect(publish).toBeEnabled();
      await screenshot(page, "composer-picture", dialog);
      await publish.click();

      await expect(dialog).toBeHidden();
      expect(api.creates).toHaveLength(1);
      expect(api.creates[0]).toContain('name="image"');
      expect(api.creates[0]).toContain("Content-Type: image/png");
      expect(api.creates[0]).not.toContain('name="content"');
      // The new post, a picture without text, has no empty text block.
      const picture = page.getByRole("img", { name: "صورة المنشور" });
      await expect(picture).toBeVisible();
      const card = picture.locator("xpath=ancestor::div[contains(@class, 'rounded-xl')][1]");
      await expect(card.locator("p.whitespace-pre-wrap")).toHaveCount(0);
      await screenshot(page, "post-picture-only", card);
    });

    test("a refusal by the API shows its Arabic message, and the post stays as it was", async ({ page, context }) => {
      const uploadFailed = "تعذّر رفع الصورة، حاول مرة أخرى.";
      const api = await mockApi(page, {
        createAnswer: { status: 400, body: { success: false, code: "UploadFailed", message: uploadFailed, post: null } },
      });
      await signIn(context);
      const dialog = await openComposer(page);

      await dialog.getByRole("textbox", { name: "نص المنشور" }).fill("منشور بصورة");
      await dialog.getByLabel("إرفاق صورة").setInputFiles(PNG);
      await dialog.getByRole("button", { name: "نشر" }).click();

      await expect(dialog.getByRole("alert")).toHaveText(uploadFailed);
      await expect(toast(page, uploadFailed)).toBeVisible();
      await expect(dialog).toBeVisible();
      await expect(dialog.getByRole("textbox", { name: "نص المنشور" })).toHaveValue("منشور بصورة");
      await expect(dialog.getByRole("img", { name: "الصورة المرفقة" })).toBeVisible();
      expect(api.creates).toHaveLength(1);
      expect(api.creates[0]).toContain('name="content"');
      await screenshot(page, "composer-refused", dialog);

      // Editing the post clears it.
      await dialog.getByRole("textbox", { name: "نص المنشور" }).fill("منشور بصورة أخرى");
      await expect(dialog.getByRole("alert")).toHaveCount(0);
    });

    test("the API's own limits are used, and without them the same numbers", async ({ page, context }) => {
      await mockApi(page, { posts: { contentMaxLength: 10, imageMaxBytes: 1.5 * 1024 * 1024, imageTypes: ["image/png"] } });
      await signIn(context);
      let dialog = await openComposer(page);
      await expect(dialog.locator("#post-content-count")).toHaveText("0/10");
      await dialog.getByRole("textbox", { name: "نص المنشور" }).fill("أحد عشر حرفاً");
      await expect(dialog.getByRole("button", { name: "نشر" })).toBeDisabled();
      await expect(dialog.getByLabel("إرفاق صورة")).toHaveAttribute("accept", "image/png");
      await dialog.getByLabel("إرفاق صورة").setInputFiles({ ...PNG, buffer: Buffer.alloc(2 * 1024 * 1024) });
      await expect(dialog.getByRole("alert").getByText("الصورة كبيرة: الحد الأقصى 1.5 ميغابايت.")).toBeVisible();

      await page.unrouteAll({ behavior: "wait" });
      await mockApi(page, { posts: null });
      await page.reload();
      dialog = await openComposer(page);
      await expect(dialog.locator("#post-content-count")).toHaveText("0/5000");
      await expect(dialog.getByLabel("إرفاق صورة")).toHaveAttribute("accept", "image/jpeg,image/png,image/webp");
    });
  });
}
