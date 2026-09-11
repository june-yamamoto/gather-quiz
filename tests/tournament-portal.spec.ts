import { test, expect } from '@playwright/test';

test('ログイン前に大会内容を確認でき、参加登録後は人数が更新される', async ({ page, request }) => {
  const response = await request.post('http://localhost:3000/api/tournaments', { data: {
    name: 'ポータル確認大会', password: 'portal-test', questionsPerParticipant: 2, points: '10,20',
    questionSlots: [{ label: '声優', choiceCount: 0, questionType: 'normal' }, { label: '音楽', choiceCount: 0, questionType: 'choice' }],
    regulation: '検索は禁止です。\n相談は可能です。', genres: 'アニメ,音楽',
  } });
  expect(response.ok()).toBeTruthy();
  const { id } = await response.json();
  await page.goto(`/gather/tournaments/${id}`);
  const overview = page.getByRole('region', { name: '大会概要' });
  await expect(overview.getByText('0人', { exact: true })).toBeVisible();
  await expect(overview.getByText('1人あたり2問')).toBeVisible();
  await expect(overview.getByRole('listitem')).toHaveText(['第1問 · 声優10点 · 通常問題', '第2問 · 音楽20点 · 選択問題']);
  await expect(overview.getByText('検索は禁止です。\n相談は可能です。')).toBeVisible();
  await page.screenshot({ path: 'artifacts/portal-desktop.png', fullPage: true });
  const registration = await request.post(`http://localhost:3000/api/tournaments/${id}/participants`, { data: { name: '確認参加者', loginId: 'portal-user', password: '123456' } });
  expect(registration.ok()).toBeTruthy();
  await page.reload();
  await expect(overview.getByText('1人', { exact: true })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'artifacts/portal-mobile.png', fullPage: true });
  await page.getByRole('button', { name: '参加者としてログイン' }).click();
  await page.getByLabel('ID', { exact: true }).fill('portal-user');
  await page.getByLabel('パスワード', { exact: true }).fill('123456');
  await page.getByRole('button', { name: 'ログイン', exact: true }).click();
  await expect(page.getByRole('heading', { name: '確認参加者 さんのダッシュボード' })).toBeVisible();
});
