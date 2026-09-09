import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

test('Storybookでラベルと形式を変更し、4択を保存・プレビュー・再編集できる', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto('/?path=/story/コンポーネント-tournamentform--labels-and-choices');
  const canvas = page.frameLocator('#storybook-preview-iframe');
  await expect(canvas.getByLabel('1問目のラベル')).toHaveValue('声優', { timeout: 20000 });
  await canvas.getByLabel('1問目のラベル').fill('アニメ');
  await page.goto('/?path=/story/画面-参加者-問題作成--multiple-choice');
  await expect(canvas.getByText('音楽 · 4択の選択問題')).toBeVisible();
  await canvas.getByLabel('問題文', { exact: true }).fill('次のうち、弦楽器はどれでしょう？');
  await canvas.getByLabel('解答文', { exact: true }).fill('2. バイオリン');
  const choices = ['ピアノ', 'バイオリン', 'フルート', 'トランペット'];
  for (const [i, choice] of choices.entries()) await canvas.getByRole('textbox', { name: `選択肢${i + 1}`, exact: true }).fill(choice);
  await canvas.getByRole('radio', { name: '選択肢2を正解にする', exact: true }).check();
  await canvas.getByRole('button', { name: 'この内容で問題を保存する' }).click();
  await canvas.getByRole('button', { name: '問題確認', exact: true }).nth(1).click();
  await expect(canvas.getByRole('list', { name: '選択肢' }).getByRole('listitem')).toHaveText(choices);
  if (process.env.CAPTURE_SLOTS_EVIDENCE) {
    const directory = resolve('../docs/evidence/question-slots');
    mkdirSync(directory, { recursive: true });
    await page.screenshot({ path: resolve(directory, '05-storybook.png'), fullPage: true, animations: 'disabled' });
  }
  await canvas.getByRole('button', { name: 'プレビューを閉じる' }).click();
  await canvas.getByRole('link', { name: '編集', exact: true }).nth(1).click();
  await expect(canvas.getByRole('textbox', { name: '選択肢4', exact: true })).toHaveValue('トランペット');
  await expect(canvas.getByRole('radio', { name: '選択肢2を正解にする', exact: true })).toBeChecked();
});
