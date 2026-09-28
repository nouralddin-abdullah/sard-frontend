import { test, expect } from "@playwright/test";

// The wallet page's withdrawal history: a member cancels their own pending request (DELETE /api/wallet/withdraw/{id},
// #27). The API is mocked, so this runs without a backend.

const API = "https://api-sareed.runasp.net";
const ME = { id: "6f1c2a4e-0000-4000-8000-000000000001", userName: "tester", displayName: "قارئ تجريبي", email: "tester@example.test" };
const PENDING_ID = "a1b2c3d4-1111-4111-8111-111111111111";
const APPROVED_ID = "b2c3d4e5-2222-4222-8222-222222222222";
const CANCELLED_ID = "c3d4e5f6-3333-4333-8333-333333333333";

const request = (id, status, extra = {}) => ({
  id,
  pointsRequested: 5000,
  baseAmountEGP: 500,
  taxDeducted: 50,
  netAmountEGP: 450,
  withdrawalMethod: "InstaPay",
  paymentDetails: "01000000000",
  status,
  requestedAt: "2026-09-20T10:00:00Z",
  processedAt: status === "Pending" ? null : "2026-09-21T10:00:00Z",
  rejectionReason: null,
  cancelledByOwner: false,
  ...extra,
});

/** Mocks the API the profile's wallet tab reads; returns what the test can change and inspect. */
const mockApi = async (page, { cancelAnswer = { status: 204 } } = {}) => {
  const state = { pendingStatus: "Pending", deletes: [], unmocked: new Set() };
  const json = (route, body, status = 200) =>
    route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });

  await page.route(`${API}/**`, async (route) => {
    const url = new URL(route.request().url());
    const method = route.request().method();
    const path = url.pathname;

    if (path === "/api/User/my-profile") return json(route, ME);
    if (path === "/api/wallet" && method === "GET")
      return json(route, {
        currentBalance: 6500, totalRecharged: 5000, totalWithdrawn: 0, totalSpent: 0, totalEarned: 1500,
        withdrawable: state.pendingStatus === "Pending" ? 0 : 1500, pendingEarnings: 0, nextReleaseAt: null,
      });
    if (path === "/api/wallet/withdraw" && method === "GET") {
      const pending = state.pendingStatus === "Pending"
        ? request(PENDING_ID, "Pending")
        : request(PENDING_ID, "Rejected", { rejectionReason: "ألغاه صاحب الطلب", cancelledByOwner: true });
      return json(route, {
        requests: [
          pending,
          request(APPROVED_ID, "Approved", { pointsRequested: 1000, netAmountEGP: 90 }),
          request(CANCELLED_ID, "Rejected", { rejectionReason: "ألغاه صاحب الطلب", cancelledByOwner: true, pointsRequested: 2000, netAmountEGP: 180 }),
        ],
        totalCount: 3,
      });
    }
    if (path === `/api/wallet/withdraw/${PENDING_ID}` && method === "DELETE") {
      state.deletes.push(route.request().headers()["authorization"]);
      if (cancelAnswer.status === 204) {
        state.pendingStatus = "Rejected";
        return route.fulfill({ status: 204 });
      }
      return json(route, cancelAnswer.body, cancelAnswer.status);
    }
    if (path === "/api/wallet/recharge") return json(route, { requests: [], totalCount: 0 });
    if (path === "/api/wallet/transactions") return json(route, { transactions: [], totalCount: 0 });

    state.unmocked.add(`${method} ${path}`);
    return json(route, {}, 404);
  });
  return state;
};

const openWithdrawalHistory = async (page, context) => {
  await context.addCookies([{ name: "sard-auth-token", value: "test-token", url: "http://127.0.0.1:5173" }]);
  await page.goto("/profile/tester?tab=points");
  await page.getByRole("button", { name: "سجل السحب" }).click();
  await expect(page.getByText("#a1b2c3d4")).toBeVisible();
};

test.describe("Cancelling a pending withdrawal request", () => {
  test("only pending requests offer it; it asks first, then cancels and refreshes", async ({ page, context }) => {
    const api = await mockApi(page);
    await openWithdrawalHistory(page, context);

    const buttons = page.getByRole("button", { name: "إلغاء الطلب" });
    await expect(buttons).toHaveCount(1);
    await expect(page.getByRole("row").filter({ hasText: "#a1b2c3d4" }).getByRole("button", { name: "إلغاء الطلب" })).toBeVisible();
    // A request the member cancelled earlier shows as cancelled, not refused.
    await expect(page.getByRole("row").filter({ hasText: "#c3d4e5f6" })).toContainText("ملغى");

    await buttons.click();
    const dialog = page.getByText("إلغاء طلب السحب؟");
    await expect(dialog).toBeVisible();
    await expect(page.getByText("سيُلغى طلب سحب ٥٬٠٠٠ نقطة، وتعود نقاطه متاحة للسحب.", { exact: false })).toBeVisible();

    // Going back cancels nothing.
    await page.getByRole("button", { name: "تراجع" }).click();
    await expect(dialog).toBeHidden();
    expect(api.deletes).toHaveLength(0);

    await buttons.click();
    await page.locator("div.fixed").getByRole("button", { name: "إلغاء الطلب" }).click();

    await expect(page.getByText("أُلغي طلب السحب، وعادت نقاطه متاحة للسحب.")).toBeVisible();
    expect(api.deletes).toEqual(["Bearer test-token"]);
    await expect(page.getByRole("button", { name: "إلغاء الطلب" })).toHaveCount(0);
    await expect(page.getByRole("row").filter({ hasText: "#a1b2c3d4" })).toContainText("ملغى");
  });

  test("a refusal is shown in Arabic from its code", async ({ page, context }) => {
    await mockApi(page, {
      cancelAnswer: { status: 409, body: { code: "AlreadyProcessed", message: "قُبل طلب السحب هذا من قبل، فلا يمكن إلغاؤه." } },
    });
    await openWithdrawalHistory(page, context);

    await page.getByRole("button", { name: "إلغاء الطلب" }).click();
    await page.locator("div.fixed").getByRole("button", { name: "إلغاء الطلب" }).click();

    await expect(page.getByText("قُبل طلب السحب هذا من قبل، فلا يمكن إلغاؤه.")).toBeVisible();
  });

  test("a refusal without an Arabic message falls back to one by its code", async ({ page, context }) => {
    await mockApi(page, { cancelAnswer: { status: 404, body: { code: "RequestNotFound", message: "Not found" } } });
    await openWithdrawalHistory(page, context);

    await page.getByRole("button", { name: "إلغاء الطلب" }).click();
    await page.locator("div.fixed").getByRole("button", { name: "إلغاء الطلب" }).click();

    await expect(page.getByText("طلب السحب غير موجود")).toBeVisible();
  });
});
