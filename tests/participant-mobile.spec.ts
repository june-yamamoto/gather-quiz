import { test, expect } from '@playwright/test';
import { pathToTournamentRegisterParticipant } from '../frontend/src/helpers/route-helpers';

for (const width of [320, 375]) {
  test(`${width}pxで参加登録から問題入力・保存まで操作できる`, async ({ page, request }, testInfo) => {
    await page.setViewportSize({ width, height: 812 });
    const tournament = await (await request.post('http://localhost:3000/api/tournaments', { data: {
      name: 'スマートフォン入力テスト', password: 'test-only', questionsPerParticipant: 1, points: '10', regulation: '一人一問です。',
    } })).json();
    await page.goto(pathToTournamentRegisterParticipant(tournament.id));
    await page.getByLabel('表示名').fill('長い名前の参加者あおい');
    await page.getByLabel(/^ID/).fill('user1');
    await page.getByLabel(/^パスワード/).fill('123456');
    await page.getByRole('button', { name: 'この内容で参加する' }).click();
    await page.getByRole('button', { name: 'ダッシュボードへ移動する' }).click();
    await page.getByRole('link', { name: '作成する', exact: true }).click();
    const question = page.getByLabel('問題文');
    await question.fill('スマートフォンで入力した問題です。\n改行も保存できます。');
    await page.getByLabel('解答文').fill('回答');
    expect(await question.evaluate((element) => parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(16);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath('mobile-editor.png'), fullPage: true });
    page.on('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'この内容で問題を保存する' }).click();
    await expect(page.getByRole('link', { name: '編集', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const action = await page.getByRole('button', { name: '問題確認' }).boundingBox();
    expect(action?.height).toBeGreaterThanOrEqual(44);
    await page.screenshot({ path: testInfo.outputPath('mobile-dashboard.png'), fullPage: true });
  });
}
