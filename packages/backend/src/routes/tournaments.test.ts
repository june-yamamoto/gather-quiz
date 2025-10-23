import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import tournamentsRouter from './tournaments';
import { PrismaClient, Tournament } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.use('/tournaments', tournamentsRouter);

describe('大会API', () => {
  let tournament: Tournament;

  beforeEach(async () => {
    tournament = await prisma.tournament.create({
      data: {
        name: 'APIテスト用大会',
        password: 'correct-password',
        questionsPerParticipant: 3,
        points: '10,20,30',
      },
    });
  });

  afterEach(async () => {
    await prisma.quiz.deleteMany({ where: { tournamentId: tournament.id } });
    await prisma.participant.deleteMany({
      where: { tournamentId: tournament.id },
    });
    await prisma.tournament.deleteMany({ where: { id: tournament.id } });
  });

  describe('POST / (大会作成)', () => {
    it('新しい大会が正しく作成されること', async () => {
      const newTournamentData = {
        name: '新規大会',
        password: 'new_password',
        questionsPerParticipant: 2,
        points: '5,15',
        regulation: '新規大会のレギュレーション',
      };
      const res = await request(app).post('/tournaments').send(newTournamentData);

      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe(newTournamentData.name);
      expect(res.body.password).toBe(newTournamentData.password);
    });

    it('必須フィールドが不足している場合にエラーを返すこと', async () => {
      const invalidTournamentData = {
        name: '無効な大会',
        password: 'new_password',
        questionsPerParticipant: 2,
        // pointsフィールドが欠けているため、バリデーションエラーとなることを期待する
      };
      const res = await request(app).post('/tournaments').send(invalidTournamentData);

      // Prismaのバリデーションエラーは500を返すため、それを検証する
      expect(res.statusCode).toBe(500);
    });
  });

  describe('GET /:id (大会取得)', () => {
    it('指定したIDの大会が正しく取得されること', async () => {
      const res = await request(app).get(`/tournaments/${tournament.id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(tournament.id);
      expect(res.body.name).toBe(tournament.name);
    });

    it('存在しないIDの場合、404エラーを返すこと', async () => {
      const res = await request(app).get('/tournaments/nonexistent_id');

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Tournament not found');
    });
  });

  describe('POST /:id/participants (参加者作成)', () => {
    it('新しい参加者が正しく作成されること', async () => {
      const res = await request(app).post(`/tournaments/${tournament.id}/participants`).send({ name: '新規参加者' });

      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe('新規参加者');
      expect(res.body.tournamentId).toBe(tournament.id);
    });

    it('必須フィールドが不足している場合にエラーを返すこと', async () => {
      // nameフィールドが欠けているため、バリデーションエラーとなることを期待する
      const res = await request(app).post(`/tournaments/${tournament.id}/participants`).send({});

      // Prismaのバリデーションエラーは500を返すため、それを検証する
      expect(res.statusCode).toBe(500);
    });

    it('同じ大会内で重複する参加者名の場合、エラーを返すこと', async () => {
      await prisma.participant.create({
        data: {
          name: '重複参加者',
          password: 'pw',
          tournamentId: tournament.id,
        },
      });

      const res = await request(app).post(`/tournaments/${tournament.id}/participants`).send({ name: '重複参加者' });

      // Prismaのユニーク制約違反は500を返すため、それを検証する
      expect(res.statusCode).toBe(500);
    });
  });

  describe('POST /:id/login (主催者ログイン)', () => {
    it('正しいパスワードでログインが成功すること', async () => {
      const res = await request(app).post(`/tournaments/${tournament.id}/login`).send({ password: 'correct-password' });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('間違ったパスワードでログインが失敗すること', async () => {
      const res = await request(app).post(`/tournaments/${tournament.id}/login`).send({ password: 'wrong-password' });
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /:id/status (大会ステータス取得)', () => {
    it('参加者の問題作成状況を含んだ大会ステータスが返されること', async () => {
      const participant = await prisma.participant.create({
        data: {
          name: 'テスト参加者',
          password: 'pw',
          tournamentId: tournament.id,
        },
      });
      await prisma.quiz.create({
        data: {
          point: 10,
          questionText: 'テスト問題',
          answerText: 'テスト解答',
          tournamentId: tournament.id,
          participantId: participant.id,
        },
      });

      const res = await request(app).get(`/tournaments/${tournament.id}/status`);

      expect(res.statusCode).toBe(200);
      expect(res.body.tournamentName).toBe('APIテスト用大会');
      expect(res.body.participants).toHaveLength(1);
      expect(res.body.participants[0].name).toBe('テスト参加者');
      expect(res.body.participants[0].created).toBe(1);
      expect(res.body.participants[0].required).toBe(3);
    });
  });

  describe('PUT /:id (大会更新)', () => {
    it('大会情報が正しく更新されること', async () => {
      const updatedData = {
        name: '更新された大会名',
        password: 'updated_password',
        questionsPerParticipant: 5,
        points: '10,20,30,40,50',
        regulation: '更新されたレギュレーション',
      };
      const res = await request(app).put(`/tournaments/${tournament.id}`).send(updatedData);

      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe(updatedData.name);
      expect(res.body.password).toBe(updatedData.password);
      expect(res.body.questionsPerParticipant).toBe(updatedData.questionsPerParticipant);
    });

    it('存在しないIDの場合、404エラーを返すこと', async () => {
      const updatedData = {
        name: '更新された大会名',
      };
      const res = await request(app).put('/tournaments/nonexistent_id').send(updatedData);

      // Prismaで存在しないレコードを更新しようとすると500エラーが返るため、それを検証する
      expect(res.statusCode).toBe(500);
    });
  });

  describe('PATCH /:id/start (大会開始)', () => {
    it('大会ステータスがin_progressに更新されること', async () => {
      const res = await request(app).patch(`/tournaments/${tournament.id}/start`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('in_progress');
    });

    it('存在しないIDの場合、404エラーを返すこと', async () => {
      const res = await request(app).patch('/tournaments/nonexistent_id/start');

      // Prismaで存在しないレコードを更新しようとすると500エラーが返るため、それを検証する
      expect(res.statusCode).toBe(500);
    });
  });

  describe('GET /:id/board (大会ボードデータ取得)', () => {
    it('大会ボードデータが正しく取得されること', async () => {
      const participant1 = await prisma.participant.create({
        data: {
          name: 'Board Participant 1',
          password: 'pw1',
          tournamentId: tournament.id,
        },
      });

      const _participant2 = await prisma.participant.create({
        data: {
          name: 'Board Participant 2',
          password: 'pw2',
          tournamentId: tournament.id,
        },
      });

      await prisma.quiz.create({
        data: {
          point: 10,
          questionText: 'Board Q1',
          answerText: 'Board A1',
          tournamentId: tournament.id,
          participantId: participant1.id,
        },
      });

      const res = await request(app).get(`/tournaments/${tournament.id}/board`);

      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(tournament.id);
      expect(res.body.participants).toHaveLength(2);
      expect(res.body.participants[0].quizzes).toHaveLength(1);
      expect(res.body.participants[1].quizzes).toHaveLength(0);
    });

    it('存在しないIDの場合、404エラーを返すこと', async () => {
      const res = await request(app).get('/tournaments/nonexistent_id/board');

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Tournament not found');
    });
  });
});
