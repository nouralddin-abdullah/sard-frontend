import { test, expect } from "@playwright/test";

test.describe("Novel Page - Figma Design Implementation", () => {
  test.beforeEach(async ({ page }) => {
    // Mock the API call to return our static data
    await page.route(
      "**/api/novel/test-novel",
      (route) => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            title: "سندرباد",
            coverImageUrl:
              "https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=600&fit=crop",
            summary:
              'في قلب مدينة بغداد القديمة، وُلد فتى ذكي يُدعى سندرباد. كان فقيراً، لكنه أبداً ما اشتكى...',
            status: "مستمرة",
            totalAverageScore: 4.0,
            reviewCount: 1267,
            createdAt: "2025-03-01T00:00:00Z",
            author: {
              userName: "author",
              displayName: "الفنط المِسمشمشي",
              profilePhoto:
                "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
            },
            genresList: [
              { name: "فعال" },
              { name: "أكشن" },
              { name: "مغامرات" },
            ],
          }),
        });
      }
    );

    await page.goto("/novel/test-novel");
  });

  test("should display hero section with cover image and novel details", async ({
    page,
  }) => {
    // Verify cover image is visible
    const coverImage = page.locator('img[alt="سندرباد"]').first();
    await expect(coverImage).toBeVisible();

    // Verify title
    await expect(page.getByText("سندرباد").first()).toBeVisible();

    // Verify genre badges
    await expect(page.getByText("فعال")).toBeVisible();
    await expect(page.getByText("أكشن")).toBeVisible();
    await expect(page.getByText("مغامرات")).toBeVisible();

    // Verify summary is visible
    await expect(
      page.getByText(/في قلب مدينة بغداد القديمة/)
    ).toBeVisible();

    // Verify author section
    await expect(page.getByText("الفنط المِسمشمشي")).toBeVisible();

    // Verify rating display
    await expect(page.getByText("4")).toBeVisible();
    await expect(page.getByText("(1267)")).toBeVisible();
  });

  test("should have correct background colors matching Figma", async ({
    page,
  }) => {
    // Check main background color
    const mainContainer = page.locator("div").first();
    const bgColor = await mainContainer.evaluate((el) =>
      window.getComputedStyle(el).backgroundColor
    );

    // #2C2C2C should be rgb(44, 44, 44)
    expect(bgColor).toBe("rgb(44, 44, 44)");

    // Check hero section background (#3C3C3C)
    const heroSection = page.locator(".bg-\\[\\#3C3C3C\\]").first();
    const heroBg = await heroSection.evaluate((el) =>
      window.getComputedStyle(el).backgroundColor
    );
    expect(heroBg).toBe("rgb(60, 60, 60)");
  });

  test("should display tabs navigation", async ({ page }) => {
    // Verify all tabs are present
    await expect(page.getByRole("button", { name: /الفصول/ })).toBeVisible();
    await expect(
      page.getByRole("button", { name: /الشخصيات/ })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /التقييمات/ })
    ).toBeVisible();

    // Test tab switching
    await page.getByRole("button", { name: /الشخصيات/ }).click();
    await page.waitForTimeout(300); // Allow transition

    // Verify tab is active (should have different background)
    const characterTab = page.getByRole("button", { name: /الشخصيات/ });
    const tabBg = await characterTab.evaluate((el) =>
      window.getComputedStyle(el).backgroundColor
    );

    // Active tab should have bg-neutral-700 or similar
    expect(tabBg).not.toBe("rgba(0, 0, 0, 0)");
  });

  test("should display action buttons in sidebar", async ({ page }) => {
    // Verify all action buttons
    await expect(page.getByText("أضف لقائمة القراءة")).toBeVisible();
    await expect(page.getByText("قم بالتبليغ عن الرواية")).toBeVisible();
    await expect(page.getByText("شارك الرواية مع...")).toBeVisible();
  });

  test("should display recommendation section", async ({ page }) => {
    // Verify recommendation section title
    await expect(page.getByText("قد تعجبك أيضاً")).toBeVisible();

    // Verify recommendation card displays
    await expect(page.getByText("لنا فقط جندي")).toBeVisible();
    await expect(page.getByText("الخلافة الهانج")).toBeVisible();
  });

  test("should display chapter list", async ({ page }) => {
    // Verify all 12 chapters are rendered
    const chapterRows = page.locator("text=سندرباد مالك البحار");
    await expect(chapterRows).toHaveCount(12);

    // Verify chapter dates are displayed
    const dateElements = page.locator("text=3 مارس 2025");
    await expect(dateElements).toHaveCount(12);
  });

  test("should have hover effects on chapter items", async ({ page }) => {
    const firstChapter = page
      .locator("text=سندرباد مالك البحار")
      .first()
      .locator("..");

    // Get initial background
    const initialBg = await firstChapter.evaluate((el) =>
      window.getComputedStyle(el).backgroundColor
    );

    // Hover over chapter
    await firstChapter.hover();
    await page.waitForTimeout(100); // Allow transition

    // Get background after hover
    const hoverBg = await firstChapter.evaluate((el) =>
      window.getComputedStyle(el).backgroundColor
    );

    // Background should change on hover
    expect(initialBg).not.toBe(hoverBg);
  });

  test("should have hover effects on action buttons", async ({ page }) => {
    const addButton = page
      .locator("text=أضف لقائمة القراءة")
      .first()
      .locator("..");

    // Get initial opacity
    const initialOpacity = await addButton.evaluate((el) =>
      window.getComputedStyle(el).opacity
    );

    // Hover
    await addButton.hover();
    await page.waitForTimeout(100);

    // Check opacity changed
    const hoverOpacity = await addButton.evaluate((el) =>
      window.getComputedStyle(el).opacity
    );

    // Opacity should be different (0.8 on hover)
    expect(parseFloat(hoverOpacity)).toBeLessThan(parseFloat(initialOpacity));
  });

  test("should display SVG icons for action buttons", async ({ page }) => {
    // Verify SVG icons are rendered
    const svgIcons = page.locator("svg");
    const iconCount = await svgIcons.count();

    // Should have multiple SVG icons (action buttons + stars + author icon)
    expect(iconCount).toBeGreaterThan(5);
  });

  test("should have correct shadow effects", async ({ page }) => {
    // Check shadow on hero section
    const heroSection = page.locator(".shadow-\\[6px_12px_10px_black\\]").first();
    const boxShadow = await heroSection.evaluate((el) =>
      window.getComputedStyle(el).boxShadow
    );

    // Should have box shadow defined
    expect(boxShadow).not.toBe("none");
    expect(boxShadow).toContain("rgb(0, 0, 0)");
  });

  test("should render in RTL direction", async ({ page }) => {
    const mainContainer = page.locator('[dir="rtl"]');
    await expect(mainContainer).toBeVisible();

    const dir = await mainContainer.evaluate((el) =>
      el.getAttribute("dir")
    );
    expect(dir).toBe("rtl");
  });

  test("should be responsive at tablet viewport (768px)", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    // Verify layout still works
    await expect(page.getByText("سندرباد").first()).toBeVisible();
    await expect(page.getByText("قد تعجبك أيضاً")).toBeVisible();

    // Verify no horizontal scroll
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // Allow 1px tolerance
  });

  test("should be responsive at mobile viewport (375px)", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Verify layout still works
    await expect(page.getByText("سندرباد").first()).toBeVisible();
    await expect(page.getByText("أضف لقائمة القراءة")).toBeVisible();

    // Verify no horizontal scroll
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });

  test("should have correct rounded corners per Figma design", async ({
    page,
  }) => {
    // Check hero section border radius (rounded-2xl = 1rem = 16px)
    const heroSection = page.locator(".rounded-2xl").first();
    const borderRadius = await heroSection.evaluate((el) =>
      window.getComputedStyle(el).borderRadius
    );

    // Should be 16px (1rem)
    expect(borderRadius).toContain("16px");
  });

  test("should display star ratings correctly", async ({ page }) => {
    // Find star icons (should be 4 filled stars based on rating 4.0)
    const stars = page.locator("svg").filter({ hasText: "" });
    const starCount = await stars.count();

    // Should have star elements visible
    expect(starCount).toBeGreaterThan(0);
  });
});
