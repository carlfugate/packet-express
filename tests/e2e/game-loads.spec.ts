import { test, expect } from '@playwright/test';

test('game loads and shows menu', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible({ timeout: 10000 });
});
