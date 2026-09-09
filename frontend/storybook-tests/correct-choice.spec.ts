import { test, expect } from '@playwright/test';
import { resolve } from 'node:path';

for (const width of [390, 1280]) {
  test(`${width}pxで正解カード・長い解説・画像を表示できる`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/iframe.html?id=コンポーネント-answerdisplaycontainer--correct-choice-mobile&viewMode=story');
    const correct = page.getByRole('region', { name: '正解の選択肢' });
    await expect(correct).toContainText('選択肢2');
    await expect(correct).toContainText('バイオリン');
    await expect(page.getByRole('img', { name: '解答画像' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole('region', { name: '本文', exact: true }).evaluate(element => { element.scrollTop = element.scrollHeight; });
    await expect(page.getByRole('button', { name: 'ボードに戻る' })).toBeVisible();
    await page.getByRole('region', { name: '本文', exact: true }).evaluate(element => { element.scrollTop = 0; });
    if (process.env.CAPTURE_SLOTS_EVIDENCE) await page.screenshot({ path: resolve(`../docs/evidence/question-slots/correct-${width}.png`) });
  });
}
