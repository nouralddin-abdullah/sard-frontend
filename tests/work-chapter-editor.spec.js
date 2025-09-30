import { test, expect } from "@playwright/test";

const WORK_EDITOR_PATH = "/dashboard/works/demo/edit";

const primeLanguage = async (page, language) => {
	await page.addInitScript(({ language }) => {
		window.localStorage.setItem("language", language);
	}, { language });
};

test.describe("Work editor localization", () => {
	test("renders English workspace copy", async ({ page }) => {
		await primeLanguage(page, "en");
		await page.goto(WORK_EDITOR_PATH);

		await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
		await expect(page.getByRole("button", { name: "Story" })).toBeVisible();
		await expect(page.getByRole("button", { name: "Chapters" })).toBeVisible();
		await expect(page.getByRole("heading", { name: "Story details" })).toBeVisible();
		await expect(page.getByRole("heading", { name: "Cover art" })).toBeVisible();
		await expect(page.getByRole("heading", { name: "Launch checklist" })).toBeVisible();
		await expect(page.getByRole("heading", { name: "Chapter pacing" })).toBeVisible();
		await expect(page.getByRole("button", { name: /Back/i })).toBeVisible();
		await expect(page.getByPlaceholder("Search chapters")).toBeVisible();
	});

	test("renders Arabic workspace copy", async ({ page }) => {
		await primeLanguage(page, "ar");
		await page.goto(WORK_EDITOR_PATH);

		await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
		await expect(page.getByRole("button", { name: "القصة" })).toBeVisible();
		await expect(page.getByRole("button", { name: "الفصول" })).toBeVisible();
		await expect(page.getByRole("heading", { name: "تفاصيل القصة" })).toBeVisible();
		await expect(page.getByRole("heading", { name: "فن الغلاف" })).toBeVisible();
		await expect(page.getByRole("heading", { name: "قائمة الإطلاق" })).toBeVisible();
		await expect(page.getByRole("heading", { name: "إيقاع الفصول" })).toBeVisible();
		await expect(page.getByRole("button", { name: "رجوع" })).toBeVisible();
		await expect(page.getByPlaceholder("ابحث في الفصول")).toBeVisible();
	});
});
