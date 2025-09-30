import { test, expect } from "@playwright/test";

const WORK_ID = "f05f953f-3f2c-4ee5-b88f-d6b414f4157a";
const CHAPTER_ID = "chapter-alpha";
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

const mockChapter = {
  id: CHAPTER_ID,
  title: "Harmonic Drift",
  status: "Draft",
  content: "A luminous tide arcs across the observatory dome signalling the choir to begin their harmonic drift ritual.",
  updatedAt: "2025-01-15T10:00:00.000Z",
};

async function primeChapterEditor(page) {
  await page.addInitScript(({ tokenKey }) => {
    window.sessionStorage.clear();
    document.cookie = `${tokenKey}=playwright-dev-token`;
  }, { tokenKey: "sard-auth-token" });

  await page.route(`${API_BASE}/api/myworks/${WORK_ID}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockWork),
    });
  });

  await page.route(`${API_BASE}/api/myworks/${WORK_ID}/chapters/${CHAPTER_ID}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ...mockChapter, wordCount: 1180 }),
    });
  });
}

test.describe("Chapter editor delete modal", () => {
  test("surfaces irreversible action styling and context", async ({ page }) => {
    await primeChapterEditor(page);

    await page.goto(`/dashboard/works/${WORK_ID}/chapters/${CHAPTER_ID}/edit`);
    await page.waitForLoadState("networkidle");

    const deleteTrigger = page.getByRole("button", { name: "Delete chapter" });
    await expect(deleteTrigger).toBeEnabled();
    await deleteTrigger.click();

    const modal = page.getByTestId("delete-chapter-modal");
    await expect(modal).toBeVisible();
    await expect(modal.getByText("Irreversible")).toBeVisible();
    await expect(page.getByTestId("delete-modal-chapter-label")).toHaveText("Harmonic Drift");
    await expect(modal.getByText(/words/i)).toContainText("words");
    await expect(modal.getByText("Impact")).toBeVisible();
    await expect(modal.getByText("Recovery")).toBeVisible();
    await expect(modal.getByText("Export or copy any passages you want to reuse before confirming.")).toBeVisible();
    await expect(page.getByTestId("confirm-delete-chapter")).toBeEnabled();

    await page.getByRole("button", { name: "Keep chapter" }).click();
    await expect(modal).toBeHidden();
  });
});
