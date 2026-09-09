import { test, expect } from '@playwright/test';
for (const width of [390, 1280]) {
  test(`${width}pxで主催者と参加者のチュートリアルを読める`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/iframe.html?id=コンポーネント-gettingstarted--default&viewMode=story');
    await expect(page.getByRole('heading', { name: 'はじめての使い方' })).toBeVisible();
    await expect(page.getByRole('listitem')).toHaveCount(8);
    await expect(page.getByText('保存してプレビュー', { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
