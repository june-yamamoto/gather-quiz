import { test, expect, APIRequestContext } from '@playwright/test';

// Helper function to create a tournament via API
const createTournament = async (request: APIRequestContext) => {
  const response = await request.post('/api/tournaments', {
    data: {
      name: `Dashboard Test Tournament ${Date.now()}` ,
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
  const response = await request.post(`/api/tournaments/${tournamentId}/participants`, {
    data: {
      name: `Test Participant ${Date.now()}`
    }
  });
  return await response.json();
};

// Helper function to create a quiz via API
const createQuiz = async (request: APIRequestContext, tournamentId: string, participantId: string, questionNumber: number) => {
  const response = await request.post('/api/quizzes', {
    data: {
      question: `Question ${questionNumber}` ,
      options: JSON.stringify(['A', 'B', 'C', 'D']),
      answer: 'A',
      point: 10,
      tournamentId,
      participantId,
    }
  });
  return await response.json();
};

test.describe('Participant Dashboard', () => {

  test('Scenario 1: should display correct status when no quizzes are created', async ({ page, request }) => {
    const tournament = await createTournament(request);
    const participant = await createParticipant(request, tournament.id);

    await page.goto(`/tournaments/${tournament.id}/participants/${participant.id}`);

    await expect(page.getByText('あと 3 問、作成してください。')).toBeVisible();
    await expect(page.getByText('作成済みの問題')).toBeVisible();
    // Expect the list of created quizzes to be empty
    const listItems = await page.locator('ul > div').count();
    expect(listItems).toBe(0);
  });

  test('Scenario 2: should display correct status when some quizzes are created', async ({ page, request }) => {
    const tournament = await createTournament(request);
    const participant = await createParticipant(request, tournament.id);
    const quiz = await createQuiz(request, tournament.id, participant.id, 1);

    await page.goto(`/tournaments/${tournament.id}/participants/${participant.id}`);

    await expect(page.getByText('あと 2 問、作成してください。')).toBeVisible();
    await expect(page.getByText('作成済みの問題')).toBeVisible();
    await expect(page.getByText(JSON.parse(quiz.question).question)).toBeVisible();
  });

  test('Scenario 3: should display correct status when all quizzes are created', async ({ page, request }) => {
    const tournament = await createTournament(request);
    const participant = await createParticipant(request, tournament.id);
    await createQuiz(request, tournament.id, participant.id, 1);
    await createQuiz(request, tournament.id, participant.id, 2);
    await createQuiz(request, tournament.id, participant.id, 3);

    await page.goto(`/tournaments/${tournament.id}/participants/${participant.id}`);

    await expect(page.getByText('あと 0 問、作成してください。')).toBeVisible();
    await expect(page.getByText('作成済みの問題')).toBeVisible();
    const listItems = await page.locator('ul > div').count();
    expect(listItems).toBe(3);
  });
});
