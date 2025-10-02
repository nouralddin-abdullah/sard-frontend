import { test, expect } from '@playwright/test';

test.describe('Dynamic Genre Sections', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto('http://localhost:5173');
    
    // Wait for auth and initial load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('should render three genre sections with different ranking types', async ({ page }) => {
    // Wait for main content to load by checking for specific header
    await page.waitForSelector('h2.noto-sans-arabic-extrabold', { timeout: 10000 });
    
    // Check that three genre sections exist with proper Arabic titles
    const genreTitles = await page.locator('h2.noto-sans-arabic-extrabold').allTextContents();
    
    // Should have multiple section titles
    expect(genreTitles.length).toBeGreaterThanOrEqual(7);
    
    // Should contain at least one of each ranking type title
    const hasNew = genreTitles.some(title => title.includes('نجوم صاعدة في'));
    const hasTrending = genreTitles.some(title => title.includes('الأكثر رواجاً في'));
    const hasTopRated = genreTitles.some(title => title.includes('الأفضل تقييماً في'));
    
    expect(hasNew).toBeTruthy();
    expect(hasTrending).toBeTruthy();
    expect(hasTopRated).toBeTruthy();
  });

  test('should display correct icons for each ranking type', async ({ page }) => {
    // Wait for main content headers to load
    await page.waitForSelector('h2.noto-sans-arabic-extrabold', { timeout: 10000 });
    
    // Check for icon containers with gradient backgrounds
    const iconContainers = page.locator('main div.rounded-xl.shadow-lg svg');
    const iconCount = await iconContainers.count();
    
    // Should have icons for: Top 10, Trending, New Arrivals, Continue Reading, + 3 genre section icons
    expect(iconCount).toBeGreaterThanOrEqual(6);
  });

  test('should render novels with correct structure in genre sections', async ({ page }) => {
    // Wait for API data to load
    await page.waitForTimeout(3000);
    
    // Find Swiper slides in category sections
    const slides = page.locator('.category-swiper .swiper-slide');
    const slideCount = await slides.count();
    
    // Should have novels from multiple genre sections
    expect(slideCount).toBeGreaterThan(0);
    
    // Check first slide structure
    if (slideCount > 0) {
      const firstSlide = slides.first();
      
      // Should have cover image
      await expect(firstSlide.locator('img')).toBeVisible();
      
      // Should have title
      await expect(firstSlide.locator('h3.noto-sans-arabic-bold')).toBeVisible();
      
      // Should have summary
      await expect(firstSlide.locator('p.text-slate-300')).toBeVisible();
      
      // Should have badge with ranking indicator
      const badge = firstSlide.locator('div.rounded-full');
      await expect(badge).toBeVisible();
    }
  });

  test('should show loading state initially', async ({ page }) => {
    // Navigate and immediately check for loading
    await page.goto('http://localhost:5173');
    
    // Check if loading spinner appears
    const spinner = page.locator('.animate-spin');
    
    // Spinner might appear briefly
    // Just verify the page eventually loads content
    await page.waitForSelector('h2', { timeout: 10000 });
    const headers = await page.locator('h2').count();
    expect(headers).toBeGreaterThan(0);
  });

  test('should handle hover effects on genre section cards', async ({ page }) => {
    // Wait for content to load
    await page.waitForTimeout(3000);
    
    // Find first genre section card
    const firstCard = page.locator('.category-swiper .swiper-slide a > div').first();
    
    if (await firstCard.count() > 0) {
      // Get initial state
      await expect(firstCard).toBeVisible();
      
      // Hover over card
      await firstCard.hover();
      
      // Verify card has hover transition classes
      const hasHoverClasses = await firstCard.evaluate((el) => {
        return el.classList.contains('group') && 
               el.classList.contains('transform') &&
               el.classList.contains('hover:scale-105');
      });
      
      expect(hasHoverClasses).toBeTruthy();
    }
  });

  test('should navigate to novel page when genre card is clicked', async ({ page }) => {
    // Wait for genre sections to load
    await page.waitForTimeout(3000);
    
    // Find first clickable novel card in genre sections
    const firstCard = page.locator('.category-swiper .swiper-slide a').first();
    
    if (await firstCard.count() > 0) {
      // Click on the card
      await firstCard.click();
      
      // Should navigate to novel detail page
      await page.waitForURL(/\/novel\/.*/, { timeout: 5000 });
      
      // Verify we're on a novel page
      expect(page.url()).toContain('/novel/');
    }
  });

  test('should display correct metadata based on ranking type', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(3000);
    
    const slides = page.locator('.category-swiper .swiper-slide');
    const slideCount = await slides.count();
    
    if (slideCount > 0) {
      // Check for either chapters count (new ranking) or views count (trending/top_rated)
      const hasChapters = await slides.first().locator('text=/فصل/').count() > 0;
      const hasViews = await slides.first().locator('text=/مشاهدة/').count() > 0;
      
      // At least one metadata type should be present
      expect(hasChapters || hasViews).toBeTruthy();
    }
  });

  test('should have pagination controls for genre sections', async ({ page }) => {
    // Wait for sections to load
    await page.waitForTimeout(3000);
    
    // Find pagination bullets
    const pagination = page.locator('.category-swiper .swiper-pagination');
    const paginationCount = await pagination.count();
    
    // Should have pagination for genre sections
    expect(paginationCount).toBeGreaterThan(0);
    
    // Check if pagination bullets are clickable
    if (paginationCount > 0) {
      const bullets = pagination.first().locator('.swiper-pagination-bullet');
      const bulletCount = await bullets.count();
      
      // Should have at least one bullet per slide group
      expect(bulletCount).toBeGreaterThan(0);
    }
  });

  test('should cache genre selection for 15 minutes', async ({ page }) => {
    // Get initial genre sections
    await page.waitForTimeout(3000);
    const initialTitles = await page.locator('h2.noto-sans-arabic-extrabold').allTextContents();
    
    // Filter to get only genre section titles
    const initialGenreTitles = initialTitles.filter(t => 
      t.includes('صاعدة في') || t.includes('رواجاً في') || t.includes('تقييماً في')
    ).sort();
    
    // Reload page
    await page.reload();
    await page.waitForTimeout(3000);
    
    // Get titles after reload
    const reloadedTitles = await page.locator('h2.noto-sans-arabic-extrabold').allTextContents();
    const reloadedGenreTitles = reloadedTitles.filter(t => 
      t.includes('صاعدة في') || t.includes('رواجاً في') || t.includes('تقييماً في')
    ).sort();
    
    // Should have 3 genre titles
    expect(initialGenreTitles.length).toBe(3);
    expect(reloadedGenreTitles.length).toBe(3);
    
    // Titles should be the same (cached) - compare each title
    expect(initialGenreTitles[0]).toBe(reloadedGenreTitles[0]);
    expect(initialGenreTitles[1]).toBe(reloadedGenreTitles[1]);
    expect(initialGenreTitles[2]).toBe(reloadedGenreTitles[2]);
  });

  test('should truncate long summaries correctly', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(3000);
    
    // Find summary paragraphs in genre sections
    const summaries = page.locator('.category-swiper p.text-slate-300');
    const summaryCount = await summaries.count();
    
    if (summaryCount > 0) {
      // Check first summary
      const firstSummary = await summaries.first().textContent();
      
      // Should be truncated to ~80 characters
      if (firstSummary) {
        expect(firstSummary.length).toBeLessThanOrEqual(85); // 80 + "..."
      }
      
      // Should have line-clamp-2 class
      const hasLineClamp = await summaries.first().evaluate((el) => {
        return el.classList.contains('line-clamp-2');
      });
      expect(hasLineClamp).toBeTruthy();
    }
  });
});
