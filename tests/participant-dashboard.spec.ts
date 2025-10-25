import { test, expect, APIRequestContext } from '@playwright/test';

// Helper function to create a tournament via API
const createTournament = async (request: APIRequestContext) => {
  const response = await request.post('http://localhost:3000/api/tournaments', {
    data: {
      name: `Dashboard Test Tournament ${Date.now()}`,
      password: 'test-password',
      questionsPerParticipant: 3,
      points: '10,20,30',
      regulation: 'E2E Test Regulation',
    },
  });
  return await response.json();
};

// Helper function to create a participant via API
const createParticipant = async (request: APIRequestContext, tournamentId: string) => {
  const response = await request.post(`http://localhost:3000/api/tournaments/${tournamentId}/participants`, {
    data: {
      name: `Test Participant ${Date.now()}`,
    },
  });
  return await response.json();
};

// Helper function to create a quiz via API
const createQuiz = async (
  request: APIRequestContext,
  tournamentId: string,
  participantId: string,
  questionNumber: number
) => {
  const response = await request.post('http://localhost:3000/api/quizzes', {
    data: {
      questionText: `Question ${questionNumber}`,
      answerText: 'A',
      point: 10,
      tournamentId,
      participantId,
    },
  });
  return await response.json();
};

test.describe('参加者ダッシュボード', () => {
  test('シナリオ1: クイズが一件も作成されていない場合に正しいステータスが表示されること', async ({ page, request }) => {
    const tournament = await createTournament(request);
    const participant = await createParticipant(request, tournament.id);

    await page.goto(`/gather/tournaments/${tournament.id}/participants/${participant.id}`);

    await expect(page.getByText('あと 3 問、作成してください。')).toBeVisible();
    await expect(page.getByText('作成済みの問題')).toBeVisible();
    // Expect the list of created quizzes to be empty
    const listItems = await page.locator('ul > div').count();
    expect(listItems).toBe(0);
  });

  test('シナリオ2: クイズがいくつか作成済みの場合に正しいステータスが表示されること', async ({ page, request }) => {
    const tournament = await createTournament(request);
    const participant = await createParticipant(request, tournament.id);
    const quiz = await createQuiz(request, tournament.id, participant.id, 1);
    await page.goto(`/gather/tournaments/${tournament.id}/participants/${participant.id}`);

    await expect(page.getByText('あと 2 問、作成してください。')).toBeVisible();
    await expect(page.getByText('作成済みの問題')).toBeVisible();
    await expect(page.getByText(quiz.questionText)).toBeVisible();
  });

  test('シナリオ3: すべてのクイズが作成済みの場合に正しいステータスが表示されること', async ({ page, request }) => {
    const tournament = await createTournament(request);
    const participant = await createParticipant(request, tournament.id);
    await createQuiz(request, tournament.id, participant.id, 1);
    await createQuiz(request, tournament.id, participant.id, 2);
    await createQuiz(request, tournament.id, participant.id, 3);

    await page.goto(`/gather/tournaments/${tournament.id}/participants/${participant.id}`);

    await expect(page.getByText('あと 0 問、作成してください。')).toBeVisible();
    await expect(page.getByText('作成済みの問題')).toBeVisible();
    const listItems = await page.locator('ul > div').count();
    expect(listItems).toBe(3);
  });
});
