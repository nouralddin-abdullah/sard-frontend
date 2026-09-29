/* global process, Buffer */
import { test, expect } from "@playwright/test";

// Gift messages (#31): the optional message box in the gift dialog (only when GET /api/app/config announces
// gifts.messageMaxLength), messages under the novel's recent gifts and under the author's gift notification, and
// reporting them (target type GiftMessage, by the gift's id). The API is mocked, so this runs without a backend.
// GIFT_SCREENS_DIR=<dir> also saves screenshots of each state.

const API = "https://api-sareed.runasp.net";
const SCREENS_DIR = process.env.GIFT_SCREENS_DIR;

const ME = { id: "6f1c2a4e-0000-4000-8000-000000000001", userName: "reader1", displayName: "قارئ تجريبي", email: "reader1@example.test" };
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
  lastUpdatedAt: "2026-09-28T10:00:00Z",
  createdAt: "2026-09-01T10:00:00Z",
  totalAverageScore: 0,
  reviewCount: 0,
  chapterCount: 0,
  author: AUTHOR,
};
const ROSE = { id: "ec16dfde-71b8-4e23-8ff5-d1846cdf2036", name: "Rose", nameAr: "وردة", imageUrl: "", cost: 100, isActive: true, createdAt: "2026-01-01T00:00:00Z" };

const LONG_MESSAGE =
  "شكراً لكِ على هذه الرواية الرائعة! الفصل الأخير جعلني أبكي من شدة جماله، وأنتظر الفصل القادم بفارغ الصبر 🌹✨ استمري";
const MIXED_MESSAGE = "Keep going! استمري في الكتابة 💪";

const gift = (id, sender, message, minutesAgo) => ({
  id,
  gift: ROSE,
  novelId: NOVEL.id,
  novelSlug: NOVEL.slug,
  senderUserName: sender.userName,
  senderDisplayName: sender.displayName,
  senderProfilePhoto: null,
  count: 1,
  totalCost: 100,
  createdAt: new Date(Date.now() - minutesAgo * 60000).toISOString(),
  message,
});
const OTHER = { userName: "noor_reads", displayName: "نور" };
const RECENT_GIFTS = [
  gift("a0000000-0000-4000-8000-000000000001", OTHER, LONG_MESSAGE, 3),
  gift("a0000000-0000-4000-8000-000000000002", ME, MIXED_MESSAGE, 30),
  gift("a0000000-0000-4000-8000-000000000003", { userName: "sami", displayName: "سامي" }, null, 90),
];

const GIFT_NOTIFICATION_ID = "e0000000-0000-4000-8000-000000000001";
const GIFT_TRANSACTION_ID = "a0000000-0000-4000-8000-000000000001";
const notification = (id, type, message, extra = {}) => ({
  id,
  type,
  actorId: "u-other",
  actorDisplayName: OTHER.displayName,
  actorProfilePhoto: null,
  message,
  actionUrl: `/novel/${NOVEL.slug}`,
  isRead: false,
  createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
  relatedEntityId: NOVEL.id,
  relatedEntityType: "Gift",
  giftId: null,
  giftNameAr: null,
  giftCount: null,
  giftTransactionId: null,
  giftMessage: null,
  ...extra,
});
const NOTIFICATIONS = {
  notifications: [
    notification(GIFT_NOTIFICATION_ID, "GiftReceived", `${OTHER.displayName} أرسل وردة إلى روايتك «${NOVEL.title}»`, {
      giftId: ROSE.id, giftNameAr: "وردة", giftCount: 1, giftTransactionId: GIFT_TRANSACTION_ID, giftMessage: LONG_MESSAGE,
    }),
    notification("e0000000-0000-4000-8000-000000000002", "GiftReceived", `سامي أرسل وردة ×3 إلى روايتك «${NOVEL.title}»`, {
      giftId: ROSE.id, giftNameAr: "وردة", giftCount: 3, giftTransactionId: "a0000000-0000-4000-8000-000000000003",
    }),
    notification("e0000000-0000-4000-8000-000000000003", "NewFollower", `${OTHER.displayName} بدأ بمتابعتك`, {
      actionUrl: `/profile/${OTHER.userName}`, relatedEntityId: null, relatedEntityType: null,
    }),
  ],
  totalCount: 3,
  unreadCount: 3,
  pageNumber: 1,
  pageSize: 20,
  totalPages: 1,
};

// A 1x1 grey PNG for every image the pages load (covers, avatars).
const PIXEL = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkaGj4DwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");

