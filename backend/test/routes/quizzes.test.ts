import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import quizzesRouter from '../../src/routes/quizzes';
import { Tournament, Participant, Quiz } from '@prisma/client';
import { errorHandler } from '../../src/middleware/errorHandler';

import { prisma } from '../../src/db';
const app = express();
app.use(express.json());
app.use('/quizzes', quizzesRouter);
app.use(errorHandler);

describe('クイズAPI', () => {
  let tournament: Tournament;
  let participant: Participant;
  let quiz: Quiz;

  beforeEach(async () => {
    tournament = await prisma.tournament.create({
      data: {
        name: 'Quiz API Test Tournament',
        password: 'password',
        questionsPerParticipant: 1,
        points: '10',
      },
    });
    participant = await prisma.participant.create({
      data: {
        name: 'Quiz API Test Participant',
        password: 'pw',
        tournamentId: tournament.id,
      },
    });
    quiz = await prisma.quiz.create({
      data: {
        point: 10,
        questionText: 'Original Question',
        answerText: 'Original Answer',
        tournamentId: tournament.id,
        participantId: participant.id,
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

  describe('POST / (クイズ作成)', () => {
    it('動画URL・音声URLのみの問題と解答を保存して再取得できる', async () => {
      const data = { point: 10, questionLink: 'https://example.com/movie.mp4', answerLink: 'https://example.com/answer.mp3', tournamentId: tournament.id, participantId: participant.id };
      const res = await request(app).post('/quizzes').send(data);
      expect(res.status).toBe(201);
      const saved = await request(app).get(`/quizzes/${res.body.id}`);
      expect(saved.body).toMatchObject(data);
      expect((await request(app).put(`/quizzes/${res.body.id}`).send({ genre: '音楽' })).status).toBe(200);
      expect((await request(app).put(`/quizzes/${res.body.id}`).send({ questionLink: null })).status).toBe(400);
      expect((await request(app).put(`/quizzes/${res.body.id}`).send({ questionText: '差し替え', questionLink: null })).status).toBe(200);
    });

    it.each(['javascript:alert(1)', 'data:text/html,a', 'https://user:pass@example.com', 'invalid', {}, 1])('作成・更新時に不正なURL %j を拒否する', async (questionLink) => {
      const data = { point: 10, questionText: '問題', answerText: '答え', questionLink, tournamentId: tournament.id, participantId: participant.id };
      expect((await request(app).post('/quizzes').send(data)).status).toBe(400);
      expect((await request(app).put(`/quizzes/${quiz.id}`).send({ answerLink: questionLink })).status).toBe(400);
    });
    it('新しいクイズが正しく作成されること', async () => {
      const quizData = {
        point: 10,
        order: 1,
        questionText: 'テスト問題文',
        answerText: 'テスト解答文',
        tournamentId: tournament.id,
        participantId: participant.id,
      };

      const res = await request(app).post('/quizzes').send(quizData);

      expect(res.statusCode).toBe(201);
      expect(res.body.questionText).toBe(quizData.questionText);
      expect(res.body.order).toBe(1);
      expect(res.body.isOpened).toBe(false);
    });

    it('必須フィールド(問題/解答)が不足している場合エラーになること', async () => {
      const quizData = {
        point: 10,
        // questionText missing
        answerText: 'テスト解答文',
        tournamentId: tournament.id,
        participantId: participant.id,
      };
      const res = await request(app).post('/quizzes').send(quizData);
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Question text, image or URL is required');
    });
  });

  describe('GET /:id (クイズ取得)', () => {
    it('通常取得や編集用の取得では既読にならないこと', async () => {
      // 初期状態確認
      const initialQuiz = await prisma.quiz.findUnique({ where: { id: quiz.id } });
      expect(initialQuiz?.isOpened).toBe(false);

      const res = await request(app).get(`/quizzes/${quiz.id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(quiz.id);
      expect(res.body.isOpened).toBe(false);

      // DBも更新されているか確認
      const updatedQuiz = await prisma.quiz.findUnique({ where: { id: quiz.id } });
      expect(updatedQuiz?.isOpened).toBe(false);
    });

    it('preview=trueの場合、isOpenedが更新されないこと', async () => {
      // 初期状態確認
      const initialQuiz = await prisma.quiz.findUnique({ where: { id: quiz.id } });
      expect(initialQuiz?.isOpened).toBe(false);

      const res = await request(app).get(`/quizzes/${quiz.id}?preview=true`);

      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(quiz.id);
      // レスポンスのisOpenedもfalseのままのはず（ただしAPIの実装によっては現在のDB値を返すか更新後の値を返すかによるが、今回は更新しないのでfalse）
      expect(res.body.isOpened).toBe(false);

      // DBも更新されていないか確認
      const updatedQuiz = await prisma.quiz.findUnique({ where: { id: quiz.id } });
      expect(updatedQuiz?.isOpened).toBe(false);
    });

    it('存在しないIDの場合、404エラーを返すこと', async () => {
      const res = await request(app).get('/quizzes/nonexistent_id');

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Quiz not found');
    });
  });

  describe('PUT /:id/opened (表示済み記録)', () => {
    it('指定した問題だけを既読にし、再送しても結果が変わらないこと', async () => {
      const other = await prisma.quiz.create({ data: {
        point: 20, order: 1, questionText: '未表示の問題', answerText: '解答',
        tournamentId: tournament.id, participantId: participant.id,
      } });
      for (let attempt = 0; attempt < 2; attempt += 1) {
        const res = await request(app).put(`/quizzes/${quiz.id}/opened`);
        expect(res.statusCode).toBe(200);
        expect(res.body.isOpened).toBe(true);
      }
      expect((await prisma.quiz.findUnique({ where: { id: other.id } }))?.isOpened).toBe(false);
    });

    it('存在しない問題は404を返すこと', async () => {
      expect((await request(app).put('/quizzes/nonexistent_id/opened')).statusCode).toBe(404);
    });

    it('GETやHEADで既読更新URLを取得しても既読にならないこと', async () => {
      await request(app).get(`/quizzes/${quiz.id}/opened`);
      await request(app).head(`/quizzes/${quiz.id}`);
      expect((await prisma.quiz.findUnique({ where: { id: quiz.id } }))?.isOpened).toBe(false);
    });
  });

  describe('PUT /:id (クイズ更新)', () => {
    it('クイズ情報が正しく更新されること', async () => {
      const updatedData = {
        point: 20,
        questionText: 'Updated Question',
        answerText: 'Updated Answer',
      };
      const res = await request(app).put(`/quizzes/${quiz.id}`).send(updatedData);

      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(quiz.id);
      expect(res.body.point).toBe(updatedData.point);
      expect(res.body.questionText).toBe(updatedData.questionText);
    });

    it('更新時に必須要件を満たさない場合エラーになること', async () => {
      // 既存の問題文を消そうとする
      const updatedData = {
        questionText: '',
      };
      const res = await request(app).put(`/quizzes/${quiz.id}`).send(updatedData);
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Question text, image or URL is required');
    });

    it('存在しないIDの場合、404エラーを返すこと', async () => {
      const updatedData = {
        point: 20,
        questionText: 'Updated Question',
      };
      const res = await request(app).put('/quizzes/nonexistent_id').send(updatedData);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('The requested resource was not found.');
    });

    it('必須フィールドが不足している場合でも更新できること (部分更新)', async () => {
      const partialUpdateData = {
        questionText: 'Partially Updated Question',
      };
      const res = await request(app).put(`/quizzes/${quiz.id}`).send(partialUpdateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(quiz.id);
      expect(res.body.questionText).toBe(partialUpdateData.questionText);
      // 他のフィールドは変更されていないことを確認
      expect(res.body.point).toBe(quiz.point);
      expect(res.body.answerText).toBe(quiz.answerText);
    });
  });
});
