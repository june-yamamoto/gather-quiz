import { test, expect } from '@playwright/test';

for (const width of [320, 390, 1280]) {
  test(`${width}pxでラベルとジャンルが重ならず同じ文字サイズになる`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/iframe.html?id=コンポーネント-quizdisplaycontainer--label-and-genre&viewMode=story');
    const label = page.getByText('音楽・声優に関する長い問題ラベル', { exact: true });
    const genre = page.getByText('アニメーションとゲームの音楽', { exact: true });
    await expect(label).toBeVisible();
    await expect(genre).toBeVisible();
    const a = (await label.boundingBox())!, b = (await genre.boundingBox())!;
    expect(a.y + a.height <= b.y || b.y + b.height <= a.y || a.x + a.width <= b.x || b.x + b.width <= a.x).toBe(true);
    expect(await label.evaluate(e => getComputedStyle(e).fontSize)).toBe(await genre.evaluate(e => getComputedStyle(e).fontSize));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
