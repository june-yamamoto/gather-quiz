import { test, expect } from '@playwright/test';

for (const width of [375, 1280]) {
  for (const mode of ['question', 'answer']) {
    test(`${width}pxの${mode}プレビューで長文と画像が重ならず拡大して戻れる`, async ({ page }) => {
      await page.setViewportSize({ width, height: 812 });
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto(`/?path=/story/コンポーネント-quizpreviewdialog--with-image`);
      await page.getByRole('row').filter({ hasText: `${mode}Text` }).getByRole('textbox').fill('長い文章でも画像と重ならず、最後まで読むことができます。'.repeat(30));
      if (mode === 'answer') await page.getByRole('radio', { name: 'answer', exact: true }).check();
      await page.setViewportSize({ width, height: 812 });
      const canvas = page.frameLocator('#storybook-preview-iframe');
      const text = canvas.getByText(/^長い文章/);
      const img = canvas.getByRole('img', { name: mode === 'question' ? '問題画像' : '解答画像', exact: true });
      await expect(img).toBeVisible();
      await expect(text).toBeVisible();
      const region = canvas.getByRole('region', { name: '本文' });
      const textBox = await region.boundingBox();
      const imageBox = await img.boundingBox();
      expect(imageBox!.y).toBeGreaterThanOrEqual(textBox!.y + textBox!.height);
      await expect(img).toBeInViewport({ ratio: 1 });
      await region.evaluate((element) => { element.scrollTop = element.scrollHeight; });
      await expect(img).toBeInViewport({ ratio: 1 });
      expect((await img.boundingBox())!.y).toBeCloseTo(imageBox!.y, 0);
      await canvas.getByRole('button', { name: /画像を拡大/ }).click();
      await expect(canvas.getByRole('dialog', { name: '画像の拡大表示' })).toBeVisible();
      const expanded = canvas.getByRole('img', { name: /（拡大）/ });
      const before = await expanded.boundingBox();
      await canvas.getByRole('button', { name: '2倍に拡大' }).click();
      await expect(canvas.getByRole('button', { name: '全体を表示' })).toHaveAttribute('aria-pressed', 'true');
      expect((await expanded.boundingBox())!.width).toBeGreaterThan(before!.width * 1.9);
      await canvas.getByRole('button', { name: '画像の拡大表示を閉じる' }).click();
      await expect(canvas.getByRole('dialog', { name: '画像の拡大表示' })).toHaveCount(0);
      await expect(canvas.getByRole('button', { name: 'プレビューを閉じる' })).toBeVisible();
    });
  }
}
