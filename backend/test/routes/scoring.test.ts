import { describe, it, expect, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import tournaments from '../../src/routes/tournaments';
import quizzes from '../../src/routes/quizzes';
import { errorHandler } from '../../src/middleware/errorHandler';
import { prisma } from '../../src/db';
const app = express(); app.use(express.json()); app.use('/tournaments', tournaments); app.use('/quizzes', quizzes); app.use(errorHandler);
const ids: string[] = [];
/** 実APIで採点用大会と問題を用意する。 */
async function setup() {
  const t = await request(app).post('/tournaments').send({ name: '採点テスト', password: 'test', questionsPerParticipant: 1, points: '10', teamNames: ['赤チーム', '青チーム'] });
  ids.push(t.body.id);
  const p = await request(app).post(`/tournaments/${t.body.id}/participants`).send({ name: '問題作成者', loginId: 'creator', password: '1234' });
  const q = await request(app).post('/quizzes').send({ tournamentId: t.body.id, participantId: p.body.id, point: 10, questionText: '問題', answerText: '解答' });
  return { t: t.body, q: q.body, base: `/tournaments/${t.body.id}` };
}
afterEach(async () => { for (const id of ids.splice(0)) { await prisma.quiz.deleteMany({ where: { tournamentId: id } }); await prisma.participant.deleteMany({ where: { tournamentId: id } }); await prisma.tournament.delete({ where: { id } }); } });
describe('チーム採点と結果発表', () => {
  it('チームは作問者と独立し、名前の長さ・重複を検証する', async () => {
    const { t, base } = await setup();
    expect(t.teams).toHaveLength(2);
    expect(t.teams.map((team: { name: string }) => team.name)).toEqual(['赤チーム', '青チーム']);
    for (const teamNames of [[''], ['あ'.repeat(21)], ['同じ', '同じ'], [12]]) expect((await request(app).put(base).send({ teamNames })).status).toBe(400);
    expect((await request(app).put(base).send({ teamNames: ['あ'.repeat(20)] })).status).toBe(200);
  });
  it('解答表示後だけ正誤を保存し、再保存は加算を重複させず終了まで順位を返さない', async () => {
    const { t, q, base } = await setup();
    expect((await request(app).get(`${base}/results`)).status).toBe(409);
    expect((await request(app).patch(`${base}/finish`)).status).toBe(409);
    await request(app).patch(`${base}/start`);
    expect((await request(app).put(`/quizzes/${q.id}`).send({ point: 100 })).status).toBe(409);
    expect((await request(app).put(base).send({ teamNames: ['変更'] })).status).toBe(409);
    const marks = { [t.teams[0].id]: true, [t.teams[1].id]: false };
    expect((await request(app).put(`${base}/scoring/${q.id}`).send({ judgments: marks })).status).toBe(409);
    await request(app).put(`/quizzes/${q.id}/opened`);
    expect((await request(app).post(`${base}/scoring/${q.id}/reveal`)).status).toBe(200);
    expect((await request(app).put(`${base}/scoring/${q.id}`).send({ judgments: { unknown: true } })).status).toBe(400);
    expect((await request(app).patch(`${base}/finish`)).status).toBe(409);
    for (let i = 0; i < 2; i++) expect((await request(app).put(`${base}/scoring/${q.id}`).send({ judgments: marks })).status).toBe(200);
    expect((await request(app).get(`${base}/results`)).status).toBe(409);
    expect((await request(app).patch(`${base}/finish`)).status).toBe(200);
    const result = await request(app).get(`${base}/results`);
    expect(result.body.rankings.map((team: { score: number; rank: number }) => [team.score, team.rank])).toEqual([[10, 1], [0, 2]]);
    expect((await request(app).put(`${base}/scoring/${q.id}`).send({ judgments: marks })).status).toBe(409);
    expect((await request(app).patch(`${base}/start`)).status).toBe(409);
  });
  it('同点は同順位で、別大会の問題は採点できない', async () => {
    const a = await setup(), b = await setup();
    await request(app).patch(`${a.base}/start`);
    expect((await request(app).post(`${a.base}/scoring/${b.q.id}/reveal`)).status).toBe(404);
    await request(app).put(`/quizzes/${a.q.id}/opened`);
    await request(app).post(`${a.base}/scoring/${a.q.id}/reveal`);
    await request(app).put(`${a.base}/scoring/${a.q.id}`).send({ judgments: Object.fromEntries(a.t.teams.map((team: { id: string }) => [team.id, true])) });
    await request(app).patch(`${a.base}/finish`);
    expect((await request(app).get(`${a.base}/results`)).body.rankings.map((team: { rank: number }) => team.rank)).toEqual([1, 1]);
  });
});
