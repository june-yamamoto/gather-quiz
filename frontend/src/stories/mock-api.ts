import { http, HttpResponse, delay } from 'msw';
import { controlledQuiz, tournamentArgs, type QuizControls, type TournamentControls } from './controls';
import { imageFixture, participantFixture, tournamentFixture } from './fixtures';

export type MockScenario = 'normal' | 'loading' | 'error' | 'empty' | 'complete' | 'finished' | 'saveError';

/** 各Storyで新しいデータを作り、Story内の画面遷移では保存・既読を維持する。 */
export const createMockApi = (args: Partial<QuizControls & TournamentControls> = {}, scenario: MockScenario = 'normal') => {
  const settings = { ...tournamentArgs, ...args };
  const points = settings.points.split(',').map(Number).filter((point) => Number.isFinite(point) && point > 0);
  if (!points.length) points.push(10);
  const tournament = { ...tournamentFixture, name: settings.tournamentName, points: points.join(','),
    questionsPerParticipant: points.length, regulation: settings.regulation, genres: settings.genres,
    questionSlots: settings.questionSlots,
    status: scenario === 'finished' ? 'in_progress' : tournamentFixture.status };
  const participants = Array.from({ length: Math.min(10, Math.max(1, settings.participantCount)) }, (_, index) => ({
    ...participantFixture, id: `p-${index + 1}`, name: index === 0 ? args.participantName || 'あおい' : `参加者${index + 1}`,
  }));
  const count = scenario === 'empty' ? 0 : scenario === 'complete' || scenario === 'finished' ? points.length : Math.min(points.length, Math.max(0, settings.createdQuestions));
  const quizzes = Array.from({ length: count }, (_, order) => ({
    ...controlledQuiz(args), id: `q-${order + 1}`, order: order === 0 ? args.order ?? order : order, point: order === 0 ? args.point ?? points[order] : points[order],
    isOpened: scenario === 'finished' || !!args.isOpened,
  }));
  // 単独問題画面のControlsは、作成数が0でも表示対象を持つ。
  if (!quizzes.length && scenario !== 'empty') quizzes.push({ ...controlledQuiz(args), id: 'q-1', order: 0 });
  /** 状況レスポンスは現在の保存内容から毎回生成する。 */
  const board = () => ({ ...tournament, participants: participants.map((participant) => ({
    ...participant, quizzes: quizzes.filter((quiz) => quiz.participantId === participant.id),
    created: quizzes.filter((quiz) => quiz.participantId === participant.id).length, required: tournament.questionsPerParticipant,
  })) });
  /** 不正なリクエストをモックで黙って成功扱いにしない。 */
  const body = async (request: Request): Promise<Record<string, unknown>> => {
    const value: unknown = await request.json();
    return typeof value === 'object' && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : {};
  };
  const missing = () => HttpResponse.json({ message: 'モックの対象データがありません。' }, { status: 404 });
  const handlers = [
    ...(scenario === 'loading' ? [http.get('*/api/*', async () => { await delay('infinite'); })] : []),
    ...(scenario === 'error' ? [http.get('*/api/*', () => HttpResponse.json({ message: '読み込みに失敗しました。接続を確認してください。' }, { status: 503 }))] : []),
    http.get('*/api/quizzes/:id', ({ params }) => {
      const quiz = quizzes.find((item) => item.id === params.id);
      return quiz ? HttpResponse.json(quiz) : missing();
    }),
    http.put('*/api/quizzes/:id/opened', ({ params }) => {
      if (scenario === 'saveError') return HttpResponse.json({ message: '通信エラー' }, { status: 503 });
      const quiz = quizzes.find((item) => item.id === params.id);
      if (!quiz) return missing();
      quiz.isOpened = true;
      return HttpResponse.json(quiz);
    }),
    http.put('*/api/quizzes/:id', async ({ params, request }) => {
      const quiz = quizzes.find((item) => item.id === params.id);
      if (!quiz) return missing();
      Object.assign(quiz, await body(request), { id: quiz.id });
      return HttpResponse.json(quiz);
    }),
    http.post('*/api/quizzes', async ({ request }) => {
      const data = await body(request);
      const slot = tournament.questionSlots[Number(data.order)] || { label: '', choiceCount: 0 };
      const quiz = { ...controlledQuiz(args), ...data, label: slot.label, id: `q-${quizzes.length + 1}` };
      quizzes.push(quiz);
      return HttpResponse.json(quiz, { status: 201 });
    }),
    http.get('*/api/tournaments/:id/board', () => HttpResponse.json(board())),
    http.get('*/api/tournaments/:id/status', () => HttpResponse.json({ ...board(), tournamentName: tournament.name })),
    http.get('*/api/tournaments/:id/participants/:participantId/quizzes', ({ params }) => {
      const participant = participants.find((item) => item.id === params.participantId);
      if (!participant) return missing();
      const createdQuizzes = quizzes.filter((quiz) => quiz.participantId === participant.id);
      return HttpResponse.json({ participantName: participant.name, tournamentPoints: tournament.points, createdQuizzes,
        remainingQuestions: Math.max(0, tournament.questionsPerParticipant - createdQuizzes.length) });
    }),
    http.get('*/api/tournaments/:id', () => HttpResponse.json(board())),
    http.post('*/api/tournaments/:id/participants/login', async ({ request }) => {
      const data = await body(request);
      return HttpResponse.json(participants.find((participant) => participant.loginId === data.loginId) || participants[0]);
    }),
    http.post('*/api/tournaments/:id/participants', async ({ request }) => {
      const data = await body(request);
      const participant = { ...participantFixture, id: `p-${participants.length + 1}`, name: typeof data.name === 'string' ? data.name : '参加者', loginId: typeof data.loginId === 'string' ? data.loginId.toLowerCase() : 'demo' };
      participants.push(participant);
      return HttpResponse.json(participant, { status: 201 });
    }),
    http.post('*/api/tournaments/:id/login', () => HttpResponse.json({ success: true })),
    http.post('*/api/tournaments', async ({ request }) => {
      Object.assign(tournament, await body(request));
      return HttpResponse.json(board(), { status: 201 });
    }),
    http.put('*/api/tournaments/:id', async ({ request }) => {
      Object.assign(tournament, await body(request));
      return HttpResponse.json(board());
    }),
    http.patch('*/api/tournaments/:id/start', () => {
      tournament.status = 'in_progress';
      return HttpResponse.json({ success: true });
    }),
    http.post('*/api/upload/image', () => HttpResponse.json({ signedUrl: '/api/story-upload', objectUrl: imageFixture })),
    http.post('*/api/upload/media', async ({ request }) => {
      const data = await body(request);
      return HttpResponse.json({ signedUrl: '/api/story-upload', objectUrl: data.fileType === 'video/mp4' || data.fileType === 'video/webm'
        ? 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'
        : 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Example.ogg' });
    }),
    http.put('*/api/story-upload', () => new HttpResponse(null, { status: 200 })),
  ];
  return { handlers };
};
