import { test, expect, devices } from '@playwright/test';

test.use(devices['Pixel 5']);

test.describe('Mobile E2E', () => {
  
  test('game loads on mobile viewport', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });
    
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    // Should be scaled to fit mobile
    expect(box!.width).toBeGreaterThan(200);
  });

  test('touch input starts game', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });
    
    // Tap to start
    await canvas.tap();
    await page.waitForTimeout(1000);
    
    const state = await page.evaluate(() => (window as any).__GAME_STATE__);
    expect(state).toBeTruthy();
    // Credits depend on which difficulty button the tap lands on
    expect(state.credits).toBeGreaterThan(0);
  });
});
