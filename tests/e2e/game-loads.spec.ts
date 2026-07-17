import { test, expect } from '@playwright/test';

test.describe('Packet Express E2E', () => {
  
  test('game loads and shows menu screen', async ({ page }) => {
    await page.goto('/');
    
    // Wait for Phaser canvas to appear
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });
    
    // Game state should be exposed
    const gameExists = await page.evaluate(() => !!(window as any).__GAME__);
    expect(gameExists).toBe(true);
  });

  test('clicking starts the game and exposes game state', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });
    
    // Wait for MenuScene to be fully ready (BootScene generates assets then transitions)
    await page.waitForTimeout(500);
    
    // Click to start game (menu screen)
    await canvas.click();
    
    // Wait for __GAME_STATE__ to be populated by GameScene
    await page.waitForFunction(() => !!(window as any).__GAME_STATE__, null, { timeout: 5000 });
    
    const state = await page.evaluate(() => (window as any).__GAME_STATE__);
    expect(state).toBeTruthy();
    expect(state.credits).toBeDefined();
    expect(state.bandwidth).toBeDefined();
    expect(state.wave).toBeDefined();
    expect(state.gameOver).toBe(false);
  });

  test('game starts with correct initial values', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(500);
    
    await canvas.click();
    await page.waitForFunction(() => !!(window as any).__GAME_STATE__, null, { timeout: 5000 });
    
    const state = await page.evaluate(() => (window as any).__GAME_STATE__);
    // Credits depend on difficulty selected (default normal=200, but click may hit a difficulty button)
    expect(state.credits).toBeGreaterThan(0);
    expect(state.bandwidth).toBeGreaterThan(0);
    expect(state.score).toBe(0);
    expect(state.towersPlaced).toBe(0);
    expect(state.accuracy).toBe(1.0);
    expect(state.threatsKilled).toBe(0);
    expect(state.falsePositives).toBe(0);
  });

  test('game progresses - enemies spawn after wave starts', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(500);
    
    await canvas.click();
    
    // Wait for __GAME_STATE__ then wait for wave to start (2s delay in GameScene)
    await page.waitForFunction(() => !!(window as any).__GAME_STATE__, null, { timeout: 5000 });
    await page.waitForFunction(
      () => {
        const s = (window as any).__GAME_STATE__;
        return s && s.wave >= 1;
      },
      null,
      { timeout: 10000 }
    );
    
    const state = await page.evaluate(() => (window as any).__GAME_STATE__);
    expect(state.wave).toBeGreaterThanOrEqual(1);
  });

  test('canvas is responsive and fills viewport', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });
    
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(400);
    expect(box!.height).toBeGreaterThan(200);
  });

  test('no console errors during gameplay', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    
    await page.goto('/');
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(500);
    
    await canvas.click();
    await page.waitForTimeout(5000); // let game run for 5 seconds
    
    expect(errors, `Console errors found: ${errors.join(', ')}`).toHaveLength(0);
  });

});
