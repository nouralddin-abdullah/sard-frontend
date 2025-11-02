import { test, expect } from '@playwright/test';

test.describe('Comment Delete Modal', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a chapter with comments
    // TODO: Replace with actual chapter URL
    await page.goto('http://localhost:5173/novel/test-novel/chapter/1');
  });

  test('should show delete confirmation modal when clicking delete button', async ({ page }) => {
    // Open comments panel
    await page.click('[aria-label="Comments"]');
    
    // Wait for comments to load
    await page.waitForSelector('.comment-item', { timeout: 5000 });
    
    // Find and click delete button on own comment
    const deleteButton = page.locator('button:has-text("حذف")').first();
    await deleteButton.click();
    
    // Verify modal appears
    await expect(page.locator('text=حذف التعليق')).toBeVisible();
    await expect(page.locator('text=هل أنت متأكد من حذف هذا التعليق؟')).toBeVisible();
  });

  test('should close modal when clicking cancel', async ({ page }) => {
    // Open comments panel and open delete modal
    await page.click('[aria-label="Comments"]');
    await page.waitForSelector('.comment-item', { timeout: 5000 });
    await page.locator('button:has-text("حذف")').first().click();
    
    // Click cancel button
    await page.click('button:has-text("إلغاء")');
    
    // Verify modal is closed
    await expect(page.locator('text=حذف التعليق')).not.toBeVisible();
  });

  test('should close modal when clicking X button', async ({ page }) => {
    // Open comments panel and open delete modal
    await page.click('[aria-label="Comments"]');
    await page.waitForSelector('.comment-item', { timeout: 5000 });
    await page.locator('button:has-text("حذف")').first().click();
    
    // Click X button
    await page.click('button[aria-label="Close"]');
    
    // Verify modal is closed
    await expect(page.locator('text=حذف التعليق')).not.toBeVisible();
  });

  test('should close modal when clicking backdrop', async ({ page }) => {
    // Open comments panel and open delete modal
    await page.click('[aria-label="Comments"]');
    await page.waitForSelector('.comment-item', { timeout: 5000 });
    await page.locator('button:has-text("حذف")').first().click();
    
    // Click backdrop (outside modal)
    await page.locator('.bg-black\\/70').click({ position: { x: 5, y: 5 } });
    
    // Verify modal is closed
    await expect(page.locator('text=حذف التعليق')).not.toBeVisible();
  });

  test('should delete comment when confirming', async ({ page }) => {
    // Open comments panel
    await page.click('[aria-label="Comments"]');
    await page.waitForSelector('.comment-item', { timeout: 5000 });
    
    // Get initial comment count
    const initialCommentCount = await page.locator('.comment-item').count();
    
    // Click delete and confirm
    await page.locator('button:has-text("حذف")').first().click();
    await page.click('button:has-text("حذف")'); // Confirm button
    
    // Wait for delete to complete
    await page.waitForTimeout(1000);
    
    // Verify comment was deleted (count decreased)
    const finalCommentCount = await page.locator('.comment-item').count();
    expect(finalCommentCount).toBe(initialCommentCount - 1);
    
    // Verify success toast
    await expect(page.locator('text=تم حذف التعليق بنجاح')).toBeVisible();
  });

  test('should show loading state while deleting', async ({ page }) => {
    // Open comments panel and open delete modal
    await page.click('[aria-label="Comments"]');
    await page.waitForSelector('.comment-item', { timeout: 5000 });
    await page.locator('button:has-text("حذف")').first().click();
    
    // Click confirm and immediately check for loading state
    await page.click('button:has-text("حذف")');
    
    // Verify loading state appears
    await expect(page.locator('text=جاري الحذف...')).toBeVisible();
  });

  test('should show delete modal for replies', async ({ page }) => {
    // Open comments panel
    await page.click('[aria-label="Comments"]');
    await page.waitForSelector('.comment-item', { timeout: 5000 });
    
    // Expand replies
    await page.locator('button:has-text("Show Replies")').first().click();
    await page.waitForTimeout(500);
    
    // Click delete on a reply
    await page.locator('.reply-item button:has-text("حذف")').first().click();
    
    // Verify modal shows correct title for reply
    await expect(page.locator('text=حذف الرد')).toBeVisible();
    await expect(page.locator('text=هل أنت متأكد من حذف هذا الرد؟')).toBeVisible();
  });

  test('should not allow clicking outside modal while deleting', async ({ page }) => {
    // Open comments panel and open delete modal
    await page.click('[aria-label="Comments"]');
    await page.waitForSelector('.comment-item', { timeout: 5000 });
    await page.locator('button:has-text("حذف")').first().click();
    
    // Start delete process
    await page.click('button:has-text("حذف")');
    
    // Try to click backdrop while loading
    await page.locator('.bg-black\\/70').click({ position: { x: 5, y: 5 } });
    
    // Modal should still be visible (can't close during loading)
    await expect(page.locator('text=جاري الحذف...')).toBeVisible();
  });
});
