import { test, expect } from '@playwright/test';
import { pathToParticipantDashboard, pathToQuizBoard, pathToQuizCreator } from '../frontend/src/helpers/route-helpers';

test('編集・プレビューでは既読を付けず、本番に表示した1問だけ記録する', async ({ page, request }) => {
  const tournament = await (await request.post('http://localhost:3000/api/tournaments', { data: {
    name: '既読の回帰テスト', password: 'test-only', questionsPerParticipant: 2, points: '10,20',
  } })).json();
  const participant = await (await request.post(`http://localhost:3000/api/tournaments/${tournament.id}/participants`, { data: { name: '参加者', loginId: 'user1', password: '123456' } })).json();
  const quizzes = [];
  for (const order of [0, 1]) {
    quizzes.push(await (await request.post('http://localhost:3000/api/quizzes', { data: {
      tournamentId: tournament.id, participantId: participant.id, order, point: (order + 1) * 10,
      questionText: `問題${order + 1}`, answerText: `解答${order + 1}`,
    } })).json());
  }
  /** GETによる検証自体が既読を付けないことも同時に確認する。 */
  const opened = async () => Promise.all(quizzes.map(async (quiz) => (await (await request.get(`http://localhost:3000/api/quizzes/${quiz.id}`)).json()).isOpened));
  await page.goto(pathToQuizCreator(tournament.id, participant.id) + `?edit=${quizzes[0].id}&order=0&point=10`);
  await expect(page.getByLabel('問題文')).toHaveValue('問題1');
  expect(await opened()).toEqual([false, false]);

  await page.goto(pathToParticipantDashboard(tournament.id, participant.id));
  await page.getByRole('button', { name: '問題確認' }).first().click();
  await expect(page.getByRole('dialog').getByText('問題1')).toBeVisible();
  await page.getByRole('button', { name: 'プレビューを閉じる' }).click();
  await page.getByRole('button', { name: '解答確認' }).first().click();
  await expect(page.getByRole('dialog').getByText('解答1')).toBeVisible();
  expect(await opened()).toEqual([false, false]);

  await page.goto(pathToQuizBoard(tournament.id));
  await page.getByRole('button', { name: '10', exact: true }).click();
  await expect(page.getByText('問題1')).toBeVisible();
  await expect.poll(opened).toEqual([true, false]);
  await page.getByRole('button', { name: '正解を見る' }).click();
  await page.getByRole('button', { name: 'ボードに戻る' }).click();
  await expect(page.getByText('参加者', { exact: true })).toBeVisible();
  expect(await opened()).toEqual([true, false]);
});
