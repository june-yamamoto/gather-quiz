import { test, expect } from '@playwright/test';

for (const width of [390, 1280]) {
  test(`${width}pxで未作成やラベルの長さにかかわらず第n問の高さが揃う`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/iframe.html?id=画面-大会実施-問題ボード--default&viewMode=story');
    await expect(page.getByRole('heading', { name: '持ち寄りクイズ大会' })).toBeVisible();
    const cells = page.locator('[data-question-order="1"]');
    await expect(cells).toHaveCount(2);
    const positions = await cells.evaluateAll(elements => elements.map(e => e.getBoundingClientRect().y));
    expect(Math.abs(positions[0] - positions[1])).toBeLessThan(1);
    const grid = page.getByRole('region', { name: '問題一覧' });
    await expect(grid).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
