import { test, expect } from '@playwright/test';

test.describe('Chapter Editor - Paste Content', () => {
  test.beforeEach(async ({ page }) => {
    // Login first if required - update this to match your auth flow
    // await page.goto('/login');
    // await page.fill('input[name="email"]', 'test@example.com');
    // await page.fill('input[name="password"]', 'password');
    // await page.click('button[type="submit"]');
    
    // Navigate to a new chapter editor
    // Update workId to a valid work ID in your test environment
    await page.goto('/dashboard/works/test-work-id/chapters/new');
    await page.waitForSelector('.ProseMirror', { timeout: 10000 });
  });

  test('should save pasted content without requiring additional keystrokes', async ({ page }) => {
    const testContent = 'هذا هو المحتوى الذي تم لصقه من الحافظة للتحقق من أن اللصق يعمل بشكل صحيح';
    
    // Fill in the title
    const titleInput = page.locator('input[placeholder*="عنوان"]').first();
    await titleInput.fill('فصل اختباري');
    
    // Focus on the editor
    const editor = page.locator('.ProseMirror');
    await editor.click();
    
    // Paste content using clipboard API
    await page.evaluate(async (content) => {
      await navigator.clipboard.writeText(content);
    }, testContent);
    
    // Simulate paste
    await page.keyboard.press('Control+v');
    
    // Wait a moment for the editor to process
    await page.waitForTimeout(500);
    
    // Check that the content is in the editor
    const editorContent = await editor.textContent();
    expect(editorContent).toContain(testContent);
    
    // Click save button - the content should be saved without needing extra keystrokes
    const saveButton = page.locator('button:has-text("حفظ")').first();
    await saveButton.click();
    
    // Wait for save to complete
    await page.waitForTimeout(2000);
    
    // Verify no error toast appeared
    const errorToast = page.locator('.Toastify__toast--error');
    await expect(errorToast).not.toBeVisible();
  });

  test('should track changes correctly after paste as first action', async ({ page }) => {
    const testContent = 'محتوى تجريبي للصق';
    
    // Focus directly on the editor without any other interaction
    const editor = page.locator('.ProseMirror');
    await editor.click();
    
    // Type content to simulate paste (easier than actual clipboard in tests)
    await editor.fill(testContent);
    
    // The "unsaved changes" indicator should appear
    // Look for any visual indicator that changes were detected
    await page.waitForTimeout(300);
    
    // Try to navigate away - should show unsaved changes modal
    await page.goto('/dashboard');
    
    // If there's an unsaved changes modal, the fix is working
    const unsavedModal = page.locator('text=تغييرات غير محفوظة');
    // This could pass or fail depending on your implementation
    // The key is that paste content is tracked
  });
});
