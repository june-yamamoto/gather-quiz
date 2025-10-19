import { test, expect } from '@playwright/test';

let tournamentId: string;

// Create a new tournament before running the tests in this file
test.beforeAll(async ({ request }) => {
  const response = await request.post('/api/tournaments', {
    data: {
      name: `Participant Flow Test Tournament ${Date.now()}` ,
      password: 'test-password',
      questionsPerParticipant: 3,
      points: '10,20,30',
      regulation: 'E2E Test Regulation',
    },
  });
  const tournament = await response.json();
  tournamentId = tournament.id;
});

test.describe('参加者登録と問題作成フロー', () => {
  test('ユーザーが参加者登録し、問題作成ページにリダイレクトされること', async ({ page }) => {
    // 1. Navigate to the tournament portal page
    await page.goto(`/tournaments/${tournamentId}`);
    await expect(page.getByRole('heading', { name: '大会ポータル' })).toBeVisible();

    // 2. Click the button to register as a participant
    await page.getByRole('link', { name: '参加者として新規登録' }).click();
    await page.waitForURL(`/tournaments/${tournamentId}/register`);

    // 3. Fill out the registration form
    const participantName = `Test Participant ${Date.now()}`
    await page.getByLabel('あなたの名前').fill(participantName);

    const responsePromise = page.waitForResponse(resp => resp.url().includes('/participants') && resp.status() === 200);
    await page.getByRole('button', { name: 'この名前で参加する' }).click();
    const response = await responsePromise;
    const participant = await response.json();

    // 4. Expect to be redirected to the quiz creation page
    await page.waitForURL(`/tournaments/${tournamentId}/participants/${participant.id}/quizzes/new`);
    await expect(page.getByRole('heading', { name: '問題作成・編集' })).toBeVisible();

    // 5. Check if the form elements are visible
    await expect(page.getByRole('textbox', { name: '問題文' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: '参考リンク' }).first()).toBeVisible(); // 問題の参考リンク
    await expect(page.getByRole('textbox', { name: '解答文' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: '参考リンク' }).nth(1)).toBeVisible(); // 解答の参考リンク
    await expect(page.getByLabel('配点')).toBeVisible();
    await expect(page.getByRole('button', { name: 'この内容で問題を保存する' })).toBeVisible();
  });
});