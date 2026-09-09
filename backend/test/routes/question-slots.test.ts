import { describe, it, expect, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import tournaments from '../../src/routes/tournaments';
import quizzes from '../../src/routes/quizzes';
import { errorHandler } from '../../src/middleware/errorHandler';
import { prisma } from '../../src/db';

const app = express();
app.use(express.json());
app.use('/tournaments', tournaments);
app.use('/quizzes', quizzes);
app.use(errorHandler);
const ids: string[] = [];
const questionSlots = [{ label: '声優', choiceCount: 4 }, { label: '音楽', choiceCount: 0 }];

/** 実APIから問題枠を設定し、参加者を登録する。 */
async function setup() {
  const res = await request(app).post('/tournaments').send({ name: 'ラベル大会', password: 'test', questionsPerParticipant: 2, points: '10,10', questionSlots });
  ids.push(res.body.id);
  const participant = await request(app).post(`/tournaments/${res.body.id}/participants`).send({ name: '参加者', loginId: 'user1', password: '1234' });
  return { tournamentId: res.body.id, participantId: participant.body.id, point: 10, order: 0, questionText: '問題', answerText: '選択肢2' };
}

afterEach(async () => {
  for (const id of ids.splice(0)) {
    await prisma.quiz.deleteMany({ where: { tournamentId: id } });
    await prisma.participant.deleteMany({ where: { tournamentId: id } });
    await prisma.tournament.delete({ where: { id } });
  }
});

describe('ラベル・選択問題API', () => {
  it('主催者の形式に関係なく参加者が切替でき、100文字は保存し101文字は拒否する', async () => {
    const data = await setup();
    const normal = await request(app).post('/quizzes').send(data);
    expect(normal.body.choiceCount).toBe(0);
    const choices = ['あ'.repeat(100), 'B'];
    const changed = await request(app).put(`/quizzes/${normal.body.id}`).send({ choiceCount: 2, choices });
    expect(changed.status).toBe(200);
    expect(changed.body.choices).toEqual(choices);
    expect((await request(app).put(`/quizzes/${normal.body.id}`).send({ choices: ['あ'.repeat(101), 'B'] })).status).toBe(400);
    for (const choiceCount of [1, 21, 2.5, '4', null]) {
      expect((await request(app).post('/quizzes').send({ ...data, choiceCount, choices })).status).toBe(400);
    }
    expect((await request(app).put(`/quizzes/${normal.body.id}`).send({ choiceCount: 0 })).body).toMatchObject({ choiceCount: 0, choices: [] });
  });
  it('同点の枠を区別し、指定数の選択肢を保存・編集・ボード取得できる', async () => {
    const data = await setup();
    expect((await request(app).get(`/tournaments/${data.tournamentId}`)).body.questionSlots).toEqual(questionSlots);
    const choices = ['選択肢1', '選択肢2', '選択肢3', '選択肢4'];
    const res = await request(app).post('/quizzes').send({ ...data, label: '改ざん', choiceCount: 4, choices });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ label: '声優', choiceCount: 4, choices });
    const normal = await request(app).post('/quizzes').send({ ...data, order: 1 });
    expect(normal.status).toBe(201);
    expect(normal.body).toMatchObject({ label: '音楽', choiceCount: 0, choices: [] });
    expect((await request(app).put(`/quizzes/${res.body.id}`).send({ questionText: '変更' })).body.choices).toEqual(choices);
    for (const invalid of [[], ['A', 'B', 'C', ' '], ['A', 'B', 'C', 1], ['A', 'B', 'C', 'x'.repeat(101)]]) {
      expect((await request(app).put(`/quizzes/${res.body.id}`).send({ choices: invalid })).status).toBe(400);
    }
    expect((await request(app).put(`/quizzes/${normal.body.id}`).send({ choices: ['A', 'B'] })).status).toBe(400);
    const changed = ['A', 'B', 'C', 'D'];
    expect((await request(app).put(`/quizzes/${res.body.id}`).send({ choices: changed })).body.choices).toEqual(changed);
    const board = await request(app).get(`/tournaments/${data.tournamentId}/board`);
    expect(board.body.participants[0].quizzes).toEqual(expect.arrayContaining([expect.objectContaining({ choices: changed, label: '声優' })]));
    expect((await request(app).put(`/tournaments/${data.tournamentId}`).send({ questionSlots: [{ label: '変更', choiceCount: 0 }, questionSlots[1]] })).status).toBe(400);
  });

  it.each([undefined, [], ['A', 'B'], ['A', 'B', 'C', ' '], ['A', 'B', 'C', 1]].map(choices => [choices]))('不足・空白・不正な選択肢 %j を拒否する', async (choices) => {
    const data = await setup();
    expect((await request(app).post('/quizzes').send({ ...data, choiceCount: 4, choices })).status).toBe(400);
  });

  it('選択肢数の範囲・問題枠数・配点の不一致を拒否する', async () => {
    const data = await setup();
    for (const slots of [[{ label: '声優', choiceCount: 1 }, questionSlots[1]], [], [{ label: '声優', choiceCount: 2.5 }, questionSlots[1]]]) {
      expect((await request(app).put(`/tournaments/${data.tournamentId}`).send({ questionSlots: slots })).status).toBe(400);
    }
    expect((await request(app).post('/quizzes').send({ ...data, order: 2 })).status).toBe(400);
    expect((await request(app).post('/quizzes').send({ ...data, order: 1, point: 20 })).status).toBe(400);
  });

  it('問題未作成ならラベルと形式を変更でき、旧大会は空ラベルで更新できる', async () => {
    const data = await setup();
    const updated = [{ label: '音楽', choiceCount: 2 }, { label: '声優', choiceCount: 20 }];
    expect((await request(app).put(`/tournaments/${data.tournamentId}`).send({ questionSlots: updated })).body.questionSlots).toEqual(updated);
    await prisma.tournament.update({ where: { id: data.tournamentId }, data: { questionSlots: null } });
    const normal = await request(app).post('/quizzes').send(data);
    expect(normal.status).toBe(201);
    expect(normal.body).toMatchObject({ label: '', choiceCount: 0, choices: [] });
    expect((await request(app).put(`/tournaments/${data.tournamentId}`).send({ name: '旧大会の編集', questionSlots: [{ label: '', choiceCount: 0 }, { label: '', choiceCount: 0 }] })).status).toBe(200);
  });
});