/** Mocks the API the novel and notifications pages read; returns what the test can change and inspect. */
const mockApi = async (page, { signedIn = true, messageMaxLength = 200, sendAnswer = null, gifts = RECENT_GIFTS } = {}) => {
  const state = { sends: [], reports: [], reads: [], unmocked: new Set() };
  const json = (route, body, status = 200) =>
    route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });

  await page.route(/^https:\/\/(images\.test|ui-avatars\.com)\//, (route) =>
    route.fulfill({ status: 200, contentType: "image/png", body: PIXEL })
  );
  await page.route(`${API}/**`, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();
    const path = decodeURIComponent(url.pathname);

    if (path === "/api/User/my-profile") return signedIn ? json(route, ME) : json(route, {}, 401);
    if (path === "/api/app/config")
      return json(route, {
        android: { minVersion: "1.0.0", latestVersion: "1.0.0" },
        ios: { minVersion: "1.0.0", latestVersion: "1.0.0" },
        maintenance: { enabled: false, messageAr: null },
        ...(messageMaxLength ? { gifts: { messageMaxLength } } : {}),
      });
    if (path === `/api/novel/${NOVEL.slug}` || path === `/api/novel/by-id/${NOVEL.id}`) return json(route, NOVEL);
    if (path === `/api/novel/${NOVEL.id}/chapter`) return json(route, []);
    if (path === `/api/novel/${NOVEL.id}/recommendations`) return json(route, []);
    if (path === `/api/library/novel/${NOVEL.id}/progress`) return json(route, {}, 404);
    if (path === `/api/gift/novel/${NOVEL.id}`)
      return json(route, { items: gifts, totalPages: 1, totalItemsCount: gifts.length, itemsFrom: 1, itemsTo: gifts.length });
    if (path === "/api/wallet") return json(route, { currentBalance: 5000, withdrawable: 0, pendingEarnings: 0, nextReleaseAt: null });
    if (path === "/api/gift/send" && method === "POST") {
      state.sends.push(request.postDataJSON());
      if (sendAnswer) return json(route, sendAnswer.body, sendAnswer.status);
      return json(route, { success: true, message: `أرسلت 1× وردة إلى رواية «${NOVEL.title}»` });
    }
    if (path === "/api/reports" && method === "POST") {
      const body = request.postDataJSON();
      state.reports.push(body);
      return json(route, { id: "r0000000-0000-4000-8000-000000000001", ...body, status: "Open", createdAt: new Date().toISOString() }, 201);
    }
    if (path === "/api/notifications/unread-count") return json(route, { unreadCount: 1 });
    if (path === "/api/notifications") return json(route, NOTIFICATIONS);
    if (/^\/api\/notifications\/[^/]+\/read$/.test(path)) {
      state.reads.push(path);
      return route.fulfill({ status: 204 });
    }

    state.unmocked.add(`${method} ${path}`);
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

// The sidebar card under the «الهدايا الأخيرة» heading.
const recentGifts = (page) => page.getByRole("heading", { name: "الهدايا الأخيرة" }).locator("xpath=../..");

const openGiftDialog = async (page) => {
  await page.goto(`/novel/${NOVEL.slug}`);
  await page.getByRole("button", { name: "إرسال الهدية" }).first().click();
  const dialog = page.getByRole("dialog", { name: /إرسال هدية إلى/ });
  await expect(dialog).toBeVisible();
  // The rose.
  await dialog.getByText("وردة", { exact: true }).click();
  return dialog;
};

for (const width of [390, 1440]) {
  test.describe(`Gift messages at ${width}px`, () => {
    test.use({ viewport: { width, height: width < 600 ? 844 : 900 } });

    test("the gift dialog takes an optional message, counts it as the API does and blocks one over the limit", async ({ page, context }) => {
      const api = await mockApi(page);
      await signIn(context);
      const dialog = await openGiftDialog(page);

      const box = dialog.getByRole("textbox", { name: /رسالة إلى الكاتب/ });
      await expect(box).toBeVisible();
      await expect(box).toHaveAttribute("dir", "auto");
      await expect(dialog.getByText("تظهر رسالتك للجميع تحت هدايا الرواية.")).toBeVisible();
      const counter = dialog.locator("#gift-message-count");
      await expect(counter).toHaveText("0/200");

      await box.fill("  شكراً على الفصل الأخير 🌹  ");
      // Trimmed, and the rose counts as one character.
      await expect(counter).toHaveText(`${characters("شكراً على الفصل الأخير 🌹")}/200`);
      await screenshot(page, "dialog-message", dialog);

      // 201 emoji: 402 UTF-16 units, 201 characters: over the limit, and sending is blocked.
      await box.fill("🌹".repeat(201));
      await expect(counter).toHaveText("201/200");
      await expect(dialog.getByRole("alert")).toHaveText("الرسالة أطول من 200 حرف، اختصرها لتتمكن من الإرسال.");
      await expect(box).toHaveAttribute("aria-invalid", "true");
      const send = dialog.getByRole("button", { name: "إرسال الهدية" });
      await expect(send).toBeDisabled();
      await screenshot(page, "dialog-over-limit", dialog);

      // 200 are fine.
      await box.fill("🌹".repeat(200));
      await expect(counter).toHaveText("200/200");
      await expect(dialog.getByRole("alert")).toHaveCount(0);
      await expect(send).toBeEnabled();

      await box.fill("  شكراً على الفصل الأخير 🌹\n");
      await send.click();
      await expect(page.getByText("تم إرسال 1x وردة إلى ظل الأمير بنجاح!")).toBeVisible();
      expect(api.sends).toEqual([{ giftId: ROSE.id, novelId: NOVEL.id, count: 1, message: "شكراً على الفصل الأخير 🌹" }]);

      // A blank message is none: not sent at all.
      await page.getByRole("button", { name: "إرسال الهدية" }).first().click();
      await dialog.getByText("وردة", { exact: true }).click();
      await expect(box).toHaveValue(""); // every opening starts without one
      await box.fill("   \n  ");
      await dialog.getByRole("button", { name: "إرسال الهدية" }).click();
      await expect.poll(() => api.sends.length).toBe(2);
      expect(api.sends[1]).toEqual({ giftId: ROSE.id, novelId: NOVEL.id, count: 1 });
      expect([...api.unmocked].filter((call) => call.includes("/gift"))).toEqual([]);
    });

    test("an API that doesn't announce messages gets no message box", async ({ page, context }) => {
      const api = await mockApi(page, { messageMaxLength: null });
      await signIn(context);
      const dialog = await openGiftDialog(page);

      await expect(dialog.getByRole("button", { name: "إرسال الهدية" })).toBeEnabled();
      await expect(dialog.getByRole("textbox", { name: /رسالة إلى الكاتب/ })).toHaveCount(0);
      await dialog.getByRole("button", { name: "إرسال الهدية" }).click();
      await expect.poll(() => api.sends.length).toBe(1);
      expect(api.sends[0]).toEqual({ giftId: ROSE.id, novelId: NOVEL.id, count: 1 });
    });

    test("refusals of the message are shown in Arabic by their code, and the dialog stays open", async ({ page, context }) => {
      await mockApi(page, {
        sendAnswer: { status: 403, body: { code: "Blocked", message: "لا يمكنك إرسال رسالة إلى هذا الكاتب." } },
      });
      await signIn(context);
      const dialog = await openGiftDialog(page);
      const box = dialog.getByRole("textbox", { name: /رسالة إلى الكاتب/ });

      await box.fill("مرحباً");
      await dialog.getByRole("button", { name: "إرسال الهدية" }).click();

      const blocked = "لا يمكنك إرسال رسالة إلى هذا الكاتب. يمكنك إرسال الهدية دون رسالة.";
      await expect(dialog.getByRole("alert")).toHaveText(blocked);
      await expect(page.locator("[data-sonner-toast]").filter({ hasText: blocked })).toBeVisible();
      await expect(dialog).toBeVisible();
      await screenshot(page, "dialog-blocked", dialog);
      // Editing the message clears it.
      await box.fill("مرحباً مجدداً");
      await expect(dialog.getByRole("alert")).toHaveCount(0);
    });

    test("a message the API finds too long says so with the API's limit", async ({ page, context }) => {
      await mockApi(page, {
        sendAnswer: { status: 400, body: { success: false, code: "GiftMessageTooLong", message: "الرسالة طويلة: الحد الأقصى 200 حرف." } },
      });
      await signIn(context);
      const dialog = await openGiftDialog(page);

      await dialog.getByRole("textbox", { name: /رسالة إلى الكاتب/ }).fill("رسالة");
      await dialog.getByRole("button", { name: "إرسال الهدية" }).click();

      await expect(dialog.getByRole("alert")).toHaveText("الرسالة طويلة: الحد الأقصى 200 حرف.");
      await expect(dialog).toBeVisible();
    });

    test("recent gifts show their messages as plain text, reportable except one's own", async ({ page, context }) => {
      const html = "<b>عريض</b> <img src=x onerror=alert(1)>";
      const withHtml = gift("a0000000-0000-4000-8000-000000000004", { userName: "tester2", displayName: "مختبر" }, html, 1);
      const api = await mockApi(page, { gifts: [withHtml, ...RECENT_GIFTS].slice(0, 3) });
      await signIn(context);
      await page.goto(`/novel/${NOVEL.slug}`);
      const section = recentGifts(page);
      await expect(section.getByText(LONG_MESSAGE)).toBeVisible();

      // Escaped: the markup shows as text and makes no element.
      const escaped = section.getByText(html, { exact: true });
      await expect(escaped).toBeVisible();
      await expect(escaped).toHaveAttribute("dir", "auto");
      await expect(escaped.locator("b, img")).toHaveCount(0);
      // The reader's own message has no report action; the others' have one each.
      await expect(section.getByText(MIXED_MESSAGE)).toBeVisible();
      await expect(section.getByRole("button", { name: /الإبلاغ عن رسالة/ })).toHaveCount(2);
      await expect(section.getByRole("button", { name: `الإبلاغ عن رسالة ${ME.displayName}` })).toHaveCount(0);

      await section.getByRole("button", { name: `الإبلاغ عن رسالة ${OTHER.displayName}` }).click();
      const report = page.getByRole("dialog", { name: "الإبلاغ عن رسالة هدية" });
      await expect(report).toBeVisible();
      await report.getByText("إساءة أو تحرّش").click();
      await report.getByRole("button", { name: "إرسال البلاغ" }).click();
      await expect(page.getByText("تم إرسال البلاغ، شكراً لك. سيراجعه فريق سرد.")).toBeVisible();
      expect(api.reports).toEqual([
        { targetType: "GiftMessage", targetId: RECENT_GIFTS[0].id, reason: "Harassment", details: null },
      ]);
    });

    test("signed out, recent gifts show their messages without a report action", async ({ page }) => {
      await mockApi(page, { signedIn: false });
      await page.goto(`/novel/${NOVEL.slug}`);
      const section = recentGifts(page);

      await expect(section.getByText(LONG_MESSAGE)).toBeVisible();
      await expect(section.getByText(MIXED_MESSAGE)).toBeVisible();
      await expect(section.getByRole("button", { name: /الإبلاغ عن رسالة/ })).toHaveCount(0);
      await section.scrollIntoViewIfNeeded();
      await screenshot(page, "recent-gifts-signed-out", section);
    });

    test("recent gifts, signed in", async ({ page, context }) => {
      await mockApi(page);
      await signIn(context);
      await page.goto(`/novel/${NOVEL.slug}`);
      const section = recentGifts(page);
      await expect(section.getByText(LONG_MESSAGE)).toBeVisible();
      await section.scrollIntoViewIfNeeded();
      await screenshot(page, "recent-gifts", section);
      if (width < 600) {
        await screenshot(page, "novel-page-recent-gifts");
      }
    });

    test("the author's gift notification shows the message and reports it by the gift's id", async ({ page, context }) => {
      const api = await mockApi(page);
      await signIn(context);
      await page.goto("/notifications");

      // The row of the gift with a message, around its link.
      const link = page.getByRole("link", { name: `${OTHER.displayName} أرسل وردة إلى روايتك «${NOVEL.title}»` });
      const item = link.locator("xpath=ancestor::div[contains(@class, 'relative')][1]");
      const message = item.getByText(LONG_MESSAGE);
      await expect(message).toBeVisible();
      await expect(message).toHaveAttribute("dir", "auto");
      // Only the gift that has a message offers it; other notifications don't.
      await expect(page.getByRole("button", { name: "إبلاغ عن الرسالة" })).toHaveCount(1);
      await screenshot(page, "notifications");

      await item.getByRole("button", { name: "إبلاغ عن الرسالة" }).click();
      const report = page.getByRole("dialog", { name: "الإبلاغ عن رسالة هدية" });
      await expect(report).toBeVisible();
      await expect(page).toHaveURL(/\/notifications$/); // reporting doesn't open the notification
      await report.getByText("محتوى مزعج أو إعلاني").click();
      await report.getByRole("button", { name: "إرسال البلاغ" }).click();
      await expect(page.getByText("تم إرسال البلاغ، شكراً لك. سيراجعه فريق سرد.")).toBeVisible();
      expect(api.reports).toEqual([{ targetType: "GiftMessage", targetId: GIFT_TRANSACTION_ID, reason: "Spam", details: null }]);

      // The rest of the row still opens the notification, and marks it read.
      await link.click();
      await expect(page).toHaveURL(new RegExp(`/novel/${encodeURIComponent(NOVEL.slug)}$`));
      expect(api.reads).toEqual([`/api/notifications/${GIFT_NOTIFICATION_ID}/read`]);
    });
  });
}
