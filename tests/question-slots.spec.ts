import { test, expect, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

/** 実データを含まない検証用大会だけを撮影する。 */
async function evidence(page: Page, name: string) {
  if (!process.env.CAPTURE_SLOTS_EVIDENCE) return;
  const directory = resolve('docs/evidence/question-slots');
  mkdirSync(directory, { recursive: true });
  await page.screenshot({ path: resolve(directory, `${name}.png`), fullPage: true, animations: 'disabled' });
}

test('大会のラベルと出題形式が参加者の作成・編集・表示まで引き継がれる', async ({ page, request }) => {
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.goto('/gather/tournaments/new');
  await page.getByRole('textbox', { name: '大会名', exact: true }).fill('声優と音楽のクイズ大会');
  await page.getByRole('textbox', { name: '管理用パスワード', exact: true }).fill('test-only');
  await page.getByLabel('参加者1人あたりの問題作成数').fill('4');
  for (const [index, label] of ['声優', '音楽', '声優', '音楽'].entries()) {
    await page.getByLabel(`${index + 1}問目のラベル`).fill(label);
    await page.getByLabel(`${index + 1}問目の配点`).fill(index < 2 ? '10' : '20');
  }
  await page.getByLabel('2問目の出題形式').click();
  await page.getByRole('option', { name: '選択問題', exact: true }).click();
  await page.getByLabel('4問目の出題形式').click();
  await page.getByRole('option', { name: '選択問題', exact: true }).click();
  await page.getByLabel('4問目の選択肢数').fill('3');
  // 撮影前に検証専用パスワードも非表示のままであることを確認する。
  await expect(page.getByRole('textbox', { name: '管理用パスワード', exact: true })).toHaveAttribute('type', 'password');
  await evidence(page, '01-tournament');
  const created = page.waitForResponse(r => r.url().endsWith('/api/tournaments') && r.request().method() === 'POST');
  await page.getByRole('button', { name: 'この内容で大会を作成する' }).click();
  const tournament = await (await created).json();
  expect(tournament.questionSlots).toEqual([{ label: '声優', choiceCount: 0 }, { label: '音楽', choiceCount: 4 }, { label: '声優', choiceCount: 0 }, { label: '音楽', choiceCount: 3 }]);
  const participant = await (await request.post(`http://localhost:3000/api/tournaments/${tournament.id}/participants`, { data: { name: 'あおい' } })).json();
  const dashboard = `/gather/tournaments/${tournament.id}/participants/${participant.id}`;
  await page.goto(dashboard);
  await expect(page.getByText('第2問 (10点) · 音楽 · 4択')).toBeVisible();
  await page.getByRole('link', { name: '作成する' }).nth(1).click();
  await expect(page.getByText('音楽 · 4択の選択問題')).toBeVisible();
  await page.getByLabel('問題文', { exact: true }).fill('次のうち、弦楽器はどれでしょう？');
  await page.getByLabel('解答文', { exact: true }).fill('2. バイオリン');
  const choices = ['ピアノ', 'バイオリン', 'フルート', 'トランペット'];
  for (const [index, choice] of choices.entries()) await page.getByRole('textbox', { name: `選択肢${index + 1}`, exact: true }).fill(choice);
  await evidence(page, '02-creator');
  const savedResponse = page.waitForResponse(r => r.url().endsWith('/api/quizzes') && r.request().method() === 'POST');
  await page.getByRole('button', { name: 'この内容で問題を保存する' }).click();
  const saved = await (await savedResponse).json();
  expect(saved.choices).toEqual(choices);
  await expect(page).toHaveURL(dashboard);
  await page.getByRole('button', { name: '問題確認', exact: true }).click();
  await expect(page.getByRole('list', { name: '選択肢' }).getByRole('listitem')).toHaveText(choices);
  expect((await (await request.get(`http://localhost:3000/api/quizzes/${saved.id}`)).json()).isOpened).toBe(false);
  await page.getByRole('button', { name: 'プレビューを閉じる' }).click();
  await page.getByRole('link', { name: '編集', exact: true }).click();
  await expect(page.getByRole('textbox', { name: '選択肢4', exact: true })).toHaveValue('トランペット');
  await page.getByRole('textbox', { name: '選択肢4', exact: true }).fill('クラリネット');
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await evidence(page, '03-mobile-edit');
  await page.getByRole('button', { name: 'この内容で更新する' }).click();
  await expect(page).toHaveURL(dashboard);
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(`/gather/quizzes/${saved.id}`);
  await expect(page.getByRole('list', { name: '選択肢' })).toContainText('クラリネット');
  await expect(page.getByText('音楽', { exact: true })).toBeVisible();
  await evidence(page, '04-question');
  await page.getByRole('button', { name: '正解を見る' }).click();
  await expect(page.getByText('2. バイオリン', { exact: true })).toBeVisible();
});
