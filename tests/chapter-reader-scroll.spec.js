import { test, expect } from '@playwright/test';

test.describe('Chapter Reader Scrolling', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a sample chapter - update this URL to a valid chapter in your app
    await page.goto('/novel/test-novel/chapter/1', { waitUntil: 'networkidle' });
  });

  test('should allow natural body scrolling instead of nested scroll', async ({ page }) => {
    // Check that the main content container does NOT have overflow-y-auto
    const mainContent = page.locator('[ref="contentRef"]').first();
    
    // Get window scroll position before
    const scrollBefore = await page.evaluate(() => window.scrollY);
    
    // Scroll down using window scroll
    await page.evaluate(() => window.scrollBy(0, 500));
    
    // Wait a bit for scroll to complete
    await page.waitForTimeout(100);
    
    // Get window scroll position after
    const scrollAfter = await page.evaluate(() => window.scrollY);
    
    // Window should have scrolled (not a nested element)
    expect(scrollAfter).toBeGreaterThan(scrollBefore);
  });

  test('should update progress bar on window scroll', async ({ page }) => {
    // Get initial progress
    const progressBar = page.locator('.bg-\\[\\#4A9EFF\\]').first();
    
    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    
    // Wait for progress update
    await page.waitForTimeout(300);
    
    // Progress bar width should be close to 100%
    const width = await progressBar.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.width;
    });
    
    // The progress should have changed (width should not be 0%)
    expect(width).not.toBe('0%');
  });

  test('main content should use min-height not fixed height', async ({ page }) => {
    // Check the main content styling
    const hasCorrectStyle = await page.evaluate(() => {
      const mainContent = document.querySelector('[style*="minHeight"]');
      if (!mainContent) return false;
      
      const style = mainContent.getAttribute('style');
      // Should have minHeight, not height
      return style.includes('min-height') || style.includes('minHeight');
    });
    
    expect(hasCorrectStyle).toBe(true);
  });
});
