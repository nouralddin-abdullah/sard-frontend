import { test, expect } from '@playwright/test';

test.describe('Header User Dropdown', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page
    await page.goto('/');
  });

  test('should display default SVG icon when user is not logged in', async ({ page }) => {
    // Check if the SVG icon is visible
    const svgIcon = page.locator('header svg').first();
    await expect(svgIcon).toBeVisible();
    
    // Check if the dropdown button exists
    const dropdownButton = page.locator('header button').first();
    await expect(dropdownButton).toBeVisible();
  });

  test('should toggle dropdown menu when clicking the user icon', async ({ page }) => {
    // Click the dropdown button
    const dropdownButton = page.locator('header button').first();
    await dropdownButton.click();
    
    // Wait for dropdown to appear
    await page.waitForTimeout(100);
    
    // Check if dropdown menu is visible
    const dropdownMenu = page.locator('div[class*="absolute"][class*="bg-[#3C3C3C]"]').first();
    await expect(dropdownMenu).toBeVisible();
    
    // Check if "الملف الشخصي" (Profile) link is visible
    const profileLink = page.locator('text=الملف الشخصي');
    await expect(profileLink).toBeVisible();
    
    // Check if "تسجيل الخروج" (Logout) button is visible
    const logoutButton = page.locator('text=تسجيل الخروج');
    await expect(logoutButton).toBeVisible();
  });

  test('should show chevron rotation when dropdown is open', async ({ page }) => {
    // Get the chevron icon
    const chevronIcon = page.locator('header svg[class*="lucide-chevron-down"]').first();
    
    // Initially should not have rotate-180
    await expect(chevronIcon).not.toHaveClass(/rotate-180/);
    
    // Click to open dropdown
    const dropdownButton = page.locator('header button').first();
    await dropdownButton.click();
    
    // Should now have rotate-180
    await expect(chevronIcon).toHaveClass(/rotate-180/);
  });

  test('should close dropdown when clicking outside', async ({ page }) => {
    // Click the dropdown button to open
    const dropdownButton = page.locator('header button').first();
    await dropdownButton.click();
    
    // Wait for dropdown to appear
    await page.waitForTimeout(100);
    
    // Verify dropdown is visible
    const dropdownMenu = page.locator('div[class*="absolute"][class*="bg-[#3C3C3C]"]').first();
    await expect(dropdownMenu).toBeVisible();
    
    // Click outside (on the logo for example)
    await page.locator('text=سَرْد').click();
    
    // Wait for dropdown to close
    await page.waitForTimeout(100);
    
    // Verify dropdown is not visible
    await expect(dropdownMenu).not.toBeVisible();
  });

  test('should navigate to profile page when clicking profile link', async ({ page }) => {
    // Click the dropdown button to open
    const dropdownButton = page.locator('header button').first();
    await dropdownButton.click();
    
    // Click the profile link
    const profileLink = page.locator('text=الملف الشخصي');
    await profileLink.click();
    
    // Wait for navigation
    await page.waitForURL('**/profile');
    
    // Verify we're on the profile page
    expect(page.url()).toContain('/profile');
  });

  test('should close dropdown after clicking profile link', async ({ page }) => {
    // Click the dropdown button to open
    const dropdownButton = page.locator('header button').first();
    await dropdownButton.click();
    
    // Wait for dropdown to appear
    await page.waitForTimeout(100);
    
    // Click the profile link
    const profileLink = page.locator('text=الملف الشخصي');
    await profileLink.click();
    
    // Wait a bit for the dropdown to close
    await page.waitForTimeout(100);
    
    // Go back to check dropdown state
    await page.goBack();
    
    // Dropdown should be closed (not visible)
    const dropdownMenu = page.locator('div[class*="absolute"][class*="bg-[#3C3C3C]"]').first();
    await expect(dropdownMenu).not.toBeVisible();
  });

  test('should work on mobile view', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if the SVG icon is visible in mobile header
    const mobileHeader = page.locator('header > div.md\\:hidden');
    await expect(mobileHeader).toBeVisible();
    
    // Click the dropdown button
    const dropdownButton = mobileHeader.locator('button').first();
    await dropdownButton.click();
    
    // Wait for dropdown to appear
    await page.waitForTimeout(100);
    
    // Check if dropdown menu is visible
    const dropdownMenu = page.locator('div[class*="absolute"][class*="bg-[#3C3C3C"]').first();
    await expect(dropdownMenu).toBeVisible();
    
    // Check if profile link exists
    const profileLink = page.locator('text=الملف الشخصي');
    await expect(profileLink).toBeVisible();
    
    // Check if logout button exists
    const logoutButton = page.locator('text=تسجيل الخروج');
    await expect(logoutButton).toBeVisible();
  });

  test('should display user profile photo when logged in', async ({ page, context }) => {
    // Mock authentication by setting a cookie
    await context.addCookies([
      {
        name: 'authToken',
        value: 'mock-token-123',
        domain: 'localhost',
        path: '/',
      },
    ]);
    
    // Mock the API response for logged in user
    await page.route('**/api/User/my-profile', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          userName: 'testuser',
          displayName: 'Test User',
          profilePhoto: 'https://via.placeholder.com/150',
        }),
      });
    });
    
    // Reload the page
    await page.reload();
    
    // Wait for the profile photo to load
    await page.waitForTimeout(500);
    
    // Check if profile image is visible
    const profileImage = page.locator('header img[alt*="User"]').first();
    await expect(profileImage).toBeVisible();
    
    // Verify image attributes
    await expect(profileImage).toHaveAttribute('src', 'https://via.placeholder.com/150');
  });

  test('should fallback to SVG icon if profile photo fails to load', async ({ page, context }) => {
    // Mock authentication
    await context.addCookies([
      {
        name: 'authToken',
        value: 'mock-token-123',
        domain: 'localhost',
        path: '/',
      },
    ]);
    
    // Mock the API response with invalid image URL
    await page.route('**/api/User/my-profile', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          userName: 'testuser',
          displayName: 'Test User',
          profilePhoto: 'https://invalid-url-that-will-fail.com/image.jpg',
        }),
      });
    });
    
    // Reload the page
    await page.reload();
    
    // Wait for image load attempt
    await page.waitForTimeout(1000);
    
    // After image fails to load, SVG should be visible
    const svgIcon = page.locator('header svg').first();
    await expect(svgIcon).toBeVisible();
  });
});

