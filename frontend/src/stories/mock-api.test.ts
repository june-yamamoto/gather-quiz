import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { setupServer } from 'msw/node';
import { createMockApi } from './mock-api';

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());
afterEach(() => server.resetHandlers());
beforeEach(() => server.use(...createMockApi().handlers));

/** APIクライアントと同じJSON境界でモックを検証する。 */
const request = async (path: string, method = 'GET', body?: object) => {
  const response = await fetch(`http://localhost/api${path}`, {
    method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined,
  });
  return { status: response.status, data: await response.json() };
};

describe('Storybook APIモック', () => {
  it('Controlsの問題文と画像が取得・既読保存のどちらでも保たれる', async () => {
    server.resetHandlers(...createMockApi({ questionText: '変更した問題', questionImage: '/sample.png' }).handlers);
    const before = await request('/quizzes/q-1');
    const after = await request('/quizzes/q-1/opened', 'PUT');
    expect(before.data.questionText).toBe('変更した問題');
    expect(after.data.questionImage).toBe('/sample.png');
    expect(after.data.isOpened).toBe(true);
  });
  it('編集を保存するとダッシュボードと問題表示に反映される', async () => {
    await request('/quizzes/q-1', 'PUT', { questionText: '保存した問題' });
    const dashboard = await request('/tournaments/t-1/participants/p-1/quizzes');
    expect(dashboard.data.createdQuizzes[0].questionText).toBe('保存した問題');
    expect((await request('/quizzes/q-1')).data.questionText).toBe('保存した問題');
  });
  it('別Story用に生成し直すと既読・保存・エラー状態を引き継がない', async () => {
    await request('/quizzes/q-1/opened', 'PUT');
    server.resetHandlers(...createMockApi({}, 'error').handlers);
    expect((await request('/quizzes/q-1')).status).toBe(503);
    server.resetHandlers(...createMockApi().handlers);
    expect((await request('/quizzes/q-1')).data.isOpened).toBe(false);
  });
  it('異なる問題IDを同じ問題として返さない', async () => {
    server.resetHandlers(...createMockApi({}, 'complete').handlers);
    expect((await request('/quizzes/q-2')).data.id).toBe('q-2');
    expect((await request('/quizzes/missing')).status).toBe(404);
  });
  it('登録した参加者の問題作成を同じStory内で継続できる', async () => {
    const participant = await request('/tournaments/t-1/participants', 'POST', { name: '新しい参加者' });
    await request('/quizzes', 'POST', { tournamentId: 't-1', participantId: participant.data.id, questionText: '追加問題', answerText: '追加解答', point: 20, order: 1 });
    const dashboard = await request(`/tournaments/t-1/participants/${participant.data.id}/quizzes`);
    expect(dashboard.data.participantName).toBe('新しい参加者');
    expect(dashboard.data.createdQuizzes[0].questionText).toBe('追加問題');
  });
});
