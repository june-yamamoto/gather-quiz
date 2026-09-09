import { beforeEach, afterEach, describe, expect, it } from 'vitest';
import express from 'express';
import request from 'supertest';
import router from '../../src/routes/tournaments';
import { errorHandler } from '../../src/middleware/errorHandler';
import { prisma } from '../../src/db';

const app = express().use(express.json()).use('/tournaments', router).use(errorHandler);
let id: string;
beforeEach(async () => { id = (await prisma.tournament.create({ data: { name: '認証テスト', password: 'admin', points: '10', questionsPerParticipant: 1 } })).id; });
afterEach(async () => { await prisma.participant.deleteMany({ where: { tournamentId: id } }); await prisma.tournament.delete({ where: { id } }); });

describe('参加者が指定する認証情報', () => {
  it('表示名とIDを分離し、短いパスワードをハッシュ保存して公開しない', async () => {
    const registered = await request(app).post(`/tournaments/${id}/participants`).send({ name: '表示名', loginId: 'Quiz_User', password: '1234' });
    expect(registered.status).toBe(200);
    expect(registered.body.loginId).toBe('quiz_user');
    expect(registered.body).not.toHaveProperty('password');
    const stored = await prisma.participant.findUniqueOrThrow({ where: { id: registered.body.id } });
    expect(stored.password).toMatch(/^scrypt\$/);
    const login = await request(app).post(`/tournaments/${id}/participants/login`).send({ loginId: 'QUIZ_USER', password: '1234' });
    expect(login.status).toBe(200);
    expect(login.body).not.toHaveProperty('password');
    const board = await request(app).get(`/tournaments/${id}/board`);
    expect(JSON.stringify(board.body)).not.toContain(stored.password);
    expect(board.body.participants[0]).not.toHaveProperty('password');
  });
  it.each([{ name: 'あ'.repeat(21), loginId: 'user1', password: '1234' }, { name: '名前', loginId: '不正ID', password: '1234' }, { name: '名前', loginId: 'ab', password: '1234' }, { name: '名前', loginId: 'user1', password: '123' }, { name: '名前', loginId: 'user1', password: '1234567' }])('入力条件をAPIでも検証する: %j', async (data) => {
    expect((await request(app).post(`/tournaments/${id}/participants`).send(data)).status).toBe(400);
  });
  it('同じ表示名を許可し、IDは大会内で大文字小文字を区別せず一意にする', async () => {
    const create = (loginId: string) => request(app).post(`/tournaments/${id}/participants`).send({ name: '同じ名前', loginId, password: '1234' });
    expect((await create('user1')).status).toBe(200);
    expect((await create('user2')).status).toBe(200);
    expect((await create('USER1')).status).toBe(409);
  });
  it('5回の失敗後は正しいパスワードでも15分間制限する', async () => {
    await request(app).post(`/tournaments/${id}/participants`).send({ name: '名前', loginId: 'user1', password: '1234' });
    for (let i = 0; i < 5; i++) expect((await request(app).post(`/tournaments/${id}/participants/login`).send({ loginId: 'user1', password: '0000' })).status).toBe(401);
    expect((await request(app).post(`/tournaments/${id}/participants/login`).send({ loginId: 'user1', password: '1234' })).status).toBe(429);
  });
});