test.describe('Logout Functionality', () => {
  test.beforeEach(async ({ page, context }) => {
    // Mock authentication
    await context.addCookies([
      {
        name: 'authToken',
        value: 'mock-token-123',
        domain: 'localhost',
        path: '/',
      },
    ]);
    
    // Mock the API response
    await page.route('**/api/User/my-profile', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          userName: 'testuser',
          displayName: 'Test User',
          profilePhoto: 'https://via.placeholder.com/150',
        }),
      });
    });
    
    await page.goto('/');
  });

  test('should navigate to login page when logout is clicked', async ({ page }) => {
    // Click the dropdown button
    const dropdownButton = page.locator('header button').first();
    await dropdownButton.click();
    
    // Wait for dropdown
    await page.waitForTimeout(100);
    
    // Click logout button
    const logoutButton = page.locator('text=تسجيل الخروج');
    await logoutButton.click();
    
    // Should navigate to login page
    await page.waitForURL('**/login');
    expect(page.url()).toContain('/login');
  });

  test('should clear auth token cookie on logout', async ({ page, context }) => {
    // Verify token exists before logout
    const cookiesBefore = await context.cookies();
    const authTokenBefore = cookiesBefore.find(c => c.name === 'authToken');
    expect(authTokenBefore).toBeDefined();
    
    // Click the dropdown button
    const dropdownButton = page.locator('header button').first();
    await dropdownButton.click();
    
    // Click logout
    const logoutButton = page.locator('text=تسجيل الخروج');
    await logoutButton.click();
    
    // Wait for logout process
    await page.waitForTimeout(500);
    
    // Verify token is cleared
    const cookiesAfter = await context.cookies();
    const authTokenAfter = cookiesAfter.find(c => c.name === 'authToken');
    expect(authTokenAfter).toBeUndefined();
  });
});
