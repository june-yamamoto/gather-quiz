import { test, expect } from '@playwright/test';

let tournamentId: string;
let participantId: string;

// Setup: Create a tournament and a participant before the test
test.beforeAll(async ({ request }) => {
  const tournamentRes = await request.post('http://localhost:3000/api/tournaments', {
    data: {
      name: `Quiz Creation Test Tournament ${Date.now()}`,
      password: 'test-password',
      questionsPerParticipant: 1,
      points: '10',
    },
  });
  const tournament = await tournamentRes.json();
  tournamentId = tournament.id;

  const participantRes = await request.post(`http://localhost:3000/api/tournaments/${tournamentId}/participants`, {
    data: { name: 'QuizCreator' },
  });
  const participant = await participantRes.json();
  participantId = participant.id;
});

test.describe('クイズ作成フロー', () => {
  test('参加者が新しいクイズを作成できること', async ({ page }) => {
    // 1. Navigate to the quiz creation page
    await page.goto(`/gather/tournaments/${tournamentId}/participants/${participantId}/quizzes/new`);
    await expect(page.getByRole('heading', { name: '問題作成・編集' })).toBeVisible();

    // 2. Fill out the form
    const questionText = '日本の最高峰の山は？';
    const answerText = '富士山';
    await page.getByLabel('配点').fill('10');
    await page.getByRole('textbox', { name: '問題文' }).fill(questionText);
    await page.getByRole('textbox', { name: '解答文' }).fill(answerText);

    // 3. Submit the form
    await page.getByRole('button', { name: 'この内容で問題を保存する' }).click();

    // 4. Assert navigation to the participant dashboard
    await page.waitForURL(`/gather/tournaments/${tournamentId}/participants/${participantId}`);
    await expect(page.getByRole('heading', { name: '参加者ダッシュボード' })).toBeVisible();

    // 5. Verify the created quiz is displayed on the dashboard
    await expect(page.getByText(questionText)).toBeVisible();
    await expect(page.getByText(`正解: ${answerText}`)).toBeVisible();
    await expect(page.getByText('あと 0 問、作成してください。')).toBeVisible();
  });
});
