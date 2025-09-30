import { test, expect } from "@playwright/test";

const WORK_ID = "f05f953f-3f2c-4ee5-b88f-d6b414f4157a";
const API_BASE = "https://api-sareed.runasp.net";

const mockWork = {
  id: WORK_ID,
  title: "Atlas of Resonant Tides",
  summary: "Archivist Rana translates cosmic waveforms into navigational poetry.",
  status: "Ongoing",
  genresList: [
    { id: 4, name: "Fantasy" },
    { id: 9, name: "Mythic" },
  ],
};

const mockChapters = {
  items: [
    {
      id: "chapter-alpha",
      title: "Chapter 1: Harmonic Drift",
      status: "Draft",
      synopsis: "Rana discovers a new tidal cadence hidden beneath the city.",
      wordCount: 1840,
      createdAt: "2025-01-12T18:00:00.000Z",
      updatedAt: "2025-01-14T09:45:00.000Z",
    },
  ],
  totalCount: 1,
};

async function primeWorkEditorRoutes(page) {
  await page.addInitScript((tokenKey) => {
    window.sessionStorage.clear();
    document.cookie = `${tokenKey}=playwright-dev-token`;
  }, "sard-auth-token");

  await page.route(`${API_BASE}/api/myworks/${WORK_ID}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockWork),
    });
  });

  await page.route(`${API_BASE}/api/myworks/${WORK_ID}/chapters`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockChapters),
    });
  });
}

test.describe("Work editor chapter overflow menu", () => {
  test("positions the action menu directly under the trigger", async ({ page }) => {
    await primeWorkEditorRoutes(page);

    await page.goto(`/dashboard/works/${WORK_ID}/edit`);
    await page.getByRole("button", { name: "Chapters & pacing" }).click();

    const trigger = page.getByTestId("chapter-card-chapter-alpha-menu-trigger");
    await expect(trigger).toBeVisible();

  await trigger.click();
  const menu = page.locator("[data-chapter-menu]");
    await expect(menu).toBeVisible();

    const triggerBox = await trigger.boundingBox();
    const menuBox = await menu.boundingBox();
    if (!triggerBox || !menuBox) {
      throw new Error("Missing bounding boxes for trigger or menu");
    }

    expect(menuBox.y).toBeGreaterThanOrEqual(triggerBox.y + triggerBox.height - 4);

    const triggerRight = triggerBox.x + triggerBox.width;
    const menuRight = menuBox.x + menuBox.width;
    expect(Math.abs(menuRight - triggerRight)).toBeLessThanOrEqual(6);

    await expect(menu.getByRole("menuitem", { name: "Edit chapter" })).toBeVisible();
    await expect(menu.getByRole("menuitem", { name: "Delete chapter" })).toBeVisible();

    await trigger.click();
    await expect(menu).toBeHidden();
  });
});
