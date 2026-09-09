import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

for (const width of [390, 1280]) {
  test(`${width}pxでチーム設定から判定・再保存・順位発表まで進める`, async ({ page, request }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/gather/tournaments/new');
    await page.getByRole('textbox', { name: '大会名', exact: true }).fill('チームで楽しむクイズ大会');
    await page.getByRole('textbox', { name: '管理用パスワード', exact: true }).fill('test-only');
    await page.getByLabel('参加者1人あたりの問題作成数').fill('1');
    await expect(page.getByLabel('参加チーム数')).toHaveCount(0);
    const created = page.waitForResponse(r => r.url().endsWith('/api/tournaments') && r.request().method() === 'POST');
    await page.getByRole('button', { name: 'この内容で大会を作成する' }).click();
    const tournament = await (await created).json();
    expect(tournament.teams).toHaveLength(0);
    const api = `http://localhost:3000/api/tournaments/${tournament.id}`;
    const p = await (await request.post(`${api}/participants`, { data: { name: '作問者', loginId: 'writer', password: '1234' } })).json();
    const q = await (await request.post('http://localhost:3000/api/quizzes', { data: { tournamentId: tournament.id, participantId: p.id, point: 10, questionText: '日本の首都は？', answerText: '東京です。' } })).json();
    await page.goto(`/gather/tournaments/${tournament.id}/admin`);
    await page.getByLabel('参加チーム数').fill('2');
    await page.getByLabel('チーム1の名前').fill('赤チーム');
    await page.getByLabel('チーム2の名前').fill('赤チーム');
    await page.getByRole('button', { name: 'この内容で大会を開始する' }).click();
    await expect(page.getByRole('alert')).toContainText('チーム名は重複しないようにしてください。');
    await expect(page.getByLabel('チーム1の名前')).toHaveValue('赤チーム');
    await page.getByLabel('チーム2の名前').fill('青チーム');
    await page.getByRole('button', { name: 'この内容で大会を開始する' }).click();
    await expect(page).toHaveURL(`/gather/tournaments/${tournament.id}/board`);
    expect((await request.get(`${api}/results`)).status()).toBe(409);
    const board = `/gather/tournaments/${tournament.id}/board`;
    await page.goto(board);
    await page.getByRole('button', { name: '10', exact: true }).click();
    await expect.poll(async () => (await (await request.get(`http://localhost:3000/api/quizzes/${q.id}`)).json()).isOpened).toBe(true);
    await page.getByRole('button', { name: '正解を見る' }).click();
    await expect(page.getByText('東京です。')).toBeVisible();
    for (const correct of [false, true]) {
      if (correct) await page.goto(`/gather/quizzes/${q.id}/answer`);
      await page.getByRole('button', { name: 'チームの正誤を設定' }).click();
      await page.getByRole('radiogroup', { name: '赤チーム' }).getByRole('radio', { name: correct ? '正解' : '不正解', exact: true }).check();
      await page.getByRole('radiogroup', { name: '青チーム' }).getByRole('radio', { name: '不正解', exact: true }).check();
      await expect(page.getByRole('dialog')).not.toContainText('順位');
      await expect(page.getByRole('dialog')).not.toContainText('10点');
      if (process.env.CAPTURE_TEAM_EVIDENCE && correct) { mkdirSync(resolve('docs/evidence/team-scoring'), { recursive: true }); await page.screenshot({ path: resolve(`docs/evidence/team-scoring/judging-${width}.png`), animations: 'disabled' }); }
      await page.getByRole('button', { name: '正誤を保存してボードへ' }).click();
      await expect(page).toHaveURL(board);
    }
    expect((await request.get(`${api}/results`)).status()).toBe(409);
    await page.getByRole('button', { name: '大会を終了する！' }).click();
    await page.getByRole('button', { name: '大会を終了して順位を発表' }).click();
    await expect(page.getByRole('heading', { name: '結果発表', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'すべての順位を表示' }).click();
    const list = page.getByRole('list', { name: '最終順位' });
    await expect(list.getByRole('listitem').nth(0)).toContainText('赤チーム');
    await expect(list.getByRole('listitem').nth(0)).toContainText('10点');
    await expect(list.getByRole('listitem').nth(1)).toContainText('0点');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (process.env.CAPTURE_TEAM_EVIDENCE) await page.screenshot({ path: resolve(`docs/evidence/team-scoring/results-${width}.png`), fullPage: true, animations: 'disabled' });
  });
}
