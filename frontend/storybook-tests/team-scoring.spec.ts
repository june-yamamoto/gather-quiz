import { test, expect } from '@playwright/test';
test('管理画面で開始前にチームを設定できる', async ({ page }) => {
  await page.goto('/iframe.html?id=画面-主催者-管理--default&viewMode=story');
  await page.getByLabel('参加チーム数').fill('2');
  await page.getByLabel('チーム1の名前').fill('当日の赤チーム');
  await page.getByLabel('チーム2の名前').fill('当日の青チーム');
  await expect(page.getByRole('button', { name: 'この内容で大会を開始する' })).toBeEnabled();
  await page.getByRole('button', { name: 'この内容で大会を開始する' }).click();
  await expect(page.getByRole('region', { name: '問題一覧' })).toBeVisible();
});
test('Storybookのチーム判定で全員の正誤を選んで保存できる', async ({ page }) => {
  await page.goto('/iframe.html?id=大会運営-チーム正誤入力--default&viewMode=story');
  await expect(page.getByRole('button', { name: '正誤を保存してボードへ' })).toBeDisabled();
  await page.getByRole('radiogroup', { name: '赤チーム' }).getByRole('radio', { name: '正解', exact: true }).check();
  await page.getByRole('radiogroup', { name: '青チーム' }).getByRole('radio', { name: '不正解', exact: true }).check();
  await expect(page.getByRole('button', { name: '正誤を保存してボードへ' })).toBeEnabled();
  await page.getByRole('button', { name: '正誤を保存してボードへ' }).click();
});
test('動きを減らす設定では同点を含め全順位をすぐ表示する', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/iframe.html?id=大会運営-順位発表--default&viewMode=story');
  await expect(page.getByRole('listitem')).toHaveCount(3);
  await expect(page.getByText('第2位', { exact: true })).toHaveCount(2);
});
